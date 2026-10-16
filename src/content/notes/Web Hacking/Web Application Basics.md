---
titre: "Web Application Basics"
description: "Apprendre les bases des applications web, avec HTTP, les URL, les méthodes de requête, les codes de réponse et les en-têtes."
resume: "Une application web repose sur des échanges HTTP entre un navigateur et un serveur. Cette note présente les composants d'une application, la structure d'une URL, puis les requêtes et réponses HTTP, leurs méthodes, leurs codes et leurs en-têtes, dont ceux qui servent la sécurité."
date: "31.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 1
difficulte: "Easy"
lien: "https://tryhackme.com/room/webapplicationbasics"
---

## Définitions

**Application web** : programme accessible depuis un navigateur, qui communique en HTTP ou en HTTPS.

**Front-end** : partie visible de l'application, avec laquelle l'utilisateur interagit. Elle repose sur HTML, CSS et JavaScript.

**Back-end** : partie invisible, qui traite les demandes, stocke les données et porte la logique métier.

**Serveur web** : logiciel, et la machine qui l'héberge, qui délivre le contenu web, comme Apache ou Nginx.

**WAF (Web Application Firewall)** : pare-feu spécialisé, qui protège une application contre les attaques web comme l'injection SQL ou le XSS.

**URL (Uniform Resource Locator)** : adresse unique d'une ressource en ligne, comme une page, une image ou un fichier.

## Les composants d'une application

Une application web ressemble à une planète. La surface visible est le front-end. Sous la surface se trouve le back-end, avec les serveurs, les bases de données et l'infrastructure réseau. Le WAF joue le rôle de l'atmosphère, qui protège l'ensemble des attaques extérieures.

| Couche | Rôle | Exemples |
| --- | --- | --- |
| Front-end | Ce que l'utilisateur voit | HTML pour la structure, CSS pour le style, JavaScript pour l'interactivité |
| Back-end | Ce qui fait fonctionner l'application | Serveur web, base de données, serveurs d'applications |
| Sécurité | Ce qui la protège | WAF |

## La structure d'une URL

```text
https://utilisateur@www.exemple.com:443/blog/article.html?search=chat&lang=fr#contact
```

| Partie | Exemple | Rôle et risque |
| --- | --- | --- |
| Schéma | `https://` | Mode de communication. HTTPS chiffre les échanges avec TLS |
| Utilisateur | `utilisateur@` | Identifiants dans l'URL, rare aujourd'hui car peu sûr |
| Hôte (domaine) | `www.exemple.com` | Nom du site. Attention au typosquatting, ces faux domaines très proches de l'original |
| Port | `:443` | Service visé, 80 pour HTTP et 443 pour HTTPS |
| Chemin | `/blog/article.html` | Ressource demandée |
| Chaîne de requête | `?search=chat&lang=fr` | Paramètres transmis, exposés aux injections s'ils ne sont pas validés |
| Fragment | `#contact` | Section de la page à afficher |

Une URL n'utilise pas forcément toutes ces parties. La chaîne de requête et le fragment sont modifiables par l'utilisateur, et doivent donc être validés côté serveur. HTTPS reste toujours recommandé, car il protège contre l'interception et la modification des données.

## Les messages HTTP

Le client envoie une **requête** pour demander une ressource ou une action. Le serveur renvoie une **réponse** avec le résultat. Les deux suivent la même structure.

| Élément | Requête | Réponse |
| --- | --- | --- |
| Première ligne | Méthode, chemin et version, par exemple `POST /login HTTP/1.1` | Version, code et phrase d'état, par exemple `HTTP/1.1 200 OK` |
| En-têtes | Informations sur la requête (navigateur, cookies, type de données) | Informations sur la réponse et la façon de la traiter |
| Ligne vide | Sépare les en-têtes du corps, et reste indispensable | Même rôle |
| Corps | Données envoyées, comme un formulaire ou du JSON | Contenu renvoyé, comme du HTML, du JSON ou une image |

Comprendre ces messages sert à déboguer une application, mais aussi à repérer des failles, comme une injection ou des en-têtes mal configurés.

## Les requêtes

### Les méthodes

| Méthode | Action | Précaution |
| --- | --- | --- |
| GET | Récupère une ressource | Ne jamais mettre de mot de passe ou de jeton dans l'URL |
| POST | Envoie des données, comme un formulaire de connexion | Valider et filtrer les entrées, contre le XSS et l'injection SQL |
| PUT | Remplace ou met à jour une ressource | Vérifier les autorisations avant toute modification |
| PATCH | Met à jour une partie d'une ressource | Vérifier la cohérence des données envoyées |
| DELETE | Supprime une ressource | Réserver l'action aux utilisateurs autorisés |

Des méthodes moins courantes existent. HEAD fonctionne comme GET, mais ne renvoie que les en-têtes. OPTIONS liste les méthodes acceptées pour une ressource. TRACE renvoie la requête en écho pour le débogage, et elle est souvent désactivée. CONNECT établit un tunnel, notamment pour HTTPS.

Le chemin désigne la ressource, par exemple `/api/users/123`. Mal contrôlé, il expose à des accès non autorisés, comme le path traversal ou l'IDOR. Il faut donc valider le chemin, nettoyer les entrées et éviter de dévoiler des chemins sensibles.

| Version | Année | Apport |
| --- | --- | --- |
| HTTP/0.9 | 1991 | Très basique, avec la seule méthode GET |
| HTTP/1.0 | 1996 | Les en-têtes et plusieurs types de contenu |
| HTTP/1.1 | 1997 | Les connexions persistantes, toujours très utilisé |
| HTTP/2 | 2015 | Le multiplexage et la compression des en-têtes, pour de meilleures performances |
| HTTP/3 | 2022 | Fondé sur QUIC, plus rapide |

### Les en-têtes et le corps

| En-tête | Contenu |
| --- | --- |
| `Host` | Nom du serveur visé |
| `User-Agent` | Navigateur ou client qui envoie la requête |
| `Referer` | Page d'où vient la requête |
| `Cookie` | Données gardées côté client, comme la session ou les préférences |
| `Content-Type` | Format des données envoyées |

Le corps contient les données, surtout pour POST, PUT et PATCH. Il prend plusieurs formats.

| Format | Principe |
| --- | --- |
| `x-www-form-urlencoded` | Paires `clé=valeur` séparées par `&`, avec les caractères spéciaux encodés |
| `multipart/form-data` | Plusieurs blocs de données, dont des fichiers |
| JSON | Données structurées en paires clé et valeur |
| XML | Données structurées par des balises imbriquées |

On n'expose jamais d'informations sensibles dans les en-têtes, et on valide toujours le corps, contre l'injection SQL, le XSS ou l'injection XML.

## Les réponses

### Les codes d'état

| Plage | Signification | Exemple |
| --- | --- | --- |
| 100 à 199 | Information. Le serveur a reçu une partie de la requête | 100 Continue |
| 200 à 299 | Succès | 200 OK |
| 300 à 399 | Redirection vers une autre URL | 301 Moved Permanently |
| 400 à 499 | Erreur côté client | 404 Not Found, 403 Forbidden |
| 500 à 599 | Erreur côté serveur | 500 Internal Server Error |

La ligne d'état indique d'un coup d'œil si une requête a réussi, ce qui aide au diagnostic.

### Les en-têtes et le corps

| En-tête | Rôle |
| --- | --- |
| `Date` | Date et heure de la réponse |
| `Content-Type` | Type du contenu et jeu de caractères, par exemple UTF-8 |
| `Server` | Logiciel du serveur |
| `Set-Cookie` | Envoie des cookies au client, pour maintenir une session |
| `Cache-Control` | Durée de mise en cache, ou interdiction pour les données sensibles |
| `Location` | Nouvelle URL, dans les réponses de redirection |

Le corps contient les données renvoyées. Tout contenu fourni par un utilisateur doit être nettoyé et échappé avant d'y être inclus, pour éviter le XSS.

## Les en-têtes de sécurité

| En-tête | Rôle | Exemple |
| --- | --- | --- |
| `Content-Security-Policy` (CSP) | Liste les sources autorisées pour les scripts, les styles et les médias, ce qui limite le XSS | `default-src 'self'; script-src 'self' https://cdn.exemple.com` |
| `Strict-Transport-Security` (HSTS) | Oblige le navigateur à n'utiliser que HTTPS | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | Interdit au navigateur de deviner le type MIME | `nosniff` |
| `Referrer-Policy` | Contrôle les informations envoyées sur la page d'origine | `strict-origin-when-cross-origin` |

Dans la CSP, `'self'` autorise seulement le site lui-même, `script-src` fixe les sources des scripts et `style-src` celles des styles. Dans HSTS, `max-age` donne la durée d'activation en secondes, `includeSubDomains` étend la règle aux sous-domaines, et `preload` inscrit le site dans les listes intégrées aux navigateurs.

| Directive de `Referrer-Policy` | Effet |
| --- | --- |
| `no-referrer` | N'envoie aucune information |
| `same-origin` | N'envoie l'information qu'aux pages du même site |
| `strict-origin` | N'envoie que l'origine, et seulement si le niveau de sécurité est conservé (de HTTPS vers HTTPS) |
| `strict-origin-when-cross-origin` | Envoie l'URL complète vers le même site, et seulement l'origine vers un autre site |

## À retenir

- Une application web se compose d'un front-end, d'un back-end et de protections comme le WAF.
- Une URL compte jusqu'à sept parties, et la chaîne de requête doit toujours être validée côté serveur.
- Requêtes et réponses partagent la même structure, une première ligne, des en-têtes, une ligne vide et un corps.
- Les codes d'état se lisent par plage, de 1xx à 5xx.
- CSP, HSTS, `X-Content-Type-Options` et `Referrer-Policy` renforcent la sécurité d'un site.
