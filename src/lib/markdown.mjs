// Mise en forme des notes et write-ups écrits en Markdown (syntaxe Obsidian comprise).
// Le plugin rehype passe après la coloration syntaxique et avant l'attribution des
// identifiants de titres par Astro : il produit le même balisage que la page de lecture
// (src/components/DocPage.astro), pour que sommaire, ancres, copie et zoom s'appliquent.

/** Même règle que slug() de src/lib/contenu.ts : adresses sans accents, partageables telles quelles. */
function slug(valeur) {
  return valeur
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

import fs from "node:fs";
import path from "node:path";

// --- Dimensions des images de public/ (qu'Astro n'optimise pas) : déclarées dans le HTML, le
// navigateur réserve leur place avant le chargement (sinon la page saute et les liens d'ancre
// tombent au mauvais endroit). Les images rangées à côté des notes passent, elles, par Astro. ---

function dimensions(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return null;
  let o;
  try {
    o = fs.readFileSync(path.join(process.cwd(), "public", decodeURI(src)));
  } catch {
    return null;
  }
  // PNG : largeur et hauteur dans l'en-tête IHDR
  if (o.readUInt32BE(0) === 0x89504e47) return { largeur: o.readUInt32BE(16), hauteur: o.readUInt32BE(20) };
  // GIF
  if (o.toString("ascii", 0, 3) === "GIF") return { largeur: o.readUInt16LE(6), hauteur: o.readUInt16LE(8) };
  // WebP
  if (o.toString("ascii", 0, 4) === "RIFF" && o.toString("ascii", 8, 12) === "WEBP") {
    const format = o.toString("ascii", 12, 16);
    if (format === "VP8X") return { largeur: 1 + o.readUIntLE(24, 3), hauteur: 1 + o.readUIntLE(27, 3) };
    if (format === "VP8L") {
      const bits = o.readUInt32LE(21);
      return { largeur: 1 + (bits & 0x3fff), hauteur: 1 + ((bits >> 14) & 0x3fff) };
    }
    if (format === "VP8 ") return { largeur: o.readUInt16LE(26) & 0x3fff, hauteur: o.readUInt16LE(28) & 0x3fff };
  }
  // JPEG : on parcourt les segments jusqu'à l'en-tête de trame (SOFn)
  if (o[0] === 0xff && o[1] === 0xd8) {
    let i = 2;
    while (i + 9 < o.length && o[i] === 0xff) {
      const marqueur = o[i + 1];
      if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
        return { largeur: o.readUInt16BE(i + 7), hauteur: o.readUInt16BE(i + 5) };
      }
      i += 2 + o.readUInt16BE(i + 2);
    }
  }
  return null;
}

// --- Petits outils hast ---

const el = (tagName, properties = {}, children = []) => ({ type: "element", tagName, properties, children });
const texte = (value) => ({ type: "text", value });
const estElement = (n, tag) => n?.type === "element" && (!tag || n.tagName === tag);
const estVide = (n) => n.type === "text" && n.value.trim() === "";

function classes(n) {
  const c = n.properties.className ?? n.properties.class ?? [];
  return Array.isArray(c) ? c.map(String) : String(c).split(/\s+/).filter(Boolean);
}
function ajouterClasses(n, liste) {
  const actuelles = classes(n);
  delete n.properties.class;
  n.properties.className = [...actuelles, ...liste.split(" ")];
}

/** Éléments déjà mis en forme : on les parcourt encore, mais on ne les enveloppe qu'une fois. */
const traites = new WeakSet();

/** Parcourt tout l'arbre ; `visite` peut renvoyer un nœud de remplacement, parcouru à son tour. */
function parcourir(noeud, visite) {
  if (!noeud.children) return;
  for (let i = 0; i < noeud.children.length; i++) {
    const remplacant = visite(noeud.children[i], noeud);
    if (remplacant) noeud.children[i] = remplacant;
    parcourir(noeud.children[i], visite);
  }
}

const texteDe = (n) => (n.type === "text" ? n.value : (n.children ?? []).map(texteDe).join(""));

// --- Icônes (tracés Lucide, comme le reste du site) ---

const TRACES = {
  lien: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  coche: ["M20 6 9 17l-5-5"],
  agrandir: ["M15 3h6v6", "m21 3-7 7", "m3 21 7-7", "M9 21H3v-6"],
  attention: ["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", "M12 9v4", "M12 17h.01"],
  info: ["M12 16v-4", "M12 8h.01"],
  conseil: [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4"
  ],
  danger: [
    "M12 16h.01",
    "M12 8v4",
    "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"
  ]
};

function icone(nom, taille, proprietes = {}) {
  const traces = TRACES[nom].map((d) => el("path", { d }));
  if (nom === "info") traces.unshift(el("circle", { cx: 12, cy: 12, r: 10 }));
  return el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: taille,
      height: taille,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ariaHidden: "true",
      ...proprietes
    },
    traces
  );
}

// --- Encadrés Obsidian : > [!warning] Titre facultatif ---

const FAMILLES = {
  info: ["note", "info", "todo", "abstract", "summary", "tldr", "question", "help", "faq", "example", "quote", "cite"],
  conseil: ["tip", "hint", "important", "success", "check", "done"],
  attention: ["warning", "caution", "attention"],
  danger: ["danger", "error", "failure", "fail", "missing", "bug"]
};
const familleDe = (type) => Object.keys(FAMILLES).find((f) => FAMILLES[f].includes(type)) ?? "info";

function encadre(blockquote) {
  const premier = blockquote.children.find((n) => !estVide(n));
  if (!estElement(premier, "p") || premier.children[0]?.type !== "text") return null;
  const marque = /^\[!([a-z-]+)\][+-]?[ \t]*([^\n]*)\n?/i.exec(premier.children[0].value);
  if (!marque) return null;

  premier.children[0].value = premier.children[0].value.slice(marque[0].length);
  if (premier.children[0].value === "") premier.children.shift();
  // Un titre suivi d'un retour à la ligne laisse un <br> en tête de paragraphe.
  if (estElement(premier.children[0], "br")) premier.children.shift();
  const corps = blockquote.children.filter((n) => !estVide(n) && !(n === premier && premier.children.length === 0));
  const titre = marque[2].trim();
  const famille = familleDe(marque[1].toLowerCase());

  return el("div", { className: ["callout"], dataCallout: famille, role: "note" }, [
    icone(famille, 16, { className: ["callout-icone"] }),
    el("div", { className: ["callout-corps"] }, [...(titre ? [el("p", { className: ["callout-titre"] }, [texte(titre)])] : []), ...corps])
  ]);
}

// --- Captures : un paragraphe qui ne contient qu'une image devient une figure agrandissable ---

function figure(p) {
  const utiles = p.children.filter((n) => !estVide(n));
  if (utiles.length !== 1 || !estElement(utiles[0], "img")) return null;
  const img = utiles[0];
  const legende = typeof img.properties.title === "string" ? img.properties.title : "";
  delete img.properties.title;
  const alt = String(img.properties.alt ?? "");
  const src = String(img.properties.src ?? "");
  if (!src.startsWith("/") && !URL.canParse(src)) {
    // Image rangée à côté de la note : Astro la convertit en WebP et en plusieurs largeurs.
    // `sizes` décrit la vraie place de la capture (colonne de 636 à 680 px, pleine largeur
    // moins les marges sur mobile) pour que le navigateur choisisse la plus petite suffisante.
    img.properties.layout = "constrained";
    img.properties.sizes = "(min-width: 768px) 680px, calc(100vw - 40px)";
  } else {
    const taille = dimensions(src);
    if (taille) {
      img.properties.width = taille.largeur;
      img.properties.height = taille.hauteur;
    }
  }
  img.properties.loading = "lazy";
  img.properties.decoding = "async";
  ajouterClasses(img, "block h-auto w-full");

  return el("figure", { className: ["m-0", "flex", "flex-col", "gap-2"] }, [
    el(
      "button",
      {
        type: "button",
        dataZoomOuvrir: "",
        ariaLabel: `Agrandir la capture : ${alt}`,
        className: "group relative block cursor-zoom-in overflow-hidden rounded-[10px] border border-border bg-muted".split(" ")
      },
      [
        img,
        el(
          "span",
          {
            dataNoPrint: "",
            className:
              "absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground opacity-0 shadow-[var(--shadow-sm)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100".split(" ")
          },
          [icone("agrandir", 14)]
        )
      ]
    ),
    ...(legende ? [el("figcaption", { className: "text-[13px] leading-[1.6] text-muted-foreground".split(" ") }, [texte(legende)])] : [])
  ]);
}

// --- Blocs de code : en-tête avec le nom de fichier (```yaml title="docker-compose.yml") et bouton Copier ---

/** Transformeur Shiki : garde le titre indiqué après le langage du bloc. */
export const transformerTitre = {
  name: "titre-du-bloc",
  pre(node) {
    const titre = /title="([^"]*)"/.exec(this.options.meta?.__raw ?? "")?.[1];
    if (titre) node.properties.dataTitre = titre;
  }
};

function blocCode(pre) {
  const titre = pre.properties.dataTitre ?? pre.properties.dataLanguage ?? "";
  delete pre.properties.dataTitre;
  ajouterClasses(pre, "m-0 font-mono text-xs leading-[1.8] whitespace-pre text-code-foreground md:text-[12.5px]");
  return el("div", { className: "overflow-hidden rounded-[10px] border border-border".split(" ") }, [
    el("div", { className: "flex items-center justify-between border-b border-border bg-muted px-3 py-2 md:px-3.5".split(" ") }, [
      el("span", { className: "font-mono text-[11px] text-muted-foreground".split(" ") }, [texte(String(titre))]),
      el(
        "button",
        {
          type: "button",
          dataCopier: "",
          dataPagefindIgnore: "",
          className: "font-mono text-[11px] text-muted-foreground transition-colors hover:text-brand-text".split(" ")
        },
        [texte("Copier")]
      )
    ]),
    el("div", { className: "overflow-x-auto bg-code p-3 md:p-3.5".split(" ") }, [pre])
  ]);
}

// --- Surlignage Obsidian : ==texte== ---

function surligner(parent) {
  if (!parent.children || ["code", "pre", "script", "style"].includes(parent.tagName)) return;
  parent.children = parent.children.flatMap((n) => {
    if (n.type !== "text" || !n.value.includes("==")) {
      surligner(n);
      return [n];
    }
    const morceaux = n.value.split(/==([^=\n]+)==/);
    return morceaux.map((m, i) => (i % 2 ? el("mark", {}, [texte(m)]) : texte(m))).filter((m) => m.type !== "text" || m.value);
  });
}

// --- Titres de section : mêmes classes et même lien d'ancre que DocPage ---

function ancre(id, libelle) {
  return el(
    "a",
    {
      href: `#${id}`,
      dataAncre: "",
      dataNoPrint: "",
      dataPagefindIgnore: "",
      ariaLabel: `Copier le lien vers la section « ${libelle} »`,
      title: "Copier le lien de cette section",
      className:
        "-my-1 ml-1 inline-flex translate-y-[2px] rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand-text focus-visible:opacity-100 [@media(hover:none)]:opacity-60".split(" ")
    },
    [icone("lien", 15, { dataIconeLien: "" }), icone("coche", 15, { dataIconeCopie: "", className: ["hidden", "text-brand-text"] })]
  );
}

const CLASSES_SECTION = "flex scroll-mt-[88px] flex-col gap-3 md:scroll-mt-24 md:gap-3.5".split(" ");
const CLASSES_H2 = "group m-0 scroll-mt-[88px] text-lg font-semibold tracking-[-0.02em] md:scroll-mt-24 md:text-xl".split(" ");

export function rehypeDocument() {
  return (arbre) => {
    surligner(arbre);

    parcourir(arbre, (n, parent) => {
      if (traites.has(n)) return null;
      if (estElement(n, "blockquote")) return encadre(n);
      if (estElement(n, "p")) return figure(n);
      if (estElement(n, "table")) {
        traites.add(n);
        return el("div", { className: ["tableau"] }, [n]);
      }
      if (estElement(n, "pre")) {
        traites.add(n);
        return blocCode(n);
      }
      // Code en ligne court (adresse, nom de machine, option) : jamais coupé en plein milieu.
      if (estElement(n, "code") && !estElement(parent, "pre") && texteDe(n).length <= 32) {
        ajouterClasses(n, "code-court");
      }
      // Liens vers d'autres pages ou d'autres sites : nouvel onglet. Les ancres de la page
      // (titres, notes de bas de page) restent dans l'onglet courant.
      if (estElement(n, "a") && !String(n.properties.href ?? "#").startsWith("#")) {
        n.properties.target = "_blank";
        n.properties.rel = ["noopener", "noreferrer"];
        n.children.push(el("span", { className: ["sr-only"] }, [texte(" (s'ouvre dans un nouvel onglet)")]));
      }
      return null;
    });

    // Cases des listes de tâches : le texte de la tâche leur sert de libellé (lecteurs d'écran).
    let tache = 0;
    parcourir(arbre, (n) => {
      if (!estElement(n, "li") || !classes(n).includes("task-list-item")) return null;
      const conteneur = estElement(n.children.find((e) => !estVide(e)), "p") ? n.children.find((e) => !estVide(e)) : n;
      const i = conteneur.children.findIndex((e) => estElement(e, "input"));
      if (i === -1) return null;
      const fin = conteneur.children.findIndex((e, k) => k > i && estElement(e) && ["ul", "ol"].includes(e.tagName));
      const texteTache = conteneur.children.splice(i + 1, (fin === -1 ? conteneur.children.length : fin) - i - 1);
      const id = `tache-${++tache}`;
      conteneur.children.splice(i + 1, 0, el("span", { id }, texteTache));
      conteneur.children[i].properties.ariaLabelledBy = id;
      return null;
    });

    // Identifiants de tous les titres, dans l'ordre du document (Astro garde ceux déjà posés).
    const vus = new Map();
    parcourir(arbre, (n) => {
      if (n.type === "element" && /^h[1-6]$/.test(n.tagName) && typeof n.properties.id !== "string") {
        const base = slug(texteDe(n)) || "section";
        const rang = (vus.get(base) ?? 0) + 1;
        vus.set(base, rang);
        n.properties.id = rang === 1 ? base : `${base}-${rang}`;
      }
      return null;
    });

    // Découpage en sections à chaque titre de niveau 2 ; ce qui précède reste en introduction.
    const intro = [];
    const sections = [];
    for (const n of arbre.children) {
      if (estElement(n, "h2")) {
        const libelle = texteDe(n);
        n.properties.className = CLASSES_H2;
        n.children.push(ancre(n.properties.id, libelle));
        sections.push(el("section", { dataDocSection: "", className: CLASSES_SECTION }, [n]));
      } else if (!estVide(n)) {
        (sections.at(-1)?.children ?? intro).push(n);
      }
    }
    arbre.children = [
      ...(intro.length ? [el("div", { className: "flex flex-col gap-3 md:gap-3.5".split(" ") }, intro)] : []),
      ...sections
    ];
  };
}
