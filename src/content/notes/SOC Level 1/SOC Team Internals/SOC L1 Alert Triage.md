---
titre: "SOC L1 Alert Triage"
description: "En apprendre plus sur les alertes SOC et construire une méthode systématique pour les trier efficacement."
resume: "La façon de trier une alerte décide si une attaque sera détectée ou passera inaperçue. Cette note suit le parcours d'une alerte, de l'événement d'origine au verdict final, et donne une méthode pour choisir quelle alerte traiter en premier."
date: "11.11.2025"
plateforme: "TryHackMe"
parcours: "SOC Level 1"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/socl1alerttriage"
---

## Définitions

**Événement (event)** : action enregistrée par un système, comme une connexion, la création d'un processus ou un transfert de fichier.

**Journal (log)** : enregistrement écrit par un système ou une application pour décrire un événement.

**Alerte** : notification générée automatiquement par un outil de sécurité quand il détecte un comportement anormal ou potentiellement malveillant. C'est le point de départ du travail de l'analyste.

**Triage d'alerte** : examen d'une alerte par un analyste. Il juge sa légitimité et son urgence, puis décide de la suite (clôture, escalade ou investigation).

**NDR (Network Detection and Response)** : solution qui analyse le trafic réseau pour détecter les comportements anormaux.

**ITSM (IT Service Management)** : outil de gestion des tickets, parfois utilisé pour suivre les alertes. Jira et TheHive en sont des exemples.

**Playbook (ou runbook)** : document qui décrit, étape par étape, comment enquêter sur une catégorie d'alerte et y répondre.

## De l'événement à l'alerte

Tout commence par un événement sur un système, comme une connexion, le lancement d'un exécutable ou l'ouverture d'un port. Le système l'enregistre dans ses journaux. Ces journaux sont ensuite envoyés à un SIEM, à un EDR ou à une autre solution de sécurité.

Ces solutions traitent des millions de journaux par jour, mais seules certaines combinaisons d'événements méritent l'attention. Quand l'outil en repère une, il crée une alerte. L'analyste traite ainsi quelques dizaines d'alertes, au lieu de millions de lignes de journaux.

### Les plateformes de gestion des alertes

| Plateforme | Rôle |
| --- | --- |
| SIEM | Cœur du SOC. Il centralise les alertes et la corrélation, et c'est le choix par défaut de la plupart des équipes. Splunk et Elastic en sont des exemples |
| EDR et NDR | Ils ont leurs propres tableaux de bord, mais il est recommandé de tout regrouper dans un SIEM ou un SOAR. Microsoft Defender et CrowdStrike sont des EDR |
| SOAR | Utilisé dans les SOC avancés pour automatiser les réponses et centraliser les alertes de nombreuses sources |
| ITSM | Sert parfois de gestionnaire de tickets pour le suivi des alertes |

### Qui fait quoi

| Rôle | Mission |
| --- | --- |
| Analyste L1 | Première ligne de défense. Il reçoit, analyse, classe et escalade les alertes suspectes. Il peut en recevoir de 0 à 100 par jour |
| Analyste L2 | Traite les alertes escaladées, avec une analyse approfondie et la remédiation |
| Analyste L3 | Gère les menaces avancées et la recherche proactive de menaces |
| Ingénieur SOC | Vérifie que les alertes sont bien configurées. Il ajuste les règles pour réduire les faux positifs et enrichir les alertes |
| Responsable du SOC | Suit la qualité et la rapidité du triage, et s'assure qu'aucune vraie attaque n'est manquée |

## Les propriétés d'une alerte

| Propriété | Rôle |
| --- | --- |
| Heure (alert time) | Moment où l'alerte est créée. Elle arrive souvent quelques minutes après l'événement réel, le temps que les journaux soient collectés et traités. Un événement survenu à 15 h 32 peut donner une alerte à 15 h 35 |
| Nom | Résume l'action suspecte, d'après le nom de la règle de détection. Par exemple *Unusual Login Location* ou *Windows RDP Bruteforce* |
| Gravité (severity) | Niveau d'urgence, de faible à critique. Il est fixé par les ingénieurs de détection, mais l'analyste peut le modifier selon le contexte |
| Statut | État d'avancement du traitement, par exemple *New*, *In Progress*, *Waiting* ou *Closed* |
| Verdict | Conclusion du triage. Un *True Positive* est une menace réelle, un *False Positive* une activité légitime |
| Responsable (assignee) | Analyste qui prend l'alerte en charge. Chaque alerte doit en avoir un, pour que rien ne reste sans suivi |
| Description | Explique la logique de la règle, le risque associé, et parfois la marche à suivre pour le triage |
| Champs | Données techniques qui ont déclenché l'alerte, comme l'hôte, l'utilisateur, la ligne de commande, les adresses IP ou le hash d'un fichier |

Les verdicts comptent au-delà de l'alerte elle-même, car ils alimentent les indicateurs du SOC.

## Choisir l'alerte à traiter

Face à une file d'alertes, l'analyste doit choisir laquelle traiter en premier, pour avoir le plus de chances d'interrompre une menace réelle. Chaque SOC définit ses règles de priorité, parfois automatisées dans le SIEM, l'EDR ou le SOAR. La méthode tient en trois étapes.

1. **Filtrer.** Écarter les alertes déjà ouvertes par un collègue, déjà assignées ou déjà résolues. On évite ainsi le travail en double.
2. **Trier par gravité.** Commencer par les alertes critiques, puis élevées, moyennes et faibles. Les alertes critiques ont plus de chances d'être de vraies menaces, et leur impact peut être majeur (exfiltration, mouvement latéral, ransomware).
3. **Trier par ancienneté.** À gravité égale, traiter d'abord les plus anciennes. L'attaque correspondante est peut-être déjà en cours, et l'attaquant a pu progresser.

## Le triage en trois temps

### Actions initiales

- S'assigner l'alerte, pour en prendre la responsabilité.
- Passer son statut à *In Progress*.
- Lire le nom, la gravité, la description et les champs de l'alerte.
- Comparer l'heure de l'alerte à celle de l'événement.
- Vérifier le contexte, avec la source de la donnée (EDR, pare-feu, proxy) et l'historique des alertes sur le même hôte ou le même utilisateur.

### Enquête

- Identifier la victime potentielle (utilisateur, hôte, service).
- Comprendre l'action signalée, comme une connexion anormale, un binaire suspect ou une possible exfiltration.
- Examiner les événements juste avant et juste après l'alerte (connexions, créations de processus, modifications de fichiers, élévations de privilèges).
- Enrichir l'analyse avec la threat intelligence (réputation d'une IP, d'un domaine ou d'un hash) et avec l'état du compte dans l'annuaire.
- Suivre le playbook prévu pour ce type d'alerte, s'il existe.
- Documenter au fur et à mesure les actions, les requêtes et les preuves.

### Actions finales

- Rendre un verdict. Un *True Positive* est escaladé au niveau 2 ou au CIRT si nécessaire. Un *False Positive* est documenté puis clos.
- Rédiger un commentaire détaillé, avec les étapes d'analyse, les preuves et la justification du verdict. Il sert à l'audit et au passage de relais.
- Mettre à jour le statut de l'alerte.
- En cas d'escalade, joindre toutes les preuves et les étapes déjà faites, pour accélérer la suite.
- Si un faux positif revient souvent, demander aux ingénieurs d'ajuster la règle.

## À retenir

- Une alerte naît d'un événement, enregistré dans un journal puis repéré par un outil de sécurité.
- Avant de trier, on filtre, puis on classe par gravité et par ancienneté.
- Le triage suit toujours trois temps, les actions initiales, l'enquête puis les actions finales.
- Chaque verdict s'accompagne d'un commentaire et de preuves, utiles pour l'audit et pour le niveau 2.
- Les faux positifs récurrents se signalent aux ingénieurs, pour ajuster les règles.
