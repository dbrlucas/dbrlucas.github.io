import type { Doc, Writeup } from "@/lib/types";
import { hrefNote, hrefWriteup, type NoteAplatie } from "./contenu";

/** Lien vers un document voisin, affiché en bas de page. */
export type Voisin = { titre: string; href: string; label: string };

export type DocumentRendu = Doc & {
  titre: string;
  /** Adresse du challenge d'origine (room, Sherlock…), facultative. */
  lien?: string;
  /** Note en attente de validation : repère affiché en développement. */
  brouillon?: boolean;
  precedent?: Voisin;
  suivant?: Voisin;
};

/** `notes` : toutes les notes du coffre, pour trouver les voisines du même dossier. */
export function documentDeNote(note: NoteAplatie, notes: NoteAplatie[]): DocumentRendu {
  const voisines = notes.filter((n) => n.chemin.join("/") === note.chemin.join("/"));
  const index = voisines.findIndex((n) => n.nom === note.nom);
  const precedente = index > 0 ? voisines[index - 1] : undefined;
  const suivante = index >= 0 && index < voisines.length - 1 ? voisines[index + 1] : undefined;

  // Le corps de la note vient de son fichier Markdown (src/pages/notes/[...chemin].astro).
  const base: Doc = {
    root: "Notes",
    crumbs: note.chemin,
    platform: note.plateforme ?? "Notes",
    badge: note.parcours ?? note.plateforme ?? "Note",
    meta: note.date,
    summary: note.desc,
    sections: []
  };

  return {
    ...base,
    diff: note.diff,
    brouillon: note.brouillon,
    titre: note.nom,
    precedent: precedente
      ? { titre: precedente.nom, href: hrefNote(precedente.chemin, precedente.nom), label: "Note précédente dans le dossier" }
      : undefined,
    suivant: suivante
      ? { titre: suivante.nom, href: hrefNote(suivante.chemin, suivante.nom), label: "Note suivante dans le dossier" }
      : undefined
  };
}

/** `writeups` : tous les write-ups, pour trouver le précédent et le suivant. */
export function documentDeWriteup(w: Writeup, writeups: Writeup[]): DocumentRendu {
  const index = writeups.findIndex((x) => x.title === w.title);
  const precedent = index > 0 ? writeups[index - 1] : undefined;
  const suivant = index >= 0 && index < writeups.length - 1 ? writeups[index + 1] : undefined;

  // Le corps du write-up vient de son fichier Markdown (src/pages/write-ups/[slug].astro).
  const base: Doc = {
    root: "Write-ups",
    crumbs: [w.platform, w.cat],
    platform: w.platform,
    badge: w.cat,
    meta: w.date,
    diff: w.diff,
    sections: [],
    summary: w.desc
  };

  return {
    ...base,
    brouillon: w.brouillon,
    titre: w.title,
    precedent: precedent ? { titre: precedent.title, href: hrefWriteup(precedent), label: "Write-up précédent" } : undefined,
    suivant: suivant ? { titre: suivant.title, href: hrefWriteup(suivant), label: "Write-up suivant" } : undefined
  };
}
