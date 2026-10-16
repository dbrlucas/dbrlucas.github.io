import { toutesLesNotes } from "../lib/contenu";
import { chargerCoffre } from "../lib/coffre";

/** Liste des notes pour la recherche globale (src/components/CommandPalette.tsx). */
export async function GET() {
  const notes = toutesLesNotes(await chargerCoffre()).map((n) => ({
    nom: n.nom,
    desc: n.desc,
    dossier: n.plateforme ?? n.chemin[0] ?? "",
    href: n.href
  }));
  return new Response(JSON.stringify(notes), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
