---
titre: "Networking Essentials"
description: "Explorer les protocoles réseau, de la configuration automatique au routage des paquets vers leur destination."
resume: "Plusieurs protocoles travaillent ensemble pour qu'une machine obtienne une adresse, trouve ses voisines et atteigne Internet. Cette note présente DHCP, ARP, ICMP, le routage et le NAT, avec les commandes qui permettent de les observer."
date: "11.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/networkingessentials"
---

## Définitions

**DHCP (Dynamic Host Configuration Protocol)** : protocole de la couche application qui configure automatiquement les paramètres réseau d'un appareil (adresse IP, masque, passerelle, DNS).

**ARP (Address Resolution Protocol)** : protocole qui trouve l'adresse MAC correspondant à une adresse IP sur un réseau local.

**ICMP (Internet Control Message Protocol)** : protocole qui transporte des messages de diagnostic et d'erreur sur un réseau IP.

**RTT (Round Trip Time)** : temps que met un paquet pour atteindre sa destination et en revenir.

**TTL (Time To Live)** : valeur diminuée de 1 par chaque routeur traversé. Elle limite le nombre de sauts d'un paquet.

**Routage** : choix, par un routeur, du chemin qu'un paquet doit suivre pour atteindre sa destination.

**NAT (Network Address Translation)** : technique qui traduit des adresses IP privées en une adresse IP publique, pour accéder à Internet.

## DHCP, la configuration automatique

DHCP évite de configurer chaque appareil à la main. Il prévient les conflits d'adresses et simplifie l'arrivée de nouveaux appareils sur le réseau. Il est surtout utile pour les appareils mobiles. Les serveurs, eux, gardent souvent une adresse fixe pour rester joignables.

Il utilise UDP, avec le port 67 côté serveur et le port 68 côté client. L'attribution d'une adresse suit quatre étapes, résumées par le sigle DORA.

| Étape | Émetteur | Contenu |
| --- | --- | --- |
| Discover | Client | Diffuse une requête pour trouver un serveur DHCP |
| Offer | Serveur | Propose une adresse IP et des paramètres réseau |
| Request | Client | Accepte l'offre et demande l'adresse proposée |
| Acknowledge | Serveur | Confirme l'attribution |

Au début de l'échange, le client n'a pas encore d'adresse. Il utilise donc `0.0.0.0` comme adresse source et `255.255.255.255` comme destination. Au niveau liaison, il écrit à l'adresse MAC de diffusion `ff:ff:ff:ff:ff:ff`, qui touche tous les hôtes du réseau local.

À la fin, le client dispose d'une adresse IP louée, d'une passerelle pour sortir du réseau local et d'un serveur DNS pour résoudre les noms de domaine.

## ARP, de l'adresse IP à l'adresse MAC

Sur un réseau local, les paquets IP voyagent dans des trames Ethernet ou Wi-Fi. Chaque trame porte une adresse MAC de destination, une adresse MAC source et un type (IPv4, ARP). Pour envoyer une trame, une machine doit donc connaître l'adresse MAC de son destinataire. ARP la lui fournit, au moment où elle en a besoin.

1. **Requête ARP.** La machine diffuse à tout le réseau la question « Qui a `192.168.1.1` ? ».
2. **Réponse ARP.** Le propriétaire de l'adresse répond directement, en donnant son adresse MAC.

Les messages ARP ne passent ni par IP ni par UDP. Ils sont placés directement dans la trame. ARP est ainsi rangé tantôt en couche 2, parce qu'il manipule des adresses MAC, tantôt en couche 3, parce qu'il traduit des adresses IP.

## ICMP, le diagnostic

### Ping

`ping` vérifie qu'un hôte est joignable. Il envoie une requête ICMP Echo Request (type 8) et attend une réponse Echo Reply (type 0). Son résultat indique le nombre de paquets envoyés et reçus, le pourcentage de perte et les temps d'aller-retour. Un pare-feu peut bloquer ces messages.

### Traceroute

`traceroute` affiche les routeurs traversés jusqu'à une destination. Il exploite le TTL. Quand celui-ci tombe à 0, le routeur renvoie un message ICMP Time Exceeded (type 11) qui révèle son adresse. Le chemin peut changer d'une exécution à l'autre. Un routeur qui ne répond pas apparaît sous la forme d'une étoile `*`.

| Commande | Effet |
| --- | --- |
| `ping <cible>` | Teste la connectivité avec une machine |
| `ping <cible> -c 4` | Envoie seulement 4 requêtes (Linux et macOS) |
| `traceroute <cible>` | Affiche le chemin vers la cible (Linux et macOS) |
| `tracert <cible>` | Affiche le chemin vers la cible (Windows) |

## Le routage

Chaque routeur possède une table de routage, qui lui indique par quelle interface envoyer un paquet. Des protocoles de routage tiennent ces tables à jour. On distingue les protocoles internes à un réseau (OSPF, EIGRP, RIP) et le protocole externe BGP.

| Protocole | Principe |
| --- | --- |
| OSPF (Open Shortest Path First) | Protocole à état de liens. Les routeurs partagent la topologie et calculent le chemin le plus court avec l'algorithme de Dijkstra |
| EIGRP (Enhanced Interior Gateway Routing Protocol) | Protocole propriétaire de Cisco, qui combine plusieurs critères comme la bande passante et le délai |
| RIP (Routing Information Protocol) | Protocole simple, fondé sur le nombre de sauts. Sa limite de 15 sauts le réserve aux petits réseaux |
| BGP (Border Gateway Protocol) | Protocole principal d'Internet. Il échange les routes entre les fournisseurs d'accès et les grands réseaux |

| Commande | Effet |
| --- | --- |
| `ip route` | Affiche la table de routage (Linux) |
| `netstat -r` | Affiche la table de routage (Linux) |
| `route print` | Affiche la table de routage (Windows) |

## Le NAT

Le NAT répond à la pénurie d'adresses IPv4. Il permet à plusieurs appareils d'un réseau privé de partager une seule adresse IP publique.

Le routeur NAT modifie l'adresse et le port source des paquets sortants, puis fait la traduction inverse sur les paquets entrants. Il tient pour cela une table NAT. Elle associe chaque couple adresse privée et port interne à un couple adresse publique et port externe. C'est elle qui permet la communication dans les deux sens.

Le NAT gêne les applications qui ont besoin de recevoir des connexions directes depuis l'extérieur. On le complète alors par une redirection de port (port forwarding).

## À retenir

- DHCP attribue une configuration réseau en quatre étapes, Discover, Offer, Request et Acknowledge.
- ARP retrouve l'adresse MAC d'une adresse IP du réseau local.
- `ping` teste si un hôte répond, `traceroute` montre le chemin suivi.
- Les routeurs s'appuient sur leur table de routage, tenue à jour par OSPF, EIGRP, RIP ou BGP.
- Le NAT fait partager une adresse publique à tout un réseau privé.
