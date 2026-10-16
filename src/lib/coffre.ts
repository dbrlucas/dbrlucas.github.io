import { getCollection, type CollectionEntry } from "astro:content";
import type { VaultNode } from "@/lib/types";
import { horodatage, type NoteAplatie } from "./contenu";

/**
 * Arborescence des notes du site, lue dans les fichiers Markdown de src/content/notes/ :
 * chaque dossier devient un dossier du site, sous le nom qu'il porte sur le disque.
 * Module réservé au serveur (pages, flux RSS, images d'aperçu) : le navigateur passe par
 * /index-notes.json.
 */

type Entree = CollectionEntry<"notes">;
type Dossier = Extract<VaultNode, { type: "folder" }>;

/** Notes à afficher : les brouillons ne sortent qu'en développement. */
async function entrees(): Promise<Entree[]> {
  return getCollection("notes", (e) => import.meta.env.DEV || !e.data.brouillon);
}

/** Dossiers d'une note, d'après l'emplacement de son fichier sous src/content/notes/. */
function cheminDe(e: Entree): string[] {
  const fichier = (e.filePath ?? "").replaceAll("\\", "/");
  const relatif = fichier.split("src/content/notes/").pop() ?? "";
  return relatif.split("/").slice(0, -1);
}

/** Date de la note la plus ancienne d'un nœud : les dossiers se suivent dans l'ordre où ils ont été commencés. */
function debut(n: VaultNode): number {
  return n.type === "note" ? horodatage(n.date) : Math.min(...n.children.map(debut));
}

/** Rang déclaré dans l'en-tête de la note (`ordre`) ; les notes sans rang et les dossiers passent après. */
const rang = (n: VaultNode) => (n.type === "note" ? (n.ordre ?? Infinity) : Infinity);

/** Notes dans l'ordre du parcours (rang déclaré, sinon date croissante), dossiers par date de leur première note. */
function trier(noeuds: VaultNode[]): VaultNode[] {
  for (const n of noeuds) if (n.type === "folder") trier(n.children);
  return noeuds.sort(
    (a, b) => (rang(a) === rang(b) ? 0 : rang(a) - rang(b)) || debut(a) - debut(b) || a.name.localeCompare(b.name, "fr")
  );
}

function arbre(liste: Entree[]): VaultNode[] {
  const racine: VaultNode[] = [];
  for (const e of liste) {
    let niveau = racine;
    for (const nom of cheminDe(e)) {
      let dossier = niveau.find((n): n is Dossier => n.type === "folder" && n.name === nom);
      if (!dossier) {
        dossier = { name: nom, type: "folder", children: [] };
        niveau.push(dossier);
      }
      niveau = dossier.children;
    }
    niveau.push({
      name: e.data.titre,
      type: "note",
      desc: e.data.description,
      date: e.data.date,
      diff: e.data.difficulte,
      plateforme: e.data.plateforme,
      parcours: e.data.parcours,
      ordre: e.data.ordre,
      brouillon: e.data.brouillon || undefined
    });
  }
  return trier(racine);
}

export async function chargerCoffre(): Promise<VaultNode[]> {
  return arbre(await entrees());
}

/** Fichier Markdown d'une note. */
export async function entreeDeNote(note: NoteAplatie): Promise<Entree | undefined> {
  const chemin = note.chemin.join("/");
  return (await entrees()).find((e) => e.data.titre === note.nom && cheminDe(e).join("/") === chemin);
}
