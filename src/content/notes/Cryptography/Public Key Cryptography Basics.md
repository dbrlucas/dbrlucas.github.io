---
titre: "Public Key Cryptography Basics"
description: "Découvrir comment fonctionnent les chiffrements à clé publique comme RSA, et leur rôle dans des applications comme SSH."
resume: "La cryptographie à clé publique permet d'échanger une clé secrète et de prouver une identité sans s'être rencontrés. Cette note présente RSA et Diffie-Hellman avec de petits exemples, puis leurs usages dans SSH, les signatures, les certificats et GPG."
date: "20.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/publickeycrypto"
---

## Définitions

**Chiffrement asymétrique** : chiffrement qui utilise une paire de clés, une publique et une privée.

**Échange de clés** : procédé qui permet à deux parties d'établir une clé symétrique commune sans la transmettre en clair.

**RSA (Rivest-Shamir-Adleman)** : algorithme asymétrique fondé sur la difficulté de factoriser un grand nombre en deux nombres premiers.

**Diffie-Hellman** : protocole qui permet à deux parties de créer une clé secrète commune sur un canal non sécurisé.

**Signature numérique** : procédé qui prouve qui a signé un document et que celui-ci n'a pas été modifié.

**Certificat numérique** : document qui associe une clé publique à une identité (personne, organisation, serveur).

**Autorité de certification (CA)** : entité de confiance qui émet les certificats et vérifie l'identité de leurs titulaires.

**Cryptanalyse** : étude des moyens de casser un système cryptographique sans connaître la clé.

## Pourquoi la clé publique

Lors d'une discussion en face à face, on sait à qui l'on parle, personne ne modifie les mots en chemin, et l'on peut rester discret. En ligne, ces garanties disparaissent. Un tiers peut usurper une identité, modifier un message ou écouter l'échange.

La cryptographie répond à ces risques. Le chiffrement symétrique assure la confidentialité. Le chiffrement asymétrique apporte l'authentification, l'authenticité et l'intégrité.

## L'usage courant

Le chiffrement asymétrique est lent. On ne l'utilise donc qu'au départ, pour transmettre de façon sûre une clé symétrique. Toute la suite de l'échange se fait ensuite en chiffrement symétrique, bien plus rapide.

L'image d'une boîte à cadenas résume le principe. Le serveur distribue des cadenas ouverts, qui jouent le rôle de sa clé publique, et garde seul la clé qui les ouvre, sa clé privée. Pour lui transmettre un code secret, c'est-à-dire la clé symétrique, on le met dans une boîte qu'on ferme avec son cadenas. Seul le serveur peut la rouvrir.

Il faut aussi vérifier qu'on parle au bon serveur. C'est le rôle des signatures et des certificats.

## RSA

RSA repose sur un constat simple. Multiplier deux grands nombres premiers `p` et `q` est facile, mais retrouver `p` et `q` à partir de leur produit `n` est extrêmement difficile.

| Variable | Rôle |
| --- | --- |
| `p` et `q` | Deux nombres premiers, gardés secrets |
| `n = p × q` | Le module, public |
| `e` | L'exposant public |
| `d` | L'exposant privé |
| `m` | Le message en clair |
| `c` | Le message chiffré |

La clé publique est `(n, e)` et sert à chiffrer avec `c = m^e mod n`. La clé privée est `(n, d)` et sert à déchiffrer avec `m = c^d mod n`.

Un exemple avec de petits nombres montre le fonctionnement.

1. On choisit `p = 61` et `q = 53`, d'où `n = 3233`.
2. On choisit l'exposant public `e = 17`. L'exposant privé correspondant est `d = 2753`.
3. La clé publique est `(3233, 17)`, la clé privée `(3233, 2753)`.
4. Pour chiffrer `m = 65`, on calcule `65^17 mod 3233`, ce qui donne `c = 2790`.
5. Pour déchiffrer, on calcule `2790^2753 mod 3233`, ce qui redonne `65`.

En pratique, `p` et `q` comptent plusieurs centaines de chiffres. Dans les CTF, les failles viennent souvent d'une mauvaise génération des clés, comme des nombres premiers trop petits ou un exposant mal choisi.

## Diffie-Hellman

Diffie-Hellman permet à Alice et Bob de construire une clé commune sans jamais l'envoyer. Voici un exemple avec de petits nombres.

1. Alice et Bob s'accordent publiquement sur `p = 23` et `g = 5`.
2. Chacun choisit un secret. Alice prend `a = 6`, Bob prend `b = 15`.
3. Alice calcule `A = 5^6 mod 23 = 8`. Bob calcule `B = 5^15 mod 23 = 19`.
4. Ils s'échangent `A` et `B`, qui peuvent circuler en clair.
5. Alice calcule `19^6 mod 23 = 2`, Bob calcule `8^15 mod 23 = 2`. Ils obtiennent le même secret, `2`.

La sécurité repose sur le problème du logarithme discret, c'est-à-dire la difficulté de retrouver `a` à partir de `A = g^a mod p`. En pratique, les nombres utilisés sont immenses.

Diffie-Hellman sert à établir la clé symétrique, ensuite utilisée par AES par exemple, dans TLS, les VPN et SSH. Seul, il ne vérifie pas l'identité des parties et reste exposé à une attaque de l'homme du milieu. On le combine donc avec RSA ou des certificats.

## SSH

| Commande | Effet |
| --- | --- |
| `ssh <utilisateur>@<serveur>` | Se connecte à un serveur |
| `ssh -i <clé privée> <utilisateur>@<serveur>` | Se connecte avec une clé privée précise |
| `ssh-keygen -t ed25519` | Génère une paire de clés avec l'algorithme Ed25519 |
| `ssh-copy-id <utilisateur>@<serveur>` | Ajoute la clé publique au fichier `authorized_keys` du serveur |

Le fichier `authorized_keys` du serveur liste les clés publiques autorisées à se connecter. Ed25519 est un algorithme moderne, rapide et sûr.

- La clé publique se partage librement. La clé privée doit rester protégée, avec des permissions `600`.
- À la première connexion, on confirme l'empreinte du serveur, ce qui protège contre l'homme du milieu.
- Les clés sont plus sûres que les mots de passe pour s'authentifier.
- Une phrase de passe chiffre la clé privée sur le disque et ajoute une protection.

## Signatures et certificats

Une signature numérique prouve à la fois l'authenticité, puisqu'elle indique qui a signé, et l'intégrité, puisque le document n'a pas changé.

1. Le signataire calcule le hash du document et le chiffre avec sa clé privée.
2. Le destinataire le déchiffre avec la clé publique du signataire.
3. Il le compare au hash du document reçu. S'ils sont identiques, la signature est valide.

Une signature électronique simple, comme une image scannée, ne prouve en revanche rien sur l'intégrité.

Les certificats permettent de vérifier qu'un serveur est bien celui qu'il prétend être. HTTPS repose sur des certificats TLS et sur une chaîne de confiance, qui remonte jusqu'aux autorités racines reconnues par le système et le navigateur. Let's Encrypt délivre gratuitement des certificats TLS.

## PGP et GPG

PGP (Pretty Good Privacy) chiffre des fichiers et des messages et les signe. GPG (GnuPG) est l'implémentation open source de la norme OpenPGP. On s'en sert notamment pour sécuriser les e-mails.

| Commande | Effet |
| --- | --- |
| `gpg --full-gen-key` | Génère une paire de clés, en choisissant le type, la courbe et l'expiration |
| `gpg --import <fichier>` | Importe une clé, par exemple depuis une sauvegarde |
| `gpg --decrypt <fichier>` | Déchiffre un fichier avec la clé privée correspondante |

Après avoir généré ses clés, on partage sa clé publique pour que ses contacts puissent chiffrer les messages qui nous sont destinés. Une phrase de passe protège la clé privée. Une sauvegarde sûre permet de la restaurer sur un nouvel ordinateur.

## À retenir

- L'asymétrique sert à échanger une clé symétrique, qui chiffre ensuite tout l'échange.
- RSA repose sur la difficulté de factoriser, Diffie-Hellman sur celle du logarithme discret.
- Diffie-Hellman seul n'authentifie personne. Il faut lui associer des signatures ou des certificats.
- Une signature numérique prouve l'auteur d'un document et son intégrité.
- SSH et GPG appliquent ces principes avec une clé privée, à protéger par une phrase de passe.
