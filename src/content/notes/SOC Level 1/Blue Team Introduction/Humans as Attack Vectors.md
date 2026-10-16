---
titre: "Humans as Attack Vectors"
description: "Comprendre pourquoi et comment les personnes sont ciblées par les cyberattaques, et comment le SOC aide à les défendre."
resume: "Tromper une personne coûte souvent moins cher qu'exploiter une faille technique. Cette note explique pourquoi les attaquants ciblent les humains, par quelles attaques ils passent et comment le SOC protège les utilisateurs."
date: "09.11.2025"
plateforme: "TryHackMe"
parcours: "SOC Level 1"
ordre: 3
difficulte: "Easy"
lien: "https://tryhackme.com/room/humansattackvectors"
---

## Définitions

**Vecteur d'attaque (attack vector)** : chemin ou méthode qu'un attaquant utilise pour pénétrer un système ou compromettre une cible.

**Ingénierie sociale (social engineering)** : ensemble de techniques qui manipulent des personnes pour leur faire révéler des informations sensibles ou accomplir une action compromettante.

**Gardien (gatekeeper)** : personne qui, par son rôle, peut accorder ou faciliter un accès. C'est le cas d'un administrateur, d'un assistant RH ou d'un agent d'accueil.

**Pivot** : déplacement d'un attaquant depuis son accès initial vers d'autres systèmes ou ressources internes.

**Atténuation (mitigation)** : mesures prises pour réduire la probabilité ou l'impact d'une attaque.

## Pourquoi cibler les humains

Le SOC ne protège pas l'entreprise seulement contre les attaques techniques. Il la protège aussi, et souvent surtout, contre les attaques qui visent les personnes considérées comme le maillon le plus faible.

Volontairement ou non, les humains ouvrent la porte aux attaquants en partageant un accès, en cliquant sur un lien ou en branchant une clé USB trouvée. Les attaquants y trouvent plusieurs avantages.

| Avantage | Explication |
| --- | --- |
| Faible coût | Tromper une personne coûte généralement bien moins cher qu'exploiter une vulnérabilité logicielle |
| Large surface d'attaque | Chaque employé est une porte d'entrée possible (identifiants, accès physique, informations) |
| Accès direct | Une personne peut donner accès à une boîte mail, un VPN, des systèmes internes ou des bases de données |
| Échelle | Certains attaquants automatisent la compromission d'un grand nombre de comptes pour les revendre ou les réutiliser |
| Personnalisation | Un message crédible qui est construit sur des informations publiques, augmente fortement les chances de réussite |

### Exemples d'attaques et objectifs

| Attaque | Objectif de l'attaquant |
| --- | --- |
| Compromettre le compte Google du responsable RH | Voler et vendre la base de données des employés (données personnelles, salaires, e-mails) |
| Pousser une personne fortunée à exécuter un logiciel malveillant | Détourner une session bancaire ou voler des fonds |
| Compromettre le compte VPN de l'administrateur informatique | Pivoter vers le réseau interne et atteindre les systèmes critiques |
| Amener un fonctionnaire à révéler des secrets | Préparer des attaques ciblées avec ces informations |

Les conséquences vont de l'exfiltration massive de données à la fraude financière, en passant par l'installation d'une porte dérobée, l'élévation de privilèges ou le sabotage.

## Les attaques contre les personnes

Ces attaques reposent sur la manipulation psychologique, pas sur la technique. Elles exploitent la confiance et les émotions (peur, urgence, curiosité). L'attaquant cherche à obtenir la coopération de sa victime, souvent sans qu'elle s'en rende compte.

### Phishing

Un message frauduleux, souvent un e-mail, pousse la victime à livrer ses identifiants ou à installer un logiciel malveillant. Dans l'exemple classique, un e-mail annonce que le compte a été compromis et invite à cliquer sur un lien. Ce lien mène à un faux site de connexion qui capture les identifiants.

D'autres variantes passent par des pièces jointes piégées (ZIP, PDF, DOC). Le **spear phishing** est la version ciblée où le message est conçu pour tromper une personne précise. Environ 3,4 milliards d'e-mails de phishing sont envoyés chaque jour.

### Téléchargement de logiciels malveillants

Les attaquants créent de faux sites ou de fausses applications, par exemple une copie du site de Firefox, pour faire installer un malware. Ils utilisent plusieurs techniques pour y attirer leurs victimes.

| Technique | Principe |
| --- | --- |
| Faux CAPTCHA | Incite à cliquer sur un lien infecté |
| QR code piégé | Redirige vers un malware |
| Empoisonnement SEO (SEO poisoning) | Manipule les résultats de recherche pour placer les sites malveillants en tête |

### Deepfakes

Un deepfake est une vidéo, un appel audio ou une image falsifiés par intelligence artificielle pour imiter une personne réelle. Dans un cas réel, un employé a transféré 25 millions de dollars après un appel vidéo imitant son patron.

### Usurpation d'identité

L'attaquant se fait passer pour un membre du service informatique ou pour un responsable de l'entreprise. Il invoque une urgence technique pour obtenir un accès ou faire exécuter une action. Cette méthode est très utilisée dans les campagnes de ransomware récentes.

### Autres formes d'ingénierie sociale

- **Clés USB abandonnées (USB drop)**, infectées puis laissées dans des lieux publics.
- **Intrusions physiques** dans les bâtiments par la ruse comme le tailgating.
- **Menaces internes**, venant d'employés malveillants ou négligents.
- **Fausses offres d'emploi** destinées à collecter des données personnelles.

## Reconnaître une compromission

Certains signes indiquent qu'une personne a été piégée :

- des connexions VPN à des heures inhabituelles ou depuis de nouveaux emplacements ;
- des envois massifs d'e-mails depuis une boîte interne légitime ;
- un changement soudain des règles de redirection d'e-mails ou des paramètres MFA ;
- l'apparition d'applications inconnues sur un poste après l'ouverture d'une pièce jointe.

## Défendre les personnes

Le SOC ne protège pas seulement les systèmes mais aussi les utilisateurs. Il agit sur deux axes. L'**atténuation** réduit les risques par la prévention. La **détection** repère rapidement les attaques qui ont échappé aux défenses. Même les meilleures mesures d'atténuation peuvent être contournées, la détection et l'enquête restent donc indispensables.

### Les mesures d'atténuation

| Mesure | Effet |
| --- | --- |
| Solution anti-phishing | Bloque les e-mails frauduleux avant qu'ils n'arrivent dans les boîtes de réception. Le SOC a aussi moins d'alertes à traiter |
| Antivirus et EDR | Protègent les terminaux contre les malwares et surveillent l'activité suspecte en temps réel |
| "Faire confiance mais vérifier" (trust but verify) | Les employés vérifient toute demande inhabituelle, par exemple en rappelant leur supérieur avant de valider un paiement |
| Formation de sensibilisation | Apprend à reconnaître le phishing, la manipulation et l'usurpation. Les simulations de phishing entretiennent cette vigilance |
| MFA obligatoire | Réduit la valeur des identifiants volés |
| Moindre privilège | Limite les accès au strict nécessaire |
| Vérification par un autre canal | Une demande sensible comme un virement, est confirmée par un numéro de téléphone déjà connu |
| Séparation des fonctions | Une même personne ne peut pas à la fois lancer et valider une opération critique |
| Contrôles techniques | Filtrage des e-mails, bac à sable pour les pièces jointes, détection d'anomalies (UEBA), restriction des périphériques USB |

### Le rôle de l'analyste

L'analyste SOC reste attentif aux comportements suspects. Il repère vite les signes d'ingénierie sociale dans les alertes et les tickets. Il travaille aussi avec l'équipe informatique et la direction pour mettre en place et améliorer les protections. Ses propositions d'atténuation renforcent durablement la sécurité et allègent sa propre charge de travail. Enfin, il contribue à la sensibilisation des employés.

L'objectif n'est pas seulement de réagir aux incidents. Il s'agit de rendre les utilisateurs plus résilients en combinant prévention, détection et formation continue.

## Sources de veille

Suivre des sources fiables aide à anticiper les nouvelles formes d'attaque et à adapter les défenses.

| Source | Contenu |
| --- | --- |
| Krebs on Security | Blog de Brian Krebs sur les cyberattaques réelles, les violations de données et le cybercrime |
| The Hacker News | Actualité des menaces, des vulnérabilités et des technologies de cybersécurité |
| BleepingComputer | Site d'information et d'entraide sur les menaces, les ransomwares et l'actualité de la cybersécurité |

## À retenir

- Les humains restent la cible principale des attaquants car c'est souvent la faille la plus facile à exploiter.
- L'ingénierie sociale repose sur la manipulation psychologique, pas sur une faille technique.
- Le SOC agit sur deux axes qui sont l'atténuation et la détection.
- L'analyste détecte les attaques réussies et aide à prévenir les suivantes.
- La formation continue et la veille sont indispensables pour rester efficace.
