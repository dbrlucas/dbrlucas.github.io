// Thèmes de coloration du code : github-light et github-dark, avec les couleurs qui n'atteignaient
// pas le contraste minimal (4,5:1) sur le fond des blocs corrigées juste assez. Fond clair #fafafa,
// fond sombre #141414 (--code-bg dans global.css).
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";

const REMPLACEMENTS = {
  "#22863a": "#218339", // vert : 4,43 → 4,60
  "#d73a49": "#d13847", // rouge : 4,38 → 4,61
  "#e36209": "#bc5107" // orange : 3,34 → 4,66
};

export const themeCodeClair = {
  ...JSON.parse(JSON.stringify(githubLight).replace(/#(22863a|d73a49|e36209)\b/gi, (c) => REMPLACEMENTS[c.toLowerCase()])),
  name: "github-light-contraste"
};

// En sombre, seuls les commentaires étaient trop pâles : 3,83 → 4,66.
export const themeCodeSombre = {
  ...JSON.parse(JSON.stringify(githubDark).replace(/#6a737d\b/gi, "#78818b")),
  name: "github-dark-contraste"
};
