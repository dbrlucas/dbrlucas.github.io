// Projets affichés sur l'accueil et la page Projets, édités à la main ici.
// L'accueil met les deux premiers en avant (src/pages/index.astro) ; les plus récents d'abord.

export type Project = {
  title: string;
  desc: string;
  tags: string[];
  /** Plage de dates affichée, par exemple « Oct. 2026 – présent ». */
  periode: string;
  /** Lien facultatif (code, page du challenge…) ; absent quand il n'y a rien à partager publiquement. */
  lien?: { href: string; label: string };
};

export const projects: Project[] = [
  {
    title: "Attaques supply chain sur Kubernetes",
    desc: "Projet de recherche annuel de Master, en équipe de 4, encadré par une entreprise partenaire. L'objectif est double : dresser un état de l'art des attaques de la supply chain logicielle et de la sécurisation de Kubernetes, puis construire une plateforme (cluster, chaîne CI/CD et registre d'images) pour simuler ces attaques, les détecter et y répondre.",
    tags: ["Kubernetes", "Supply chain", "CI/CD", "Détection"],
    periode: "Oct. 2026 – Présent"
  },
  {
    title: "Organisation du CTF Cyber&Spice",
    desc: "Co-organisation d'un CTF en présentiel réunissant une centaine de participants. J'ai conçu des challenges forensic (image disque, exfiltration DNS, compromission par webshell), testé ceux des autres organisateurs, puis rédigé les solutions et les indices. J'ai aussi participé à la mise en place de l'infrastructure et à l'accompagnement des participants le jour de l'événement.",
    tags: ["CTF", "Forensic", "Infrastructure"],
    periode: "Janv. – Mai 2026"
  }
];
