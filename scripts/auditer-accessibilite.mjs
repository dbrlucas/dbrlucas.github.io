// Audit d'accessibilité automatique (axe-core, règles WCAG 2.1 A et AA) sur le site construit.
// Prérequis : npm run build, puis npx astro preview --port 4322.
//
//   node scripts/auditer-accessibilite.mjs [http://localhost:4322]

import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = process.argv[2] ?? "http://localhost:4322";
const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AXE = fs.readFileSync(path.join(RACINE, "node_modules", "axe-core", "axe.min.js"), "utf8");
const NAVIGATEUR = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright", "chromium-1246", "chrome-win64", "chrome.exe");

const NOTE_MD = "/notes/networking/nmap-the-basics/";

/** Pages et états à auditer ; `action` ouvre un élément avant l'audit. */
const PAGES = [
  { nom: "accueil", url: "/" },
  { nom: "write-ups", url: "/write-ups/" },
  { nom: "write-ups, tri ouvert", url: "/write-ups/", action: (p) => p.locator('button[aria-label="Trier"]').click(), bureau: true },
  { nom: "write-up", url: "/write-ups/attacktive-directory/" },
  { nom: "notes", url: "/notes/" },
  { nom: "dossier", url: "/notes/networking/" },
  { nom: "note Markdown", url: NOTE_MD },
  { nom: "projets", url: "/projets/" },
  { nom: "404", url: "/page-qui-n-existe-pas" },
  { nom: "palette de recherche", url: "/", action: (p) => p.keyboard.press("Control+k") },
  { nom: "menu mobile", url: "/", action: (p) => p.locator("[data-menu-toggle]").click(), mobile: true }
];

const FORMATS = [
  { cle: "bureau", viewport: { width: 1280, height: 900 } },
  { cle: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
];

const navigateur = await chromium.launch({ executablePath: NAVIGATEUR });
const constats = new Map(); // règle → { impact, aide, occurrences: Set<"page · format · thème → élément"> }

for (const theme of ["light", "dark"]) {
  for (const format of FORMATS) {
    const ctx = await navigateur.newContext({ viewport: format.viewport, isMobile: format.isMobile, hasTouch: format.hasTouch });
    await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await ctx.newPage();
    for (const cible of PAGES) {
      if (cible.mobile && format.cle !== "mobile") continue;
      if (cible.bureau && format.cle !== "bureau") continue;
      await page.goto(SITE + cible.url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (cible.action) {
        await cible.action(page);
        await page.waitForTimeout(400);
      }
      await page.addScriptTag({ content: AXE });
      const resultat = await page.evaluate(() =>
        window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } })
      );
      for (const v of resultat.violations) {
        const c = constats.get(v.id) ?? { impact: v.impact, aide: v.help, occurrences: new Set() };
        for (const n of v.nodes) {
          const detail = n.any?.[0]?.message ?? n.all?.[0]?.message ?? "";
          c.occurrences.add(`${cible.nom} · ${format.cle} · ${theme === "dark" ? "sombre" : "clair"} → ${n.target.join(" ")}${detail ? `  (${detail.slice(0, 240)})` : ""}`);
        }
        constats.set(v.id, c);
      }
    }
    await ctx.close();
  }
}
await navigateur.close();

const ordre = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const tries = [...constats.entries()].sort((a, b) => ordre[a[1].impact] - ordre[b[1].impact]);
if (tries.length === 0) console.log("Aucune violation détectée.");
for (const [regle, c] of tries) {
  console.log(`\n[${c.impact}] ${regle} — ${c.aide} (${c.occurrences.size} occurrence(s))`);
  if (regle === "color-contrast") {
    // Regroupement par couple de couleurs : c'est le jeton de couleur qu'il faut corriger.
    const couples = new Map();
    for (const o of c.occurrences) {
      const m = /contrast of ([\d.]+) \(foreground color: (#\w+), background color: (#\w+), font size: ([\d.]+pt)/.exec(o);
      const cle = m ? `${m[1]} : ${m[2]} sur ${m[3]} (${m[4]})` : "autre";
      const liste = couples.get(cle) ?? [];
      liste.push(o.split(" → ")[0] + " → " + o.split(" → ")[1].split("  (")[0].slice(-60));
      couples.set(cle, liste);
    }
    for (const [cle, liste] of couples) console.log(`   ${liste.length} × ${cle}
      ex. ${liste[0]}`);
    continue;
  }
  for (const o of [...c.occurrences].slice(0, 12)) console.log("   " + o);
  if (c.occurrences.size > 12) console.log(`   … ${c.occurrences.size - 12} autres`);
}
