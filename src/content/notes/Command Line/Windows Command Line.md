---
titre: "Windows Command Line"
description: "Apprendre les commandes essentielles de Windows."
resume: "L'invite de commandes de Windows permet d'aller plus vite qu'avec la souris. Cette note présente les commandes pour connaître le système, diagnostiquer le réseau, gérer les fichiers et surveiller les processus."
date: "28.07.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/windowscommandline"
---

## Définitions

**Interface graphique (GUI)** : interface faite de fenêtres, d'icônes et de boutons.

**Interface en ligne de commande (CLI)** : interface où l'on tape des commandes textuelles.

**cmd.exe** : interpréteur de commandes par défaut de Windows, aussi appelé invite de commandes.

**Path** : variable d'environnement qui liste les répertoires où Windows cherche les exécutables.

**Pipe (`|`)** : opérateur qui envoie la sortie d'une commande en entrée d'une autre.

**PID (Process Identifier)** : numéro unique attribué à chaque processus en cours.

## Pourquoi la ligne de commande

Beaucoup préfèrent l'interface graphique, jugée plus intuitive. La ligne de commande est pourtant plus rapide. Trouver son adresse IP, par exemple, demande une seule commande au lieu de plusieurs clics.

- Elle consomme peu de ressources, ce qui convient au matériel limité et aux machines cloud bon marché.
- Elle permet d'automatiser les tâches répétitives, avec des scripts ou des fichiers batch.
- Elle simplifie l'administration à distance des serveurs, routeurs et objets connectés, même sur une connexion lente.

## Connaître le système

| Commande | Effet |
| --- | --- |
| `set` | Affiche les variables d'environnement, dont `Path` |
| `ver` | Affiche la version de Windows |
| `systeminfo` | Donne un rapport complet sur le système (nom d'hôte, version, fabricant, configuration) |
| `driverquery` | Liste les pilotes installés |
| `help <commande>` | Affiche l'aide d'une commande |
| `cls` | Efface l'écran |

Quand une sortie est trop longue, on l'envoie dans `more` avec un pipe, par exemple `driverquery | more`. La barre d'espace passe à la page suivante. `Ctrl + C` interrompt une commande en cours.

## Diagnostiquer le réseau

| Commande | Effet |
| --- | --- |
| `ipconfig` | Affiche la configuration IP (adresse, masque, passerelle) |
| `ipconfig /all` | Ajoute le détail de chaque interface, dont les serveurs DNS et l'état DHCP |
| `ping <cible>` | Vérifie qu'une machine répond |
| `tracert <cible>` | Affiche les routeurs traversés jusqu'à la cible |
| `nslookup <domaine>` | Résout un nom de domaine avec le serveur DNS par défaut |
| `nslookup <domaine> <serveur>` | Résout un nom avec un serveur DNS précis |
| `netstat` | Affiche les connexions réseau et les ports en écoute |

`ipconfig /all` aide à diagnostiquer un problème DHCP ou DNS. `tracert` montre où un paquet se bloque sur son chemin.

`netstat` devient très parlant avec ses options combinées, par exemple `netstat -abon`.

| Option | Effet |
| --- | --- |
| `-a` | Toutes les connexions et tous les ports en écoute |
| `-b` | L'exécutable associé à chaque connexion |
| `-o` | Le PID de chaque connexion |
| `-n` | Les adresses et les ports en numérique |

## Gérer les fichiers

| Commande | Effet |
| --- | --- |
| `cd` | Affiche le répertoire courant, ou en change avec un chemin |
| `cd ..` | Remonte d'un niveau |
| `dir` | Liste le contenu du répertoire |
| `dir /a` | Inclut les fichiers cachés et système |
| `dir /s` | Liste aussi le contenu des sous-répertoires |
| `tree` | Affiche l'arborescence des répertoires |
| `mkdir <nom>` | Crée un répertoire |
| `rmdir <nom>` | Supprime un répertoire vide |
| `type <fichier>` | Affiche un fichier texte |
| `more <fichier>` | Affiche un fichier texte page par page |
| `copy <source> <destination>` | Copie un fichier |
| `move <source> <destination>` | Déplace un fichier |
| `del <fichier>` ou `erase <fichier>` | Supprime un fichier |

Le joker `*` agit sur plusieurs fichiers à la fois. `copy *.md C:\notes` copie par exemple tous les fichiers `.md`. `del` et `erase` s'utilisent avec précaution.

## Surveiller les processus

| Commande | Effet |
| --- | --- |
| `tasklist` | Liste les processus en cours |
| `tasklist /FI "imagename eq sshd.exe"` | Filtre la liste sur un nom de processus |
| `taskkill /PID <PID>` | Termine un processus |

La liste complète est longue, d'où l'intérêt du filtre `/FI`. Arrêter un processus critique peut rendre le système instable.

## Autres commandes utiles

| Commande | Effet |
| --- | --- |
| `chkdsk` | Vérifie un disque et repère les secteurs défectueux |
| `sfc /scannow` | Analyse et répare les fichiers système corrompus |
| `<commande> /?` | Affiche l'aide de presque n'importe quelle commande |

Une fois ces bases acquises, l'étape suivante est PowerShell.

## À retenir

- La ligne de commande est plus rapide et s'automatise mieux que l'interface graphique.
- `systeminfo` et `ipconfig /all` donnent l'essentiel sur la machine et son réseau.
- `netstat -abon` relie chaque connexion à son processus.
- `tasklist` et `taskkill` surveillent et arrêtent les processus.
- `/?` affiche l'aide d'une commande, et `| more` découpe une sortie trop longue.
