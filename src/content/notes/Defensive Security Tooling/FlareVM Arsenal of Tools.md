---
titre: "FlareVM: Arsenal of Tools"
description: "Découvrir l'arsenal d'outils d'investigation de FlareVM."
resume: "FlareVM installe sur une machine Windows tout l'outillage de l'analyse de malwares et de la rétro-ingénierie. Cette note présente ses outils par catégorie, détaille les plus utilisés en investigation, puis décrit une démarche pour examiner un fichier suspect."
date: "31.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/flarevmarsenaloftools"
---

## Définitions

**FlareVM** : collection de scripts qui installe et configure sur Windows des outils de rétro-ingénierie, d'analyse de malwares, de réponse à incident et d'investigation numérique. FLARE signifie Forensics, Logic Analysis and Reverse Engineering.

**Chocolatey** : gestionnaire de paquets pour Windows. FlareVM s'en sert pour automatiser l'installation des outils.

**PE (Portable Executable)** : format des fichiers exécutables de Windows.

**IAT (Import Address Table)** : table d'un exécutable PE qui liste les API et les bibliothèques dont il a besoin. Elle révèle ses comportements possibles (chiffrement, réseau, manipulation de processus).

**Obfuscation** : technique qui masque le code ou les chaînes d'un programme, pour gêner son analyse.

**C2 (Command and Control)** : serveur par lequel un attaquant envoie des commandes à un malware et en reçoit les données.

## Présentation

FlareVM fournit, de façon automatisée et reproductible, un poste Windows riche en outils d'analyse statique et dynamique. Il s'adresse aux analystes de malwares, aux équipes SOC et de réponse à incident, et aux spécialistes de l'investigation numérique.

Quelques précautions s'imposent.

- On l'installe uniquement dans une machine virtuelle dédiée, avec un instantané pris avant l'installation.
- On n'analyse jamais un échantillon actif sur la machine hôte. Le réseau de la machine virtuelle est isolé, ou simulé avec INetSim.
- L'installation demande des droits d'administrateur et une connexion Internet. L'antivirus doit être désactivé, car beaucoup d'outils déclenchent de fausses alertes.
- On note la version des outils installés, pour pouvoir reproduire une analyse.

Le script d'installation se lance dans PowerShell. Il exécute des commandes téléchargées depuis Internet, ce qui mérite une relecture dans un environnement soumis à des règles strictes.

## L'arsenal par catégorie

| Catégorie | Outils |
| --- | --- |
| Rétro-ingénierie et débogage | Ghidra, x64dbg, OllyDbg, Radare2, Binary Ninja |
| Analyse statique | CFF Explorer, PEStudio, PEview, Detect It Easy (DIE), PEiD, FLOSS, RetDec |
| Analyse dynamique | Procmon, Process Explorer, Process Hacker, Wireshark |
| Mémoire et investigation | Volatility, Rekall, FTK Imager |
| Réseau et simulation | Wireshark, mitmproxy, INetSim |
| Automatisation | Python, PowerShell, YARA |

Ghidra est la suite de rétro-ingénierie open source de la NSA. Avec RetDec, elle sert à décompiler un binaire en pseudo-code lisible. DIE et PEiD identifient le compilateur d'un fichier et le packer qui le protège. La suite Sysinternals regroupe Procmon, Process Explorer et Autoruns.

## Les outils d'investigation courants

| Outil | Usage |
| --- | --- |
| Procmon (Process Monitor) | Enregistre en temps réel les opérations sur les fichiers, le registre et les processus. Il sert à tracer le comportement d'un processus suspect |
| Process Explorer | Gestionnaire de tâches avancé. Il affiche l'arbre parent-enfant des processus, leurs DLL, leurs handles et le chemin de chaque exécutable |
| HxD | Éditeur hexadécimal, pour lire ou modifier le contenu brut d'un fichier. Il sert à vérifier un en-tête, comme les octets `4D 5A` (`MZ`) d'un exécutable |
| Wireshark | Capture le trafic réseau et décode les protocoles, pour y chercher des adresses IP, des domaines ou des charges |
| CFF Explorer | Inspecte et modifie les fichiers PE (en-têtes, sections, imports, exports) et calcule leurs empreintes |
| PEStudio | Analyse un exécutable sans le lancer. Il fournit des indicateurs comme l'entropie, les imports suspects et les signatures |
| FLOSS (FLARE Obfuscated String Solver) | Extrait les chaînes d'un binaire et désobfusque celles qui sont masquées, dont les stackstrings |

Quelques manipulations reviennent souvent.

| Besoin | Manipulation |
| --- | --- |
| Suivre un seul processus dans Procmon | *Filter*, puis *Process Name is* suivi du nom du processus |
| Voir l'arbre des processus dans Process Explorer | *View → Show Process Tree* |
| Voir les DLL d'un processus | Double-clic sur le processus, onglet *DLLs* |
| Comparer deux fichiers dans HxD | *Analysis → File-Compare* |
| Extraire les fichiers d'un trafic HTTP dans Wireshark | *File → Export Objects → HTTP* |

```powershell
# Empreinte SHA-256 d'un fichier
certutil -hashfile echantillon.exe SHA256

# Extraire et désobfusquer les chaînes d'un binaire
floss echantillon.exe
```

## Analyser un fichier suspect

L'analyse va du statique au dynamique. On commence par ce qui ne demande pas d'exécuter le fichier.

1. **Triage.** Calculer les empreintes du fichier, vérifier sa réputation sur VirusTotal, regarder son entropie et identifier un éventuel packer.
2. **Analyse statique.** Examiner les métadonnées et les imports avec PEStudio, puis extraire les chaînes avec FLOSS. On y cherche des URL, des chemins ou des clés.
3. **Analyse dynamique.** Si l'environnement est sûr, exécuter le fichier dans la machine virtuelle isolée, sous la surveillance de Procmon, de Process Explorer et de Wireshark.
4. **Analyse mémoire.** Capturer la mémoire et l'étudier avec Volatility, puis extraire les indicateurs de compromission.
5. **Rapport.** Rédiger les conclusions et créer des signatures, comme des règles YARA ou des règles pour le SIEM.

Certains indices statiques orientent tout de suite l'enquête.

| Indice | Ce qu'il suggère |
| --- | --- |
| Un fichier qui se présente comme un outil système, mais placé hors de son emplacement habituel | Un leurre |
| Des métadonnées dans une langue inattendue | Une origine possible, ou une tentative d'usurpation |
| L'absence d'en-tête Rich | Un fichier peut-être packé ou obfusqué |
| Des imports comme `CryptoStream`, `RijndaelManaged` ou `CreateDecryptor` | L'usage du chiffrement AES, pour des communications chiffrées ou un ransomware |
| Un import comme `Set_UseShellExecute` | La capacité de lancer d'autres processus |

L'analyse dynamique confirme ensuite ces hypothèses. Process Explorer montre la filiation des processus, par exemple un traitement de texte qui lance un interpréteur de commandes puis PowerShell. Cette chaîne aide à retrouver le vecteur d'infection. Son onglet *TCP/IP* liste les connexions réseau d'un processus. Procmon, filtré sur le nom du processus, confirme l'activité réseau observée.

> [!note] Garder une trace
> Chaque action se consigne, avec la commande, l'instantané utilisé et l'heure. On travaille toujours sur une copie, l'original restant intact.

## À retenir

- FlareVM transforme une machine virtuelle Windows en poste d'analyse de malwares.
- Il s'installe dans un environnement isolé, avec un instantané de départ.
- PEStudio et FLOSS servent à l'analyse statique, Procmon et Process Explorer à l'analyse dynamique.
- On procède toujours du statique vers le dynamique.
- Les imports et les métadonnées d'un fichier donnent les premières hypothèses, que l'exécution contrôlée confirme.
