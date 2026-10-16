import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import type { Apercu, Pastille } from "@/lib/apercus";

/** Image d'aperçu de 1200 × 630 px, le format attendu par LinkedIn, Discord ou X. */

const racine = process.cwd();
const lire = (fichier: string) => fs.readFileSync(path.join(racine, fichier));

// Satori ne lit pas le WOFF2 des polices du site : on charge Geist en WOFF (@fontsource/geist).
const POLICES = [
  { name: "Geist", data: lire("node_modules/@fontsource/geist/files/geist-latin-400-normal.woff"), weight: 400 as const },
  { name: "Geist", data: lire("node_modules/@fontsource/geist/files/geist-latin-500-normal.woff"), weight: 500 as const },
  { name: "Geist", data: lire("node_modules/@fontsource/geist/files/geist-latin-600-normal.woff"), weight: 600 as const },
  { name: "Geist Mono", data: lire("node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff"), weight: 400 as const }
];

// Portrait sur fond sombre, comme le reste de l'image.
const AVATAR = `data:image/jpeg;base64,${lire("public/avatar-sombre.jpg").toString("base64")}`;

// Couleurs du thème sombre (src/styles/global.css, bloc .dark)
const C = {
  fond: "#0a0a0a",
  texte: "#fafafa",
  attenue: "#a3a3a3",
  bordure: "rgba(255, 255, 255, 0.1)",
  marque: "#3b6fe0",
  marqueTexte: "#6e94e8",
  marqueFond: "rgba(59, 111, 224, 0.18)",
  marqueTrait: "rgba(59, 111, 224, 0.35)"
};

type Noeud = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, autres: Record<string, unknown> = {}): Noeud => ({
  type,
  props: { style, children, ...autres }
});

const pilule = ({ texte, point, marque }: Pastille) =>
  h(
    "div",
    {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "7px 18px",
      border: `1px solid ${marque ? C.marqueTrait : C.bordure}`,
      borderRadius: 999,
      background: marque ? C.marqueFond : "transparent",
      fontSize: 22,
      fontWeight: 500,
      color: marque ? C.marqueTexte : C.attenue
    },
    [...(point ? [h("div", { width: 10, height: 10, borderRadius: 999, background: point })] : []), texte]
  );

/** Plus le titre est long, plus il est petit : il doit tenir en trois lignes. */
const tailleTitre = (titre: string) => (titre.length > 70 ? 50 : titre.length > 42 ? 58 : 68);

export async function imageApercu(a: Apercu): Promise<Buffer> {
  const arbre = h(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "60px 72px 64px",
      background: C.fond,
      color: C.texte,
      fontFamily: "Geist",
      position: "relative"
    },
    [
      // En-tête : avatar, nom, rubrique
      h("div", { display: "flex", alignItems: "center", gap: 20 }, [
        h("img", { width: 64, height: 64, borderRadius: 9, border: `1px solid ${C.bordure}` }, undefined, {
          src: AVATAR,
          width: 64,
          height: 64
        }),
        h("div", { fontSize: 28, fontWeight: 500, letterSpacing: -0.3 }, "dbrlucas"),
        h("div", { flexGrow: 1 }),
        h(
          "div",
          {
            padding: "7px 18px",
            borderRadius: 999,
            border: `1px solid ${C.marqueTrait}`,
            background: C.marqueFond,
            color: C.marqueTexte,
            fontSize: 22,
            fontWeight: 500
          },
          a.rubrique
        )
      ]),

      // Titre, puis pastilles (pages de lecture) ou description (rubriques)
      h("div", { display: "flex", flexDirection: "column", gap: 28 }, [
        h(
          "div",
          {
            display: "block",
            fontSize: tailleTitre(a.titre),
            fontWeight: 600,
            letterSpacing: -0.03 * tailleTitre(a.titre),
            lineHeight: 1.12,
            lineClamp: 3
          },
          a.titre
        ),
        a.pastilles.length
          ? h("div", { display: "flex", flexWrap: "wrap", gap: 12 }, a.pastilles.map(pilule))
          : h("div", { display: "block", fontSize: 28, lineHeight: 1.45, color: C.attenue, lineClamp: 2 }, a.description)
      ]),

      // Pied : adresse du site
      h("div", { display: "flex", fontFamily: "Geist Mono", fontSize: 22, color: C.attenue }, "dbrlucas.github.io"),

      // Filet de la couleur du site
      h("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: C.marque })
    ]
  );

  const svg = await satori(arbre as never, { width: 1200, height: 630, fonts: POLICES });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
