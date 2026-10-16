---
titre: "Windows PowerShell"
description: "Découvrir la « puissance » de PowerShell et en apprendre les bases."
resume: "PowerShell manipule des objets plutôt que du texte, ce qui le rend plus puissant que l'invite de commandes. Cette note présente les cmdlets de base, la gestion des fichiers, le pipeline, puis les commandes utiles pour analyser un système et l'automatiser."
date: "03.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/windowspowershell"
---

## Définitions

**PowerShell** : shell en ligne de commande et langage de script de Microsoft, fondé sur .NET. Il sert surtout à administrer et automatiser Windows.

**Cmdlet** : commande native de PowerShell, nommée selon le format `Verbe-Nom`. Elle renvoie des objets .NET.

**Objet** : élément structuré qui possède des propriétés (des données) et des méthodes (des fonctions).

**Alias** : nom raccourci d'une cmdlet. `cd` est par exemple un alias de `Set-Location`.

**Module** : ensemble de cmdlets qui servent une même fonctionnalité.

**PSGallery** : dépôt officiel en ligne des modules PowerShell.

**Pipeline** : enchaînement de commandes avec `|`, où la sortie de l'une devient l'entrée de la suivante.

## Qu'est-ce que PowerShell

PowerShell a été conçu pour dépasser les limites de `cmd.exe` et des scripts batch. Sa différence principale est d'être orienté objet. Là où Bash ou l'invite de commandes manipulent du texte, PowerShell transmet des données structurées, qu'on manipule sans traitement intermédiaire.

D'abord réservé à Windows, il existe depuis 2016 en version open source et multiplateforme, PowerShell Core, pour Linux et macOS.

## Les bases

On lance PowerShell depuis le menu Démarrer, la boîte Exécuter (`Win + R`), l'explorateur de fichiers, ou en tapant `powershell` dans `cmd.exe`.

| Cmdlet | Effet |
| --- | --- |
| `Get-Command` | Liste les commandes disponibles (cmdlets, fonctions, alias, scripts) |
| `Get-Command -CommandType "Function"` | Ne liste que les fonctions |
| `Get-Help <cmdlet>` | Affiche l'aide d'une cmdlet, avec les options `-Examples`, `-Detailed`, `-Full` ou `-Online` |
| `Get-Alias` | Liste les alias |
| `Find-Module -Name "<motif>"` | Cherche des modules dans les dépôts en ligne |
| `Install-Module -Name "<module>"` | Installe un module, par exemple depuis PSGallery |

Les alias comme `ls`, `cd` ou `cat` facilitent la transition depuis d'autres shells.

## Fichiers et répertoires

| Cmdlet | Effet | Équivalent CMD |
| --- | --- | --- |
| `Get-ChildItem -Path <chemin>` | Liste le contenu d'un répertoire | `dir` |
| `Set-Location -Path <chemin>` | Change de répertoire | `cd` |
| `New-Item -Path <chemin> -ItemType File` | Crée un fichier, ou un dossier avec `Directory` | `mkdir` |
| `Remove-Item -Path <chemin>` | Supprime un fichier ou un dossier | `del`, `rmdir` |
| `Copy-Item -Path <source> -Destination <cible>` | Copie | `copy` |
| `Move-Item -Path <source> -Destination <cible>` | Déplace | `move` |
| `Get-Content -Path <fichier>` | Affiche un fichier | `type` |

`Set-Location` accepte un chemin relatif (`.\dossier`) ou absolu (`C:\Users\utilisateur\Documents`).

## Le pipeline, le filtrage et le tri

Dans PowerShell, le pipeline transmet des objets. On peut donc filtrer sur une propriété, trier ou ne garder que certaines colonnes.

```powershell
# Trier les fichiers par taille croissante
Get-ChildItem | Sort-Object Length

# Ne garder que les fichiers .txt
Get-ChildItem | Where-Object -Property "Extension" -eq ".txt"

# Ne garder que les fichiers dont le nom commence par « rapport »
Get-ChildItem | Where-Object -Property "Name" -like "rapport*"

# Afficher seulement le nom et la taille
Get-ChildItem | Select-Object Name,Length

# Trouver le plus gros fichier
Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 1

# Chercher un mot dans un fichier (expressions régulières acceptées)
Select-String -Path ".\notes.txt" -Pattern "mot"
```

| Opérateur de `Where-Object` | Signification |
| --- | --- |
| `-eq` | Égal à |
| `-ne` | Différent de |
| `-gt` et `-ge` | Supérieur, ou supérieur ou égal à |
| `-lt` et `-le` | Inférieur, ou inférieur ou égal à |
| `-like` | Correspond à un motif avec `*` |

## Système et réseau

| Cmdlet | Effet |
| --- | --- |
| `Get-ComputerInfo` | Donne de nombreuses informations sur le système (version, édition, date d'installation). Elle peut être lente |
| `Get-LocalUser` | Liste les comptes locaux et leur état |
| `Get-NetIPConfiguration` | Montre la configuration IP de chaque interface (adresse, DNS, passerelle) |
| `Get-NetIPAddress` | Liste toutes les adresses IP configurées |

Ces cmdlets donnent des informations plus riches et mieux structurées que `systeminfo` ou `ipconfig`. `Get-LocalUser` sert par exemple à auditer les comptes actifs.

## Analyser un système en temps réel

| Cmdlet | Effet | Intérêt en sécurité |
| --- | --- | --- |
| `Get-Process` | Liste les processus avec leur ID, leur CPU et leur mémoire | Gestionnaire des tâches en ligne de commande |
| `Get-Service` | Liste les services et leur état | Repérer un service inconnu |
| `Get-NetTCPConnection` | Liste les connexions TCP, avec les adresses, les ports et le PID | Repérer une connexion suspecte, comme celle d'une porte dérobée |
| `Get-FileHash -Path <fichier>` | Calcule le hash d'un fichier, en SHA-256 par défaut | Comparer un fichier à une base de réputation comme VirusTotal |

Ces cmdlets sont précieuses en investigation et en réponse à incident.

## Les scripts

Le scripting PowerShell est une compétence centrale en cybersécurité. Il fait gagner du temps, réduit les erreurs humaines et rend possibles des tâches trop complexes à la main.

| Profil | Usage |
| --- | --- |
| Blue Team | Analyser les journaux, détecter des anomalies, répondre aux incidents |
| Red Team | Automatiser l'énumération et l'exécution à distance |
| Administrateur | Gérer la configuration et la surveillance à grande échelle |

`Invoke-Command` exécute des commandes sur des machines distantes, soit un fichier de script, soit un bloc de commandes.

```powershell
# Exécuter un script local sur une machine distante
Invoke-Command -FilePath <script> -ComputerName <machine>

# Exécuter un bloc de commandes avec des identifiants précis
Invoke-Command -ComputerName <machine> -Credential <domaine\utilisateur> -ScriptBlock { <commande> }
```

Pas besoin d'être expert. Quelques lignes suffisent souvent pour des tâches puissantes.

## À retenir

- PowerShell manipule des objets, ce qui rend le filtrage et le tri précis.
- Les cmdlets suivent le format `Verbe-Nom`, et `Get-Help` explique chacune d'elles.
- `Where-Object`, `Sort-Object` et `Select-Object` travaillent sur les propriétés des objets.
- `Get-Process`, `Get-Service`, `Get-NetTCPConnection` et `Get-FileHash` servent en réponse à incident.
- `Invoke-Command` automatise l'administration à distance.
