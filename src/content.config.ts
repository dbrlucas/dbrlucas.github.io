import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Notes écrites en Markdown. Les dossiers de src/content/notes/ donnent l'arborescence du site :
 * leur nom est affiché tel quel (src/lib/coffre.ts). La plateforme et le parcours, indépendants des
 * dossiers, servent les badges.
 */
const notes = defineCollection({
  loader: glob({ base: "./src/content/notes", pattern: "**/*.md" }),
  schema: z.object({
    titre: z.string(),
    /** Phrase courte des listes et des résultats de recherche. */
    description: z.string(),
    /** Encadré en tête de note ; la description sert à défaut. */
    resume: z.string().optional(),
    date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "date attendue au format JJ.MM.AAAA"),
    /** Plateforme d'origine (TryHackMe…), affichée en badge gris. */
    plateforme: z.string(),
    /** Parcours ou ensemble de rooms (Cyber Security 101, SOC Level 1…), affiché en badge bleu. */
    parcours: z.string().optional(),
    /** Rang de la note dans son module (1, 2, 3…), pour suivre l'ordre du parcours ; à défaut, la date. */
    ordre: z.number().int().positive().optional(),
    /** Difficulté annoncée par la plateforme, facultative. */
    difficulte: z.enum(["Easy", "Medium", "Hard"]).optional(),
    /** Challenge d'origine (room TryHackMe, Sherlock HackTheBox…), facultatif. */
    lien: z.string().url().optional(),
    /** Note en attente de validation : visible en développement, absente du site construit. */
    brouillon: z.boolean().default(false)
  })
});

/**
 * Write-ups écrits en Markdown dans src/content/write-ups/ (un fichier par write-up). La plateforme et
 * la catégorie servent les badges et le fil d'Ariane (src/lib/writeups.ts).
 */
const writeups = defineCollection({
  loader: glob({ base: "./src/content/write-ups", pattern: "**/*.md" }),
  schema: z.object({
    titre: z.string(),
    /** Phrase courte des listes et des résultats de recherche. */
    description: z.string(),
    /** Encadré en tête de page ; la description sert à défaut. */
    resume: z.string().optional(),
    date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "date attendue au format JJ.MM.AAAA"),
    /** Plateforme du challenge (TryHackMe, HackTheBox…). */
    plateforme: z.string(),
    /** Catégorie affichée en badge (Active Directory, Forensics…). */
    categorie: z.string(),
    difficulte: z.enum(["Easy", "Medium", "Hard"]),
    /** Challenge d'origine, facultatif. */
    lien: z.string().url().optional(),
    /** Write-up en attente de validation : visible en développement, absent du site construit. */
    brouillon: z.boolean().default(false)
  })
});

export const collections = { notes, writeups };
