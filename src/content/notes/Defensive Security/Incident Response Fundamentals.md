---
titre: "Incident Response Fundamentals"
description: "Apprendre à mener une réponse à incident en cybersécurité."
resume: "Aucune protection n'est infaillible, il faut donc savoir réagir après une attaque. Cette note explique ce qu'est un incident, quels en sont les types, et comment les cadres SANS et NIST organisent la réponse."
date: "25.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/incidentresponsefundamentals"
---

## Définitions

**Événement** : action enregistrée par un système, qu'elle vienne d'un utilisateur (lancer un jeu, regarder une vidéo) ou d'un processus en arrière-plan.

**Alerte** : notification déclenchée par une solution de sécurité quand un ou plusieurs événements semblent nuisibles.

**Faux positif** : alerte qui signale une menace alors qu'il n'y a pas de danger réel.

**Vrai positif** : alerte qui correspond à une activité réellement dangereuse.

**Incident** : vrai positif analysé par l'équipe de sécurité et confirmé comme nécessitant une intervention.

**Réponse à incident (incident response)** : processus structuré qui gère un incident du début à la fin, de la détection à la limitation des dégâts.

**Plan de réponse à incident** : document officiel qui décrit les procédures à suivre avant, pendant et après un incident, avec les rôles, les responsabilités, la communication et l'escalade.

## Pourquoi se préparer à réagir

La sécurité préventive met en place des contrôles d'accès et des systèmes de surveillance. Elle ne suffit pas. Les organisations subissent des cyberattaques tous les jours, et celles-ci peuvent coûter très cher. Il faut donc prévoir ce qui se passe après une attaque.

La réponse à incident couvre tout le cycle, de la préparation au retour d'expérience. Son objectif est de réduire l'impact d'un incident et d'assurer une gestion coordonnée.

## De l'événement à l'incident

1. Les systèmes génèrent un grand nombre d'événements.
2. Les solutions de sécurité les collectent sous forme de journaux.
3. Elles analysent ces journaux et déclenchent des alertes sur les activités suspectes.
4. L'équipe de sécurité trie les alertes et sépare les faux positifs des vrais positifs.
5. Les vrais positifs confirmés deviennent des incidents.

Chaque incident reçoit une gravité (faible, moyenne, élevée ou critique), selon son impact possible sur l'organisation. Elle sert à traiter les incidents critiques en priorité.

## Les types d'incidents

| Type | Description |
| --- | --- |
| Infection par malware | Un programme malveillant endommage un système, un réseau ou une application. Il peut arriver par un document, un exécutable ou un autre fichier |
| Violation de sécurité (security breach) | Accès non autorisé à des données confidentielles |
| Fuite de données (data leak) | Exposition de données confidentielles à des tiers non autorisés. Elle peut être volontaire ou accidentelle (erreur humaine, mauvaise configuration) |
| Attaque interne (insider attack) | Un membre de l'organisation utilise son accès légitime de manière malveillante |
| Déni de service (DoS) | Un système est inondé de fausses requêtes, pour le rendre indisponible aux utilisateurs légitimes |

Ces incidents peuvent survenir seuls ou en même temps. Leur gravité dépend de l'organisation. Une fuite de données peut être mineure pour une entreprise, alors qu'un déni de service sur son service principal lui causera une perte critique.

## Les cadres SANS et NIST

Deux cadres servent de référence pour organiser la réponse. Celui du SANS compte six phases, résumées par le sigle PICERL. Celui du NIST couvre le même parcours en quatre phases.

| Phase SANS | Contenu | Phase NIST correspondante |
| --- | --- | --- |
| Préparation | Mettre en place les ressources, former les équipes, déployer les solutions de sécurité | Préparation |
| Identification | Repérer les comportements anormaux qui signalent un incident | Détection et analyse |
| Confinement | Isoler les systèmes compromis pour limiter la propagation | Confinement, éradication et récupération |
| Éradication | Supprimer la menace de l'environnement compromis | Confinement, éradication et récupération |
| Récupération | Restaurer et valider les systèmes touchés | Confinement, éradication et récupération |
| Enseignements tirés | Analyser l'incident après coup, pour améliorer la prévention et la réponse | Activité post-incident |

La préparation et les enseignements tirés sont les phases qui réduisent le plus les risques dans la durée. Chaque organisation adapte ces cadres à sa structure, à ses ressources et aux menaces qui la visent. Le plan de réponse à incident formalise ensuite les actions et les responsabilités, pour une réponse cohérente et rapide.

## Les outils et les procédures

La phase d'identification s'appuie sur des solutions automatisées.

| Outil | Rôle |
| --- | --- |
| SIEM | Collecte les journaux importants en un point central et les corrèle pour identifier les incidents |
| Antivirus | Détecte et supprime les programmes malveillants connus, et analyse régulièrement le système |
| EDR | Déployé sur chaque système, il détecte les menaces avancées. Il peut aussi les confiner et les éradiquer |

Deux types de documents guident ensuite la réponse. Le **playbook** donne les lignes directrices à suivre pour un type d'incident précis, ce qui accélère et standardise la réponse. Le **runbook** détaille l'exécution pas à pas de ces étapes, en fonction des ressources disponibles.

Un playbook pour un e-mail de phishing peut suivre ces étapes.

1. Informer les parties prenantes.
2. Analyser l'en-tête et le corps de l'e-mail, pour vérifier s'il est malveillant.
3. Examiner les pièces jointes.
4. Vérifier si des utilisateurs les ont ouvertes.
5. Isoler les systèmes infectés.
6. Bloquer l'expéditeur.

## À retenir

- Un incident est un vrai positif confirmé, qui demande une intervention.
- Sa gravité fixe la priorité de traitement.
- Les cadres SANS et NIST décrivent le même parcours, de la préparation au retour d'expérience.
- SIEM, antivirus et EDR aident à identifier les incidents. L'EDR permet aussi de confiner et d'éradiquer.
- Playbooks et runbooks rendent la réponse plus rapide et plus régulière.
