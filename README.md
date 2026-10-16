# dbrlucas

Portfolio d'un étudiant en Master Cybersécurité, orienté Blue Team : write-ups de challenges, notes de formation et projets.

Site : [dbrlucas.github.io](https://dbrlucas.github.io)

## Contenu

- **Write-ups** : résolutions de challenges, étape par étape (`src/content/write-ups/`).
- **Notes** : notes reformulées à partir des parcours de formation, rangées par dossier (`src/content/notes/`). Chaque dossier du disque devient un dossier du site.
- **Projets** : projets de recherche et d'organisation (`src/data/projets.ts`).

Les notes et write-ups sont des fichiers Markdown, avec un en-tête qui précise le titre, la description, la date et la difficulté. Un en-tête `brouillon: true` garde une page visible en local mais l'exclut du site publié.

## Technique

- [Astro](https://astro.build) pour la génération du site statique, avec quelques composants React.
- Tailwind CSS pour la mise en forme.
- [Pagefind](https://pagefind.app) pour la recherche dans le texte, indexée après la construction.
- Images d'aperçu générées pour chaque page lors de la construction.

## En local

Il faut Node.js 22.12 ou plus récent.

| Commande | Effet |
| --- | --- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Lance le site en local sur `localhost:4321` |
| `npm run build` | Construit le site dans `dist/`, puis l'index de recherche |
| `npm run preview` | Sert le site construit, pour le vérifier avant publication |

## Publication

Chaque envoi sur `main` construit le site et le publie sur GitHub Pages (`.github/workflows/deploy.yml`).
