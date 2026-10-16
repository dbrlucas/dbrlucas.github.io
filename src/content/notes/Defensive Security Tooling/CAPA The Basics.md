---
titre: "CAPA: The Basics"
description: "Apprendre à utiliser CAPA pour identifier des capacités malveillantes."
resume: "CAPA analyse un exécutable sans le lancer et liste ce qu'il est capable de faire. Cette note explique comment lancer l'outil et comment lire son rapport, bloc par bloc, avec les référentiels MITRE ATT&CK, MAEC et MBC, puis les espaces de noms et les capacités."
date: "29.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/capabasics"
---

## Définitions

**CAPA (Common Analysis Platform for Artifacts)** : outil développé par l'équipe FireEye Mandiant. Il identifie automatiquement les capacités d'un fichier exécutable, grâce à des règles qui décrivent des comportements courants.

**Capacité** : fonctionnalité qu'un programme peut exécuter, comme communiquer sur le réseau, manipuler des fichiers ou s'injecter dans un processus.

**Analyse statique** : étude d'un programme sans l'exécuter, à partir de son code ou de sa structure.

**Analyse dynamique** : étude d'un programme en l'exécutant dans un environnement contrôlé, pour observer son comportement réel.

**MITRE ATT&CK** : référentiel qui documente les tactiques et les techniques utilisées par les attaquants.

**MAEC (Malware Attribute Enumeration and Characterization)** : langage standardisé qui décrit les attributs et les comportements des malwares.

**MBC (Malware Behavior Catalog)** : catalogue standardisé des comportements des malwares.

**Stackstring** : technique d'obfuscation où une chaîne est construite sur la pile pendant l'exécution, au lieu d'être stockée en clair.

## À quoi sert CAPA

Exécuter un logiciel suspect hors d'un environnement isolé peut compromettre la machine. CAPA évite ce risque. Il examine le fichier sans le lancer et en déduit ses capacités. L'analyste gagne ainsi du temps, que ce soit pour étudier un malware, chercher des menaces ou répondre à un incident.

Il accepte plusieurs formats, dont les exécutables PE et ELF, les modules .NET, le shellcode et les rapports de bac à sable.

> [!note] Des capacités potentielles
> CAPA signale ce qu'un fichier peut faire, d'après des indices statiques. Ses résultats se confirment par une analyse dynamique en bac à sable et par le recoupement avec les journaux et le trafic réseau.

## Lancer CAPA

```powershell
# Analyse simple
capa.exe .\echantillon.exe

# Sortie détaillée, puis très détaillée
capa.exe .\echantillon.exe -v
capa.exe .\echantillon.exe -vv

# Résultat en JSON, enregistré dans un fichier
capa.exe -j -vv .\echantillon.exe > resultat.json
```

| Option | Effet |
| --- | --- |
| `-h` | Affiche l'aide et les options |
| `-v` | Donne une sortie détaillée |
| `-vv` | Montre toutes les correspondances de règles. L'analyse est plus lente |
| `-j` | Produit le résultat au format JSON |

L'analyse peut prendre plusieurs minutes, selon la taille et la complexité du fichier. Quand un résultat a déjà été enregistré dans un fichier texte, on le relit avec `Get-Content` au lieu de relancer l'analyse.

## Lire le rapport

### Informations générales

Le premier bloc identifie l'échantillon et précise comment il a été analysé.

| Champ | Contenu |
| --- | --- |
| `md5`, `sha1`, `sha256` | Empreintes du fichier, qui l'identifient de façon unique |
| `analysis` | Méthode d'analyse, par exemple `static` |
| `os` | Système visé, par exemple `windows` |
| `format` | Format du fichier, par exemple `pe` pour un exécutable Windows |
| `arch` | Architecture, par exemple `i386` ou `x86_64` |
| `path` | Emplacement du fichier analysé |

Ces informations orientent la suite de l'enquête et le choix des outils.

### MITRE ATT&CK

CAPA rattache ses détections aux tactiques et aux techniques d'ATT&CK. Chaque ligne se lit sous la forme `Tactique :: Technique [identifiant]`.

```text
DEFENSE EVASION :: Obfuscated Files or Information [T1027]
```

| Élément | Définition | Dans l'exemple |
| --- | --- | --- |
| Tactique | Objectif poursuivi par l'attaquant | `DEFENSE EVASION` |
| Technique | Méthode employée pour l'atteindre | `Obfuscated Files or Information` |
| Identifiant | Code de la technique. Une sous-technique ajoute un suffixe, comme `T1027.005` | `T1027` |

Cette correspondance aide à fixer les priorités. Elle permet aussi de rédiger des rapports dans un vocabulaire que les équipes SOC et de réponse à incident partagent.

### MAEC

CAPA attribue au fichier une catégorie MAEC, qui résume son profil.

| Valeur | Signification | À vérifier |
| --- | --- | --- |
| Launcher | Le fichier sert d'amorce. Il dépose ou exécute d'autres composants | Persistance, communications réseau, fichiers écrits, commandes lancées |
| Downloader | Le fichier télécharge puis exécute d'autres charges | Adresses contactées et fichiers récupérés |

### MBC

Le MBC classe les comportements par **objectifs**, proches des tactiques d'ATT&CK.

| Objectif | Signification |
| --- | --- |
| Anti-Behavioral Analysis | Échapper à l'analyse dynamique (bac à sable, débogueur) |
| Anti-Static Analysis | Compliquer l'analyse statique (obfuscation, chiffrement) |
| Collection | Récupérer des informations sur la machine ou le réseau visé |
| Command and Control | Communiquer avec un serveur de commande |
| Credential Access | Voler des identifiants |
| Defense Evasion | Contourner les mécanismes de détection |
| Discovery | Recueillir des informations sur le système et le réseau |
| Execution | Exécuter du code ou des commandes non autorisés |
| Exfiltration | Extraire des données sensibles |
| Impact | Perturber ou endommager des systèmes ou des données |
| Lateral Movement | Se propager sur le réseau |
| Persistence | Rester actif sur le système dans la durée |
| Privilege Escalation | Obtenir des privilèges plus élevés |

Il décrit aussi des **micro-comportements**, plus élémentaires. Chacun est souvent légitime pris isolément, mais peut faire partie d'un schéma malveillant. Ils sont regroupés en micro-objectifs.

| Micro-objectif | Actions concernées |
| --- | --- |
| Process | Création et gestion de processus, de threads, de mutex |
| Memory | Allocation, modification et libération de mémoire |
| Communication | Trafic réseau (HTTP, DNS, FTP, SMTP, ICMP) |
| Data | Vérification, encodage, décodage et compression de données |
| File System | Création, lecture, écriture et suppression de fichiers ou de dossiers |

Une ligne du rapport se lit de gauche à droite, du plus général au plus précis.

```text
DATA :: Encode Data::Base64 [C0026.001]
```

| Élément | Valeur | Sens |
| --- | --- | --- |
| Micro-objectif | `DATA` | Le fichier agit sur des données |
| Comportement | `Encode Data` | Il encode des données |
| Méthode | `Base64` | L'encodage utilisé est le Base64 |
| Identifiant | `C0026.001` | Référence du comportement et de sa méthode dans le catalogue |

Ici, le fichier est donc capable d'encoder des données en Base64.

### Espaces de noms et capacités

CAPA range ses règles dans des **espaces de noms** (namespaces), qui regroupent celles qui ont un but voisin. Le premier niveau s'appelle le Top-Level Namespace, ou TLN.

| TLN | Ce qu'il regroupe |
| --- | --- |
| `anti-analysis` | Techniques pour échapper à l'analyse (détection de machine virtuelle, anti-débogage, obfuscation) |
| `communication` | Échanges réseau, comme HTTP |
| `data-manipulation` | Modification et encodage de données (Base64, XOR) |
| `host-interaction` | Actions sur l'hôte, comme la lecture, l'écriture ou la suppression de fichiers |
| `persistence` | Moyens de rester actif après un redémarrage, comme les tâches planifiées |
| `load-code` | Chargement de code |
| `impact` | Actions destructrices ou perturbatrices |
| `linking` | Liaison avec des bibliothèques |

Chaque **capacité** détectée correspond à une règle, écrite dans un fichier YAML. Le fichier porte le nom de la capacité, les espaces étant remplacés par des tirets.

| Élément | Exemple |
| --- | --- |
| Capacité | `reference Base64 string` |
| Fichier de règle | `reference-base64-string.yml` |
| Espace de noms | `encoding/base64` |
| TLN | `data-manipulation` |

Les règles encore expérimentales sont rangées à part, dans la catégorie *nursery*.

Cette hiérarchie répond à quatre questions sur un fichier. Elle dit comment il interagit avec l'hôte, comment il évite l'analyse, s'il charge du code externe et comment il persiste.

## Aller plus loin dans les résultats

Avec `-vv`, CAPA montre précisément quels éléments du fichier ont déclenché chaque règle, comme une chaîne, un motif ou un appel d'API. Une règle sur les tâches planifiées repose par exemple sur la présence des chaînes `schtasks` et `create`.

Cette sortie peut atteindre des milliers de lignes, difficiles à lire dans un terminal. L'option `-j` l'exporte en JSON. Le fichier se charge alors dans **CAPA Web Explorer**, une interface graphique qui permet de parcourir les capacités, de chercher dans les résultats et de voir les règles déclenchées.

## À retenir

- CAPA liste les capacités d'un exécutable sans l'exécuter.
- Son rapport commence par les empreintes, le format et l'architecture du fichier.
- Il traduit ses détections dans trois référentiels, MITRE ATT&CK, MAEC et MBC.
- Chaque capacité correspond à une règle YAML, rangée dans un espace de noms.
- Ce sont des capacités potentielles, à confirmer par une analyse dynamique.
