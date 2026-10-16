---
titre: "CyberChef: The Basics"
description: "Une introduction à CyberChef, le couteau suisse des professionnels de la cybersécurité."
resume: "CyberChef transforme des données dans le navigateur, en enchaînant des opérations appelées recettes. Cette note présente son interface, une méthode de travail en quatre étapes et les opérations les plus utiles pour décoder, convertir et extraire des données."
date: "28.10.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/cyberchefbasics"
---

## Définitions

**CyberChef** : application web développée par le GCHQ, le service de renseignement électronique britannique. Elle manipule, analyse et transforme des données dans le navigateur.

**Opération** : transformation unique proposée par CyberChef, comme *From Base64*, *To Hex* ou *XOR*.

**Recette (recipe)** : suite ordonnée d'opérations appliquées aux données d'entrée.

**Bake** : action qui exécute la recette et produit le résultat.

**Magic** : fonction qui tente d'identifier automatiquement les opérations à appliquer, quand on ne connaît pas le format d'une donnée.

**Encodage en base** : méthode qui transforme des données binaires en texte lisible, à l'aide d'un alphabet de caractères ASCII.

**Horodatage UNIX** : nombre de secondes écoulées depuis le 1er janvier 1970 à 00:00:00 UTC.

## Un couteau suisse pour les données

CyberChef réunit des centaines d'opérations. Il sait encoder, convertir, hacher, chiffrer, déchiffrer et extraire des données. Quelques usages courants en donnent une idée.

- Décoder une charge en Base64 trouvée dans des journaux.
- Convertir un extrait hexadécimal en texte lisible.
- Appliquer un XOR à une chaîne, pour défaire une obfuscation simple.
- Extraire des URL ou des adresses e-mail d'un texte.
- Préparer des données pour un autre outil.

Tout le traitement se fait dans le navigateur. Aucune donnée n'est envoyée à un serveur, ce qui réduit les risques quand on manipule des informations sensibles.

## Accéder à l'outil

| Mode | Atouts | Usage |
| --- | --- | --- |
| En ligne | Aucune installation, on ouvre l'instance publique dans un navigateur | Tests rapides sur des données non sensibles |
| Copie locale | Fonctionne sans connexion, et tout reste sur la machine | Données sensibles, ateliers, environnements isolés |

Pour une copie locale, on télécharge l'archive de la dernière version stable depuis le dépôt officiel. On la décompresse, puis on ouvre le fichier `index.html`. Il est préférable de servir le dossier avec un serveur web local.

> [!warning] Données sensibles
> Même si le traitement est local, il vaut mieux ne jamais coller un mot de passe ou une clé privée dans une instance publique. Une copie locale écarte tout risque d'envoi accidentel.

## L'interface

| Zone | Rôle | Fonctions utiles |
| --- | --- | --- |
| Opérations | Liste toutes les opérations, classées par catégories | Barre de recherche. Une description s'affiche au survol |
| Recette | Reçoit les opérations, que l'on glisse, ordonne et configure | Enregistrer, charger ou effacer une recette. Bouton *BAKE!* et option *Auto Bake* |
| Entrée | Reçoit les données à traiter (texte, fichiers, dossiers) | Ouvrir un fichier ou un dossier, ajouter un onglet, tout effacer |
| Sortie | Affiche le résultat | Enregistrer dans un fichier, copier, remplacer l'entrée par la sortie |

Avec *Auto Bake*, la recette s'exécute à chaque modification, sans cliquer sur *BAKE!*.

## Une méthode en quatre étapes

1. **Définir un objectif clair.** On se demande ce que l'on veut obtenir, par exemple savoir si une chaîne d'apparence aléatoire cache un message lisible.
2. **Importer les données.** On les colle ou on les charge dans la zone d'entrée. Un second onglet permet de tester plusieurs jeux de données.
3. **Choisir et ordonner les opérations.** On construit la recette et on règle les paramètres de chaque opération (clé, encodage, mode).
4. **Vérifier la sortie et recommencer.** Si le résultat n'est pas lisible, on change l'ordre ou les opérations, jusqu'à épuiser les hypothèses raisonnables.

Quelques conseils complètent cette méthode.

- L'ordre des opérations est crucial, car elles s'appliquent l'une après l'autre.
- On commence par les opérations sans clé, comme *From Base64*, *From Hex* ou *ROT13*, avant celles qui en demandent une, comme AES.
- Le contexte réduit les hypothèses. L'origine du texte donne souvent un indice sur l'encodage.
- *Magic* fournit un point de départ, mais ses propositions se vérifient toujours à la main.

## Les opérations utiles

### Extractors

Ces opérations extraient automatiquement des données d'un type précis dans un texte brut.

| Opération | Ce qu'elle extrait |
| --- | --- |
| *Extract IP addresses* | Les adresses IPv4 et IPv6 valides |
| *Extract email addresses* | Les adresses e-mail |
| *Extract URLs* | Les URL qui commencent par un protocole (`http://`, `https://`, `ftp://`) |

### Date/Time

| Opération | Effet | Exemple |
| --- | --- | --- |
| *From UNIX Timestamp* | Convertit un horodatage UNIX en date lisible | `1700000000` donne le 14 novembre 2023 à 22:13:20 UTC |
| *To UNIX Timestamp* | Convertit une date en horodatage UNIX | L'opération inverse |

### Data Format

| Opération | Effet | Exemple |
| --- | --- | --- |
| *From Base64* | Décode une chaîne Base64 | `SGVsbG8gd29ybGQ=` donne `Hello world` |
| *URL Decode* | Remplace les codes en pourcentage par leur caractère | `https%3A%2F%2Fexample%2Ecom` donne `https://example.com` |
| *From Base85* | Décode une chaîne Base85 | `BOu!rD]j7BEbo7` donne `hello world` |

Le Base64 utilise un alphabet de 64 symboles, formé des lettres majuscules et minuscules, des chiffres, de `+` et de `/`. *From Base58* et *To Base62* fonctionnent sur le même principe. Le Base58 écarte les caractères ambigus (`l`, `I`, `0`, `O`), et le Base62 donne un résultat compact.

### Autres opérations courantes

| Opération | Effet |
| --- | --- |
| *From Hex* et *To Hex* | Convertit entre hexadécimal et texte |
| *ROT13* | Décale chaque lettre de 13 positions dans l'alphabet |
| *XOR* | Applique un XOR bit à bit avec une clé |
| *AES Decrypt* et *AES Encrypt* | Chiffrement symétrique, avec une clé, un vecteur d'initialisation et un mode |
| *Regular expression* | Recherche ou remplace avec une expression régulière |
| *From Morse Code* | Traduit du code Morse en texte |

## À retenir

- CyberChef enchaîne des opérations dans une recette, exécutée par *Bake*.
- Le traitement se fait dans le navigateur. Une copie locale reste préférable pour les données sensibles.
- La méthode tient en quatre étapes, l'objectif, l'import, la recette et la vérification.
- L'ordre des opérations change le résultat.
- *Magic* aide à démarrer face à un format inconnu, mais ne remplace pas la vérification.
