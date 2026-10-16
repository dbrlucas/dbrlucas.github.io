/**
 * Annonce un message aux lecteurs d'écran (copie effectuée, nombre de résultats…), par la zone
 * « polite » placée dans Base.astro. La zone est vidée puis remplie pour qu'un même message
 * répété soit de nouveau annoncé.
 */
export function annoncer(texte: string) {
  const zone = document.getElementById("annonces");
  if (!zone) return;
  zone.textContent = "";
  window.setTimeout(() => {
    zone.textContent = texte;
  }, 60);
}

/** « 3 notes », « 1 note », « 0 note ». */
export function compter(n: number, singulier: string, pluriel = `${singulier}s`) {
  return `${n} ${n > 1 ? pluriel : singulier}`;
}
