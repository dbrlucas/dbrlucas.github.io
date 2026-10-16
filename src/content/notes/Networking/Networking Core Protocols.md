---
titre: "Networking Core Protocols"
description: "Découvrir les protocoles fondamentaux de TCP/IP."
resume: "Naviguer sur le web, transférer un fichier ou envoyer un e-mail repose sur quelques protocoles de la couche application. Cette note présente DNS, WHOIS, HTTP, FTP, SMTP, POP3 et IMAP, avec leurs ports et leurs commandes principales."
date: "12.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/networkingcoreprotocols"
---

## Définitions

**DNS (Domain Name System)** : système qui traduit un nom de domaine en adresse IP. Il travaille à la couche application.

**WHOIS** : service qui donne les informations publiques d'enregistrement d'un nom de domaine.

**Registrar** : société accréditée qui gère l'enregistrement des noms de domaine.

**HTTP (Hypertext Transfer Protocol)** : protocole client-serveur qui transfère les pages web et leurs ressources.

**FTP (File Transfer Protocol)** : protocole de transfert de fichiers entre un client et un serveur.

**SMTP (Simple Mail Transfer Protocol)** : protocole standard d'envoi des e-mails.

**POP3 (Post Office Protocol version 3)** : protocole qui récupère les e-mails stockés sur un serveur.

**IMAP (Internet Message Access Protocol)** : protocole qui permet de consulter et de gérer ses e-mails directement sur le serveur.

## DNS

Le DNS évite de retenir des adresses IP, en travaillant avec des noms lisibles. Il utilise le port UDP 53, et le port TCP 53 en secours.

| Enregistrement | Rôle |
| --- | --- |
| A | Associe un nom de domaine à une adresse IPv4 |
| AAAA | Associe un nom de domaine à une adresse IPv6 |
| CNAME (Canonical Name) | Associe un nom de domaine à un autre nom de domaine |
| MX (Mail Exchange) | Indique le serveur de messagerie d'un domaine |

Quand un navigateur charge `example.com`, il demande au serveur DNS l'enregistrement A, puis l'enregistrement AAAA. Quand un serveur de messagerie envoie un e-mail à une adresse de ce domaine, il demande l'enregistrement MX.

```bash
nslookup example.com
```

## WHOIS

WHOIS n'est pas un sigle. Le mot se prononce « who is ». Le service renvoie les informations d'enregistrement d'un domaine.

- les dates de création, de mise à jour et d'expiration ;
- le registrar, avec son site et son contact pour les abus ;
- les données du déclarant (nom, organisation, adresse, e-mail, téléphone).

Ces données sont publiques par défaut. Les registrars proposent souvent un service de protection qui les masque. Elles servent à identifier le propriétaire d'un domaine, à connaître son ancienneté, ou à contacter son administrateur pour signaler un abus.

```bash
whois example.com
```

## HTTP et HTTPS

HTTP fonctionne sur TCP, avec le port 80 par défaut. HTTPS est sa version sécurisée. Il chiffre les échanges avec TLS et utilise le port 443. Les ports 8080 et 8443 servent parfois d'alternatives.

| Méthode | Action |
| --- | --- |
| GET | Récupère une ressource |
| POST | Envoie des données au serveur (formulaire, fichier) |
| PUT | Crée une ressource ou la remplace entièrement |
| DELETE | Supprime une ressource |

HTTP étant un protocole en texte, on peut dialoguer à la main avec un serveur web grâce à `telnet`, pour tester ou dépanner. Wireshark montre de son côté le détail des requêtes et des réponses, comme les en-têtes ou la version du serveur.

## FTP

FTP utilise le port TCP 21 pour les commandes. Chaque transfert de fichier ou chaque liste de répertoire passe ensuite par une connexion de données distincte.

Deux modes de transfert existent. Le mode **ASCII** sert aux fichiers texte, dont il convertit les fins de ligne selon le système. Le mode **binaire** ne modifie rien et sert à tous les autres fichiers. Se tromper de mode peut corrompre un fichier.

| Commande du client | Effet |
| --- | --- |
| `ftp <serveur>` | Se connecte à un serveur FTP |
| `ls` | Liste les fichiers du répertoire courant |
| `type ascii` | Passe en mode ASCII |
| `type binary` | Passe en mode binaire |
| `get <fichier>` | Télécharge un fichier |
| `put <fichier>` | Envoie un fichier |
| `quit` | Ferme la session |

Les commandes tapées dans le client ne sont pas celles du protocole. Une capture Wireshark montre par exemple que `ls` envoie `LIST`, `get` envoie `RETR` et `put` envoie `STOR`. L'identification passe par `USER` puis `PASS`. Les serveurs publics acceptent souvent l'utilisateur `anonymous`, sans mot de passe.

> [!warning] Un protocole en clair
> FTP ne chiffre rien par défaut. Les identifiants et les fichiers circulent en clair.

## Les protocoles de messagerie

### SMTP, l'envoi

SMTP sert uniquement à envoyer les e-mails, d'un client vers un serveur ou entre serveurs. Il utilise le port TCP 25. C'est un protocole en texte, comparable à un passage au bureau de poste. On salue, on donne l'expéditeur et le destinataire, on remet le courrier, puis on attend la confirmation.

| Commande | Rôle |
| --- | --- |
| `HELO` ou `EHLO` | Salutation initiale. `EHLO` est la version étendue |
| `MAIL FROM` | Indique l'adresse de l'expéditeur |
| `RCPT TO` | Indique l'adresse du destinataire |
| `DATA` | Annonce le corps du message |
| `.` | Seul sur une ligne, termine le corps du message |
| `QUIT` | Ferme la session |

Envoyer un e-mail à la main avec `telnet` est un bon exercice pour comprendre le protocole, car on voit chaque réponse du serveur.

### POP3, la récupération

POP3 télécharge les messages sur le poste de l'utilisateur. Selon le réglage du client, il les supprime ensuite du serveur. C'est l'équivalent d'aller vider sa boîte aux lettres. Il utilise le port TCP 110.

| Commande | Rôle |
| --- | --- |
| `USER` et `PASS` | Identifient l'utilisateur |
| `STAT` | Donne le nombre de messages et leur taille totale |
| `LIST` | Liste les messages avec leur taille |
| `RETR <numéro>` | Récupère un message |
| `DELE <numéro>` | Marque un message pour suppression |
| `QUIT` | Ferme la session et applique les suppressions |

### IMAP, la consultation sur le serveur

Avec IMAP, les messages restent sur le serveur. Chaque appareil affiche une vue synchronisée de la boîte, avec l'état de chaque message (lu, déplacé, supprimé). C'est comme lire et classer son courrier directement à la poste. En contrepartie, la boîte occupe plus d'espace sur le serveur. IMAP utilise le port TCP 143.

| Commande | Rôle |
| --- | --- |
| `LOGIN <utilisateur> <mot de passe>` | Authentifie l'utilisateur |
| `SELECT <dossier>` | Choisit le dossier de travail, par exemple `inbox` |
| `FETCH <numéro> <élément>` | Récupère un message. `FETCH 3 body[]` renvoie l'en-tête et le corps du message 3 |
| `MOVE` et `COPY` | Déplacent ou copient des messages vers un autre dossier |
| `LOGOUT` | Ferme la session |

### Les ports à connaître

| Protocole | Port en clair | Port chiffré |
| --- | --- | --- |
| SMTP | 25 | 465 (SMTPS) ou 587 (envoi authentifié, souvent avec STARTTLS) |
| POP3 | 110 | 995 (POP3S) |
| IMAP | 143 | 993 (IMAPS) |

En clair, ces trois protocoles exposent les mots de passe et le contenu des messages à quiconque écoute le réseau. Il faut préférer leurs versions chiffrées.

## À retenir

- DNS traduit les noms en adresses, avec les enregistrements A, AAAA, CNAME et MX.
- WHOIS renseigne sur le propriétaire et les dates d'un domaine.
- HTTP utilise le port 80, HTTPS le port 443 avec TLS.
- FTP sépare la connexion de commandes de la connexion de données, et ne chiffre rien.
- SMTP envoie les e-mails, POP3 les télécharge, IMAP les laisse sur le serveur et synchronise les appareils.
