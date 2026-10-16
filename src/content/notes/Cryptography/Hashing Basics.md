---
titre: "Hashing Basics"
description: "Découvrir les fonctions de hachage et leurs usages dans la vérification des mots de passe et le contrôle d'intégrité des fichiers."
resume: "Une fonction de hachage produit une empreinte de taille fixe, impossible à inverser. Cette note explique son fonctionnement, puis ses deux grands usages, le stockage des mots de passe et le contrôle d'intégrité, et la différence entre hachage, encodage et chiffrement."
date: "20.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/hashingbasics"
---

## Définitions

**Fonction de hachage** : fonction qui transforme une entrée de taille quelconque en une sortie de taille fixe, appelée hash ou empreinte.

**Collision** : situation où deux entrées différentes donnent le même hash.

**Sel (salt)** : valeur aléatoire ajoutée à un mot de passe avant de le hacher.

**Table arc-en-ciel (rainbow table)** : table précalculée qui associe des hashs à des mots de passe en clair.

**HMAC (Keyed-Hash Message Authentication Code)** : code qui combine une fonction de hachage et une clé secrète, pour garantir l'intégrité et l'authenticité d'un message.

**NTLM** : algorithme de hachage des mots de passe de Windows, fondé sur MD4. Les hashs sont conservés dans la base SAM (Security Accounts Manager).

## Le fonctionnement

Une fonction de hachage n'utilise pas de clé, et son résultat ne se déchiffre pas. Un bon algorithme est rapide à calculer mais impossible à inverser. Le moindre changement dans les données change complètement le hash, c'est l'effet avalanche.

Deux fichiers identiques donnent le même hash, ce qui permet de les comparer sans les lire bit par bit. Le hash s'affiche en général en hexadécimal, à raison de deux caractères par octet, ou en Base64.

```bash
# Contenu d'un fichier en hexadécimal
hexdump -C fichier.txt

# Hash d'un fichier avec différents algorithmes
md5sum fichier.txt
sha1sum fichier.txt
sha256sum fichier.txt
```

Les collisions sont inévitables en théorie. C'est le principe des tiroirs. S'il y a plus d'entrées possibles que de sorties, certaines entrées partagent forcément la même sortie. Un bon algorithme les rend toutefois rares et imprévisibles. MD5 et SHA-1 ne sont plus sûrs, car des collisions ont été produites. SHA-256 et au-delà restent recommandés.

## Stocker les mots de passe

### Les mauvaises pratiques

| Pratique | Problème |
| --- | --- |
| Mots de passe en clair | Toute fuite de la base expose directement les comptes |
| Chiffrement déprécié | Les mots de passe sont vite récupérés, comme lors de la fuite d'Adobe |
| SHA-1 sans sel | Vulnérable aux attaques par dictionnaire, comme lors de la fuite de LinkedIn en 2012 |

Un gestionnaire de mots de passe est un cas à part. Il doit pouvoir restituer les mots de passe en clair à leur propriétaire, donc il les chiffre.

### Hacher et saler

Un service d'authentification n'a pas besoin de connaître le mot de passe, seulement de vérifier qu'il est correct. On stocke donc son hash. Le hachage est préféré au chiffrement, qui obligerait à conserver une clé capable de déchiffrer tous les mots de passe d'un coup.

Sans sel, deux utilisateurs qui ont le même mot de passe ont le même hash, et une table arc-en-ciel suffit à les retrouver. Le sel règle ce problème. Il n'a pas besoin d'être secret, mais il doit être unique pour chaque utilisateur.

Les fonctions modernes, comme yescrypt, bcrypt, scrypt, Argon2 ou PBKDF2, intègrent le sel et sont volontairement lentes. Chaque essai coûte cher à un attaquant.

### Reconnaître un hash

Sous Linux, les hashs des mots de passe sont rangés dans `/etc/shadow`, lisible seulement par root. Ils suivent la forme `$préfixe$options$sel$hash`. Le préfixe indique l'algorithme. La commande `man 5 shadow` décrit le format du fichier.

| Préfixe | Algorithme |
| --- | --- |
| `$y$` | yescrypt |
| `$gy$` | gost-yescrypt |
| `$7$` | scrypt |
| `$2a$`, `$2b$`, `$2x$`, `$2y$` | bcrypt |
| `$6$` | sha512crypt |
| `$md5` | SunMD5 |
| `$1$` | md5crypt |

Des outils comme hashID devinent le type d'un hash, mais ils se trompent parfois. Le contexte et la longueur du hash aident à trancher.

### Pourquoi le sel et la lenteur protègent

Un hash ne se « déchiffre » pas. Pour retrouver un mot de passe, un attaquant doit essayer des candidats un par un et comparer leurs hashs. Des outils comme Hashcat ou John the Ripper automatisent ces essais, et les cartes graphiques les accélèrent beaucoup.

C'est pourquoi les deux protections comptent. Le sel rend les tables précalculées inutiles. Une fonction lente comme bcrypt réduit fortement le nombre d'essais possibles par seconde. Un mot de passe long et unique fait le reste.

Hashcat illustre cette démarche. On lui fournit le type de hash, un mode d'attaque, le fichier de hashs et un dictionnaire.

```bash
# Forme générale
hashcat -m <type> -a <mode> <fichier-de-hashs> <dictionnaire>
```

| Option | Rôle |
| --- | --- |
| `-m <type>` | Type de hash, par exemple `1000` pour NTLM ou `3200` pour bcrypt |
| `-a <mode>` | Mode d'attaque, `0` pour un dictionnaire (chaque mot est testé l'un après l'autre) |

```bash
# Auditer un hash bcrypt avec un dictionnaire courant
hashcat -m 3200 -a 0 hash.txt /usr/share/wordlists/rockyou.txt
```

Un sel unique et une fonction lente comme bcrypt (`-m 3200`) ralentissent énormément ce genre d'audit, ce qui est précisément leur but.

## Contrôler l'intégrité

Comparer le hash d'un fichier à celui publié par son éditeur prouve qu'il n'a pas été modifié ni corrompu. Un seul bit changé suffit à produire un hash complètement différent.

```bash
# Hash du fichier téléchargé
sha256sum fichier.iso

# Hashs officiels publiés par l'éditeur, pour comparer
head <fichier-de-sommes>
```

Le hachage repère aussi les doublons, puisque deux fichiers identiques ont le même hash.

HMAC va plus loin. En mêlant une clé secrète au calcul, il confirme à la fois l'intégrité du message et son origine, puisque seul le détenteur de la clé peut produire ce code.

## Hachage, encodage et chiffrement

| Procédé | Réversible | But |
| --- | --- | --- |
| Hachage | Non | Vérifier l'intégrité, stocker des mots de passe |
| Encodage | Oui, sans clé | Rendre des données compatibles avec un système (ASCII, UTF-8, Base64) |
| Chiffrement | Oui, avec la clé | Protéger la confidentialité |

L'encodage ne protège rien. Base64 sert seulement à transmettre ou stocker des données dans un format texte.

```bash
# Encoder puis décoder en Base64
echo "Bonjour" | base64        # Qm9uam91cgo=
echo "Qm9uam91cgo=" | base64 -d
```

## À retenir

- Une fonction de hachage produit une empreinte de taille fixe, impossible à inverser.
- MD5 et SHA-1 ne sont plus sûrs. SHA-256 reste recommandé pour l'intégrité.
- Les mots de passe se stockent hachés, salés, avec une fonction lente comme bcrypt ou Argon2.
- Le préfixe d'un hash, comme `$6$` ou `$y$`, indique son algorithme.
- Hachage, encodage et chiffrement n'ont pas le même but. L'encodage ne protège rien.
