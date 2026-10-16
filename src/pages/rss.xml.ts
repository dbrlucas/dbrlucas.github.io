import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { hrefWriteup, toutesLesNotes } from "../lib/contenu";
import { chargerCoffre } from "../lib/coffre";
import { chargerWriteups } from "../lib/writeups";

/** Write-ups et notes sont datés « JJ.MM.AAAA ». */
const dateJour = (date: string) => {
  const [jour, mois, annee] = date.split(".").map(Number);
  return new Date(Date.UTC(annee, mois - 1, jour));
};

export async function GET(context: APIContext) {
  const coffre = await chargerCoffre();
  const writeups = await chargerWriteups();
  const entrees = [
    ...writeups.map((w) => ({
      title: w.title,
      description: w.desc,
      link: hrefWriteup(w),
      pubDate: dateJour(w.date),
      categories: ["Write-up", w.platform, w.cat]
    })),
    ...toutesLesNotes(coffre).map((n) => ({
      title: n.nom,
      description: n.desc,
      link: n.href,
      pubDate: dateJour(n.date),
      categories: ["Note", ...[n.plateforme, n.parcours].filter((c): c is string => Boolean(c))]
    }))
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: "dbrlucas | Write-ups et notes",
    description: "Write-ups, notes et projets de dbrlucas, étudiant en Cybersécurité.",
    site: context.site!,
    items: entrees,
    customData: "<language>fr-fr</language>"
  });
}
