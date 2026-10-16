// Génère la photo de profil et les icônes du site à partir des deux portraits sources
// (src/assets/profil/photo-clair.jpg et photo-sombre.jpg, 1024 × 1024, même visage, fond clair ou sombre).
// À relancer si les portraits changent : node scripts/generer-photo.mjs
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = (version) => `src/assets/profil/photo-${version}.jpg`;

/** Icône carrée aux coins arrondis (19 % du côté, comme les 14 px de la photo en 96 px), fond transparent. */
const icone = (version, taille) => {
  const rayon = Math.round(taille * 0.19);
  return sharp(source(version))
    .resize(taille, taille)
    .composite([
      {
        input: Buffer.from(`<svg width="${taille}" height="${taille}"><rect width="${taille}" height="${taille}" rx="${rayon}"/></svg>`),
        blend: "dest-in"
      }
    ])
    .png()
    .toBuffer();
};

/** Fichier .ico contenant des images PNG (format accepté par tous les navigateurs actuels). */
function ico(images) {
  const entete = Buffer.alloc(6 + 16 * images.length);
  entete.writeUInt16LE(0, 0);
  entete.writeUInt16LE(1, 2);
  entete.writeUInt16LE(images.length, 4);
  let decalage = entete.length;
  images.forEach(({ taille, png }, i) => {
    const e = 6 + 16 * i;
    entete.writeUInt8(taille, e);
    entete.writeUInt8(taille, e + 1);
    entete.writeUInt16LE(1, e + 4);
    entete.writeUInt16LE(32, e + 6);
    entete.writeUInt32LE(png.length, e + 8);
    entete.writeUInt32LE(decalage, e + 12);
    decalage += png.length;
  });
  return Buffer.concat([entete, ...images.map((i) => i.png)]);
}

// Photo de l'accueil : 288 px, soit trois fois les 96 px affichés, pour rester nette sur les écrans haute densité.
for (const version of ["clair", "sombre"]) {
  await sharp(source(version)).resize(288, 288).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/avatar-${version}.jpg`);
}

// Favicons de l'onglet : un par thème du site. Le script de thème (Base.astro, Header.astro) choisit le
// bon au chargement et au clic sur le bouton de thème : l'icône suit la page, pas le navigateur.
for (const version of ["clair", "sombre"]) {
  await writeFile(`public/favicon-${version}.png`, await icone(version, 64));
}

// Favicon .ico, version sombre (thème par défaut du site) : requêtes directes de /favicon.ico
// (lecteurs de flux, favoris…).
const tailles = [16, 32, 48];
await writeFile("public/favicon.ico", ico(await Promise.all(tailles.map(async (taille) => ({ taille, png: await icone("sombre", taille) })))));

// Écran d'accueil iOS, version sombre (thème par défaut du site) : carré et opaque, iOS arrondit lui-même les coins.
await sharp(source("sombre")).resize(180, 180).png().toFile("public/apple-touch-icon.png");

console.log("Images générées : avatar-clair.jpg, avatar-sombre.jpg, favicon-clair.png, favicon-sombre.png, favicon.ico, apple-touch-icon.png.");
