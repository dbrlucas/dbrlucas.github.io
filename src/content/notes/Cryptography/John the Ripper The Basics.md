---
titre: "John the Ripper: The Basics"
description: "Apprendre à utiliser John the Ripper, un outil de cassage de hashs puissant et adaptable."
resume: "John the Ripper teste la robustesse des mots de passe en retrouvant ceux qui sont faibles à partir de leur hash. Cette note présente son principe, l'attaque par dictionnaire, les cas NTLM et /etc/shadow, le mode Single Crack, les règles personnalisées et les outils qui préparent un ZIP, un RAR ou une clé SSH."
date: "21.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/johntheripperbasics"
---

## Définitions

**John the Ripper (JtR)** : outil open source d'audit de mots de passe. Il sert à vérifier leur robustesse en retrouvant ceux qui sont faibles à partir de leur hash.

**Jumbo John** : version étendue de John, qui ajoute de nombreux formats et outils. C'est celle qu'on utilise en pratique.

**Attaque par dictionnaire** : méthode qui teste les mots d'une liste un par un, en comparant chaque hash au hash cible.

**Wordlist (liste de mots)** : fichier qui contient de nombreux mots de passe candidats. `rockyou.txt`, issu d'une fuite de 2009, est la plus connue.

**Single Crack** : mode où John construit lui-même ses candidats, à partir des informations de l'utilisateur (nom, champ GECOS).

**Mangling** : technique qui dérive des variantes d'un mot, par exemple en changeant la casse ou en ajoutant des chiffres.

## Le principe

Un hash ne se déchiffre pas. Pour retrouver un mot de passe, on en teste beaucoup, on calcule leur hash et on le compare au hash cible. La sécurité d'un hash ne tient donc pas à son irréversibilité absolue, mais au temps nécessaire pour essayer assez de candidats.

John automatise cette démarche. Il génère des candidats, les hache et les compare très vite. Les pentesters et les administrateurs s'en servent pour repérer les mots de passe faibles de leur environnement. Un même hash peut d'ailleurs correspondre à des entrées de longueurs différentes. `pollo` et `polomints` donnent tous deux un hash MD5 de 32 caractères.

## Mettre en place John

Kali Linux et l'AttackBox de TryHackMe incluent déjà Jumbo John. Les versions des dépôts (`apt`, `dnf`) sont parfois incomplètes, et il vaut alors mieux compiler Jumbo John depuis les sources pour disposer de tous ses outils. Sur Windows, des binaires précompilés existent. Les wordlists comme `rockyou.txt` se trouvent dans `/usr/share/wordlists/`.

## L'attaque par dictionnaire

| Commande | Effet |
| --- | --- |
| `john <fichier>` | Lance John sur un fichier de hashs |
| `john --wordlist=<liste> <fichier>` | Attaque par dictionnaire avec une wordlist |
| `john --format=<format> --wordlist=<liste> <fichier>` | Précise le format du hash, par exemple `raw-md5` |
| `john --list=formats` | Liste les formats pris en charge |
| `john --show <fichier>` | Affiche les mots de passe déjà retrouvés |

John tente de deviner le format, mais il se trompe parfois. Un outil comme hash-identifier aide à l'identifier.

```bash
# Identifier un hash
python3 hash-id.py

# Lister les formats contenant « md5 »
john --list=formats | grep -iF "md5"
```

Pour les hashs simples comme MD5, le format porte souvent le préfixe `raw-`, par exemple `raw-md5`.

## Les hashs NTLM

NTLM reste présent dans les environnements Windows. Ses hashs ne sont pas salés, ce qui les rend vulnérables aux attaques par dictionnaire. John les cible avec `--format=NT`.

```bash
john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt ntlm.txt
```

## Les hashs de /etc/shadow

Sous Linux, les hashs sont dans `/etc/shadow`, et les comptes dans `/etc/passwd`. L'outil `unshadow` réunit les deux fichiers en un seul, que John peut traiter. Le préfixe du hash indique l'algorithme. On trouve `$1$` pour md5crypt, `$5$` pour sha256crypt et `$6$` pour sha512crypt.

```bash
# Réunir passwd et shadow
unshadow local_passwd local_shadow > unshadowed.txt

# Lancer l'attaque par dictionnaire
john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt
```

## Le mode Single Crack

Ce mode n'a pas besoin de dictionnaire externe. John part des informations déjà présentes, comme le nom d'utilisateur, et leur applique des règles de mangling (casse, suffixes numériques, répétitions). Il est efficace contre les mots de passe dérivés du nom d'utilisateur.

Le fichier doit être au format `utilisateur:hash`.

```bash
john --single --format=<format> <fichier>
```

## Les règles personnalisées

Les utilisateurs placent souvent leurs majuscules, chiffres et symboles à des positions prévisibles. Les règles personnalisées exploitent cette régularité, en générant des variantes à partir d'une liste de mots. On les définit dans le fichier `john.conf`.

| Modificateur | Effet |
| --- | --- |
| `c` | Met une majuscule à la position indiquée |
| `Az"..."` | Ajoute les caractères à la fin du mot |
| `A0"..."` | Ajoute les caractères au début du mot |

| Jeu de caractères | Signification |
| --- | --- |
| `[0-9]` | Les chiffres de 0 à 9 |
| `[A-Z]` et `[a-z]` | Les lettres majuscules et minuscules |
| `[!£$%@]` | Les symboles indiqués |

Cette règle part de `motdepasse` pour tester `Motdepasse` suivi d'un chiffre et d'un symbole, comme `Motdepasse1!`.

```text
[List.Rules:ReglePerso]
cAz"[0-9][!£$%@]"
```

On applique ensuite la règle avec `--rules=ReglePerso`. John fournit aussi une large liste de règles prêtes à l'emploi.

## Fichiers protégés et clés SSH

John ne sait traiter que des hashs. La suite Jumbo fournit donc des outils qui extraient un hash d'un fichier protégé ou d'une clé privée. Le principe est le même que pour `unshadow`. On prépare le hash, puis on lance John dessus.

| Outil | Prépare le hash d'un… |
| --- | --- |
| `zip2john` | Fichier ZIP protégé |
| `rar2john` | Archive RAR protégée |
| `ssh2john` | Clé privée SSH protégée par une phrase de passe |

```bash
# Exemple avec un ZIP
zip2john archive.zip > zip_hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt zip_hash.txt
```

`ssh2john` s'emploie de la même façon. Si l'outil n'est pas installé, on lance le script directement, par exemple `python3 /opt/john/ssh2john.py cle_privee > ssh_hash.txt`.

## À retenir

- John retrouve les mots de passe faibles en testant des candidats et en comparant leurs hashs.
- L'attaque par dictionnaire s'appuie sur une wordlist comme `rockyou.txt`.
- NTLM n'est pas salé, `unshadow` prépare les hashs de `/etc/shadow`.
- Le mode Single Crack et les règles personnalisées exploitent les habitudes des utilisateurs.
- `zip2john`, `rar2john` et `ssh2john` préparent le hash d'un fichier protégé ou d'une clé SSH.
