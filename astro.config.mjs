// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { rehypeDocument, transformerTitre } from './src/lib/markdown.mjs';
import { themeCodeClair, themeCodeSombre } from './src/lib/theme-code.mjs';

// https://astro.build/config
export default defineConfig({
  // Adresse prévue à la mise en ligne. La renseigner ne publie rien : elle sert à écrire
  // les liens absolus du sitemap et du flux RSS.
  site: 'https://dbrlucas.github.io',
  integrations: [react(), sitemap()],

  // Notes en Markdown : pipeline remark/rehype, pour la syntaxe Obsidian et nos propres
  // mises en forme (src/lib/markdown.mjs).
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeDocument],
      remarkRehype: { footnoteLabel: 'Notes', footnoteBackLabel: 'Revenir au texte' },
      // Guillemets droits "…" gardés tels quels ; l'apostrophe devient typographique (’).
      smartypants: {
        openingQuotes: { double: '"', single: '‘' },
        closingQuotes: { double: '"', single: '’' }
      }
    }),
    shikiConfig: {
      themes: { light: themeCodeClair, dark: themeCodeSombre },
      defaultColor: false,
      wrap: null,
      transformers: [transformerTitre]
    }
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
