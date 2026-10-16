---
titre: "Linux Shells"
description: "Découvrir le scripting et les différents types de shells Linux."
resume: "Le shell est l'interface textuelle de Linux. Cette note compare les principaux shells, puis présente les bases du scripting en Bash, avec les variables, les boucles et les conditions."
date: "08.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/linuxshells"
---

## Définitions

**Shell** : programme qui exécute les commandes système saisies dans une interface en ligne de commande.

**Bash (Bourne Again Shell)** : shell par défaut de la plupart des distributions Linux. C'est une version améliorée du shell Bourne d'origine, `sh`.

**Répertoire personnel** : répertoire où l'on arrive en ouvrant un terminal, souvent `/home/<utilisateur>`.

**Script shell** : fichier qui contient une suite de commandes à exécuter automatiquement.

**Shebang (`#!`)** : première ligne d'un script, qui indique l'interpréteur à utiliser, par exemple `#!/bin/bash`.

## Pourquoi le shell

Le shell consomme moins de ressources que l'interface graphique et donne plus de contrôle. Utiliser l'interface graphique revient à se faire servir au restaurant. Avec le shell, on cuisine soi-même, avec de l'aide. C'est particulièrement utile en cybersécurité.

| Commande | Effet |
| --- | --- |
| `pwd` | Affiche le répertoire courant |
| `cd <répertoire>` | Change de répertoire |
| `ls` | Liste le contenu du répertoire |
| `cat <fichier>` | Affiche un fichier |
| `grep <motif> <fichier>` | Affiche les lignes qui contiennent un motif |

## Les types de shells

Plusieurs shells sont souvent installés, même si Bash reste le plus utilisé. Ils offrent les mêmes bases (scripting, autocomplétion, historique), mais diffèrent par leur ergonomie.

| Shell | Particularités |
| --- | --- |
| Bash | Le plus répandu. Pas de coloration syntaxique native |
| Zsh (Z Shell) | Le plus personnalisable, notamment avec oh-my-zsh. Coloration syntaxique par extension |
| Fish (Friendly Interactive Shell) | Axé sur le confort, avec une autocomplétion avancée et une coloration native. Rarement installé par défaut |
| sh | Le shell d'origine, plus ancien, pour des scripts simples |

| Commande | Effet |
| --- | --- |
| `echo $SHELL` | Affiche le shell en cours |
| `cat /etc/shells` | Liste les shells installés |
| `zsh` | Ouvre une session Zsh, le temps de la session |
| `chsh -s /usr/bin/zsh` | Fait de Zsh le shell par défaut |
| `history` | Affiche l'historique des commandes |

## Écrire un script

Un script automatise les tâches répétitives. On le crée, on le rend exécutable, puis on le lance.

```bash
nano premier_script.sh     # créer le script
chmod +x premier_script.sh # le rendre exécutable
./premier_script.sh        # l'exécuter
```

### Variables et saisie

```bash
#!/bin/bash
# Demande un nom puis l'affiche
echo "Quel est ton nom ?"
read nom
echo "Bienvenue, $nom"
```

`read` attend une saisie et la range dans une variable. Le `#` introduit un commentaire.

### Boucles

```bash
#!/bin/bash
# Affiche les nombres de 1 à 10
for i in {1..10}; do
  echo $i
done
```

### Conditions

```bash
#!/bin/bash
echo "Entre ton nom :"
read nom
if [ "$nom" = "Alice" ]; then
  echo "Accès autorisé."
else
  echo "Accès refusé."
fi
```

On place les variables entre guillemets dans les comparaisons, pour éviter une erreur si la saisie est vide.

### Combiner boucle et conditions

Ce script demande trois informations dans une boucle, ce qui évite de répéter du code. L'accès n'est accordé que si les trois sont correctes, grâce à l'opérateur `&&`.

```bash
#!/bin/bash
for i in {1..3}; do
  if [ "$i" -eq 1 ]; then
    echo "Nom d'utilisateur :"; read utilisateur
  elif [ "$i" -eq 2 ]; then
    echo "Entreprise :"; read entreprise
  else
    echo "Code :"; read code
  fi
done

if [ "$utilisateur" = "alice" ] && [ "$entreprise" = "exemple" ] && [ "$code" = "0000" ]; then
  echo "Authentification réussie."
else
  echo "Authentification refusée."
fi
```

### Chercher un motif dans des journaux

Ce script parcourt tous les fichiers `.log` d'un répertoire et signale ceux qui contiennent un motif.

```bash
#!/bin/bash
repertoire="/var/log"
motif="erreur"

for fichier in "$repertoire"/*.log; do
  if grep -q "$motif" "$fichier"; then
    echo "Motif trouvé dans : $(basename "$fichier")"
  fi
done
```

`grep -q` ne produit aucune sortie. Seul son code de retour indique si le motif existe. `basename` ne garde que le nom du fichier, sans son chemin. Lire certains journaux demande les droits root, obtenus par exemple avec `sudo su`.

## À retenir

- Bash, Zsh et Fish partagent les mêmes bases, mais diffèrent par la personnalisation et le confort.
- `echo $SHELL` affiche le shell courant, `chsh` change le shell par défaut.
- Un script commence par un shebang et doit être rendu exécutable avec `chmod +x`.
- `read`, `for` et `if` suffisent pour écrire des scripts utiles.
- `grep -q` permet de tester la présence d'un motif sans rien afficher.
