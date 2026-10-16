---
titre: "SOC Role in Blue Team"
description: "Découvrir les métiers de la sécurité et apprendre à faire évoluer sa carrière en SOC, à partir du poste d'analyste L1."
resume: "Le SOC n'est qu'une des équipes de sécurité d'une entreprise. Cette note le situe dans la hiérarchie de la sécurité et dans la Blue Team, puis présente les évolutions possibles après un poste d'analyste L1."
date: "09.11.2025"
plateforme: "TryHackMe"
parcours: "SOC Level 1"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/socroleinblueteam"
---

## Définitions

**CISO (Chief Information Security Officer)** : responsable de la sécurité de l'information. Il définit la stratégie de cybersécurité et supervise les équipes de sécurité.

**Red Team** : équipe offensive qui teste les défenses de l'entreprise en simulant des attaques réelles.

**Blue Team** : équipe défensive, chargée de détecter les attaques, d'y répondre et de les prévenir.

**GRC (Governance, Risk and Compliance)** : équipe qui gère les politiques de sécurité, les risques et la conformité réglementaire.

**PCI DSS (Payment Card Industry Data Security Standard)** : norme de sécurité imposée aux entreprises qui manipulent des cartes de paiement.

**CIRT (Cyber Incident Response Team)** : équipe d'intervention sur les incidents critiques. Les termes CSIRT et CERT désignent la même chose.

**MSSP (Managed Security Service Provider)** : société qui fournit des services de sécurité externalisés à plusieurs clients.

## La hiérarchie de la sécurité

Les priorités de sécurité dépendent du type d'organisation.

| Organisation | Priorité |
| --- | --- |
| Cabinet d'avocats | Confidentialité des documents |
| Usine | Disponibilité des lignes de production |
| Hôpital | Sécurité et confidentialité des patients |

La hiérarchie suit souvent le même schéma. Le PDG est au sommet, puis vient le CISO, les managers, les analystes SOC et les autres équipes techniques.

Dans une petite structure, c'est souvent le service informatique qui assure la cybersécurité. Dans une grande entreprise, le CISO supervise plusieurs équipes spécialisées comme la Red Team, la Blue Team et l'équipe GRC.

## La Blue Team

La Blue Team défend l'entreprise contre les cybermenaces. Elle surveille les attaques, y répond rapidement et renforce la posture de sécurité. Selon la taille de l'organisation, elle compte de 3 à 50 membres répartis en sous-équipes spécialisées.

### Le SOC

Le SOC est le cœur de la défense. Il fonctionne en général 24 heures sur 24. Il collecte et surveille les journaux, enquête sur les alertes, crée des règles de détection, coopère avec l'équipe informatique et rédige des rapports de synthèse.

| Rôle | Mission |
| --- | --- |
| Analyste L1 | Trie les alertes et remonte les cas complexes |
| Analyste L2 | Enquête sur les incidents plus avancés |
| Ingénieur SOC | Configure et maintient les outils (EDR, SIEM) |
| Responsable du SOC | Supervise l'équipe et coordonne ses activités |

C'est souvent le premier poste d'un débutant en cybersécurité.

### Le CIRT

Le CIRT est une équipe d'experts mobilisée pour les incidents graves et les attaques complexes. Elle regroupe des analystes forensiques, des analystes threat intelligence, des threat hunters et des analystes de malwares.

| Exemple | Nature |
| --- | --- |
| JPCERT | CERT national japonais |
| Mandiant | Équipe privée internationale |
| AWS CIRT | Équipe qui traite les incidents sur les services Amazon Web Services |

### Les rôles spécialisés

On les trouve dans les grandes entreprises, les startups technologiques et les agences gouvernementales.

| Rôle | Mission |
| --- | --- |
| Analyste forensique (digital forensics) | Analyse les disques et la mémoire pour retrouver les traces d'une attaque |
| Analyste threat intelligence | Suit les groupes d'attaquants et leurs tactiques |
| Ingénieur AppSec | Sécurise le code et les applications tout au long de leur cycle de vie |
| Ingénieur DevSecOps | Automatise la sécurité dans les pipelines CI/CD |
| Chercheur en IA | Étudie les menaces liées à l'intelligence artificielle et développe des contre-mesures |

## Faire carrière dans un SOC

### Commencer comme analyste L1

Le poste d'analyste L1 est une bonne porte d'entrée dans la cybersécurité. On y voit des attaques réelles et on comprend comment une entreprise se défend. C'est un poste formateur où l'on manipule de nombreux outils et où l'on traite de vraies alertes.

Quatre étapes mènent à ce poste, puis au suivant.

1. Acquérir les compétences de base d'un SOC (analyse d'alertes, SIEM, EDR) et les pratiquer.
2. Être proactif en participant à des CTF et en suivant l'actualité.
3. Préparer les entretiens, puis postuler.
4. Après quelque temps, viser un poste de niveau supérieur (L2, ingénieur SOC ou CIRT).

### SOC interne ou MSSP

| Aspect | SOC interne | MSSP |
| --- | --- | --- |
| Cadre | On protège les systèmes de sa propre entreprise, une banque par exemple | On protège de nombreux clients en même temps |
| Rythme | Plus calme, avec peu de pression sur les délais | Rapide et sous pression, avec un flux constant d'alertes |
| Outils | Moins nombreux mais maîtrisés en profondeur | Nombreux et variés |
| Expérience | Peu d'incidents majeurs | Des attaques et des incidents chaque semaine, donc un apprentissage accéléré |

Le SOC interne apporte de la stabilité et une expertise approfondie sur un environnement précis. Le MSSP est plus intense et fait gagner de l'expérience plus vite.

### Après le poste de L1

Plusieurs évolutions sont possibles :

- analyste SOC L2 avec plus d'autonomie et d'expertise ;
- ingénieur SOC, chargé de la configuration des outils de sécurité ;
- membre du CIRT qui intervient sur les incidents ;
- responsable du SOC, voire CISO à long terme.

L'objectif des premières années est avant tout d'acquérir une solide expérience pratique.

## À retenir

- Le CISO supervise la Red Team, la Blue Team et l'équipe GRC.
- Le SOC est le cœur de la Blue Team et souvent le premier poste en cybersécurité.
- Le CIRT et les rôles spécialisés prennent en charge les incidents graves et les sujets complexes.
- SOC interne et MSSP offrent deux expériences différentes, l'une plus stable, l'autre plus intense.
- Le poste de L1 sert d'abord à accumuler de l'expérience pratique.
