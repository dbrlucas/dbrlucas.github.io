// Convertit un dossier du coffre Obsidian en brouillons de notes pour le site.
// Le coffre n'est jamais modifié : le script le lit, et écrit uniquement dans src/content/notes/.
// Il ne fait que le travail mécanique (en-tête, rangement, nettoyage) ; chaque brouillon est ensuite
// reformulé à la main, puis publié en retirant `brouillon: true`.
//
//   node scripts/importer-notes.mjs --coffre "<dossier du coffre>" --liste
//   node scripts/importer-notes.mjs --coffre "<dossier du coffre>" "TryHackMe/SOC Level 1/Blue Team Introduction"
//
// Le dossier du coffre peut aussi venir de la variable d'environnement COFFRE_OBSIDIAN.
// Un fichier déjà présent dans src/content/notes/ n'est jamais écrasé.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DESTINATION = "src/content/notes";

const args = process.argv.slice(2);
const option = (nom) => {
  const i = args.indexOf(nom);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const coffre = option("--coffre") ?? process.env.COFFRE_OBSIDIAN;
const lister = args.includes("--liste");
const module_ = args.find((a) => !a.startsWith("--"));

if (!coffre || (!lister && !module_)) {
  console.error('Usage : node scripts/importer-notes.mjs --coffre "<dossier du coffre>" (--liste | "<dossier à importer>")');
  process.exit(1);
}

/** « Cyber_Security_101 » → « Cyber Security 101 » : le nom du dossier est celui affiché sur le site. */
const nomAffiche = (nom) => nom.replaceAll("_", " ").replace(/\s+/g, " ").trim();

/** Nom de la room d'après le fichier : « Nmap_The_Basics » → « Nmap: The Basics ». */
const titreDe = (fichier) => nomAffiche(path.basename(fichier, ".md")).replace(/ The Basics$/, ": The Basics");

/** Windows refuse certains caractères dans les noms de fichiers (« : » en particulier). */
const nomDeFichier = (titre) => titre.replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, " ").trim() + ".md";

async function fichiersMarkdown(dossier) {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const listes = await Promise.all(
    entrees.map((e) => {
      const chemin = path.join(dossier, e.name);
      return e.isDirectory() ? fichiersMarkdown(chemin) : e.name.endsWith(".md") ? [chemin] : [];
    })
  );
  return listes.flat().sort();
}

/** Parcours dont les modules sont rangés directement à la racine des notes, sans dossier du parcours. */
const PARCOURS_A_PLAT = ["Cyber_Security_101"];

/** Dossiers d'une note dans le coffre : plateforme, parcours, puis module éventuel. */
const dossiersDe = (fichier) => path.relative(coffre, path.dirname(fichier)).split(path.sep);

/** Emplacement du brouillon : sans le dossier de la plateforme, ni celui des parcours mis à plat. */
function destinationDe(fichier) {
  const [, ...dossiers] = dossiersDe(fichier);
  if (PARCOURS_A_PLAT.includes(dossiers[0])) dossiers.shift();
  return path.join(DESTINATION, ...dossiers.map(nomAffiche), nomDeFichier(titreDe(fichier)));
}

/** Sections du gabarit Obsidian, repérées par leur titre de niveau 2 (« ## :LiBrain: Définitions »). */
function sections(corps) {
  const resultat = {};
  let courante = null;
  for (const ligne of corps.split("\n")) {
    const titre = /^## (?::Li\w+: )?(.+?)\s*$/.exec(ligne);
    if (titre) courante = resultat[titre[1]] = [];
    else if (courante && ligne.trim() !== "---") courante.push(ligne);
  }
  return Object.fromEntries(Object.entries(resultat).map(([nom, lignes]) => [nom, lignes.join("\n").trim()]));
}

/** Les « < » hors code seraient lus comme des balises HTML (« <fichier> » dans une phrase). */
function echapperChevrons(texte) {
  let dansBloc = false;
  return texte
    .split("\n")
    .map((ligne) => {
      if (ligne.trimStart().startsWith("```")) dansBloc = !dansBloc;
      if (dansBloc) return ligne;
      return ligne
        .split(/(`[^`]*`)/)
        .map((morceau, i) => (i % 2 ? morceau : morceau.replaceAll("<", "&lt;")))
        .join("");
    })
    .join("\n");
}

function nettoyer(texte, images) {
  return echapperChevrons(
    texte
      // Image intégrée : signalée, à traiter à la main (schéma de la plateforme ou capture personnelle).
      .replace(/!\[\[([^\]]+)\]\]/g, (_, nom) => {
        images.push(nom);
        return `> [!todo] Image d'origine à traiter : ${nom}`;
      })
      // Lien interne Obsidian : seul le nom de la note est gardé.
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, cible, alias) => alias ?? nomAffiche(cible))
      .replace(/\t/g, "    ")
      .replace(/\n{3,}/g, "\n\n")
  );
}

async function convertir(fichier) {
  const source = (await readFile(fichier, "utf8")).replace(/\r\n/g, "\n");
  const entete = /^---\n([\s\S]*?)\n---\n/.exec(source);
  const date = /^date:\s*(\d{2})-(\d{2})-(\d{4})\s*$/m.exec(entete?.[1] ?? "");
  const parties = sections(source.slice(entete?.[0].length ?? 0));
  const lien = /https:\/\/tryhackme\.com\/room\/[\w-]+/.exec(parties["Ressources"] ?? "")?.[0];

  const images = [];
  const corps = ["Définitions", "Commandes", "Notes"]
    .filter((nom) => parties[nom])
    .map((nom) => `## ${nom}\n\n${nettoyer(parties[nom], images)}`)
    .join("\n\n");

  const titre = titreDe(fichier);
  const [plateforme, parcours] = dossiersDe(fichier).map(nomAffiche);
  const texte = [
    "---",
    `titre: ${JSON.stringify(titre)}`,
    'description: ""',
    ...(date ? [`date: "${date[1]}.${date[2]}.${date[3]}"`] : ['date: "01.01.1970"']),
    `plateforme: ${JSON.stringify(plateforme)}`,
    ...(parcours ? [`parcours: ${JSON.stringify(parcours)}`] : []),
    ...(lien ? [`lien: "${lien}"`] : []),
    "brouillon: true",
    "---",
    "",
    "> [!warning] Conversion automatique",
    "> Note convertie depuis le coffre Obsidian, pas encore reformulée.",
    "",
    corps,
    ""
  ].join("\n");

  return { titre, texte, vide: corps === "", lien, date: Boolean(date), images };
}

if (lister) {
  // Avancement : pour chaque dossier du coffre, combien de notes ont déjà leur fichier sur le site.
  const parDossier = new Map();
  for (const fichier of await fichiersMarkdown(coffre)) {
    const dossier = path.relative(coffre, path.dirname(fichier)).split(path.sep).join("/");
    const compte = parDossier.get(dossier) ?? { total: 0, faits: 0 };
    compte.total++;
    if (existsSync(destinationDe(fichier))) compte.faits++;
    parDossier.set(dossier, compte);
  }
  for (const [dossier, { total, faits }] of parDossier) console.log(`${String(faits).padStart(2)} / ${String(total).padEnd(2)}  ${dossier}`);
} else {
  for (const fichier of await fichiersMarkdown(path.join(coffre, module_))) {
    const destination = destinationDe(fichier);
    if (existsSync(destination)) {
      console.log(`déjà là      ${destination}`);
      continue;
    }
    const note = await convertir(fichier);
    if (note.vide) {
      console.log(`vide, ignoré ${path.basename(fichier)}`);
      continue;
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, note.texte, "utf8");
    const remarques = [
      !note.lien && "lien de la room introuvable",
      !note.date && "date introuvable",
      note.images.length && `${note.images.length} image(s) à traiter`
    ].filter(Boolean);
    console.log(`brouillon    ${destination}${remarques.length ? `  (${remarques.join(", ")})` : ""}`);
  }
}
