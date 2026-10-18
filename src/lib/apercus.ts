import { bio } from "@/data/site";
import { badgesNote, hrefDossier, hrefWriteup, listerDossier, tousLesDossiers, toutesLesNotes } from "@/lib/contenu";
import { chargerCoffre } from "@/lib/coffre";
import { chargerWriteups } from "@/lib/writeups";

/**
 * Aperçus de partage (LinkedIn, Discord, messageries…) : une image par page, générée au build
 * par src/pages/og/[...chemin].png.ts, et les balises Open Graph posées par Base.astro.
 */

/** `marque` : pastille bleue de la catégorie, comme sur les cartes du site. */
export type Pastille = { texte: string; point?: string; marque?: boolean };

export type Apercu = {
  /** Adresse de la page, sans barre finale (« / » pour l'accueil). */
  chemin: string;
  titre: string;
  /** Rubrique affichée en haut à droite de l'image. */
  rubrique: string;
  pastilles: Pastille[];
  description: string;
  /** Page de lecture (write-up, note) plutôt que page de rubrique. */
  article: boolean;
};

/** Les liens du site finissent par « / », pas les chemins des aperçus. */
const sansBarre = (href: string) => href.replace(/\/+$/, "") || "/";

/** Couleurs de difficulté du thème sombre, celui des images d'aperçu. */
const DIFFICULTE = { Easy: "#4ade80", Medium: "#fbbf24", Hard: "#f87171" } as const;

export async function tousLesApercus(): Promise<Apercu[]> {
  const coffre = await chargerCoffre();
  const writeups = await chargerWriteups();
  const page = (chemin: string, titre: string, description: string): Apercu => ({
    chemin,
    titre,
    rubrique: titre,
    pastilles: [],
    description,
    article: false
  });

  return [
    { ...page("/", "Portfolio Cybersécurité", bio), rubrique: "Portfolio", pastilles: [{ texte: "Write-ups" }, { texte: "Notes" }, { texte: "Projets" }] },
    page("/write-ups", "Write-ups", "Les challenges que je résous, détaillés étape par étape."),
    ...writeups.map((w) => ({
      chemin: sansBarre(hrefWriteup(w)),
      titre: w.title,
      rubrique: "Write-up",
      pastilles: [{ texte: w.cat, marque: true }, { texte: w.platform }, { texte: w.diff, point: DIFFICULTE[w.diff] }],
      description: w.desc,
      article: true
    })),
    page("/notes", "Notes", "Ce que je retiens de mes parcours de formation, rangé par module."),
    ...tousLesDossiers(coffre).map((chemin) => {
      const n = listerDossier(coffre, chemin).nombre;
      return {
        chemin: sansBarre(hrefDossier(chemin)),
        titre: chemin.at(-1)!,
        rubrique: "Notes",
        pastilles: chemin.slice(0, -1).map((texte) => ({ texte })),
        description: `${n} note${n > 1 ? "s" : ""} dans ce dossier.`,
        article: false
      };
    }),
    ...toutesLesNotes(coffre).map((n) => {
      const b = badgesNote(n);
      return {
        chemin: sansBarre(n.href),
        titre: n.nom,
        rubrique: "Note",
        pastilles: [
          ...(b.cat ? [{ texte: b.cat, marque: true }] : []),
          ...(b.platform ? [{ texte: b.platform }] : []),
          ...(n.diff ? [{ texte: n.diff, point: DIFFICULTE[n.diff] }] : [])
        ],
        description: n.desc,
        article: true
      };
    }),
    page("/projets", "Projets", "Mes projets et contributions, en recherche comme en pratique.")
  ];
}

/** Aperçu d'une page ; les pages sans image propre (404…) reprennent celle de l'accueil. */
export async function apercuDe(pathname: string): Promise<Apercu> {
  const chemin = pathname.replace(/\/+$/, "") || "/";
  const liste = await tousLesApercus();
  return liste.find((a) => a.chemin === chemin) ?? liste[0];
}

/** Adresse de l'image d'aperçu d'une page. */
export const adresseImage = (a: Apercu) => `/og${a.chemin === "/" ? "/accueil" : a.chemin}.png`;
