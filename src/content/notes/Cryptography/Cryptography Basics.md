---
titre: "Cryptography Basics"
description: "Apprendre les bases de la cryptographie et du chiffrement symétrique."
resume: "La cryptographie protège la confidentialité, l'intégrité et l'authenticité des échanges. Cette note présente son vocabulaire, quelques chiffrements historiques, la différence entre chiffrement symétrique et asymétrique, puis deux opérations mathématiques de base, le XOR et le modulo."
date: "19.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/cryptographybasics"
---

## Définitions

**Cryptographie** : discipline qui protège la confidentialité, l'intégrité et l'authenticité des données échangées.

**Texte en clair (plaintext)** : données lisibles avant le chiffrement (texte, image, fichier).

**Texte chiffré (ciphertext)** : version illisible des données après le chiffrement.

**Algorithme de chiffrement (cipher)** : méthode qui transforme le texte en clair en texte chiffré, et inversement.

**Clé** : suite de bits utilisée par l'algorithme pour chiffrer ou déchiffrer.

**Attaque par force brute** : technique qui essaie toutes les clés possibles pour retrouver le texte d'origine.

## À quoi sert la cryptographie

Les protocoles réseau permettent de communiquer. La cryptographie rend ces échanges dignes de confiance. Elle répond à trois besoins.

| Propriété | Garantie |
| --- | --- |
| Confidentialité | Seules les personnes autorisées peuvent lire les données |
| Intégrité | Les données n'ont pas été modifiées en chemin |
| Authenticité | On communique bien avec l'interlocuteur prévu |

Elle agit en arrière-plan, sans que l'utilisateur s'en rende compte. Elle protège une connexion à un site ou en SSH, permet de vérifier le certificat d'un serveur, ou de contrôler l'intégrité d'un fichier téléchargé.

Elle est aussi une obligation légale dans certains secteurs.

| Secteur | Réglementation |
| --- | --- |
| Cartes bancaires | PCI DSS impose de chiffrer les données au repos et en transit |
| Données médicales et personnelles | HIPAA et HITECH aux États-Unis, RGPD en Europe, DPA au Royaume-Uni |

## Du texte en clair au texte chiffré

Le chiffrement repose sur deux éléments. L'**algorithme** est connu de tous, la **clé** reste secrète.

1. Le texte en clair et la clé passent par le chiffrement et donnent le texte chiffré.
2. Le texte chiffré et la clé passent par le déchiffrement et redonnent le texte en clair.

Sans la clé, le texte chiffré est inutilisable. La sécurité ne dépend donc pas du secret de l'algorithme, mais du secret de la clé.

## Les chiffrements historiques

Le **chiffre de César** décale chaque lettre d'un nombre fixe de positions dans l'alphabet. Avec un décalage de 3, `BONJOUR` devient `ERQMRXU`. Pour déchiffrer, on décale dans l'autre sens.

Il n'existe que 25 décalages possibles. Une attaque par force brute le casse donc immédiatement. Il ne sert plus que d'exemple.

| Chiffrement | Époque | Principe |
| --- | --- | --- |
| Vigenère | XVIe siècle | Une série de décalages, fondée sur un mot-clé |
| Enigma | Seconde Guerre mondiale | Machine électromécanique de l'armée allemande |
| Masque jetable (one-time pad) | Guerre froide | Clé totalement aléatoire, aussi longue que le message. Il est incassable si la clé n'est utilisée qu'une fois |

## Symétrique et asymétrique

| | Chiffrement symétrique | Chiffrement asymétrique |
| --- | --- | --- |
| Clés | Une seule clé, pour chiffrer et déchiffrer | Une paire de clés. La clé publique chiffre, la clé privée déchiffre |
| Vitesse | Rapide | Plus lent |
| Difficulté | Partager la clé de façon sûre | Simplifie le partage des clés |

| Algorithme | Type | Caractéristiques |
| --- | --- | --- |
| DES | Symétrique | Adopté en 1977, clé de 56 bits |
| 3DES | Symétrique | DES appliqué trois fois, clé de 168 bits pour une sécurité effective de 112 bits. Déprécié en 2019 |
| AES | Symétrique | Adopté en 2001, clés de 128, 192 ou 256 bits. C'est le standard recommandé |
| RSA | Asymétrique | Clés de 2048, 3072 ou 4096 bits |
| Diffie-Hellman | Asymétrique | Sert à échanger une clé. Au moins 2048 bits recommandés |
| ECC | Asymétrique | Courbes elliptiques. Sécurité comparable à RSA avec des clés plus courtes |

Le chiffrement asymétrique repose sur des problèmes mathématiques faciles à calculer dans un sens et extrêmement difficiles à inverser. En pratique, on combine les deux. L'asymétrique sert à échanger une clé, puis le symétrique chiffre les données.

## Les mathématiques de base

### Le XOR

Le XOR (ou exclusif), noté `⊕`, renvoie 1 quand les deux bits sont différents et 0 quand ils sont identiques.

| Propriété | Écriture |
| --- | --- |
| Un nombre XOR lui-même donne 0 | `A ⊕ A = 0` |
| Un nombre XOR 0 reste inchangé | `A ⊕ 0 = A` |
| Commutativité | `A ⊕ B = B ⊕ A` |
| Associativité | `(A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)` |

Ces propriétés font du XOR un chiffrement symétrique simple. Si `C = P ⊕ K`, alors `P = C ⊕ K`.

### Le modulo

Le modulo, noté `%`, donne le reste d'une division entière. `25 % 7` vaut par exemple 4. Il n'est pas réversible, car plusieurs nombres donnent le même reste.

Les calculs cryptographiques utilisent de très grands nombres. Python et les bibliothèques de grands entiers sont faits pour cela.

## À retenir

- La cryptographie garantit la confidentialité, l'intégrité et l'authenticité.
- L'algorithme est public, seule la clé doit rester secrète.
- Les chiffrements historiques comme César se cassent facilement par force brute.
- Le symétrique est rapide, l'asymétrique facilite l'échange des clés, et on combine les deux.
- AES est le standard symétrique actuel. RSA et ECC sont les principaux algorithmes asymétriques.
