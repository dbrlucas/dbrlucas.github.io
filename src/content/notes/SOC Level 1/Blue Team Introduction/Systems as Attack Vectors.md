---
titre: "Systems as Attack Vectors"
description: "Apprendre comment les attaquants exploitent les systèmes vulnérables et mal configurés, et comment les protéger."
resume: "Un système vulnérable ou mal configuré suffit à contourner des utilisateurs bien formés. Cette note explique pourquoi les attaquants visent les systèmes, par quelles attaques ils passent, puis comment répondre aux vulnérabilités et aux erreurs de configuration."
date: "11.11.2025"
plateforme: "TryHackMe"
parcours: "SOC Level 1"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/systemsattackvectors"
---

## Définitions

**Système** : ensemble de composants matériels (serveurs, postes de travail, équipements réseau) et logiciels (systèmes d'exploitation, applications, services) qui font fonctionner une organisation.

**Surface d'attaque (attack surface)** : ensemble des points d'entrée par lesquels un attaquant peut tenter de compromettre un système (services, ports, interfaces, comptes).

**Valeur d'attaque** : intérêt d'un système pour un attaquant. Un serveur central vaut souvent bien plus qu'un poste utilisateur isolé.

**Vulnérabilité** : faiblesse d'un logiciel, d'un système ou d'une configuration. Un attaquant peut l'exploiter pour obtenir un accès non autorisé ou provoquer un dysfonctionnement.

**Zero-day** : vulnérabilité encore inconnue du public et de l'éditeur au moment où elle est exploitée.

**CVE (Common Vulnerabilities and Exposures)** : identifiant attribué à une vulnérabilité publique, pour la cataloguer et faciliter son suivi.

**Correctif (patch)** : mise à jour publiée par l'éditeur pour corriger une vulnérabilité.

**Mauvaise configuration (misconfiguration)** : erreur dans le paramétrage d'un système, qui crée une faille exploitable.

**Botnet** : réseau d'appareils infectés et contrôlés à distance par un attaquant, souvent utilisé pour des attaques massives.

## Pourquoi les systèmes sont visés

Les systèmes sont au cœur de toute infrastructure numérique. Les attaquants les ciblent parce qu'ils renferment des ressources précieuses comme des données sensibles, des accès au réseau ou le contrôle d'autres machines. Sécuriser les systèmes compte donc autant que sensibiliser les personnes.

Tous les systèmes n'ont pas la même valeur. Compromettre un système central comme un serveur de messagerie ou un serveur de domaine, donne un accès bien plus large qu'un simple compte utilisateur. Il permet aussi de pivoter vers d'autres machines. Les attaquants cherchent donc les cibles qui offrent le plus de levier.

| Système compromis | Valeur pour l'attaquant |
| --- | --- |
| Ordinateur portable personnel d'un élève | Voler un profil de jeu ou ajouter la machine à un botnet |
| Ordinateur portable de l'administrateur informatique d'une banque | Accéder aux systèmes bancaires internes |
| Serveur de messagerie d'un cabinet d'avocats | Voler les boîtes aux lettres des clients, puis les faire chanter |
| Serveur au cœur d'un réseau industriel | Chiffrer ou saboter les opérations industrielles |
| Panneau d'administration d'un site gouvernemental | Défigurer le site, diffuser de la désinformation ou faire de l'activisme |

Pour le SOC, connaître la valeur relative des systèmes aide à orienter la détection et la réponse. Les systèmes à haute valeur sont surveillés, durcis et corrigés en priorité. Les contrôles habituels sont la gestion des correctifs, la segmentation réseau, le MFA, la surveillance par EDR\SIEM et des sauvegardes sécurisées.

## Les attaques contre les systèmes

### Attaques passant par l'utilisateur

L'utilisateur peut déclencher une attaque sans le vouloir. Le facteur humain reste souvent le point d'entrée initial.

- **Clés USB malveillantes** comme la Rubber Ducky qui exécutent des scripts automatiquement.
- **Logiciels compromis**, téléchargés par l'utilisateur.
- **Mots de passe faibles ou réutilisés**. 81 % des violations impliquent des identifiants compromis.

### Vulnérabilités

Tout logiciel peut contenir des failles. En 2024, plus de 40 000 vulnérabilités ont été publiées et plus de 300 ont été activement exploitées dans des attaques majeures.

Les mauvaises pratiques des administrateurs comme les mots de passe faibles ou les accès non restreints, augmentent le risque. Les anciens systèmes encore exposés sur Internet comme Windows XP ou Windows Server 2008, en sont un bon exemple.

### Attaques de la chaîne d'approvisionnement

Les applications dépendent de bibliothèques tierces et de mises à jour. Si l'un de ces composants est compromis, le malware se propage à tous ses utilisateurs par des mises à jour légitimes. SolarWinds, 3CX et Lottie Player en sont des exemples connus.

Ces attaques sont difficiles à contrer. La défense passe par la surveillance des dépendances, le contrôle des mises à jour, l'audit de sécurité des fournisseurs et un plan de réponse aux incidents. Le SOC continue donc de surveiller les systèmes même après une mise à jour légitime. En cas d'incident, il isole, analyse, corrige et communique avec le fournisseur.

## Vulnérabilités et zero-days

Une vulnérabilité peut exister pendant des années avant d'être découverte. Shellshock est restée plus de vingt ans dans Bash avant d'être révélée en 2014.

Les zero-days sont les plus dangereuses car aucune protection standard n'existe au moment de l'attaque. C'est alors au SOC de détecter l'exploitation avant qu'un correctif ne soit disponible.

Une fois publique, une vulnérabilité reçoit un identifiant CVE. Les défenseurs doivent alors appliquer rapidement les correctifs, surveiller les signes d'exploitation et déployer des mesures temporaires si nécessaire.

| Mesure temporaire | Principe |
| --- | --- |
| Restriction d'accès | Limiter l'accès au système aux adresses IP de confiance |
| Contournement de l'éditeur | Appliquer les mesures provisoires recommandées par le fournisseur |
| Blocage des attaques connues | Filtrer les schémas d'attaque avec un IPS ou un WAF (Web Application Firewall) |

Parmi les vulnérabilités critiques connues figurent EternalBlue (2017), PrintNightmare (2021) et Follina (2022).

## Mauvaises configurations

Une erreur de configuration peut être exploitée avant même qu'un analyste ne la remarque. Une base de données critique, protégée par un mot de passe faible et exposée sur Internet, est compromise très vite.

| Cas réel | Conséquence |
| --- | --- |
| Mot de passe "123456" chez McDonald's | 64 millions de candidatures exposées |
| Environnement cloud AWS mal configuré | Données de 106 millions de clients d'une banque exposées |
| Objets connectés mal configurés comme des réfrigérateurs | Appareils enrôlés dans des botnets |

Trois pratiques permettent de trouver ces erreurs avant les attaquants.

| Pratique | Principe |
| --- | --- |
| Test d'intrusion | Des hackers éthiques recherchent les failles |
| Analyse de vulnérabilités | Des outils lancés régulièrement repèrent les mots de passe faibles et les logiciels obsolètes |
| Audit de configuration | On vérifie que les systèmes respectent les standards de sécurité |

## À retenir

- Un système vulnérable ou mal configuré annule les efforts de sensibilisation des utilisateurs.
- La valeur d'un système pour un attaquant guide les priorités de surveillance du SOC.
- Les attaques passent par l'utilisateur, par les vulnérabilités ou par la chaîne d'approvisionnement.
- Face à une vulnérabilité, on corrige vite, on surveille l'exploitation et on applique des mesures temporaires.
- L'analyste SOC ne configure pas les systèmes. Connaître ces attaques l'aide pourtant à travailler avec l'équipe informatique et partager l'information renforce la sécurité de toute l'entreprise.
