---
titre: "Tcpdump: The Basics"
description: "Apprendre à utiliser Tcpdump pour enregistrer, filtrer et afficher des paquets."
resume: "Tcpdump capture le trafic réseau depuis la ligne de commande. Cette note présente les options de capture, les filtres par hôte, par port et par protocole, le filtrage avancé sur les en-têtes, puis les façons d'afficher le contenu des paquets."
date: "15.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 6
difficulte: "Easy"
lien: "https://tryhackme.com/room/tcpdump"
---

## Définitions

**Tcpdump** : outil en ligne de commande qui capture et analyse le trafic d'une interface réseau. Il est léger, rapide et très utilisé sous Unix et Linux.

**libpcap** : bibliothèque de capture de paquets écrite en C. Tcpdump repose sur elle, comme beaucoup d'autres outils dont Wireshark.

**WinPcap** : version de libpcap pour Windows.

**PCAP (Packet Capture)** : format standard des fichiers de capture de paquets.

**Expression de filtrage** : règle passée à `tcpdump` pour limiter les paquets capturés, par hôte, par port ou par protocole.

**Drapeaux TCP** : bits de contrôle de l'en-tête TCP, qui indiquent l'état de la connexion.

## Pourquoi capturer le trafic

Les protocoles réseau restent d'habitude invisibles, cachés derrière le navigateur ou les applications. Capturer le trafic permet de voir concrètement les échanges, comme une requête ARP ou la poignée de main en trois temps de TCP.

Tcpdump et libpcap datent de la fin des années 1980 et du début des années 1990. Ce sont des outils fondamentaux et très stables.

## Capturer des paquets

| Option | Effet |
| --- | --- |
| `-i <interface>` | Capture sur l'interface indiquée, par exemple `eth0`. La valeur `any` les prend toutes |
| `-D` | Liste les interfaces disponibles |
| `-c <nombre>` | S'arrête après le nombre de paquets indiqué |
| `-n` | Affiche les adresses IP au lieu des noms d'hôtes |
| `-nn` | Affiche aussi les numéros de ports au lieu des noms de services |
| `-v`, `-vv`, `-vvv` | Affiche de plus en plus de détails |
| `-w <fichier>` | Enregistre les paquets dans un fichier `.pcap` |
| `-r <fichier>` | Lit un fichier `.pcap` et affiche ses paquets |

Par défaut, `tcpdump` capture jusqu'à ce qu'on l'arrête avec `Ctrl + C`. Il affiche alors le nombre de paquets capturés, reçus par le filtre et abandonnés par le noyau. Un fichier enregistré avec `-w` se relit avec `tcpdump -r` ou s'ouvre dans Wireshark. Lire un fichier ne demande pas `sudo`, contrairement à une capture en direct.

## Filtrer

Sans filtre, une capture contient beaucoup trop de bruit.

| Filtre | Paquets retenus |
| --- | --- |
| `host <adresse>` | Tout le trafic échangé avec une adresse IP ou un nom d'hôte |
| `src host <adresse>` | Le trafic dont cet hôte est la source |
| `dst host <adresse>` | Le trafic dont cet hôte est la destination |
| `port <numéro>` | Le trafic qui utilise ce port, en source ou en destination |
| `src port <numéro>` | Le trafic dont c'est le port source |
| `dst port <numéro>` | Le trafic dont c'est le port de destination |
| `ip`, `ip6`, `tcp`, `udp`, `icmp` | Le trafic du protocole indiqué |

Les opérateurs logiques combinent ces conditions.

| Opérateur | Effet | Exemple |
| --- | --- | --- |
| `and` | Les deux conditions doivent être vraies | `tcpdump host 1.1.1.1 and tcp` |
| `or` | Une des deux conditions suffit | `tcpdump udp or icmp` |
| `not` | Exclut une condition | `tcpdump not tcp` |

```bash
# Trafic SSH sur toutes les interfaces
sudo tcpdump -i any tcp port 22

# Trafic NTP sur l'interface Wi-Fi
sudo tcpdump -i wlo1 udp port 123

# Trafic HTTPS échangé avec example.com, enregistré dans un fichier
sudo tcpdump -i eth0 host example.com and tcp port 443 -w https.pcap

# Les 5 premiers paquets d'une capture, sans résolution de noms
tcpdump -r capture.pcap -c 5 -n

# Nombre de paquets venant d'une adresse donnée
tcpdump -r capture.pcap src host 192.168.1.10 -n | wc -l
```

## Filtrage avancé

### Par taille

| Filtre | Paquets retenus |
| --- | --- |
| `greater <taille>` | Ceux dont la taille est supérieure ou égale à la valeur |
| `less <taille>` | Ceux dont la taille est inférieure ou égale à la valeur |

### Sur le contenu des en-têtes

La syntaxe `proto[expr:size]` lit directement un champ d'en-tête, ce qui permet d'écrire des filtres sur mesure.

| Élément | Signification |
| --- | --- |
| `proto` | Le protocole, par exemple `ether`, `ip`, `tcp`, `udp`, `arp` ou `icmp` |
| `expr` | La position de l'octet à lire |
| `size` | Le nombre d'octets lus (1, 2 ou 4). Il vaut 1 par défaut |

Ces filtres utilisent des opérations sur les bits.

| Opérateur | Résultat |
| --- | --- |
| `&` (ET) | 1 seulement si les deux bits valent 1 |
| `\|` (OU) | 1 si au moins un des deux bits vaut 1 |
| `!` (NON) | Inverse la valeur du bit |

### Sur les drapeaux TCP

Les drapeaux servent à observer les phases d'une connexion, comme la poignée de main avec SYN et ACK.

| Drapeau | Signification |
| --- | --- |
| `tcp-syn` | Ouverture de la connexion |
| `tcp-ack` | Accusé de réception |
| `tcp-fin` | Fin de la transmission |
| `tcp-rst` | Réinitialisation de la connexion |
| `tcp-push` | Demande à l'hôte de traiter les données immédiatement |

```bash
# Paquets où seul le drapeau SYN est activé
tcpdump "tcp[tcpflags] == tcp-syn"

# Paquets où le drapeau SYN est activé, seul ou avec d'autres
tcpdump "tcp[tcpflags] & tcp-syn != 0"

# Paquets où SYN ou ACK est activé
tcpdump "tcp[tcpflags] & (tcp-syn|tcp-ack) != 0"

# Paquets SYN échangés avec un hôte précis
tcpdump "tcp[tcpflags] & tcp-syn != 0 and host 10.0.0.1"

# Paquets envoyés à une adresse Ethernet multicast
tcpdump "ether[0] & 1 != 0"

# Paquets IPv4 dont l'en-tête contient des options
tcpdump "ip[0] & 0xf != 5"
```

## Afficher les paquets

| Option | Affichage | Usage |
| --- | --- | --- |
| `-q` | Résumé court, avec l'heure, les adresses, les ports, le protocole et la taille | Aperçu rapide |
| `-e` | En-tête de niveau liaison, avec les adresses MAC | Comprendre les échanges Ethernet, ARP ou DHCP |
| `-A` | Contenu en ASCII | Lire du texte en clair, comme du HTTP non chiffré |
| `-xx` | Contenu en hexadécimal | Analyser les en-têtes et les données octet par octet |
| `-X` | Hexadécimal et ASCII côte à côte | Analyse manuelle d'un paquet |

## À retenir

- Tcpdump capture le trafic en ligne de commande, et s'appuie sur libpcap comme Wireshark.
- `-w` enregistre une capture et `-r` la relit, sans droits particuliers.
- Les filtres `host`, `port` et de protocole se combinent avec `and`, `or` et `not`.
- `proto[expr:size]` et les drapeaux TCP permettent de cibler un champ précis d'un en-tête.
- `-A` et `-X` montrent le contenu des paquets, lisible quand le trafic n'est pas chiffré.
