import { hrefWriteup } from "../lib/contenu";
import { chargerWriteups } from "../lib/writeups";

/** Liste des write-ups pour la recherche globale (src/components/CommandPalette.tsx). */
export async function GET() {
  const liste = (await chargerWriteups()).map((w) => ({
    titre: w.title,
    desc: w.desc,
    plateforme: w.platform,
    cat: w.cat,
    href: hrefWriteup(w)
  }));
  return new Response(JSON.stringify(liste), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
