---
titre: "IDS Fundamentals"
description: "Apprendre les bases des IDS et s'exercer avec Snort."
resume: "Un IDS surveille le réseau et alerte quand il repère une activité suspecte, là où le pare-feu se contente de filtrer. Cette note présente les types d'IDS et leurs méthodes de détection, puis la prise en main de Snort, de l'écriture d'une règle à l'analyse d'une capture."
date: "05.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/idsfundamentals"
---

## Définitions

**IDS (Intrusion Detection System)** : système de détection d'intrusion. Il surveille le trafic en temps réel et génère une alerte quand il détecte une activité suspecte ou malveillante. Contrairement au pare-feu, il ne bloque pas les connexions.

**Signature** : modèle d'une attaque connue auquel le trafic est comparé.

**Ligne de base (baseline)** : comportement normal attendu d'un système ou d'un réseau.

**Zero-day** : attaque qui exploite une vulnérabilité inconnue ou pas encore corrigée, donc sans signature disponible.

**PCAP (Packet Capture)** : format standard de capture de paquets réseau, utilisé pour analyser un trafic après coup.

**Mode promiscuité (promiscuous mode)** : mode dans lequel une interface réseau capture tous les paquets qui circulent et pas seulement ceux qui lui sont adressés.

## Pare-feu et IDS

Le pare-feu est le gardien posté à l'entrée du réseau. L'IDS est la caméra de surveillance placée à l'intérieur. Il n'empêche pas une attaque mais il la détecte et alerte les administrateurs.

Les deux se complètent. L'IDS est surtout utile quand un attaquant a contourné le pare-feu en passant par une connexion légitime.

## Les types d'IDS

### Selon le déploiement

| Critère | HIDS (Host-based) | NIDS (Network-based) |
| --- | --- | --- |
| Portée | Un seul hôte | L'ensemble du réseau |
| Déploiement | Sur chaque machine | En un point central du réseau |
| Gestion | Complexe sur un grand parc | Centralisée |
| Niveau de détail | Très détaillé pour la machine | Vue globale |

### Selon la méthode de détection

| Méthode | Principe | Atout et limite |
| --- | --- | --- |
| Par signature | Compare le trafic à une base d'attaques connues | Détecte vite les menaces connues. Inefficace contre les zero-days et dépend de la qualité de la base |
| Par anomalie | Repère les écarts par rapport à la ligne de base | Peut détecter des zero-days mais génère souvent plus de faux positifs |
| Hybride | Combine les deux méthodes | Couvre les menaces connues et les nouvelles |

## Snort

Snort est un IDS open source, créé en 1998 et très répandu. Il détecte les menaces grâce à des signatures d'attaques connues et à l'analyse des anomalies. Ses règles intégrées couvrent un grand nombre d'attaques courantes. L'administrateur peut en créer de nouvelles, les modifier ou les désactiver, pour adapter Snort à son réseau.

| Mode | Fonctionnement | Usage |
| --- | --- | --- |
| Sniffer | Affiche le trafic en direct, sans détection ni alerte | Diagnostic réseau et dépannage |
| Packet logging | Enregistre le trafic dans des fichiers PCAP | Enquête après incident |
| NIDS | Compare le trafic aux règles en temps réel et génère des alertes | Surveillance du réseau |

## Utiliser Snort

### Les fichiers

| Emplacement | Rôle |
| --- | --- |
| `/etc/snort/snort.conf` | Configuration principale (interfaces, règles activées, réseau surveillé) |
| `/etc/snort/rules/` | Fichiers de règles |
| `/etc/snort/rules/local.rules` | Règles personnalisées de l'administrateur |

Pour capturer tout le trafic du réseau, l'interface doit être en mode promiscuité.

### Anatomie d'une règle

```text
alert icmp any any -> $HOME_NET any (msg:"Ping Detected"; sid:10001; rev:1;)
```

| Élément | Valeur | Signification |
| --- | --- | --- |
| Action | `alert` | Génère une alerte |
| Protocole | `icmp` | Type de trafic visé, ici celui de la commande `ping` |
| Source | `any any` | Toute adresse IP et tout port |
| Destination | `$HOME_NET any` | Le réseau défini dans la configuration, sur tous les ports |
| `msg` | `"Ping Detected"` | Message affiché quand la règle se déclenche |
| `sid` | `10001` | Identifiant unique de la règle |
| `rev` | `1` | Numéro de révision, augmenté à chaque modification |

### Écrire et tester une règle

On ajoute d'abord la règle dans le fichier des règles personnalisées. Celle-ci signale tout ping envoyé à l'adresse de loopback.

```bash
sudo nano /etc/snort/rules/local.rules
```

```text
alert icmp any any -> 127.0.0.1 any (msg:"Loopback Ping Detected"; sid:10003; rev:1;)
```

On lance ensuite Snort en mode NIDS sur l'interface de loopback `lo` avec les alertes affichées dans la console.

```bash
sudo snort -q -l /var/log/snort -i lo -A console -c /etc/snort/snort.conf
```

Dans un autre terminal, un ping déclenche la règle.

```bash
ping 127.0.0.1
```

Snort affiche alors l'alerte, ce qui confirme que la règle fonctionne.

```text
07/24-10:46:52.401504  [**] [1:10003:1] Loopback Ping Detected [**] [Priority: 0] {ICMP} 127.0.0.1 -> 127.0.0.1
```

### Analyser une capture

Snort sait aussi rejouer un trafic enregistré au format PCAP pour une enquête après incident. L'option `-r` remplace alors l'interface par le fichier à lire.

```bash
sudo snort -q -l /var/log/snort -r capture.pcap -A console -c /etc/snort/snort.conf
```

## À retenir

- Le pare-feu filtre à l'entrée, l'IDS surveille à l'intérieur et alerte.
- Un HIDS protège un hôte, un NIDS observe tout le réseau.
- La détection par signature vise les menaces connues, la détection par anomalie les nouvelles menaces.
- Snort fonctionne en trois modes : sniffer, packet logging et NIDS.
- Une règle Snort indique une action, un protocole, une source, une destination et des options comme `msg`, `sid` et `rev`.
