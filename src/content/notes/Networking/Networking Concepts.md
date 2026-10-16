---
titre: "Networking Concepts"
description: "Découvrir le modèle OSI de l'ISO et la suite de protocoles TCP/IP."
resume: "Deux modèles décrivent la façon dont les machines communiquent, le modèle OSI et le modèle TCP/IP. Cette note les présente, puis explique les adresses IP, les protocoles TCP et UDP, l'encapsulation et l'usage de Telnet pour dialoguer avec un service."
date: "09.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/networkingconcepts"
---

## Définitions

**Adresse IP** : identifiant attribué à chaque hôte d'un réseau, pour lui permettre de communiquer.

**Adresse MAC (Media Access Control)** : identifiant de 6 octets attribué à une interface réseau. Les trois premiers octets désignent le fabricant.

**Masque de sous-réseau** : valeur qui sépare, dans une adresse IP, la partie fixe (le réseau) de la partie variable (les hôtes).

**Notation CIDR** : écriture `/n` qui indique le nombre de bits réservés au réseau. Un `/24` correspond au masque `255.255.255.0`.

**NAT (Network Address Translation)** : technique qui permet à des adresses privées d'accéder à Internet par une adresse publique.

**Routeur** : équipement de couche 3 qui transmet les paquets vers le bon réseau.

**Encapsulation** : mécanisme par lequel chaque couche ajoute son en-tête aux données reçues, avant de les passer à la couche inférieure.

## Le modèle OSI

Le modèle OSI (Open Systems Interconnection) est un modèle conceptuel de l'ISO. Il découpe une communication réseau en sept couches, de la transmission physique jusqu'aux applications.

| Couche | Rôle | Exemples |
| --- | --- | --- |
| 7. Application | Fournit les services réseau aux applications | HTTP, FTP, DNS, SMTP, IMAP, POP3, DHCP |
| 6. Présentation | Encodage, compression et chiffrement des données | ASCII, Unicode, JPEG, PNG, MIME |
| 5. Session | Établit, maintient et synchronise les sessions | NFS, RPC |
| 4. Transport | Communication de bout en bout, segmentation, contrôle d'erreurs | TCP, UDP |
| 3. Réseau | Adressage logique et routage entre réseaux | IP, ICMP, IPSec |
| 2. Liaison de données | Transfert entre deux nœuds d'un même segment | Ethernet (802.3), Wi-Fi (802.11) |
| 1. Physique | Transmission physique des signaux | Câbles Ethernet, fibre optique, ondes Wi-Fi |

Savoir associer un protocole ou un équipement à sa couche aide beaucoup au diagnostic. Un switch travaille en couche 2, un routeur en couche 3. De la même façon, l'adresse MAC identifie physiquement une interface, alors que l'adresse IP identifie logiquement un hôte sur un réseau.

## Le modèle TCP/IP

Le modèle TCP/IP a été développé dans les années 1970 par le département de la Défense des États-Unis. Il a été conçu pour continuer à fonctionner malgré des pannes ou des coupures. Contrairement au modèle OSI, plus théorique, c'est lui qui est réellement mis en œuvre. Il est à la base d'Internet.

| Couche TCP/IP | Couches OSI correspondantes | Exemples |
| --- | --- | --- |
| Application | 5, 6 et 7 | HTTP, DNS, SMTP |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP, ICMP, IPSec |
| Liaison | 2 | Ethernet, Wi-Fi |

La correspondance entre les deux modèles n'est pas parfaite, puisque TCP/IP regroupe plusieurs couches OSI. Certains manuels utilisent une variante à cinq couches, qui ajoute la couche physique.

## Adresses IP et sous-réseaux

Une adresse IPv4 tient sur 32 bits, soit quatre octets valant chacun de 0 à 255. Cela représente environ 4 milliards d'adresses, un peu moins en pratique à cause des adresses réservées.

Dans un réseau en `/24`, les 24 premiers bits sont fixes. Il reste 256 adresses, dont deux sont réservées.

| Adresse | Exemple | Rôle |
| --- | --- | --- |
| Adresse réseau | `192.168.1.0` | Première adresse, elle identifie le réseau |
| Adresse de diffusion (broadcast) | `192.168.1.255` | Dernière adresse, elle envoie un message à tous les hôtes |
| Adresses d'hôtes | `192.168.1.1` à `192.168.1.254` | Les 254 adresses utilisables |

Une adresse **publique** est joignable depuis Internet. Une adresse **privée** sert à l'intérieur d'un réseau local et n'est pas routable sur Internet. La RFC 1918 définit trois plages privées, `10.0.0.0/8`, `172.16.0.0/12` et `192.168.0.0/16`.

Pour atteindre Internet, une machine en adresse privée passe par un routeur qui fait du NAT. Quand plusieurs chemins mènent à une destination, le routeur choisit la meilleure route.

## TCP et UDP

| Protocole | Caractéristiques | Usages |
| --- | --- | --- |
| TCP | Orienté connexion et fiable. Il garantit la livraison et l'intégrité, mais il est plus lent | HTTP et HTTPS, e-mail (SMTP, IMAP, POP3), FTP |
| UDP | Sans connexion, rapide et léger, mais sans garantie de livraison | DNS, VoIP, streaming, jeux en ligne |

Un numéro de port tient sur deux octets. Les ports vont donc de 1 à 65535, le port 0 étant réservé.

TCP ouvre une connexion par une poignée de main en trois temps.

1. Le client envoie un paquet **SYN**, avec son numéro de séquence initial.
2. Le serveur répond par un **SYN-ACK**, avec son propre numéro de séquence et l'accusé de réception du SYN.
3. Le client renvoie un **ACK**. La connexion est établie.

## L'encapsulation

Grâce à l'encapsulation, chaque couche travaille indépendamment des autres, avec ses propres protocoles et ses propres en-têtes.

| Couche | Ce qui est ajouté | Unité obtenue |
| --- | --- | --- |
| Application | Les données de l'application, par exemple une requête HTTP | Données |
| Transport | Un en-tête TCP ou UDP | Segment TCP ou datagramme UDP |
| Réseau | Un en-tête IP | Paquet IP |
| Liaison | Un en-tête et une fin de trame | Trame (Ethernet, Wi-Fi) |

À la réception, les données sont décapsulées dans l'ordre inverse. Sur le trajet, chaque routeur ne lit que l'en-tête de couche 3 pour décider où envoyer le paquet.

## Telnet

Telnet (Teletype Network) permet de se connecter à distance à un terminal et d'envoyer des commandes en texte. Il sert aussi à vérifier rapidement qu'un port TCP est ouvert et à dialoguer directement avec le service qui écoute.

| Port | Service | Comportement |
| --- | --- | --- |
| 7 | Echo | Renvoie exactement ce qu'on lui envoie |
| 13 | Daytime | Renvoie la date et l'heure, puis ferme la connexion |
| 80 | HTTP | Sert des pages web |

```bash
# Se connecter au service qui écoute sur un port
telnet <cible> 80
```

Pour quitter, on ouvre l'invite de Telnet avec `Ctrl + ]`, puis on saisit `quit`.

> [!warning] Un protocole en clair
> Telnet ne chiffre rien. Il ne faut pas l'utiliser sur Internet. Les services Echo et Daytime sont obsolètes et vulnérables, donc généralement désactivés.

## À retenir

- Le modèle OSI compte sept couches et sert de référence théorique. Le modèle TCP/IP en compte quatre et fait fonctionner Internet.
- Un `/24` offre 254 adresses utilisables, entre l'adresse réseau et l'adresse de diffusion.
- Les adresses privées passent par le NAT pour atteindre Internet.
- TCP est fiable et orienté connexion, UDP est rapide et sans garantie.
- Chaque couche encapsule les données de la couche supérieure, et la réception fait le chemin inverse.
