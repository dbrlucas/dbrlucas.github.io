---
titre: "Logs Fundamentals"
description: "Découvrir ce que sont les journaux et comment les analyser pour mener une enquête efficace."
resume: "Les journaux gardent la trace de tout ce qui se passe sur un système. Cette note présente leurs usages et leurs types, puis deux cas d'analyse, les journaux d'événements Windows et les journaux d'accès d'un serveur web."
date: "27.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/logsfundamentals"
---

## Définitions

**Journal (log)** : enregistrement chronologique des événements d'un système. L'activité enregistrée peut être normale (démarrage d'un service) ou malveillante (tentative d'intrusion).

**Analyse de journaux** : technique qui extrait les informations utiles des journaux, pour repérer des anomalies ou des comportements suspects.

**Event ID** : numéro unique attribué à chaque type d'activité dans les journaux Windows.

**Journal d'accès (access log)** : fichier où un serveur web enregistre chaque requête reçue.

**User-Agent** : chaîne envoyée par le client, qui décrit son navigateur et son système.

**Rotation des journaux (log rotation)** : mécanisme qui découpe les journaux par période (jour, semaine) et compresse souvent les anciens fichiers, pour qu'aucun ne devienne trop volumineux.

## À quoi servent les journaux

Les journaux sont les empreintes numériques laissées par toutes les activités d'un système. Ils servent dans plusieurs situations.

| Usage | Objectif |
| --- | --- |
| Surveillance de la sécurité | Détecter en temps réel un comportement anormal ou suspect |
| Enquête après incident | Retracer et comprendre les actions menées pendant un incident |
| Dépannage | Diagnostiquer et corriger les erreurs d'un système ou d'une application |
| Suivi des performances | Suivre le comportement d'une application |
| Audit et conformité | Vérifier les actions et les processus, pour répondre à des exigences légales ou internes |

Pour l'équipe de sécurité, ils sont une source de vérité. Ils permettent de reconstituer le déroulé d'une attaque, et parfois d'identifier l'attaquant.

## Les types de journaux

Les journaux sont classés par catégories, ce qui permet d'ouvrir directement celui qui répond à la question posée. Pour chercher des connexions réussies sous Windows, par exemple, on consulte le journal de sécurité et pas les autres.

| Type | Contenu |
| --- | --- |
| Système | Fonctionnement du système d'exploitation (démarrages, arrêts, erreurs, incidents matériels) |
| Sécurité | Authentifications, changements de comptes, activités suspectes |
| Application | Événements propres à une application (interactions des utilisateurs, erreurs, mises à jour) |
| Audit | Modifications du système, accès aux données et activités des utilisateurs, souvent pour la conformité |
| Réseau | Trafic entrant et sortant, connexions, pare-feu |
| Accès | Accès aux ressources (serveurs web, bases de données, API) |

Leur volume interdit de tout lire à l'œil nu. L'analyse combine donc des techniques manuelles et des outils automatisés.

## Les journaux d'événements Windows

Windows range ses événements dans des journaux séparés selon leur type (application, système, sécurité). L'Observateur d'événements (Event Viewer) permet de les consulter dans une interface graphique.

Chaque entrée contient quatre champs principaux.

| Champ | Contenu |
| --- | --- |
| Description | Détail de l'activité |
| Nom du journal | Journal dans lequel l'événement est enregistré |
| Date (Logged) | Date et heure de l'activité |
| Event ID | Identifiant du type d'activité |

Quelques identifiants reviennent souvent dans une enquête.

| Event ID | Activité |
| --- | --- |
| `4624` | Connexion réussie |
| `4625` | Connexion échouée |
| `4634` | Déconnexion réussie |
| `4720` | Création d'un compte utilisateur |
| `4722` | Activation d'un compte utilisateur |
| `4724` | Tentative de réinitialisation d'un mot de passe |
| `4725` | Désactivation d'un compte utilisateur |
| `4726` | Suppression d'un compte utilisateur |

La fonction *Filter Current Log* filtre un journal par Event ID. Filtrer sur `4624` donne par exemple toutes les connexions réussies.

## Les journaux d'accès d'un serveur web

Un serveur web comme Apache écrit une ligne par requête dans son fichier `access.log`.

```text
203.0.113.5 - - [06/Jun/2024:13:58:44 +0000] "GET /products HTTP/1.1" 200 3395 "-" "Mozilla/5.0 (...)"
```

| Champ | Exemple | Signification |
| --- | --- | --- |
| Adresse IP | `203.0.113.5` | Client qui a envoyé la requête |
| Horodatage | `[06/Jun/2024:13:58:44 +0000]` | Date et heure de la requête |
| Requête | `"GET /products HTTP/1.1"` | Méthode HTTP et ressource demandée |
| Code de statut | `200` | Réponse du serveur (`200` OK, `404` introuvable, `500` erreur interne) |
| User-Agent | `"Mozilla/5.0 (...)"` | Navigateur et système du client |

### Commandes utiles

```bash
# Afficher un fichier, ou en réunir plusieurs en un seul
cat access.log
cat access1.log access2.log > combined_access.log

# Parcourir un gros fichier page par page (/motif pour chercher, n et N pour naviguer)
less access.log

# Toutes les lignes d'une adresse IP
grep "192.168.1.1" access.log

# Les requêtes GET vers /products
grep '"GET /products' access.log

# Les requêtes qui ont renvoyé un code 404
grep '" 404 ' access.log

# Les adresses IP les plus actives
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head

# Méthode, URL et version HTTP de chaque requête
awk -F\" '{print $2}' access.log | awk '{print $1, $2, $3}' | head

# Chercher dans les journaux compressés par la rotation
zcat access.log.*.gz | grep "motif"
```

### Méthode d'analyse

- **Cibler le bon fichier.** Avec la rotation, on analyse le fichier de la période qui nous intéresse, ou on en réunit plusieurs.
- **Filtrer avant de lire.** `grep` et `awk` isolent les lignes pertinentes (IP suspecte, URL visée, codes d'erreur) avant la lecture ligne par ligne.
- **Extraire et croiser.** Les adresses IP, les horaires, les URL et les codes de statut se recoupent avec d'autres journaux (pare-feu, application, système).
- **Lire les archives sans les décompresser.** `zcat` et `zgrep` interrogent directement les fichiers compressés.
- **Documenter.** On note les commandes lancées, les fichiers analysés et les périodes étudiées, pour le rapport.

Certains motifs trahissent une attaque.

| Ce que l'on observe | Ce que cela peut indiquer |
| --- | --- |
| Un très grand nombre de requêtes depuis une même IP | Une attaque par force brute |
| Beaucoup de codes `404` sur des pages sensibles | Un scan du site |
| Des codes `500` répétés | Une tentative d'exploitation, ou un bug exploité |
| Des requêtes `POST` suspectes vers une page d'envoi de fichiers | Une tentative de dépôt de fichier, à vérifier avec les IP et les horaires |

## À retenir

- Les journaux servent à surveiller, enquêter, dépanner et prouver la conformité.
- Bien les classer permet d'ouvrir directement le bon journal.
- Sous Windows, on filtre par Event ID. `4624` et `4625` désignent les connexions réussies et échouées.
- Sur un serveur web, `grep` et `awk` suffisent pour isoler une IP, une URL ou un code de statut.
- On filtre d'abord, on lit ensuite, et on documente chaque étape.
