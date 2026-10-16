// Types des notes et des write-ups, partagés par les pages, les listes et la recherche.

export type Writeup = {
  title: string;
  desc: string;
  platform: string;
  cat: string;
  diff: "Easy" | "Medium" | "Hard";
  /** JJ.MM.AAAA, comme les notes. */
  date: string;
  /** AAAAMMJJ, pour le tri. */
  ts: number;
  /** Write-up Markdown en attente de validation : visible en développement seulement. */
  brouillon?: boolean;
};

export type VaultNode =
  | { name: string; type: "folder"; children: VaultNode[] }
  | { name: string; type: "note"; desc: string; date: string; diff?: "Easy" | "Medium" | "Hard"; plateforme?: string; parcours?: string; ordre?: number; brouillon?: boolean };

export type DocSection = {
  label: string;
  body?: string;
  defs?: { term: string; text: string }[];
  codeFile?: string;
  code?: string;
  callout?: string;
};

export type Doc = {
  root: "Notes" | "Write-ups";
  crumbs: string[];
  platform: string;
  badge: string;
  meta: string;
  diff?: string;
  summary: string;
  sections: DocSection[];
};
