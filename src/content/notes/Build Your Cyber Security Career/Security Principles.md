---
titre: "Security Principles"
description: "Découvrir la triade de la sécurité ainsi que les modèles et principes de sécurité courants."
resume: "La sécurité n'est jamais absolue, c'est un processus d'amélioration continue. Cette note présente la triade CIA et ses extensions, son opposé le modèle DAD, les grands modèles de sécurité, puis les principes de conception qui en découlent."
date: "01.11.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/securityprinciples"
---

## Définitions

**Posture de sécurité** : niveau global de protection d'un système face aux menaces.

**Adversaire** : personne, groupe ou organisation qui tente de compromettre la sécurité d'un système.

**Contrôle de sécurité** : mécanisme, politique ou outil qui protège un actif contre les menaces.

**Non-répudiation** : garantie qu'une personne ne peut pas nier une action qu'elle a effectuée, comme l'envoi d'un message.

**Contrôle d'accès obligatoire (MAC, Mandatory Access Control)** : contrôle où les droits d'accès sont fixés par le système, et non modifiables par l'utilisateur.

**Microsegmentation** : découpage d'un réseau en très petits segments, jusqu'à un seul hôte, avec un contrôle strict des échanges entre eux.

## Le contexte

La sécurité n'est pas un état, c'est un processus d'amélioration continue. Le but n'est pas une sécurité parfaite, qui n'existe pas, mais de réduire les risques et de rendre l'attaque plus difficile.

Avant de choisir des protections, il faut connaître l'adversaire, ses capacités et ses objectifs. La défense dépend de la valeur de ce qu'on protège et du profil de l'attaquant. On ne protège pas un ordinateur de la même façon contre un enfant curieux et contre un espion industriel.

## La triade CIA

La confidentialité, l'intégrité et la disponibilité sont les trois piliers de la sécurité de l'information.

| Propriété | Objectif | Exemple de violation |
| --- | --- | --- |
| Confidentialité (confidentiality) | Seules les personnes autorisées accèdent aux données | Les données de carte bancaire d'un achat en ligne fuitent |
| Intégrité (integrity) | Les données restent exactes, et toute modification non autorisée se détecte | Un attaquant change une adresse de livraison, ou un dossier médical |
| Disponibilité (availability) | Les services restent accessibles quand on en a besoin | Un site marchand ou un système hospitalier tombe en panne |

Leur poids varie selon le contexte. Une annonce publique n'a pas besoin de confidentialité, mais son intégrité compte beaucoup, pour éviter qu'on la falsifie.

### Au-delà de la triade

Deux propriétés s'ajoutent souvent. L'**authenticité** garantit que l'information vient bien de la source annoncée, par exemple qu'une commande a bien été passée par le client. La **non-répudiation** empêche ce client de nier sa commande ensuite. Elles sont essentielles pour les transactions, les diagnostics médicaux ou les opérations bancaires.

En 1998, Donn Parker a proposé d'étendre la triade à six éléments, l'**hexade parkérienne**. Elle ajoute l'authenticité, la possession et l'utilité.

| Propriété | Sens | Exemple de perte |
| --- | --- | --- |
| Utilité | L'information reste exploitable par son utilisateur légitime | Une clé de chiffrement perdue rend les données inutilisables, bien qu'elles soient disponibles |
| Possession | L'utilisateur autorisé garde le contrôle de ses données | Un ransomware chiffre les fichiers, toujours présents mais plus maîtrisés |

## Le modèle DAD

Le modèle DAD décrit l'inverse de la triade CIA, c'est-à-dire les trois menaces fondamentales.

| Menace DAD | Principe violé | Exemple dans un hôpital |
| --- | --- | --- |
| Divulgation (disclosure) | Confidentialité | Des dossiers de patients sont volés et publiés |
| Altération (alteration) | Intégrité | Des dossiers sont modifiés, avec un risque d'erreur médicale grave |
| Destruction ou déni (destruction) | Disponibilité | Un ransomware rend les systèmes inaccessibles |

La sécurité consiste à trouver un équilibre entre les trois principes. Trop de confidentialité ou d'intégrité peut nuire à la disponibilité, et l'inverse est vrai aussi. Une bonne politique adapte ce compromis au métier et aux risques.

## Les modèles de sécurité

Les modèles de sécurité formalisent les règles qui garantissent une ou plusieurs propriétés de la triade.

### Bell-LaPadula, pour la confidentialité

Ce modèle repose sur des niveaux de classification (non classifié, confidentiel, secret, très secret) et sur le contrôle d'accès obligatoire.

| Règle | Signification |
| --- | --- |
| Pas de lecture vers le haut (no read up) | Un sujet ne lit pas un objet d'un niveau supérieur au sien |
| Pas d'écriture vers le bas (no write down) | Un sujet n'écrit pas dans un objet d'un niveau inférieur au sien |
| Propriété discrétionnaire | Une matrice d'accès précise en plus les droits de lecture et d'écriture |

Il se résume par « écrire vers le haut, lire vers le bas ». Il ne gère ni le partage collaboratif, ni les échanges entre sujets de même niveau.

### Biba, pour l'intégrité

Biba fait l'inverse de Bell-LaPadula, pour protéger l'intégrité.

| Règle | Signification |
| --- | --- |
| Pas de lecture vers le bas (no read down) | Un sujet ne lit pas de données d'un niveau d'intégrité inférieur, pour ne pas être contaminé |
| Pas d'écriture vers le haut (no write up) | Un sujet n'écrit pas dans des données d'un niveau supérieur, pour ne pas les corrompre |

Il se résume par « lire vers le haut, écrire vers le bas ». Il ne prend en compte ni les menaces internes, ni les besoins de collaboration.

### Clark-Wilson, pour l'intégrité des transactions

Clark-Wilson garantit l'intégrité par des transactions contrôlées et par la séparation des rôles, ce qui limite la fraude interne.

| Élément | Rôle |
| --- | --- |
| CDI (Constrained Data Item) | Données critiques, dont l'intégrité doit être préservée |
| UDI (Unconstrained Data Item) | Données non contraintes, comme les saisies des utilisateurs |
| TP (Transformation Procedure) | Opérations autorisées à modifier les CDI sans compromettre leur intégrité |
| IVP (Integrity Verification Procedure) | Vérifications régulières de la validité des CDI |

Un employé saisit par exemple une commande, qui est un UDI. Seule une procédure autorisée peut la valider et modifier les enregistrements critiques.

### D'autres modèles

| Modèle | Principe |
| --- | --- |
| Brewer-Nash (muraille de Chine) | Empêche les conflits d'intérêts entre données de concurrents |
| Goguen-Meseguer | Fondé sur la non-interférence, pour éviter les flux d'information indésirables |
| Sutherland | Empêche la fuite d'informations par déduction |
| Graham-Denning et Harrison-Ruzzo-Ullman | Décrivent la création et la modification des droits d'accès dans un système |

## La défense en profondeur

La défense en profondeur superpose plusieurs couches de protection indépendantes. Chacune est une barrière de plus, qui ralentit l'attaquant. Aucune n'est infaillible, mais leur combinaison réduit fortement les chances de succès.

Des documents importants peuvent ainsi être rangés dans un tiroir fermé, dans une pièce fermée à clé, dans un appartement fermé, dans un immeuble fermé et surveillé par des caméras. En informatique, les couches portent sur la sécurité physique, le réseau (pare-feu, segmentation, IDS), les applications (authentification, chiffrement) et les utilisateurs (formation).

## La norme ISO/IEC 19249

La norme ISO/IEC 19249:2017 propose des principes pour concevoir des produits, des systèmes et des applications sûrs.

| Principe d'architecture | Idée | Exemple |
| --- | --- | --- |
| Séparation des domaines | Regrouper des composants liés dans une entité qui a ses propres attributs de sécurité | Les anneaux de privilèges des processeurs x86 |
| Superposition (layering) | Organiser le système en couches, pour appliquer des politiques à chaque niveau | Le modèle OSI |
| Encapsulation | Cacher l'implémentation et n'offrir que des interfaces contrôlées | Les méthodes en programmation objet, une API devant une base de données |
| Redondance | Doubler les composants pour garantir disponibilité et intégrité | Une double alimentation, le RAID 5 |
| Virtualisation | Partager le matériel tout en isolant les systèmes | Les services cloud, les bacs à sable |

| Principe de conception | Idée |
| --- | --- |
| Moindre privilège | Ne donner que les droits nécessaires à la tâche |
| Réduction de la surface d'attaque | Désactiver tout service inutile |
| Validation centralisée des paramètres | Vérifier les entrées en un point unique, pour éviter les exploitations |
| Services de sécurité centralisés | Centraliser l'authentification, sans créer de point de défaillance unique |
| Gestion des erreurs et des exceptions | Gérer les erreurs sans divulguer d'informations sensibles, en restant dans un état sûr |

## « Faire confiance mais vérifier » et zéro confiance

Le principe **« faire confiance mais vérifier » (trust but verify)** demande de contrôler même une entité jugée fiable. Les journaux, la surveillance automatisée, les proxys et les IDS ou IPS détectent les comportements anormaux.

Le **zéro confiance (zero trust)** va plus loin. Il considère la confiance elle-même comme une vulnérabilité. Aucun utilisateur ni appareil n'est fiable par défaut, quel que soit son emplacement. Chaque accès exige une authentification et une autorisation. En cas de compromission, les dégâts restent mieux contenus. On le met souvent en œuvre par la microsegmentation.

Appliqué à l'extrême, le zéro confiance peut nuire aux performances ou à l'efficacité de l'entreprise. Il faut trouver un équilibre.

## Vulnérabilité, menace et risque

| Notion | Définition | Exemple d'une vitrine |
| --- | --- | --- |
| Vulnérabilité | Faiblesse qui peut être exploitée | Le verre est fragile |
| Menace | Danger lié à cette faiblesse | La vitre peut être brisée |
| Risque | Probabilité que la menace se réalise, et son impact | Les chances que la vitre soit brisée, et ce que cela coûterait au magasin |

Dans un hôpital, la vulnérabilité peut être une faille découverte dans une base de données. La publication d'un code d'exploitation rend la menace réelle. Évaluer le risque revient alors à décider des mesures pour réduire l'exposition.

Distinguer ces trois notions est essentiel pour évaluer et gérer la sécurité.

Dans le cloud, le **modèle de responsabilité partagée** répartit la sécurité entre le fournisseur et le client. En IaaS, le client contrôle entièrement le système d'exploitation et sa configuration. En SaaS, il n'a pas accès au système sous-jacent.

## À retenir

- La triade CIA (confidentialité, intégrité, disponibilité) est le socle de la sécurité, et le modèle DAD décrit son inverse.
- L'authenticité, la non-répudiation, la possession et l'utilité complètent la triade.
- Bell-LaPadula protège la confidentialité, Biba et Clark-Wilson protègent l'intégrité.
- La défense en profondeur superpose des protections indépendantes.
- Le zéro confiance vérifie chaque accès, sans confiance par défaut.
