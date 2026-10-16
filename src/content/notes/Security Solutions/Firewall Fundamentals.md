---
titre: "Firewall Fundamentals"
description: "Découvrir les pare-feu et prendre en main ceux intégrés à Windows et à Linux."
resume: "Le pare-feu filtre le trafic entre un réseau et l'extérieur. Cette note présente les quatre types de pare-feu, la structure d'une règle, puis la configuration du pare-feu de Windows et de ufw sous Linux."
date: "03.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/firewallfundamentals"
---

## Définitions

**Pare-feu (firewall)** : dispositif matériel ou logiciel qui contrôle le trafic entrant et sortant d'un système ou d'un réseau, selon des règles de sécurité.

**Règle de pare-feu** : ensemble de conditions qui décrit comment traiter un type de trafic.

**Table d'état (state table)** : base interne où un pare-feu avec état enregistre les connexions actives et leur état (établie, fermée, en attente).

**Inspection approfondie des paquets (deep packet inspection)** : analyse complète du contenu des paquets, données applicatives comprises, pour y repérer des signatures ou des comportements malveillants.

**NLA (Network Location Awareness)** : fonction de Windows qui détecte le type de réseau auquel l'ordinateur est connecté (privé, public ou domaine).

**Netfilter** : composant du noyau Linux qui gère le trafic réseau. Il assure le filtrage des paquets, la traduction d'adresses (NAT) et le suivi des connexions.

## Le rôle d'un pare-feu

Le pare-feu est un agent de sécurité placé à la frontière entre un réseau interne, jugé fiable, et le monde extérieur. Tout le trafic, entrant comme sortant, doit passer par lui. Il examine chaque paquet et décide de l'autoriser ou de le bloquer, d'après les règles configurées.

Son objectif est d'empêcher les accès non autorisés tout en laissant passer les communications légitimes. Les pare-feu modernes vont au-delà du simple filtrage. Ils détectent les intrusions, bloquent des applications et analysent le contenu du trafic.

## Les types de pare-feu

| Type | Couches OSI | Fonctionnement |
| --- | --- | --- |
| Sans état (stateless) | 3 et 4 | Filtre chaque paquet selon des règles fixes, sans garder la mémoire des paquets précédents. Rapide et léger, il convient aux environnements à haut débit, mais il ne voit pas le contexte |
| Avec état (stateful) | 3 et 4 | Tient une table d'état des connexions actives. Les paquets d'une connexion déjà autorisée passent sans être réévalués. La sécurité est plus fine et plus dynamique |
| Proxy | 7 | Sert d'intermédiaire entre le client et le serveur. Il masque les adresses internes et inspecte le contenu (requêtes HTTP, courriels). Le filtrage est précis, mais plus lent |
| Nouvelle génération (NGFW) | 3 à 7 | Combine les précédents et ajoute la prévention d'intrusion (IPS), l'analyse heuristique, le déchiffrement SSL/TLS et la threat intelligence. Il protège en temps réel contre les menaces avancées |

## Les règles

### Composants d'une règle

| Composant | Contenu |
| --- | --- |
| Source | Adresse IP ou plage d'adresses d'où vient le trafic |
| Destination | Adresse IP ou plage d'adresses vers laquelle il est envoyé |
| Port | Numéro de port utilisé, par exemple 80 pour HTTP ou 22 pour SSH |
| Protocole | Type de communication (TCP, UDP, ICMP) |
| Action | Ce que le pare-feu fait du trafic |
| Direction | Sens du trafic concerné |

### Actions

| Action | Effet | Exemple |
| --- | --- | --- |
| Autoriser (allow) | Laisse passer le trafic décrit par la règle | Autoriser le trafic HTTP sortant (port 80) du réseau interne vers Internet |
| Refuser (deny) | Bloque le trafic décrit par la règle | Refuser le trafic SSH entrant (port 22) vers le réseau interne |
| Transférer (forward) | Redirige le trafic vers une autre adresse ou un autre segment du réseau | Transférer le trafic HTTP entrant vers le serveur web interne |

### Directions

| Direction | Trafic concerné | Exemple |
| --- | --- | --- |
| Entrante (inbound) | Trafic qui entre dans le réseau interne | Autoriser le trafic HTTP vers le serveur web |
| Sortante (outbound) | Trafic qui quitte le réseau interne | Bloquer le trafic SMTP sortant (port 25), sauf depuis le serveur de messagerie |
| Transfert (forward) | Trafic redirigé entre deux segments | Transférer le trafic HTTP entrant vers un serveur web interne |

## Le pare-feu de Windows

Windows Defender Firewall est intégré à Windows et activé par défaut. On l'ouvre en cherchant « Pare-feu Windows Defender » dans le menu Démarrer. Il adapte ses règles au type de réseau, grâce à deux profils.

| Profil | Usage | Réglages |
| --- | --- | --- |
| Privé | Réseaux domestiques ou de confiance | Plus permissifs, par exemple pour partager des fichiers entre ordinateurs |
| Public | Réseaux non sécurisés (cafés, Wi-Fi publics) | Plus restrictifs. Il est recommandé d'y bloquer toutes les connexions entrantes qui ne sont pas explicitement nécessaires |

Depuis le tableau de bord, on peut autoriser ou bloquer une application pour chaque profil, activer ou désactiver le pare-feu, et restaurer les paramètres par défaut. Désactiver complètement le pare-feu est déconseillé. Mieux vaut bloquer toutes les connexions entrantes.

### Créer une règle personnalisée

L'exemple suivant bloque tout le trafic web sortant, en HTTP (port 80) et en HTTPS (port 443).

1. Ouvrir **Paramètres avancés** dans le tableau de bord du pare-feu.
2. Choisir **Règles sortantes**, puis **Nouvelle règle**.
3. Sélectionner le type **Personnalisée**.
4. Sélectionner **Tous les programmes**.
5. Choisir le protocole **TCP**.
6. Saisir `80,443` dans les ports distants spécifiques.
7. Laisser les adresses IP par défaut.
8. Choisir l'action **Bloquer la connexion**.
9. Cocher tous les profils réseau.
10. Donner un nom et une description à la règle, puis terminer.

La règle apparaît alors dans la liste des règles sortantes. Pour la vérifier, on essaie d'ouvrir un site web. La connexion doit échouer.

## Les pare-feu sous Linux

Netfilter est le cœur du pare-feu sous Linux. Les outils ci-dessous ne sont que des interfaces pour le piloter.

| Outil | Particularité |
| --- | --- |
| iptables | Utilitaire en ligne de commande qui définit les règles de filtrage et de NAT |
| nftables | Successeur d'iptables, plus moderne et plus efficace |
| firewalld | Service qui s'appuie sur des zones de sécurité prédéfinies. Les règles changent sans redémarrage |
| ufw (Uncomplicated Firewall) | Interface simplifiée d'iptables, recommandée pour débuter ou pour une configuration rapide |

### Les commandes ufw

| Commande | Effet |
| --- | --- |
| `sudo ufw status` | Indique si le pare-feu est actif |
| `sudo ufw enable` | Active le pare-feu, qui démarrera ensuite avec le système |
| `sudo ufw disable` | Désactive le pare-feu |
| `sudo ufw default allow outgoing` | Autorise par défaut tout le trafic sortant |
| `sudo ufw default deny incoming` | Refuse par défaut tout le trafic entrant |
| `sudo ufw deny 22/tcp` | Bloque le trafic entrant sur le port TCP 22, celui de SSH |
| `sudo ufw status numbered` | Affiche les règles actives avec leur numéro |
| `sudo ufw delete 2` | Supprime la règle numéro 2 |

Les politiques par défaut décident du sort d'un paquet quand aucune règle ne lui correspond. Après avoir modifié ou supprimé une règle, il est conseillé de relancer `sudo ufw status numbered` pour vérifier la configuration.

## À retenir

- Un pare-feu filtre le trafic entrant et sortant d'après des règles.
- Du pare-feu sans état au NGFW, chaque type inspecte le trafic plus en profondeur que le précédent.
- Une règle décrit une source, une destination, un port, un protocole, une action et une direction.
- Sous Windows, les profils privé et public adaptent le filtrage au réseau.
- Sous Linux, Netfilter fait le travail. iptables, nftables, firewalld et ufw servent à le configurer.
