---
titre: "Networking Secure Protocols"
description: "Apprendre comment TLS, SSH et les VPN peuvent sécuriser le trafic réseau."
resume: "Les protocoles de base comme HTTP, SMTP ou Telnet transmettent tout en clair. Cette note présente les trois façons de sécuriser le trafic, TLS pour les protocoles existants, SSH pour l'accès à distance et le VPN pour relier des réseaux."
date: "13.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/networkingsecureprotocols"
---

## Définitions

**TLS (Transport Layer Security)** : protocole cryptographique qui sécurise les communications. Il a succédé à SSL en 1999, et sa dernière version majeure est TLS 1.3, publiée en 2018.

**SSL (Secure Sockets Layer)** : ancêtre de TLS, développé par Netscape pour sécuriser le web. Sa première version publique date de 1995.

**Certificat TLS** : document numérique qui prouve l'identité d'un serveur ou d'un client. Il est signé par une autorité de certification.

**Autorité de certification (CA)** : entité de confiance qui signe les certificats et atteste l'identité de leur propriétaire.

**CSR (Certificate Signing Request)** : demande envoyée à une autorité de certification pour obtenir un certificat signé.

**Certificat auto-signé** : certificat signé par son propre détenteur, sans validation par un tiers. Il ne prouve donc pas l'authenticité.

**SSH (Secure Shell)** : protocole sécurisé de connexion à distance, sur le port 22.

**VPN (Virtual Private Network)** : technologie qui crée un réseau privé sécurisé en s'appuyant sur une infrastructure publique comme Internet.

## Trois propriétés à protéger

Les protocoles de base (HTTP, SMTP, POP3, IMAP) ne chiffrent rien. Sur un réseau non protégé, un attaquant peut donc s'en prendre à trois propriétés.

| Propriété | Garantie | Ce que fait l'attaquant sans protection |
| --- | --- | --- |
| Confidentialité | Aucun tiers ne peut lire les données, comme un mot de passe ou un numéro de carte | Il lit les données |
| Intégrité | Les données reçues sont identiques aux données envoyées | Il modifie les données |
| Authenticité | On communique bien avec l'entité prévue | Il se fait passer pour le serveur légitime |

## TLS

Avant TLS, capturer des mots de passe sur un réseau était trivial. TLS protège les trois propriétés à la fois, par le chiffrement, le contrôle d'intégrité et la vérification du serveur. Il s'ajoute à un protocole existant sans le remplacer.

| Protocole d'origine | Version sécurisée par TLS |
| --- | --- |
| HTTP | HTTPS |
| DNS | DoT (DNS over TLS) |
| MQTT | MQTTS |
| SIP | SIPS |

L'authenticité repose sur les certificats. Un certificat signé par une autorité de certification est reconnu automatiquement par les systèmes qui font confiance à cette autorité. Let's Encrypt en délivre gratuitement et de façon automatisée. Un certificat auto-signé reste utile en interne, mais il ne prouve rien sur Internet.

### HTTPS

| Protocole | Déroulement d'une connexion |
| --- | --- |
| HTTP | Poignée de main TCP, puis échange HTTP en clair |
| HTTPS | Poignée de main TCP, poignée de main TLS, puis échange HTTP chiffré |

La poignée de main TLS sert à négocier les paramètres cryptographiques et à établir une clé de chiffrement partagée. Ajouter TLS à HTTP ne change ni TCP ni IP.

Sans TLS, n'importe qui sur le réseau lit le contenu des requêtes. Avec TLS, un outil comme Wireshark ne voit que des « données d'application » illisibles. Il faut lui fournir la clé de déchiffrement pour afficher le contenu en clair.

### La messagerie sécurisée

SMTPS, POP3S et IMAPS suivent le même principe que HTTPS. Le « S » final indique l'usage de TLS.

| Protocole | Port en clair | Port avec TLS |
| --- | --- | --- |
| HTTP | 80 | 443 |
| SMTP | 25 | 465 et 587 |
| POP3 | 110 | 995 |
| IMAP | 143 | 993 |

## SSH

Telnet (port 23) transmet les identifiants et les commandes en clair, ce qui le rend vulnérable à l'écoute du réseau. SSH (port 22) le remplace pour les connexions à distance.

| Année | Étape |
| --- | --- |
| 1995 | SSH-1, publié par Tatu Ylönen |
| 1996 | SSH-2, plus sécurisé |
| 1999 | OpenSSH, version open source publiée par l'équipe OpenBSD |

OpenSSH est aujourd'hui l'implémentation la plus répandue. Il apporte :

- une authentification sécurisée, par mot de passe, par clé publique ou à deux facteurs ;
- la confidentialité, grâce au chiffrement de bout en bout ;
- l'intégrité des données ;
- une protection contre les attaques de l'homme du milieu, avec une alerte quand la clé du serveur change ;
- le tunneling, qui fait passer d'autres protocoles dans le canal chiffré ;
- la redirection X11, pour afficher en local une application graphique distante.

```bash
ssh <utilisateur>@<serveur>
```

## SFTP et FTPS

| | SFTP | FTPS |
| --- | --- | --- |
| Nom complet | SSH File Transfer Protocol | File Transfer Protocol Secure |
| Fondé sur | SSH, sans aucun lien avec FTP | FTP, sécurisé par TLS |
| Port | 22 | 990 |
| Particularité | Profite du chiffrement et de l'authentification de SSH | Demande un certificat TLS valide. Ses connexions séparées pour le contrôle et les données le rendent plus difficile à faire passer derrière un pare-feu strict |

Dans une session SFTP, `get <fichier>` télécharge un fichier et `put <fichier>` en envoie un. Les commandes ressemblent à celles d'Unix et diffèrent un peu de celles de FTP.

```bash
sftp <utilisateur>@<serveur>
```

## VPN

Un VPN relie de façon sécurisée des succursales ou des employés distants au réseau principal d'une entreprise. Le trafic passe par un tunnel chiffré entre le client et le serveur VPN. Les services en ligne voient alors l'adresse IP du serveur VPN, et non celle de l'utilisateur.

| Atouts | Limites |
| --- | --- |
| Confidentialité, grâce au chiffrement | Certains VPN ne redirigent pas tout le trafic, ce qui peut faire fuiter l'adresse IP réelle |
| Masquage de l'adresse IP | La légalité des VPN varie selon les pays |
| Contournement des restrictions géographiques | Il faut un serveur configuré et un client compatible, et les performances dépendent du serveur |

Un test de fuite DNS vérifie que le VPN ne laisse pas échapper l'adresse IP réelle ou les requêtes DNS de l'utilisateur.

| Solution | Ports habituels |
| --- | --- |
| OpenVPN | 1194, en UDP ou en TCP |
| IPsec | 500 et 4500 |
| WireGuard | 51820, en UDP |

## À retenir

- TLS ajoute confidentialité, intégrité et authenticité à un protocole existant, sans le modifier.
- HTTPS, SMTPS, POP3S et IMAPS sont les versions TLS de protocoles en clair.
- SSH remplace Telnet pour l'accès à distance, et permet aussi de sécuriser d'autres protocoles par tunneling.
- SFTP repose sur SSH, FTPS sur FTP et TLS.
- Un VPN chiffre tout le trafic entre deux points et masque l'adresse IP réelle.
