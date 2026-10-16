---
titre: "SOC Fundamentals"
description: "Découvrir l'équipe SOC et ses processus."
resume: "Un SOC surveille en continu les réseaux et les systèmes d'une organisation pour détecter les menaces et y répondre. Cette note présente ce qu'il détecte, puis les trois piliers sur lesquels il repose (personnes, processus et technologie)."
date: "21.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/socfundamentals"
---

## Définitions

**SOC (Security Operations Center)** : centre des opérations de sécurité. C'est l'équipe qui surveille en permanence les réseaux et les systèmes d'une organisation. Elle détecte les menaces, les analyse et y répond.

**Acteur de la menace** : personne ou groupe malveillant qui exploite une faille pour causer des dommages, perturber l'activité ou voler des données.

**Vulnérabilité** : faiblesse d'un système, d'un logiciel ou d'un équipement. Un attaquant peut l'exploiter pour obtenir plus de droits que prévu.

**Intrusion** : accès non autorisé à un système ou à un réseau, obtenu grâce à une faille ou à une technique d'attaque.

**Triage d'alerte** : premier examen d'une alerte. Il sert à juger sa gravité et à lui donner une priorité.

**Réponse à incident** : ensemble des actions menées pour contenir un incident de sécurité, limiter ses effets et en comprendre la cause.

**Analyse forensique (forensics)** : étude détaillée des traces laissées sur un système ou un réseau. Elle permet de remonter à la cause profonde d'un incident.

**CISO (Chief Information Security Officer)** : directeur de la sécurité de l'information, l'équivalent du RSSI en français. Le responsable du SOC lui rend compte.

## À quoi sert un SOC

Les organisations stockent de grandes quantités de données sensibles sur leurs réseaux et leurs systèmes. Les attaquants ne visent donc plus seulement des biens physiques. Ils visent ces données. Les perdre, les voir modifiées ou ne plus y avoir accès peut causer des dommages importants.

Les menaces évoluent vite. De nouvelles vulnérabilités et de nouveaux vecteurs d'attaque apparaissent régulièrement. Les pratiques de sécurité classiques ne suffisent plus, il faut une équipe dont c'est le métier.

C'est le rôle du SOC, pilier de la sécurité défensive. Il assure trois choses :

- une surveillance continue, 24 heures sur 24 et 7 jours sur 7 ;
- le repérage des activités suspectes ;
- la prévention des dommages.

Le SOC s'appuie sur des solutions de sécurité intégrées. Elles lui permettent de surveiller tout le réseau et tous les systèmes depuis un point central. Son objectif tient en deux mots, **détecter** et **répondre**, sans interruption.

## Détecter et répondre

### Ce qu'un SOC détecte

| Type de détection | Exemple |
| --- | --- |
| Vulnérabilités | Des postes Windows auxquels il manque un correctif |
| Activités non autorisées | Une connexion avec les identifiants volés d'un employé, repérée grâce à une géolocalisation inhabituelle |
| Violations de la politique de sécurité | Un téléchargement illégal ou une fuite de données confidentielles |
| Intrusions | L'exploitation d'une application web, ou une infection après la visite d'un site malveillant |

Corriger une vulnérabilité n'est pas directement la mission du SOC. Il doit pourtant les repérer, car une faille non corrigée fragilise toute l'organisation. Les violations de politique dépendent des règles que chaque organisation s'est fixées.

### Comment il répond

Quand un incident survient, le SOC soutient sa gestion. Il aide à limiter l'impact, puis à identifier et analyser la cause profonde. Il assiste aussi les équipes spécialisées dans la réponse à incident.

Détection et réponse reposent sur trois piliers, les **personnes**, les **processus** et la **technologie**. C'est leur combinaison qui rend un SOC mature et efficace.

## Les personnes

Les outils automatisés produisent un grand nombre d'alertes. Beaucoup sont fausses ou sans gravité. Ce sont les analystes qui les filtrent, classent les menaces par priorité et vérifient que la réaction est adaptée. Sans eux, un SOC ressemblerait à une alarme incendie qui sonne sans arrêt. Il y aurait beaucoup de bruit et des ressources gaspillées.

| Rôle | Mission |
| --- | --- |
| Analyste SOC niveau 1 | Premier point de contact pour les alertes. Il fait le tri initial et signale celles qui sont réellement nuisibles |
| Analyste SOC niveau 2 | Mène les enquêtes approfondies, en corrélant les données de plusieurs sources |
| Analyste SOC niveau 3 | Expert senior. Il recherche activement les menaces et répond aux incidents critiques (confinement, éradication, remédiation) |
| Ingénieur sécurité | Déploie et configure les solutions de sécurité, et veille à leur bon fonctionnement |
| Ingénieur détection | Écrit et améliore les règles de détection. Ce rôle est souvent tenu par des analystes de niveau 2 ou 3 |
| Responsable du SOC | Supervise les processus, soutient l'équipe et rend compte au CISO de la posture de sécurité |

La taille et la composition de l'équipe varient selon la taille de l'organisation et la criticité de son activité.

## Les processus

### Le triage d'alerte

C'est la première étape de la réponse. Il s'agit de déterminer la gravité d'une alerte pour la classer par priorité. La méthode des **5 W** (What, When, Where, Who, Why) sert de grille d'analyse.

| Question | Ce que l'on cherche | Exemple |
| --- | --- | --- |
| Quoi (What) | La nature de l'événement | Un malware a été détecté |
| Quand (When) | Le moment de la détection | Le 5 juin 2024 à 13 h 20 |
| Où (Where) | L'hôte, le réseau ou le répertoire concerné | Sur le poste d'un employé |
| Qui (Who) | L'utilisateur ou le système concerné | L'utilisateur de ce poste |
| Pourquoi (Why) | La cause ou l'origine | Un téléchargement depuis un site de logiciels piratés |

### Le rapport

Les alertes jugées nuisibles sont transmises aux analystes de niveau supérieur. Le rapport qui les accompagne contient trois éléments :

- l'analyse selon les 5 W ;
- des explications détaillées ;
- des preuves, comme des captures d'écran ou des journaux.

### La réponse à incident et l'analyse forensique

La réponse à incident est déclenchée pour les incidents critiques. Elle comprend le confinement, la remédiation et des analyses approfondies. Une analyse forensique peut être nécessaire. Elle étudie les traces laissées sur les systèmes ou le réseau pour identifier la cause racine de l'incident.

## La technologie

La technologie complète les personnes et les processus. Elle a trois rôles :

- **centraliser** les informations venues de tous les équipements et de toutes les applications ;
- **réduire le travail manuel** des analystes ;
- **automatiser la détection** et accélérer la réponse.

### Les trois solutions principales

| Solution | Rôle |
| --- | --- |
| SIEM (Security Information and Event Management) | Centralise les journaux de nombreuses sources. Il applique des règles de détection et de corrélation pour signaler les activités suspectes. Les plus avancés ajoutent l'analyse comportementale, la threat intelligence et le machine learning |
| EDR (Endpoint Detection and Response) | Donne une visibilité détaillée sur les terminaux, en temps réel et dans l'historique. Il permet des détections avancées, des investigations poussées et une réponse rapide, parfois automatisée |
| Pare-feu (firewall) | Barrière entre le réseau interne et l'extérieur. Il filtre le trafic entrant et sortant, et bloque les flux suspects avant qu'ils n'atteignent les systèmes internes |

> [!note] Limite du SIEM
> Un SIEM ne fournit que de la **détection**. Il signale les activités suspectes, mais ne répond pas lui-même à la menace.

### Les autres solutions courantes

| Solution | Rôle |
| --- | --- |
| Antivirus | Détecte et supprime les malwares connus |
| EPP (Endpoint Protection Platform) | Suite de protection des postes de travail (antivirus, contrôle des applications, etc.) |
| IDS (Intrusion Detection System) | Repère les tentatives d'intrusion sur le réseau |
| IPS (Intrusion Prevention System) | Prolonge l'IDS en bloquant automatiquement les tentatives détectées |
| XDR (Extended Detection and Response) | Étend la détection et la réponse à plusieurs couches de l'infrastructure (réseau, terminaux, cloud) |
| SOAR (Security Orchestration, Automation and Response) | Automatise les tâches du SOC et orchestre les outils de sécurité entre eux |

Le choix de ces technologies dépend de la surface d'attaque de l'organisation et des ressources dont elle dispose.

## À retenir

- Un SOC a deux missions, **détecter** et **répondre**, et il les assure en continu.
- Personnes, processus et technologie sont ses trois piliers. Ils sont indissociables.
- Les outils produisent beaucoup d'alertes. Ce sont les analystes qui font le tri, avec la grille des 5 W.
- Une alerte nuisible est toujours transmise avec son analyse et ses preuves.
- Le SIEM détecte, l'EDR détecte et répond sur les terminaux, le pare-feu filtre le trafic.
