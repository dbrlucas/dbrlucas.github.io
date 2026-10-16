---
titre: "Common Attacks"
description: "Voir, à travers des exercices pratiques, comment se déroulent les attaques courantes, et améliorer son hygiène numérique pour être plus en sécurité en ligne."
resume: "La plupart des attaques visent d'abord les personnes. Cette note présente l'ingénierie sociale, le phishing, les malwares et les ransomwares, puis les bonnes pratiques qui protègent, des mots de passe aux sauvegardes en passant par les mises à jour."
date: "17.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/commonattacks"
---

## Définitions

**Ingénierie sociale** : toute attaque qui vise une personne plutôt qu'un ordinateur, en la manipulant pour obtenir des informations ou un accès. On parle aussi de *human hacking*.

**Phishing** : forme d'ingénierie sociale où un message en ligne (e-mail, SMS) pousse la victime à livrer des informations sensibles ou à installer un malware.

**Ransomware** : malware qui chiffre les données d'un système et réclame une rançon pour les déchiffrer.

**C2 (Command and Control)** : serveur distant avec lequel un malware communique, et par lequel l'attaquant contrôle le système infecté.

**Credential stuffing (bourrage d'identifiants)** : réutilisation d'identifiants volés sur un service pour tenter de se connecter à d'autres.

**MFA (authentification multifacteur)** : connexion qui exige plus d'un facteur. Les facteurs possibles sont ce que l'on sait (un mot de passe), ce que l'on possède (un téléphone, une clé matérielle) et ce que l'on est (une empreinte, l'iris).

**TOTP (Time-based One-Time Password)** : code à usage unique, valable peu de temps, généré par une application comme Google Authenticator ou Authy.

**Fin de vie (EOL, End Of Life)** : moment où un logiciel n'est plus maintenu et ne reçoit plus de correctifs.

## L'ingénierie sociale

L'ingénierie sociale exploite la psychologie humaine plutôt que des failles techniques. Elle se déroule souvent par étapes, chaque information obtenue servant à en obtenir une autre. Un détail trouvé sur un réseau social peut par exemple convaincre un opérateur téléphonique de transférer un numéro, qui donne ensuite accès à un compte bancaire.

| Technique | Principe |
| --- | --- |
| Prétexte (pretexting) | L'attaquant invente une histoire ou une identité pour obtenir une information ou une action |
| Appât (baiting) | Des supports piégés, comme des clés USB, sont laissés dans des lieux publics |
| Quid pro quo | Un service ou un avantage est promis en échange d'informations |
| Abus de confiance | L'attaquant se fait passer pour une autorité, comme le support technique |

Stuxnet illustre l'efficacité de l'appât. Ce ver, attribué aux États-Unis et à Israël, visait le programme nucléaire iranien, dont le réseau était isolé d'Internet. Il y serait entré par des clés USB piégées. Il a détruit de nombreuses centrifugeuses et ralenti fortement le programme.

Quelques mesures protègent de l'ingénierie sociale.

- Activer l'authentification multifacteur, et choisir des réponses aux questions de sécurité difficiles à deviner, voire fausses mais mémorisées.
- Ne jamais brancher un support inconnu (clé USB, CD, câble) sur un appareil sensible.
- Vérifier l'identité d'un interlocuteur par un canal de confiance, comme un numéro ou un site officiel.
- Se rappeler qu'aucun service légitime ne demande un mot de passe complet.

## Le phishing

| Type | Cible | Qualité du message |
| --- | --- | --- |
| Phishing classique | Un grand nombre de personnes | Peu personnalisé, souvent mal conçu |
| Spear phishing | Une personne ou un petit groupe | Ciblé et crédible |
| Whaling | Un dirigeant ou une personne de grande valeur | Très soigné et difficile à repérer |

Le phishing passe aussi par d'autres canaux, le **smishing** par SMS et le **vishing** par appel vocal ou vidéo.

Une campagne suit souvent le même déroulé.

1. L'attaquant envoie des e-mails malveillants.
2. Certaines victimes cliquent sur le lien.
3. Elles saisissent leurs identifiants sur une fausse page.
4. La page enregistre ces identifiants ou les transmet à l'attaquant.
5. L'attaquant se connecte au compte et s'en sert, par exemple pour des achats frauduleux.

Les attaquants clonent des pages légitimes, achètent des domaines très proches de l'original (`exemp1e.com` au lieu de `example.com`) et masquent la vraie adresse des liens.

| Signes d'alerte | Bons réflexes |
| --- | --- |
| Fautes d'orthographe et de grammaire | Supprimer les e-mails suspects sans les ouvrir |
| Message impersonnel, comme « Cher client » | Ne jamais ouvrir une pièce jointe d'origine douteuse |
| Liens ou domaines suspects | Aller sur le site officiel au lieu de cliquer sur le lien |
| Pièce jointe inattendue | Vérifier le domaine avant de saisir des informations |
| Sentiment d'urgence artificiel | Limiter les informations personnelles publiées en ligne |

En cas de piège, il faut changer immédiatement ses mots de passe, et prévenir le service informatique si cela se produit au travail.

## Les malwares et les ransomwares

Malgré les antivirus, malwares et ransomwares restent une menace majeure. Un ransomware infecte le système, chiffre les fichiers, puis réclame une rançon contre leur déchiffrement. Il exploite souvent des vulnérabilités connues.

Les infections arrivent par les pièces jointes (documents Office avec macros, PDF, scripts, exécutables), par les périphériques USB ou par les vulnérabilités des serveurs.

- Appliquer les mises à jour et les correctifs sans tarder.
- Ne pas ouvrir de liens ou de pièces jointes suspects.
- Éviter les fichiers d'origine inconnue et les clés USB non vérifiées.
- Garder un antivirus actif et à jour.
- Sauvegarder régulièrement les données importantes.

En cas d'infection par un ransomware, on ne paie pas la rançon. On isole l'appareil et on prévient les autorités.

## Les mots de passe

Un bon mot de passe est long et idéalement aléatoire. Une suite aléatoire d'une trentaine de caractères est très sûre, mais impossible à retenir sans gestionnaire. Une phrase de passe, faite de plusieurs mots et de ponctuation, combine longueur et facilité de mémorisation.

Réutiliser un mot de passe sur plusieurs services est dangereux, car une seule fuite expose tous les comptes. Les services doivent stocker les mots de passe hachés avec un algorithme sûr, jamais en clair.

| Type d'attaque | Principe |
| --- | --- |
| Locale | L'attaquant possède les hashs et tente de retrouver les mots de passe par force brute ou par dictionnaire |
| À distance | L'attaquant tente de se connecter au service, par exemple avec des identifiants volés ailleurs |

### MFA et gestionnaires de mots de passe

Il faut activer la MFA partout où elle est proposée. Les codes TOTP d'une application sont plus sûrs que les SMS, qui s'interceptent plus facilement.

Un gestionnaire de mots de passe (1Password, Bitwarden, KeePass, LastPass) garde les mots de passe dans un coffre chiffré. Il génère un mot de passe unique et aléatoire pour chaque compte, et remplit les formulaires. Sa sécurité dépend de la solidité du mot de passe maître.

## Les réseaux publics

Un Wi-Fi public expose à l'interception des données. Un attaquant peut facilement créer un faux réseau et mener une attaque de l'homme du milieu (MITM).

Le cadenas du navigateur indique que la connexion est chiffrée par TLS. Un cadenas barré ou accompagné d'un point d'exclamation signale un problème de certificat. Un VPN chiffre tout le trafic, ce qui rend l'interception inutile. Le mieux reste d'éviter les réseaux publics douteux. Une connexion chiffrée ne garantit pas pour autant que le site lui-même est honnête.

## Les sauvegardes

Les sauvegardes sont la mesure défensive la plus importante pour protéger les données. La **règle 3-2-1** en fixe le minimum.

1. Trois copies des données.
2. Sur deux supports différents, par exemple un disque local et le cloud.
3. Dont une copie hors site.

La fréquence dépend de la sensibilité des données. Une entreprise sensible peut faire deux ou trois sauvegardes complètes par jour, un particulier une ou deux par semaine. Une sauvegarde trop ancienne ne sert plus à grand-chose.

## Les mises à jour

Les mises à jour corrigent des bugs, ajoutent des fonctions et comblent des failles. Les correctifs de sécurité s'appliquent rapidement. Un logiciel en fin de vie doit être remplacé ou isolé. L'antivirus se met à jour souvent, car il détecte les malwares grâce à des signatures.

WannaCry montre le prix d'un retard. Il s'est propagé massivement grâce à la vulnérabilité EternalBlue, alors que le correctif MS17-010 était déjà publié.

## À retenir

- L'ingénierie sociale manipule les personnes. On vérifie l'identité d'un interlocuteur par un canal de confiance.
- Le phishing se repère à l'urgence, aux fautes, aux liens et aux domaines suspects.
- Contre les ransomwares, mises à jour et sauvegardes sont les meilleures défenses. On ne paie pas la rançon.
- Un mot de passe long et unique, un gestionnaire et la MFA protègent les comptes.
- La règle 3-2-1 fixe le minimum pour des sauvegardes fiables.
