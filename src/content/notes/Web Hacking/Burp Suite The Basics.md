---
titre: "Burp Suite: The Basics"
description: "Une introduction à l'utilisation de Burp Suite pour le test d'intrusion d'applications web."
resume: "Burp Suite s'intercale entre le navigateur et le serveur pour observer et modifier le trafic web. Cette note présente l'outil et ses éditions, le proxy et sa configuration, la gestion du périmètre, l'interception du HTTPS, puis ce que l'interception révèle sur les filtres côté client."
date: "03.09.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 4
difficulte: "Easy"
lien: "https://tryhackme.com/room/burpsuitebasics"
---

## Définitions

**Burp Suite** : outil écrit en Java pour tester la sécurité des applications web. Il intercepte, observe et modifie le trafic HTTP et HTTPS entre le navigateur et le serveur.

**Proxy** : fonction qui s'intercale dans les échanges, pour voir et modifier les requêtes et les réponses.

**Scope (périmètre)** : ensemble des domaines, adresses IP et chemins sur lesquels Burp concentre son analyse.

**FoxyProxy** : extension de navigateur qui bascule facilement entre plusieurs configurations de proxy.

**CA (autorité de certification)** : entité qui émet et valide les certificats permettant d'authentifier un site.

**XSS (Cross-Site Scripting)** : vulnérabilité qui injecte du code, souvent du JavaScript, dans une page, où il s'exécute dans le navigateur de la victime.

## À quoi sert Burp Suite

Burp Suite est l'outil de référence pour tester manuellement la sécurité d'une application web. Son principe est d'intercepter les requêtes et les réponses HTTP et HTTPS, pour les examiner et les modifier.

Il existe en trois éditions.

| Édition | Public | Particularités |
| --- | --- | --- |
| Community | Apprentissage et tests de base | Gratuite, avec les outils essentiels. C'est celle de la room |
| Professional | Pentesters | Payante, avec scanner, fuzzer complet, sauvegarde de projet et Burp Collaborator |
| Enterprise | Entreprise | Scan continu et automatisé, proche d'un outil comme Nessus mais orienté web |

L'édition Community est préinstallée sur Kali Linux et sur l'AttackBox de TryHackMe. Elle réunit plusieurs modules.

| Module | Rôle |
| --- | --- |
| Proxy | Intercepte et modifie le trafic. C'est le module central |
| Repeater | Renvoie une même requête plusieurs fois, en la modifiant à chaque essai |
| Intruder | Automatise l'envoi de requêtes. Sa vitesse est bridée dans l'édition Community |
| Decoder | Encode et décode des données |
| Comparer | Compare deux jeux de données, au mot ou à l'octet près |
| Sequencer | Évalue le caractère aléatoire de jetons, comme un cookie de session |

Le BApp Store ajoute des extensions, développées en Java, Python ou Ruby.

## Le proxy

Le proxy est le cœur de Burp. Même quand l'interception est désactivée, il enregistre tout le trafic dans son historique, consultable plus tard. Son bouton *Intercept is on/off* active ou coupe l'interception. Quand elle est active, chaque requête est mise en attente jusqu'à une action.

| Action | Effet |
| --- | --- |
| *Forward* | Transmet la requête au serveur |
| *Drop* | Abandonne la requête |
| *Edit* | Modifie la requête avant de la transmettre |
| *Send to…* | Envoie la requête vers un autre module, comme Repeater |

La fonction *Match and Replace* applique des changements automatiques, par exemple remplacer l'en-tête *User-Agent* ou injecter un cookie, à l'aide d'expressions régulières.

> [!tip] Ne pas laisser l'interception active en permanence
> Tant qu'elle est active, toutes les requêtes du navigateur sont bloquées. On la coupe dès qu'on n'analyse pas, et on ferme les onglets inutiles pour éviter les requêtes parasites.

### Rediriger le navigateur vers Burp

Deux façons d'envoyer le trafic du navigateur vers le proxy, qui écoute par défaut sur `127.0.0.1:8080`.

- **Le navigateur intégré.** Dans l'onglet *Proxy*, *Open Browser* ouvre un navigateur Chromium déjà configuré. C'est le plus simple.
- **FoxyProxy.** Sur un navigateur externe, on crée dans FoxyProxy une configuration qui pointe vers `127.0.0.1` sur le port `8080`, puis on l'active.

## Cartographier et cadrer

En naviguant sur la cible à travers le proxy, chaque page visitée s'ajoute à la *Site map*, une vue en arbre des pages et des points d'entrée. L'onglet *Issue definitions* liste de son côté les vulnérabilités connues, utile pour documenter une faille trouvée à la main.

Le périmètre (*scope*) est important, pour deux raisons. Il évite de noyer l'analyse sous le trafic externe, comme les polices ou les CDN. Il évite surtout d'intercepter par erreur du trafic hors du cadre autorisé.

1. Dans l'onglet *Target*, clic droit sur la cible, puis *Add to Scope*.
2. Dans *Scope settings*, on inclut ou exclut des domaines et des chemins.
3. Dans les réglages du proxy, l'option *And URL is in target scope* limite l'interception au périmètre. Sans elle, le proxy continue de tout intercepter.

## Intercepter le HTTPS

Sur un site HTTPS, le navigateur ne reconnaît pas l'autorité de Burp et affiche une erreur de certificat. Il faut donc ajouter le certificat de Burp (la PortSwigger CA) au navigateur.

1. Le proxy actif, aller sur `http://burp/cert` et télécharger le fichier `cacert.der`.
2. Dans les certificats du navigateur, importer ce fichier.
3. Cocher la confiance pour identifier les sites web.

Ce certificat permet à Burp de déchiffrer le trafic HTTPS. On ne l'installe donc que sur un navigateur de test, jamais sur un poste personnel ou de production.

## Ce que l'interception révèle

L'interception montre bien pourquoi un filtre appliqué côté client ne protège rien. La requête peut être modifiée après le navigateur, donc après le filtre, avant d'atteindre le serveur.

La room le démontre sur un champ de formulaire. On intercepte l'envoi, on remplace la valeur par une charge XSS, au besoin encodée en URL avec `Ctrl + U` pour passer un filtre, puis on transmet la requête.

```text
Valeur injectée : <script>alert(1)</script>
Encodée en URL  : %3Cscript%3Ealert(1)%3C%2Fscript%3E
```

La leçon est défensive. Puisqu'un filtre côté client se contourne, la protection contre le XSS se place côté serveur. Elle repose sur la validation des entrées, l'échappement des caractères spéciaux et une Content Security Policy (CSP).

## À retenir

- Burp Suite s'intercale entre le navigateur et le serveur pour voir et modifier le trafic.
- Le proxy est le module central. Il enregistre tout, même interception coupée.
- Le périmètre évite le bruit et garde les tests dans le cadre autorisé.
- Intercepter le HTTPS demande d'installer le certificat de Burp, à réserver au test.
- Un filtre côté client se contourne. La vraie protection contre le XSS est côté serveur.
