---
titre: "Introduction to SIEM"
description: "Apprendre les bases du SIEM et explorer ses fonctionnalités."
resume: "Un SIEM réunit les journaux de tout le réseau en un seul endroit et les corrèle pour repérer les incidents. Cette note présente les sources de journaux, les façons de les envoyer au SIEM, puis les règles, les alertes et le travail de l'analyste."
date: "27.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/introtosiem"
---

## Définitions

**SIEM (Security Information and Event Management)** : outil qui collecte les journaux de nombreuses sources, les centralise et les corrèle pour identifier les événements de sécurité.

**Ingestion** : collecte et intégration des journaux dans le SIEM, pour qu'ils puissent être analysés.

**Normalisation** : mise au même format des données venues de sources différentes, pour pouvoir les comparer et les corréler.

**Corrélation d'événements** : mise en relation d'événements de sources différentes (réseau, hôtes, applications), pour faire apparaître un comportement suspect ou une attaque.

**Règle de corrélation** : ensemble de conditions logiques appliquées aux journaux pour détecter un comportement suspect.

**Faux positif** : alerte qui semble indiquer une menace, mais qui ne représente aucun risque réel après analyse.

**Sysmon (System Monitor)** : outil Windows qui enregistre des événements détaillés sur les processus, les connexions réseau et les modifications du système.

**Syslog** : protocole standard qui transmet les journaux en temps réel vers une destination centrale.

## Deux familles de journaux

| Famille | Ce qu'elle décrit | Exemples |
| --- | --- | --- |
| Journaux d'hôte | Ce qui se passe à l'intérieur d'une machine | Accès à un fichier, tentative d'authentification, exécution d'un processus, modification du registre Windows |
| Journaux réseau | Les communications entre machines ou avec Internet | Connexion SSH, transfert FTP, trafic web, accès par VPN, partage de fichiers |

Les journaux d'hôte viennent par exemple des Windows Event Logs, de Sysmon ou d'Osquery. Les journaux réseau concernent des protocoles comme SSH, HTTP et HTTPS, FTP, SMB ou les VPN.

## Pourquoi un SIEM

Sans SIEM, il faut analyser chaque appareil séparément, ce qui est beaucoup trop lourd pendant un incident. Le SIEM centralise les journaux et les corrèle en temps réel. Il donne ainsi une vision globale du réseau et permet de réagir vite. Quand une condition prédéfinie est remplie ou qu'un seuil est dépassé, il génère une alerte pour les analystes.

Ses capacités principales sont les suivantes :

- l'ingestion des journaux en temps réel ;
- la corrélation d'événements venus de sources différentes ;
- la détection des comportements anormaux, avec des alertes ;
- une surveillance continue, 24 heures sur 24 ;
- la visualisation et l'analyse des données ;
- les enquêtes sur les incidents passés ;
- le threat hunting, c'est-à-dire la recherche proactive de menaces qu'aucune règle ne couvre encore.

## Sources et ingestion

### Où se trouvent les journaux

Sous **Windows**, les journaux se consultent dans l'Observateur d'événements (Event Viewer). Chaque type d'événement y porte un identifiant unique.

Sous **Linux**, ils sont rangés dans `/var/log`.

| Emplacement | Contenu |
| --- | --- |
| `/var/log/httpd` | Requêtes et erreurs HTTP |
| `/var/log/cron` | Événements des tâches planifiées |
| `/var/log/auth.log` ou `/var/log/secure` | Authentifications |
| `/var/log/kern` | Événements du noyau |

Un **serveur web Apache** écrit ses journaux dans `/var/log/apache` ou `/var/log/httpd`. Chaque requête y occupe une ligne.

```text
192.168.1.20 - - [21/Mar/2022:10:17:10 -0300] "GET /index.html HTTP/1.0" 200 3395
```

### Comment ils arrivent dans le SIEM

| Méthode | Principe |
| --- | --- |
| Agent (forwarder) | Un petit programme installé sur la machine collecte les journaux et les envoie au SIEM. Le Splunk Forwarder en est un exemple |
| Syslog | Protocole standard et très répandu. Il transfère les journaux en temps réel depuis des serveurs web, des bases de données ou des équipements réseau |
| Envoi manuel | On dépose directement des fichiers de journaux dans le SIEM, comme le permettent Splunk ou ELK |
| Écoute sur un port | Le SIEM écoute sur un port défini, et les machines y envoient leurs journaux |

## Règles, alertes et tableaux de bord

Une fois normalisés, les journaux sont analysés par des règles que les analystes ont définies. Quand les conditions d'une règle sont remplies, une alerte est déclenchée et une enquête commence.

### Exemples de règles

| Condition | Alerte levée |
| --- | --- |
| 5 connexions échouées en 10 secondes | *Multiple Failed Login Attempts* |
| Connexion réussie après plusieurs échecs | *Successful Login After Multiple Failed Attempts* |
| Journal Windows avec l'Event ID `104` (un journal a été effacé) | *Event Log Cleared* |
| Journal Windows avec l'Event ID `4688` (nouveau processus) dont le nom contient `whoami` | *WHOAMI Command Execution Detected* |

La commande `whoami` est surveillée car un attaquant la lance souvent juste après une élévation de privilèges.

### Tableaux de bord

Les tableaux de bord présentent l'information sous une forme synthétique et exploitable. Chaque SIEM, comme QRadar, en propose par défaut et permet d'en créer sur mesure. On y trouve notamment :

- les alertes les plus importantes ;
- les notifications du système et les alertes sur son état de santé ;
- la liste des connexions échouées ;
- le nombre d'événements ingérés ;
- les règles déclenchées ;
- les domaines les plus visités.

## Le travail de l'analyste

Avec un SIEM, l'analyste SOC a plusieurs responsabilités.

| Responsabilité | Contenu |
| --- | --- |
| Surveillance et investigation | Suivre les événements de sécurité et enquêter sur les alertes |
| Gestion des faux positifs | Les identifier, pour éviter les alertes inutiles |
| Affinage des règles | Réduire le bruit des règles qui se déclenchent trop souvent |
| Rapports et conformité | Produire les rapports demandés par les audits et la réglementation |
| Couverture des angles morts | Réduire les zones du réseau qui ne sont pas surveillées |

Face à une alerte, il vérifie les événements liés et les conditions de la règle. Il détermine ensuite s'il s'agit d'un faux positif ou d'une alerte valide. Plusieurs suites sont alors possibles :

- ajuster la règle, si c'est un faux positif ;
- approfondir l'investigation, si l'alerte est valide ;
- contacter le propriétaire de la machine, pour vérifier l'activité ;
- isoler un hôte compromis ;
- bloquer une adresse IP ou un autre indicateur suspect.

## À retenir

- Le SIEM centralise les journaux d'hôte et les journaux réseau, puis les corrèle.
- Les journaux lui arrivent par un agent, par Syslog, par envoi manuel ou par écoute sur un port.
- Ils sont normalisés avant d'être analysés par des règles de corrélation.
- Une règle remplie déclenche une alerte, que l'analyste doit qualifier.
- Affiner les règles réduit les faux positifs et le bruit.
