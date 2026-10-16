---
titre: "Wireshark: The Basics"
description: "Apprendre les bases de Wireshark et l'analyse de protocoles et de fichiers PCAP."
resume: "Wireshark capture le trafic réseau et l'affiche paquet par paquet. Cette note présente son interface, la lecture d'un paquet couche par couche, puis les fonctions qui servent à naviguer dans une capture et à la filtrer."
date: "14.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 5
difficulte: "Easy"
lien: "https://tryhackme.com/room/wiresharkthebasics"
---

## Définitions

**Wireshark** : analyseur de paquets réseau, open source et multiplateforme. Il capture le trafic en temps réel ou lit des fichiers de capture.

**Paquet** : unité de données transmise sur un réseau. Il contient des données utiles et des en-têtes de contrôle.

**PCAP (Packet Capture)** : format de fichier qui stocke des captures de paquets.

**Interface réseau** : point de connexion entre un ordinateur et un réseau, comme `lo`, `eth0` ou `ens33`.

**Dissection** : décodage détaillé d'un paquet, protocole par protocole et champ par champ.

**tshark** : version en ligne de commande de Wireshark, sans interface graphique.

## À quoi sert Wireshark

Wireshark capture tout le trafic auquel la machine a accès. Certaines interfaces demandent pour cela des droits d'administrateur. C'est un outil de base pour diagnostiquer un problème réseau, analyser un incident de sécurité ou apprendre comment fonctionnent les protocoles.

Il se contente de lire et d'afficher les paquets, sans jamais les modifier. Il ne dit pas non plus ce qui est anormal. Repérer une anomalie dépend entièrement de l'expertise de l'analyste.

Deux types de filtres existent. Les **filtres de capture** s'appliquent avant l'enregistrement, les **filtres d'affichage** après.

## L'interface

L'écran d'accueil comprend cinq zones. On y trouve la barre d'outils, la barre de filtre d'affichage, les fichiers récents, la liste des interfaces avec leurs filtres de capture, et la barre d'état.

Une fois une capture chargée, les paquets s'affichent dans trois volets.

| Volet | Contenu |
| --- | --- |
| Liste des paquets | Une ligne par paquet, avec son numéro, son heure, sa source, sa destination et son protocole |
| Détails du paquet | Le paquet sélectionné, décodé couche par couche |
| Octets | Le contenu brut du paquet, en hexadécimal et en ASCII |

Wireshark colore les paquets selon leur protocole et certaines conditions, ce qui aide à repérer rapidement un événement. Une coloration peut être temporaire, pour la session en cours, ou enregistrée dans le profil.

| Action | Chemin |
| --- | --- |
| Démarrer, arrêter ou relancer une capture | Boutons bleu, rouge et vert de la barre d'outils |
| Ouvrir un fichier PCAP | *File → Open* |
| Fusionner deux fichiers PCAP | *File → Merge* |
| Activer ou désactiver la coloration | *View → Colourise Packet List* |
| Voir les propriétés du fichier (hash, date, interface, commentaires) | *Statistics → Capture File Properties* |

## Lire un paquet

Le volet des détails présente un paquet en cinq à sept couches, qui suivent le modèle OSI.

| Ligne affichée | Couche | Contenu |
| --- | --- | --- |
| Frame | Physique | Informations sur la trame elle-même |
| Source et destination MAC | Liaison de données | Adresses MAC |
| Source et destination IP | Réseau | Adresses IPv4 |
| Protocole de transport | Transport | TCP ou UDP, avec les ports source et destination |
| Erreurs de protocole | Transport | Segments TCP qui ont dû être réassemblés |
| Protocole d'application | Application | Détails du protocole, par exemple HTTP, FTP ou SMB |
| Données d'application | Application | Contenu transporté |

Cliquer sur une ligne des détails met en surbrillance les octets correspondants dans le volet du bas. Wireshark sait décoder un très grand nombre de protocoles, et il accepte des scripts de dissection personnalisés.

## Naviguer dans une capture

| Fonction | Chemin | Usage |
| --- | --- | --- |
| Aller à un paquet | *Go → Go to Packet* | Atteindre un paquet par son numéro |
| Chercher | *Edit → Find Packet* | Rechercher un contenu, sous forme de filtre, d'hexadécimal, de chaîne ou d'expression régulière |
| Marquer | Clic droit, *Mark/Unmark Packet* | Repérer un paquet. Il s'affiche en noir, pour la session seulement |
| Commenter | Clic droit, *Packet Comment* | Ajouter une note qui reste dans le fichier |
| Exporter des paquets | *File → Export Specified Packets* | Isoler les paquets suspects dans un nouveau fichier |
| Exporter des objets | *File → Export Objects* | Extraire les fichiers transférés par un protocole |
| Changer le format de l'heure | *View → Time Display Format* | Choisir l'affichage de l'heure des paquets |

Le menu *Analyze → Expert Information* liste les événements et les anomalies que Wireshark a relevés, classés par gravité.

| Niveau | Couleur | Signification |
| --- | --- | --- |
| Chat | Bleu | Informations sur le déroulement normal |
| Note | Cyan | Événements notables, comme une erreur d'application |
| Warning | Jaune | Avertissements sur un comportement inhabituel |
| Error | Rouge | Problèmes, comme un paquet mal formé |

## Filtrer les paquets

Les filtres d'affichage réduisent le bruit sans toucher à la capture d'origine. Ils portent sur un champ, sur une conversation entière, ou combinent plusieurs conditions avec des opérateurs logiques. Un clic droit sur un champ donne accès aux plus courants.

| Action | Effet |
| --- | --- |
| *Apply as Filter* | Filtre immédiatement sur la valeur sélectionnée |
| *Prepare as Filter* | Écrit le filtre sans l'exécuter, pour le compléter d'abord |
| *Conversation Filter* | Ne garde que les paquets de la même conversation |
| *Colourise Conversation* | Met la conversation en couleur, sans masquer les autres paquets |
| *Apply as Column* | Ajoute le champ comme colonne de la liste des paquets |
| *Analyze → Follow* | Reconstitue le flux d'un protocole et applique le filtre correspondant |

Suivre un flux reconstitue les données telles que l'application les a échangées. Sur un protocole non chiffré, cela peut révéler des identifiants ou des mots de passe.

## À retenir

- Wireshark lit et affiche les paquets. L'interprétation reste le travail de l'analyste.
- Une capture se lit dans trois volets, la liste, les détails et les octets.
- Un paquet se décode couche par couche, de la trame aux données de l'application.
- *Expert Information* signale les anomalies, classées de Chat à Error.
- Les filtres d'affichage et le suivi de flux font ressortir l'essentiel d'une capture.
