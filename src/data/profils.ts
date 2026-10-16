// Profils affichés en haut de l'accueil (src/pages/index.astro). Vrai contenu, édité à la main ici.

export type Profile = {
  /** Nom de la plateforme. */
  name: string;
  /** Indicateur mis en avant (rang, points, statut…). */
  metric: string;
  /** Adresse affichée, sans le protocole. */
  handle: string;
  /** Lien complet vers le profil. */
  url: string;
};

export const profiles: Profile[] = [
  { name: "TryHackMe", metric: "Top 2%", handle: "tryhackme.com/p/dbrlucas", url: "https://tryhackme.com/p/dbrlucas" },
  { name: "Root-Me", metric: "1 410 pts", handle: "root-me.org/dbrlucas", url: "https://www.root-me.org/dbrlucas" }
];
