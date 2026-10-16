---
titre: "Nmap: The Basics"
description: "Apprendre à utiliser Nmap pour découvrir les hôtes actifs, trouver les ports ouverts et détecter les versions des services."
resume: "Nmap automatise la découverte des machines d'un réseau et des services qu'elles exposent. Cette note suit l'ordre d'un scan. Elle va de la recherche des hôtes en ligne à l'enregistrement des résultats, en passant par le scan des ports, l'identification des services et le réglage de la vitesse."
date: "16.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 7
difficulte: "Easy"
lien: "https://tryhackme.com/room/nmap"
---

## Définitions

**Nmap (Network Mapper)** : outil libre de scan réseau, créé en 1997. Il sert à découvrir les hôtes actifs d'un réseau et les services qu'ils exposent.

**Découverte d'hôtes (host discovery)** : étape qui consiste à déterminer quelles machines d'un réseau sont en ligne.

**Port** : point d'accès logique d'une machine, associé à un service réseau.

**Service réseau** : programme qui écoute sur un port pour recevoir des connexions, par exemple SSH, HTTP ou FTP.

**Réseau local** : réseau auquel la machine est directement connectée, en Ethernet ou en Wi-Fi.

**Réseau distant** : réseau séparé de la machine par au moins un routeur.

**TCP (Transmission Control Protocol)** : protocole orienté connexion, qui garantit la livraison des paquets.

**UDP (User Datagram Protocol)** : protocole sans connexion, utilisé pour des échanges rapides et légers.

**IDS (Intrusion Detection System)** : système de détection d'intrusion. Il surveille le réseau à la recherche d'activités suspectes ou malveillantes.

## Pourquoi utiliser Nmap

Un réseau en `/24` contient 256 adresses IP, dont 254 utilisables. L'adresse du réseau et celle de diffusion (broadcast) sont réservées. Chercher à la main quelles machines répondent, puis quels ports sont ouverts, devient vite impraticable. Les outils simples ont en plus chacun leur limite.

| Outil | Limite |
| --- | --- |
| `ping` | Échoue dès que l'ICMP est bloqué |
| `arp-scan` | Ne fonctionne que sur le réseau local |
| `telnet` | Trop lent pour tester des ports un par un |

Nmap automatise ce travail. Il découvre les hôtes, scanne leurs ports, identifie les services et sait s'adapter aux pare-feux.

> [!tip] Lancer Nmap avec sudo
> Sans les droits root, certaines fonctions ne sont pas disponibles, à commencer par le scan SYN. Autant prendre l'habitude de lancer Nmap avec `sudo`.

> [!warning] Uniquement sur des réseaux autorisés
> Scanner un réseau ou une machine sans l'accord de son propriétaire est illégal. Les commandes de cette note sont à utiliser dans un lab ou dans un cadre autorisé.

## Découvrir les hôtes en ligne

La première étape consiste à savoir quelles machines répondent, sans encore scanner leurs ports. Cette découverte génère peu de trafic, ce qui la rend assez discrète.

| Option | Effet |
| --- | --- |
| `-sn` | Découvre les hôtes en ligne, sans scanner leurs ports |
| `-sL` | Liste les cibles d'une plage sans les scanner |
| `-PS[ports]` | Découvre les hôtes avec des paquets TCP SYN envoyés sur les ports indiqués |
| `-PA[ports]` | Même principe avec des paquets TCP ACK |
| `-PU[ports]` | Même principe avec des paquets UDP |

La méthode dépend de l'emplacement de la cible.

- **Sur le réseau local**, Nmap envoie des requêtes ARP. Il peut même identifier le fabricant de la carte réseau grâce à l'adresse MAC.
- **Sur un réseau distant**, l'ARP ne passe pas les routeurs. Nmap combine alors plusieurs techniques, comme les requêtes ICMP et les paquets TCP SYN et ACK. La découverte y est donc plus complexe.

```bash
# Hôtes en ligne sur un réseau
sudo nmap -sn 192.168.1.0/24

# Lister les cibles sans les scanner
nmap -sL 192.168.1.0/24
```

## Scanner les ports

Une fois les hôtes connus, on cherche quels services y écoutent. Nmap propose trois grands types de scan.

| Option | Type de scan | Fonctionnement |
| --- | --- | --- |
| `-sT` | TCP connect | Établit une connexion complète sur chaque port (poignée de main en trois temps). Plus facile à détecter |
| `-sS` | SYN | Envoie un paquet SYN mais ne termine jamais la connexion. Plus discret |
| `-sU` | UDP | Cherche les services UDP, comme DNS, DHCP, NTP, SNMP ou la VoIP |

En TCP, la réponse indique l'état du port. Un port ouvert renvoie un paquet SYN-ACK, un port fermé un paquet RST.

Par défaut, Nmap scanne les 1 000 ports les plus courants. Trois options changent cette plage.

| Option | Ports scannés |
| --- | --- |
| `-F` | Les 100 ports les plus courants (mode rapide) |
| `-p10-1024` | Une plage précise, ici du port 10 au port 1024 |
| `-p-` | Tous les ports, de 1 à 65535 |

```bash
# Scan SYN des 100 ports les plus courants
sudo nmap -sS -F <cible>

# Scan SYN de tous les ports
sudo nmap -sS -p- <cible>
```

## Identifier les services et le système

Savoir qu'un port est ouvert ne suffit pas. C'est la version exacte du service qui permet de chercher ses vulnérabilités connues.

| Option | Effet |
| --- | --- |
| `-sV` | Identifie les services des ports ouverts et leur version |
| `-O` | Tente d'identifier le système d'exploitation de la cible |
| `-A` | Regroupe la détection du système, celle des versions et d'autres informations comme le traceroute |
| `-Pn` | Considère l'hôte comme en ligne et le scanne même s'il ne répond pas à la découverte |

Trois précisions sur ces options.

- La détection du système n'est jamais certaine. C'est une estimation, fondée sur des signatures réseau.
- `-A` donne beaucoup d'informations en une seule commande, mais le scan est plus intrusif et plus facile à détecter.
- `-Pn` sert quand un pare-feu bloque les réponses ICMP. Sans elle, Nmap ignorerait des hôtes pourtant en ligne.

```bash
# Scan SYN avec détection des versions et du système
sudo nmap -sS -sV -O <cible>
```

## Régler la vitesse

La vitesse d'envoi des paquets est un compromis entre rapidité et discrétion. Un scan lent a moins de chances d'alerter un IDS ou de surcharger le réseau. L'option `-T` choisit un profil, par son numéro ou par son nom.

| Option | Profil | Vitesse |
| --- | --- | --- |
| `-T0` | paranoid | Très lent |
| `-T1` | sneaky | Lent |
| `-T2` | polite | Modéré |
| `-T3` | normal | Profil par défaut |
| `-T4` | aggressive | Rapide |
| `-T5` | insane | Le plus rapide |

D'autres options permettent un réglage plus fin.

| Option | Effet |
| --- | --- |
| `--min-parallelism` et `--max-parallelism` | Nombre minimal et maximal de sondes envoyées en parallèle |
| `--min-rate` et `--max-rate` | Nombre minimal et maximal de paquets envoyés par seconde |
| `--host-timeout` | Temps maximal accordé à un hôte, utile quand sa connexion est lente ou instable |

Les durées mesurées dans un lab ne valent pas pour un réseau réel. Elles dépendent de la configuration du réseau et des performances de la cible.

```bash
# Scan SYN lent et discret des 100 ports les plus courants
sudo nmap -sS -F -T1 <cible>
```

## Suivre et enregistrer un scan

### Voir ce que fait Nmap

| Option | Effet |
| --- | --- |
| `-v` | Affiche la progression du scan en temps réel (étapes ARP, DNS, SYN) |
| `-vv` à `-vvvv`, ou `-v2` à `-v4` | Augmente le niveau de détail |
| `-d` | Affiche des informations de débogage, utiles pour diagnostiquer un problème |
| `-d9` | Niveau de débogage maximal, qui produit une quantité énorme d'informations |

### Enregistrer les résultats

| Option | Format |
| --- | --- |
| `-oN` | Normal, lisible tel quel |
| `-oX` | XML |
| `-oG` | « Grepable », facile à filtrer avec `grep` |
| `-oA` | Les trois formats à la fois |

`-oA` est la plus pratique. Elle garde une trace complète du scan, réutilisable ensuite dans d'autres outils ou dans des scripts.

```bash
# Enregistre passerelle.nmap, passerelle.xml et passerelle.gnmap
sudo nmap -sS 192.168.1.1 -oA passerelle
```

## À retenir

- Nmap remplace avantageusement les méthodes manuelles (`ping`, `arp-scan`, `telnet`) pour découvrir les hôtes et scanner les ports.
- Un scan suit un ordre logique. On cherche d'abord les hôtes en ligne (`-sn`), puis les ports ouverts (`-sS`), puis les services et le système (`-sV`, `-O`).
- Le scan SYN est plus discret que le scan TCP connect, mais il demande les droits root.
- Le profil de vitesse (`-T`) et le parallélisme s'adaptent aux réseaux sensibles et à la discrétion voulue.
- Nmap est un outil très riche. Cette note ne couvre que ses fonctions les plus courantes.
