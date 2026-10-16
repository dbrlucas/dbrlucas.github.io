import { getCollection, type CollectionEntry } from "astro:content";
import type { Writeup } from "@/lib/types";
import { horodatage } from "./contenu";

/**
 * Liste des write-ups du site, lue dans les fichiers Markdown de src/content/write-ups/.
 *
 * Module réservé au serveur (pages, flux RSS, images d'aperçu) : le navigateur passe par
 * /index-writeups.json.
 */

type Entree = CollectionEntry<"writeups">;

/** Write-ups à afficher : les brouillons ne sortent qu'en développement. */
async function entrees(): Promise<Entree[]> {
  return getCollection("writeups", (e) => import.meta.env.DEV || !e.data.brouillon);
}

/** Un write-up Markdown, au format commun aux listes, cartes, recherche et flux. */
function enWriteup(e: Entree): Writeup {
  return {
    title: e.data.titre,
    desc: e.data.description,
    platform: e.data.plateforme,
    cat: e.data.categorie,
    diff: e.data.difficulte,
    date: e.data.date,
    ts: horodatage(e.data.date),
    brouillon: e.data.brouillon || undefined
  };
}

export async function chargerWriteups(): Promise<Writeup[]> {
  return (await entrees()).map(enWriteup).sort((a, b) => b.ts - a.ts);
}

/** Fichier Markdown d'un write-up. */
export async function entreeDeWriteup(w: Writeup): Promise<Entree | undefined> {
  return (await entrees()).find((e) => e.data.titre === w.title);
}
