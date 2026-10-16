---
titre: "REMnux: Getting Started"
description: "Apprendre à utiliser les outils de la machine virtuelle REMnux."
resume: "REMnux est une distribution Linux prête à l'emploi pour analyser des malwares. Cette note présente ses outils principaux à travers trois exercices, l'analyse d'un document Office piégé, la simulation d'un réseau avec INetSim et la préparation d'une image mémoire avec Volatility."
date: "30.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/remnuxgettingstarted"
---

## Définitions

**REMnux** : distribution Linux spécialisée dans l'analyse de logiciels malveillants. Elle fournit un environnement déjà configuré, avec des outils d'analyse statique, d'analyse mémoire et d'analyse réseau.

**Machine virtuelle (VM)** : environnement isolé qui fait tourner un système invité sans toucher à l'hôte. Elle sert à contenir l'exécution d'un malware.

**Analyse statique** : étude d'un fichier sans l'exécuter (code, signatures, métadonnées).

**Analyse dynamique** : observation du comportement d'un logiciel exécuté dans un environnement contrôlé.

**OLE (Object Linking and Embedding)** : technologie de Microsoft qui réunit plusieurs types de données dans un seul fichier. Le format OLE2 est celui des anciens documents Office.

**Macro VBA** : script intégré à un document Office pour automatiser des actions. Les attaquants s'en servent souvent pour exécuter du code malveillant.

**Image mémoire** : copie du contenu de la mémoire vive, utilisée pour l'investigation.

## Présentation

REMnux accélère l'analyse en réunissant des outils prêts à l'emploi. Travailler dans une machine virtuelle isolée réduit les risques quand on examine ou qu'on exécute un échantillon suspect.

| Outil | Usage |
| --- | --- |
| oledump | Analyse les fichiers OLE2 et extrait leurs flux, dont les macros VBA |
| INetSim | Simule des services Internet (DNS, HTTP, HTTPS, FTP, SMTP, POP3), pour observer un malware sans accès réel à Internet |
| Volatility | Analyse une image mémoire et en extrait les processus, les connexions réseau, les modules chargés |
| YARA | Identifie des familles de malwares à l'aide de règles fondées sur des motifs |
| Wireshark | Capture et analyse le trafic réseau |
| strings | Extrait le texte lisible d'un fichier binaire |

Une analyse suit en général cinq étapes.

1. **Acquisition** de l'échantillon (binaire, document, image mémoire, capture réseau).
2. **Analyse statique**, avec `strings`, YARA ou oledump.
3. **Analyse dynamique** si nécessaire, dans un bac à sable, avec le réseau redirigé vers INetSim.
4. **Analyse mémoire**, avec Volatility.
5. **Corrélation** des résultats, pour conclure sur le serveur de commande, la persistance ou l'exfiltration.

Chaque action se documente, avec son horodatage et le hash des fichiers. Si l'analyse sert une enquête officielle, on tient aussi une chaîne de possession.

## Analyser un document Office

`oledump.py` liste les flux internes d'un document, dont ceux qui contiennent des macros.

```bash
# Lister les flux du document
oledump.py document.xlsm

# Afficher le flux numéro 4
oledump.py document.xlsm -s 4

# Décompresser ce flux pour lire le code VBA
oledump.py document.xlsm -s 4 --vbadecompress
```

Une macro malveillante se contente souvent d'appeler PowerShell pour télécharger la vraie charge. Le schéma suivant revient régulièrement.

1. PowerShell est lancé en mode caché, sans fenêtre visible.
2. La politique d'exécution des scripts est contournée, avec `-ExecutionPolicy Bypass`.
3. Un fichier temporaire est créé, puis renommé en `.exe`.
4. Un fichier est téléchargé depuis Internet, avec `Invoke-WebRequest`.
5. Le fichier téléchargé est exécuté, avec `Start-Process`.

La commande est fréquemment obfusquée. Des caractères parasites, comme `*` ou `^`, y sont insérés puis retirés à l'exécution par un `Replace`. Il faut les supprimer pour lire la commande réelle.

## Simuler un réseau avec INetSim

INetSim répond à la place d'Internet. Le malware croit joindre ses serveurs, alors que toutes ses requêtes arrivent sur la machine REMnux. On relève ainsi ses domaines, ses URL et ses téléchargements sans rien exposer.

Le réglage essentiel est `dns_default_ip`. C'est l'adresse renvoyée pour toutes les requêtes DNS. On y met l'adresse IP de la machine REMnux.

```bash
# Modifier la ligne dns_default_ip du fichier de configuration
sudo nano /etc/inetsim/inetsim.conf

# Vérifier la modification
grep dns_default_ip /etc/inetsim/inetsim.conf

# Démarrer la simulation
sudo inetsim
```

INetSim affiche `Simulation running.` quand il est prêt. Depuis une seconde machine, qui joue le rôle du poste infecté, toute demande de fichier reçoit alors une réponse factice.

```bash
sudo wget https://<IP de REMnux>/fichier.zip --no-check-certificate
```

INetSim génère un rapport dans `/var/log/inetsim/report/`. Il liste les connexions, les URL demandées, les fichiers servis et le protocole utilisé.

## Préparer une image mémoire

Avant l'analyse proprement dite, on extrait les informations de base de l'image mémoire. Ce prétraitement fait gagner du temps, car chaque plugin de Volatility peut tourner plusieurs minutes.

| Plugin Volatility 3 | Ce qu'il extrait |
| --- | --- |
| `windows.pstree.PsTree` | Les processus sous forme d'arbre, avec les liens parent-enfant |
| `windows.pslist.PsList` | Les processus actifs au moment de la capture |
| `windows.psscan.PsScan` | Les processus, même terminés ou cachés |
| `windows.cmdline.CmdLine` | Les arguments de lancement des processus |
| `windows.filescan.FileScan` | Les objets fichiers présents en mémoire |
| `windows.dlllist.DllList` | Les DLL chargées par les processus |
| `windows.malfind.Malfind` | Les zones de mémoire qui contiennent peut-être du code injecté |

```bash
# Lancer un plugin
vol3 -f memoire.mem windows.pstree.PsTree

# Lancer plusieurs plugins et enregistrer chaque résultat dans un fichier texte
for plugin in windows.pstree.PsTree windows.pslist.PsList windows.cmdline.CmdLine windows.malfind.Malfind; do
  vol3 -q -f memoire.mem $plugin > memoire.$plugin.txt
done
```

On extrait aussi les chaînes de caractères de l'image. Elles révèlent des chemins, des noms de processus, des clés de registre, des URL ou des commandes.

```bash
# Chaînes ASCII
strings memoire.mem > memoire.strings.ascii.txt

# Chaînes Unicode, en little-endian puis en big-endian
strings -e l memoire.mem > memoire.strings.unicode_le.txt
strings -e b memoire.mem > memoire.strings.unicode_be.txt
```

En little-endian, l'octet de poids faible est stocké en premier. C'est le format utilisé par Windows. En big-endian, c'est l'octet de poids fort.

## À retenir

- REMnux réunit dans une machine virtuelle les outils d'analyse de malwares.
- `oledump.py` repère et affiche les macros d'un document Office.
- Une macro malveillante sert souvent à télécharger puis à exécuter une charge avec PowerShell.
- INetSim simule Internet, pour observer les communications d'un malware sans risque.
- Avec Volatility et `strings`, on prépare une image mémoire avant de l'analyser.
