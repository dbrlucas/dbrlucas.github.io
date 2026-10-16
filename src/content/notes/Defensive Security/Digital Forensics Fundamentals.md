---
titre: "Digital Forensics Fundamentals"
description: "Découvrir l'investigation numérique et ses processus, puis les mettre en pratique sur un exemple."
resume: "L'investigation numérique consiste à collecter, préserver et analyser des preuves issues d'appareils numériques. Cette note présente la méthode du NIST, les règles d'acquisition des preuves, les outils d'une enquête sous Windows et un exemple pratique sur les métadonnées."
date: "22.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/digitalforensicsfundamentals"
---

## Définitions

**Investigation numérique (digital forensics)** : discipline qui consiste à identifier, collecter, préserver, analyser et présenter des preuves issues d'appareils numériques, dans le cadre d'une enquête.

**Preuve numérique** : toute information stockée ou transmise sous forme numérique et utilisable en justice (documents, images, journaux, communications).

**NIST (National Institute of Standards and Technology)** : organisme américain qui élabore des standards et des cadres de référence, notamment en cybersécurité.

**Chaîne de possession (chain of custody)** : document qui retrace chaque manipulation d'une preuve (collecte, transfert, stockage, accès). Il garantit son intégrité et sa fiabilité devant un tribunal.

**Bloqueur d'écriture (write blocker)** : dispositif matériel ou logiciel qui empêche toute modification d'un support pendant son acquisition.

**Image disque** : copie bit à bit de tout un support de stockage. Elle contient les données non volatiles, comme les fichiers, les documents ou l'historique de navigation.

**Image mémoire** : copie du contenu de la mémoire vive. Elle contient les données volatiles (processus actifs, connexions réseau, fichiers ouverts), qui disparaissent à l'extinction ou au redémarrage.

## Une discipline au service de l'enquête

Les appareils numériques facilitent la vie quotidienne, mais ils servent aussi à commettre des infractions. Lors d'une enquête, les forces de l'ordre saisissent les appareils suspects avec un mandat, puis les confient à une équipe d'investigation numérique.

Dans une affaire de vol de banque, par exemple, cette équipe peut retrouver :

- un plan numérique de la banque sur un ordinateur portable ;
- des documents décrivant les entrées, les sorties et les contrôles de sécurité sur un disque dur ;
- des photos et des vidéos de délits précédents ;
- des discussions et des journaux d'appels sur un téléphone.

## La méthode du NIST

Le NIST propose un cadre en quatre phases, applicable à toutes les enquêtes.

| Phase | Contenu |
| --- | --- |
| 1. Collecte | Identifier et saisir les appareils, préserver les données, documenter les preuves |
| 2. Examen | Filtrer et extraire les données pertinentes, par exemple les fichiers d'un utilisateur ou les médias d'une date précise |
| 3. Analyse | Corréler les preuves pour reconstituer les événements, souvent dans l'ordre chronologique, et en tirer des conclusions |
| 4. Rapport | Rédiger un rapport détaillé avec la méthode, les résultats, les preuves et les recommandations, ainsi qu'un résumé accessible à chaque public |

### Les spécialités

| Spécialité | Objet |
| --- | --- |
| Ordinateurs | Analyse des ordinateurs impliqués dans une infraction |
| Mobile | Extraction de preuves des téléphones et des tablettes (SMS, appels, positions GPS) |
| Réseau | Analyse du trafic et des journaux réseau |
| Bases de données | Recherche d'intrusions, de modifications ou d'exfiltrations de données |
| Cloud | Étude des données hébergées dans le cloud, plus complexe car on ne contrôle pas directement l'infrastructure |
| E-mail | Analyse des courriels liés au phishing, à la fraude ou à des campagnes malveillantes |

## Acquérir les preuves

L'acquisition doit se faire sans altérer les données d'origine. Trois pratiques sont fondamentales.

1. **L'autorisation légale.** Sans approbation officielle des autorités compétentes, les preuves risquent d'être jugées irrecevables par un tribunal.
2. **La chaîne de possession.** Elle documente tout le cycle de vie d'une preuve, ce qui permet de défendre sa fiabilité en justice.
3. **Le bloqueur d'écriture.** Il évite toute modification accidentelle quand on branche le support sur le poste d'analyse. La lecture reste possible, l'écriture est bloquée.

La chaîne de possession doit contenir :

- la description de la preuve (nom, type) ;
- l'identité de la personne qui l'a collectée ;
- la date et l'heure de la collecte ;
- le lieu de stockage ;
- le journal des accès à la preuve.

## L'investigation sous Windows

Deux images sont collectées. L'image mémoire se capture **en premier**, car son contenu est perdu dès que la machine s'éteint ou redémarre. L'image disque vient ensuite, pour récupérer les fichiers stockés de façon durable.

| Outil | Usage |
| --- | --- |
| FTK Imager | Outil propriétaire à interface graphique. Il crée des images disque et permet une première analyse |
| Autopsy | Plateforme open source d'analyse d'images disque (recherche par mot-clé, récupération de fichiers supprimés, métadonnées) |
| DumpIt | Utilitaire en ligne de commande qui capture une image mémoire sous Windows |
| Volatility | Outil open source d'analyse d'images mémoire. Ses plugins extraient des artefacts (processus, connexions). Il fonctionne avec Windows, Linux, macOS et Android |

## Exemple pratique sur les métadonnées

### Documents PDF

Les documents créés dans un éditeur avancé, comme Microsoft Word, gardent des métadonnées riches. Selon l'outil utilisé, l'export en PDF en conserve la plupart. La commande `pdfinfo` les affiche. On y trouve le logiciel qui a créé le document, ainsi que ses dates de création et de modification.

```bash
pdfinfo document.pdf
```

### Photos

Les photos prises avec un smartphone ou un appareil photo contiennent souvent le modèle de l'appareil, la date, les réglages de prise de vue et, fréquemment, les coordonnées GPS. La commande `exiftool` les affiche.

```bash
# Toutes les métadonnées EXIF
exiftool image.jpg

# Seulement la latitude et la longitude
exiftool -gpslatitude -gpslongitude image.jpg
```

Les coordonnées s'affichent sous la forme `48 deg 51' 29.60" N, 2 deg 17' 40.20" E`. Pour les chercher sur une carte, on les réécrit en degrés, minutes et secondes, soit `48°51'29.6"N 2°17'40.2"E`.

> [!warning] Des indices, pas des preuves
> Les métadonnées peuvent être falsifiées. Ce sont des indices, à recouper avec d'autres éléments.

### Bonnes pratiques

- Ne jamais modifier la preuve originale. On travaille sur une copie.
- Ne pas envoyer de preuves sensibles à des outils en ligne publics, ce qui compromettrait leur confidentialité et leur intégrité. On utilise des outils locaux.
- Noter chaque extraction dans le rapport (outil, options, date et heure de l'analyse).

## À retenir

- L'investigation numérique suit quatre phases, la collecte, l'examen, l'analyse et le rapport.
- Une preuve n'a de valeur que si elle est acquise légalement, tracée et protégée contre toute modification.
- Sous Windows, on capture la mémoire avant le disque.
- Les métadonnées orientent l'enquête, mais elles peuvent être falsifiées.
