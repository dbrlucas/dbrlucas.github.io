---
titre: "NetworkMiner"
description: "Apprendre à utiliser NetworkMiner pour analyser des fichiers de trafic enregistré et s'exercer à l'investigation réseau."
resume: "NetworkMiner donne en quelques clics une vue d'ensemble d'une capture réseau. Cette note présente son rôle en investigation, ses deux modes, ses principaux onglets, ses différences avec Wireshark et les écarts entre ses versions."
date: "19.08.2025"
plateforme: "TryHackMe"
parcours: "Separate Rooms"
difficulte: "Easy"
lien: "https://tryhackme.com/room/networkminer"
---

## Définitions

**NetworkMiner** : outil open source d'investigation réseau développé par Netresec. Il analyse le trafic de façon passive et en extrait les hôtes, les sessions, les fichiers et les certificats.

**NFAT (Network Forensics Analysis Tool)** : outil d'investigation sur le trafic réseau.

**Investigation réseau (network forensics)** : analyse du trafic pour repérer des activités malveillantes, des atteintes à la sécurité et des anomalies.

**PCAP (Packet Capture)** : fichier qui contient des paquets réseau capturés.

**Prise d'empreinte du système (OS fingerprinting)** : identification du système d'exploitation d'une machine à partir de caractéristiques visibles dans son trafic.

**OSINT (Open Source Intelligence)** : renseignement tiré de sources publiques, qui enrichit les informations sur un hôte.

## Présentation

NetworkMiner fonctionne comme un renifleur passif et comme un outil d'analyse de fichiers PCAP. Il identifie les systèmes d'exploitation, les sessions, les noms d'hôtes, les ports ouverts, les fichiers et les certificats échangés, sans générer lui-même de trafic.

Les équipes de réponse à incident et les forces de l'ordre l'utilisent beaucoup. Il fonctionne sous Windows, et sous Linux, macOS ou FreeBSD grâce à Mono.

## Son rôle dans une investigation

NetworkMiner indique rapidement par où commencer une enquête.

- Le contexte des hôtes capturés, avec leur adresse IP, leur adresse MAC, leur nom et leur système.
- Des indices d'attaque ou d'anomalie, comme des pics de trafic ou des balayages de ports.
- Les outils utilisés par l'attaquant, comme Nmap.

L'investigation réseau porte sur trois types de données, le trafic en direct, les captures de trafic et les fichiers journaux. NetworkMiner travaille sur les deux premiers.

## Les deux modes

| Mode | Usage |
| --- | --- |
| Renifleur (sniffer) | Capture le trafic en direct. Il n'existe que sous Windows et reste moins fiable que Wireshark ou tcpdump |
| Analyse de paquets | Analyse un fichier PCAP pour en tirer une vue d'ensemble |

Ses atouts sont l'extraction facile des fichiers et des certificats, l'identification des systèmes, la recherche de mots-clés en clair et la vue d'ensemble rapide. En revanche, il n'est pas adapté à la capture à grande échelle, son filtrage est limité, et il n'est pas conçu pour une analyse manuelle détaillée.

Il se distingue ainsi de Wireshark. NetworkMiner donne une vue d'ensemble rapide et extrait facilement les objets. Wireshark décode complètement chaque paquet et offre un filtrage avancé, pour l'analyse approfondie.

## Les principaux onglets

| Élément | Contenu |
| --- | --- |
| Menu *File* | Charge un fichier PCAP, par glisser-déposer ou par réception sur une adresse IP |
| Menu *Tools* | Efface le tableau de bord et les données chargées |
| Menu *Help* | Affiche la version et les mises à jour |
| *Case Panel* | Liste les fichiers PCAP étudiés, pour les recharger, voir leurs métadonnées ou les retirer |
| *Hosts* | Liste les hôtes avec leur adresse IP, leur adresse MAC, leur système, leurs ports ouverts et leurs sessions |
| *Sessions* | Liste les sessions, avec le client, le serveur, les ports, le protocole et l'horodatage |
| *DNS* | Liste les requêtes DNS, avec le client, le serveur, le TTL, l'identifiant de transaction, le type et la réponse |
| *Credentials* | Liste les identifiants et les hashs trouvés dans la capture (Kerberos, NTLM, cookies HTTP, RDP, IMAP, FTP, SMTP, MS SQL) |
| *Files*, *Images*, *Messages* | Montrent les fichiers, les images et les messages extraits du trafic, avec leurs pièces jointes |
| *Parameters* | Liste les paramètres extraits des requêtes |
| *Keywords* | Recherche des mots-clés en clair dans la capture |
| *Anomalies* | Signale quelques détections intégrées, comme EternalBlue |

L'onglet *Hosts* identifie le système grâce aux bases d'empreintes de p0f et Satori, et le fabricant grâce à la base d'adresses MAC mac-ages. Les sessions se filtrent par phrase exacte, par tous les mots, par exclusion ou par expression régulière. Après un changement de mots-clés, il faut recharger le cas pour que la recherche s'applique.

Les identifiants trouvés peuvent ensuite être soumis à un outil comme Hashcat ou John the Ripper. Certaines fonctions, comme les recherches OSINT ou la recherche de hashs, sont réservées à la version payante.

NetworkMiner n'est pas un IDS. Ses quelques détections intégrées restent un complément.

## Les différences de version

La machine de la room propose deux versions, 1.6 et 2.7. Les versions récentes améliorent la stabilité, la sécurité et les fonctions, mais certaines fonctions ont disparu.

| Fonction | Version 1.6 | Version 2 et suivantes |
| --- | --- | --- |
| Corrélation des adresses MAC | Absente | Présente, utile pour repérer les conflits d'adresses |
| Détail des paquets envoyés et reçus | Plus détaillé | Moins détaillé |
| Nombre de trames | Affiché | Absent |
| Paramètres extraits | Moins complets | Plus complets |
| Données en clair | Toutes réunies dans un onglet, sans lien avec les paquets | Absent |

## À retenir

- NetworkMiner analyse surtout des fichiers PCAP, de façon passive.
- Il n'est pas fait pour servir de renifleur principal.
- Il donne vite une vue d'ensemble des hôtes, des sessions, du DNS, des identifiants et des fichiers.
- On approfondit ensuite l'enquête avec Wireshark ou tcpdump.
- Les versions 1.6 et 2 n'offrent pas les mêmes fonctions.
