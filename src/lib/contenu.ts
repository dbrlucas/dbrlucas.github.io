import type { VaultNode, Writeup } from "@/lib/types";

// Fonctions sans dépendance au serveur : ce fichier est aussi chargé dans le navigateur (recherche).
// L'arborescence des notes (`coffre`) leur est passée en argument ; elle vient de src/lib/coffre.ts.

/** Transforme un titre ou un nom de dossier en segment d'URL. */
export function slug(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type NoteAplatie = {
  nom: string;
  desc: string;
  date: string;
  diff?: Writeup["diff"];
  /** Plateforme et parcours, pour les badges. */
  plateforme?: string;
  parcours?: string;
  /** Note en attente de validation : visible en développement seulement. */
  brouillon?: boolean;
  chemin: string[];
  href: string;
};

/** Toutes les notes du coffre, avec leur chemin de dossiers. */
export function toutesLesNotes(coffre: VaultNode[], chemin: string[] = []): NoteAplatie[] {
  return coffre.flatMap((n) =>
    n.type === "note"
      ? [
          {
            nom: n.name,
            desc: n.desc,
            date: n.date,
            diff: n.diff,
            plateforme: n.plateforme,
            parcours: n.parcours,
            brouillon: n.brouillon,
            chemin,
            href: hrefNote(chemin, n.name)
          }
        ]
      : toutesLesNotes(n.children, [...chemin, n.name])
  );
}

export function hrefNote(chemin: string[], nom: string): string {
  return "/notes/" + [...chemin, nom].map(slug).join("/") + "/";
}

export function hrefDossier(chemin: string[]): string {
  return chemin.length ? "/notes/" + chemin.map(slug).join("/") + "/" : "/notes/";
}

export function hrefWriteup(w: Writeup): string {
  return "/write-ups/" + slug(w.title) + "/";
}

/** Date « JJ.MM.AAAA » en nombre AAAAMMJJ, pour les tris. */
export function horodatage(date: string): number {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  return m ? Number(m[3] + m[2] + m[1]) : 0;
}

/** Notes choisies par leur titre, dans l'ordre donné. Un titre introuvable arrête le build. */
export function notesParTitre(coffre: VaultNode[], titres: string[]): NoteAplatie[] {
  const notes = toutesLesNotes(coffre);
  return titres.map((titre) => {
    const note = notes.find((n) => n.nom === titre);
    if (!note) throw new Error(`Note introuvable : « ${titre} »`);
    return note;
  });
}

/** Les n write-ups les plus récents. */
export function writeupsRecents(writeups: Writeup[], n = 3): Writeup[] {
  return [...writeups].sort((a, b) => b.ts - a.ts).slice(0, n);
}

/** Badges d'une note : plateforme en gris, parcours en bleu. */
export function badgesNote(note: { plateforme?: string; parcours?: string }): { platform?: string; cat?: string } {
  return { platform: note.plateforme, cat: note.parcours };
}

/** Nombre de notes contenues dans un nœud, sous-dossiers compris. */
export function compterNotes(noeud: VaultNode): number {
  return noeud.type === "note" ? 1 : noeud.children.reduce((n, e) => n + compterNotes(e), 0);
}

export function enfantsDuDossier(coffre: VaultNode[], chemin: string[]): VaultNode[] {
  let noeuds: VaultNode[] = coffre;
  for (const segment of chemin) {
    const trouve = noeuds.find((n) => n.type === "folder" && slug(n.name) === slug(segment));
    if (!trouve || trouve.type !== "folder") return [];
    noeuds = trouve.children;
  }
  return noeuds;
}

/** Nom réel des dossiers d'un chemin en segments d'URL (pour l'affichage). */
export function nomsDuChemin(coffre: VaultNode[], segments: string[]): string[] {
  const noms: string[] = [];
  let noeuds: VaultNode[] = coffre;
  for (const segment of segments) {
    const trouve = noeuds.find((n) => n.type === "folder" && slug(n.name) === slug(segment));
    if (!trouve || trouve.type !== "folder") break;
    noms.push(trouve.name);
    noeuds = trouve.children;
  }
  return noms;
}

export function listerDossier(coffre: VaultNode[], chemin: string[]) {
  const enfants = enfantsDuDossier(coffre, chemin);
  const noms = nomsDuChemin(coffre, chemin);
  return {
    noms,
    total: coffre.reduce((n, e) => n + compterNotes(e), 0),
    nombre: enfants.reduce((n, e) => n + compterNotes(e), 0),
    dossiers: enfants
      .filter((e): e is Extract<VaultNode, { type: "folder" }> => e.type === "folder")
      .map((e) => ({ nom: e.name, nombre: compterNotes(e), href: hrefDossier([...noms, e.name]) })),
    notes: enfants
      .filter((e): e is Extract<VaultNode, { type: "note" }> => e.type === "note")
      .map((e) => ({
        nom: e.name,
        desc: e.desc,
        date: e.date,
        diff: e.diff,
        plateforme: e.plateforme,
        parcours: e.parcours,
        href: hrefNote(noms, e.name)
      }))
  };
}

/** Tous les chemins de dossiers du coffre, racine exclue. */
export function tousLesDossiers(coffre: VaultNode[], chemin: string[] = []): string[][] {
  return coffre.flatMap((n) =>
    n.type === "folder" ? [[...chemin, n.name], ...tousLesDossiers(n.children, [...chemin, n.name])] : []
  );
}
