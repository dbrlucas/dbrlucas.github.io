import { useEffect, useState } from "react";

/**
 * Recherche dans le texte complet des notes et write-ups, via l'index Pagefind généré après
 * le build (`pagefind --site dist`). En développement l'index n'existe pas : la recherche
 * renvoie alors un résultat vide et chaque liste se contente des titres et descriptions.
 */

type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (
    q: string,
    o?: Record<string, unknown>,
    delai?: number
  ) => Promise<{ results: { data: () => Promise<{ url: string; excerpt: string }> }[] } | null>;
};

let chargement: Promise<Pagefind | null> | null = null;

function pagefind(): Promise<Pagefind | null> {
  if (!chargement) {
    // Adresse gardée dans une variable : Vite ne doit pas chercher ce fichier au build.
    const adresse = "/pagefind/pagefind.js";
    chargement = import(/* @vite-ignore */ adresse)
      .then(async (pf: Pagefind) => {
        await pf.options({ excerptLength: 16 });
        await pf.init();
        return pf;
      })
      .catch(() => null);
  }
  return chargement;
}

/** Les adresses de l'index finissent par « / » ; celles du site non. */
export const normaliser = (url: string) => url.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";

/** Adresse de page → extrait où le terme apparaît (balises <mark> incluses). */
export type Extraits = Map<string, string>;

export async function chercherDansLeTexte(q: string): Promise<Extraits | null> {
  const terme = q.trim();
  if (terme.length < 2) return new Map();
  const pf = await pagefind();
  if (!pf) return new Map();
  const reponse = await pf.debouncedSearch(terme, {}, 120);
  if (!reponse) return null; // recherche remplacée par une frappe plus récente
  const donnees = await Promise.all(reponse.results.slice(0, 20).map((r) => r.data()));
  return new Map(donnees.map((d) => [normaliser(d.url), d.excerpt]));
}

/** Même chose sous forme de hook React : se met à jour à chaque frappe. */
export function useRechercheTexte(q: string): Extraits {
  const [extraits, setExtraits] = useState<Extraits>(new Map());
  useEffect(() => {
    let annule = false;
    chercherDansLeTexte(q).then((r) => {
      if (!annule && r) setExtraits(r);
    });
    return () => {
      annule = true;
    };
  }, [q]);
  return extraits;
}
