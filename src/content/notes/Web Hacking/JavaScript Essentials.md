---
titre: "JavaScript Essentials"
description: "Apprendre à utiliser JavaScript pour rendre un site interactif, et comprendre les vulnérabilités associées."
resume: "JavaScript ajoute de l'interactivité à une page web, mais il s'exécute chez le visiteur, ce qui a des conséquences de sécurité. Cette note présente les bases du langage, son intégration au HTML, le danger de la logique côté client, puis les bonnes pratiques de développement."
date: "31.08.2025"
plateforme: "TryHackMe"
parcours: "Cyber Security 101"
ordre: 2
difficulte: "Easy"
lien: "https://tryhackme.com/room/javascriptessentials"
---

## Définitions

**JavaScript (JS)** : langage de script qui s'exécute dans le navigateur du visiteur. Il ajoute de l'interactivité à une page web.

**Variable** : conteneur nommé qui stocke une valeur.

**Flux de contrôle** : ordre dans lequel les instructions d'un programme s'exécutent.

**Minification** : compression du code (espaces, retours à la ligne et commentaires retirés, noms raccourcis) pour réduire la taille des fichiers et accélérer le chargement.

**Obfuscation** : transformation qui rend le code illisible pour un humain, par exemple en renommant les variables ou en ajoutant du code factice, pour gêner son analyse.

## Le rôle de JavaScript

Une page web repose sur trois langages. Le HTML structure le contenu, le CSS le met en forme, et JavaScript le rend interactif. JavaScript gère par exemple la validation d'un formulaire, les animations et les clics.

Il s'exécute côté client, c'est-à-dire dans le navigateur du visiteur, ligne par ligne. C'est le point clé pour la sécurité, car le visiteur voit et peut modifier ce code. Les attaquants détournent d'ailleurs ses fonctions légitimes, notamment pour des attaques XSS.

## Les bases du langage

| Déclaration | Portée | Usage |
| --- | --- | --- |
| `var` | Fonction | Ancienne méthode, à éviter |
| `let` | Bloc | Pour une variable qui change |
| `const` | Bloc | Pour une valeur fixe |

Les types de données courants sont les suivants.

| Type | Contenu |
| --- | --- |
| `string` | Du texte |
| `number` | Un entier ou un décimal |
| `boolean` | `true` ou `false` |
| `null` | Une valeur vide, définie à dessein |
| `undefined` | Une variable déclarée sans valeur |
| `object` | Une structure complexe, comme un tableau |

Une **fonction** est un bloc de code réutilisable, qui peut recevoir des paramètres. Une **boucle** (`for`, `while`, `do...while`) répète un bloc tant qu'une condition est vraie. La commande `console.log()` affiche une valeur dans la console du navigateur, idéale pour expérimenter.

```javascript
let x = 5;
let y = 10;
console.log(x + y); // 15
```

## Intégrer JavaScript au HTML

Le code peut être écrit dans la page ou dans un fichier séparé.

| Type | Où | Usage |
| --- | --- | --- |
| Interne | Entre les balises `<script>...</script>` de la page | Petits tests, apprentissage |
| Externe | Dans un fichier `.js` chargé par `<script src="...">` | Projets réels, pour organiser et réutiliser le code |

Un clic droit, puis *Afficher le code source*, révèle quel type un site utilise. Deux éléments servent souvent à modifier la page, `document.getElementById()` qui sélectionne un élément par son identifiant, et la propriété `innerHTML` qui change son contenu.

```javascript
let resultat = 5 + 10;
document.getElementById("resultat").innerHTML = "Le résultat est : " + resultat;
```

## Les boîtes de dialogue

JavaScript propose trois boîtes de dialogue intégrées.

| Fonction | Rôle |
| --- | --- |
| `alert()` | Affiche un message avec un bouton *OK* |
| `prompt()` | Demande une saisie, et renvoie la valeur ou `null` si on annule |
| `confirm()` | Pose une question, et renvoie `true` ou `false` |

Ces fonctions simples peuvent être détournées. Une boucle qui appelle `alert()` des centaines de fois force l'utilisateur à cliquer sans fin, ce qui bloque la navigation. C'est pourquoi il ne faut exécuter que du code JavaScript de source fiable.

## Le danger de la logique côté client

Comme le code s'exécute chez le visiteur, toute vérification écrite en JavaScript est visible et modifiable. Vérifier un identifiant et un mot de passe uniquement en JavaScript est donc une faille. Le mot de passe apparaît en clair dans le code source, et il suffit de le lire pour contourner le contrôle.

```javascript
// À ne jamais faire : le mot de passe est visible dans le code source
if (utilisateur === "admin" && motDePasse === "secret") {
  alert("Connecté");
}
```

L'authentification se fait toujours côté serveur. La logique du navigateur, elle, peut être lue ou modifiée depuis la console.

## Minification et obfuscation

La minification est purement technique et sert les performances. L'obfuscation a deux usages. Un usage légitime protège la propriété intellectuelle en gênant la copie. Un usage malveillant cache du code dangereux, comme une charge XSS. Un même code reste fonctionnel une fois obfusqué, mais devient illisible. Les analystes utilisent des outils de désobfuscation pour examiner un script suspect.

## Les bonnes pratiques

| Pratique | Raison |
| --- | --- |
| Valider aussi côté serveur | La validation côté client sert le confort, pas la sécurité. Le visiteur peut la désactiver |
| Vérifier les bibliothèques externes | Une bibliothèque piégée, qui imite un paquet légitime, rend l'application vulnérable |
| Ne pas écrire de secret en dur | Une clé d'API dans le code est visible côté client. Les secrets restent côté serveur |
| Minifier et obfusquer en production | Cela n'arrête pas un attaquant motivé, mais augmente le coût de son analyse |

## À retenir

- JavaScript s'exécute dans le navigateur, donc tout son code est visible du visiteur.
- `let` et `const` remplacent `var`, et `console.log()` sert à expérimenter.
- Les boîtes `alert()`, `prompt()` et `confirm()` sont simples mais détournables.
- La sécurité ne repose jamais sur le code côté client. L'authentification se fait côté serveur.
- Aucun secret ne doit figurer dans du JavaScript, car il part chez le visiteur.
