import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, Search, XCircle } from "lucide-react";
import type { Writeup } from "@/lib/types";
import { annoncer, compter } from "@/lib/annonce";
import { useRechercheTexte } from "@/lib/recherche";

type Tri = "recent" | "ancien" | "difficulte";

const TRIS: { cle: Tri; label: string }[] = [
  { cle: "recent", label: "Plus récents" },
  { cle: "ancien", label: "Plus anciens" },
  { cle: "difficulte", label: "Difficulté" }
];

const RANG = { Easy: 1, Medium: 2, Hard: 3 } as const;
const PASTILLE = { Easy: "bg-easy", Medium: "bg-medium", Hard: "bg-hard" } as const;
const PILULE = "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-xs";

function href(w: Writeup) {
  return (
    "/write-ups/" +
    w.title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "/"
  );
}

function Ligne({ w }: { w: Writeup }) {
  return (
    <a
      href={href(w)}
      className="grid grid-cols-1 gap-[7px] rounded-[14px] border border-border bg-card px-4 py-[14px] shadow-[var(--shadow-sm)] transition-colors hover:border-border-hover hover:bg-surface-hover md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6 md:px-[18px] md:py-4"
    >
      <div className="flex min-w-0 flex-col gap-[7px]">
        {/* Sur mobile, la date est à droite du titre ; sur ordinateur, dans sa colonne à droite de la carte. */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 text-[15px] font-medium tracking-[-0.01em]">{w.title}</span>
          <span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground md:hidden">{w.date}</span>
        </div>
        <span className="text-sm leading-[1.6] text-muted-foreground">{w.desc}</span>
        {/* Sur mobile, faute de place, la catégorie se raccourcit (…) avant que les badges passent à la ligne ; ils n'y passent que sous 3,5 rem de catégorie (très petits écrans). */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={`${PILULE} min-w-0 max-w-max flex-[1000_1_3.5rem] border border-brand-line bg-brand-tint text-brand-text md:flex-none`}>
            <span className="truncate">{w.cat}</span>
          </span>
          <span className={`${PILULE} shrink-0 border border-border text-muted-foreground`}>{w.platform}</span>
          <span className={`${PILULE} shrink-0 gap-[5px] border border-border text-muted-foreground`}>
            <span className={`size-1.5 shrink-0 rounded-full ${PASTILLE[w.diff]}`} />
            {w.diff}
          </span>
        </div>
      </div>
      <span className="hidden pt-0.5 font-mono text-xs whitespace-nowrap text-muted-foreground md:block">{w.date}</span>
    </a>
  );
}

export default function WriteupsBrowser({ writeups }: { writeups: Writeup[] }) {
  const [recherche, setRecherche] = useState("");
  const [plateforme, setPlateforme] = useState("Tous");
  const [tri, setTri] = useState<Tri>("recent");
  const [triOuvert, setTriOuvert] = useState(false);
  const menuTri = useRef<HTMLDivElement>(null);

  // Les trois états vivent dans l'URL : le bouton retour et les liens partagés les retrouvent.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setRecherche(p.get("q") ?? "");
    setPlateforme(p.get("plateforme") ?? "Tous");
    const t = p.get("tri");
    if (t === "recent" || t === "ancien" || t === "difficulte") setTri(t);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (recherche.trim()) p.set("q", recherche.trim());
    if (plateforme !== "Tous") p.set("plateforme", plateforme);
    if (tri !== "recent") p.set("tri", tri);
    const suffixe = p.toString();
    window.history.replaceState(null, "", suffixe ? `?${suffixe}` : window.location.pathname);
  }, [recherche, plateforme, tri]);

  // Échap ferme le menu de tri et rend le focus à son bouton.
  const boutonTri = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!triOuvert) return;
    const echap = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setTriOuvert(false);
      boutonTri.current?.focus();
    };
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [triOuvert]);

  useEffect(() => {
    if (!triOuvert) return;
    const dehors = (e: MouseEvent) => {
      if (!menuTri.current?.contains(e.target as Node)) setTriOuvert(false);
    };
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, [triOuvert]);

  const plateformes = useMemo(() => ["Tous", ...new Set(writeups.map((w) => w.platform))], [writeups]);
  const dansLeTexte = useRechercheTexte(recherche);

  const lignes = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return writeups
      .filter((w) => plateforme === "Tous" || w.platform === plateforme)
      .filter(
        (w) => q === "" || `${w.title} ${w.desc} ${w.cat}`.toLowerCase().includes(q) || dansLeTexte.has(href(w))
      )
      .sort((a, b) =>
        tri === "ancien" ? a.ts - b.ts : tri === "difficulte" ? RANG[b.diff] - RANG[a.diff] : b.ts - a.ts
      );
  }, [writeups, recherche, plateforme, tri, dansLeTexte]);

  const labelTri = TRIS.find((t) => t.cle === tri)!.label;

  // Après une recherche ou un filtre, le nombre de write-ups affichés est annoncé (pas au chargement).
  const premier = useRef(true);
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    const minuterie = window.setTimeout(
      () => annoncer(lignes.length ? `${compter(lignes.length, "write-up")} sur ${writeups.length}` : "Aucun résultat"),
      500
    );
    return () => window.clearTimeout(minuterie);
  }, [lignes.length, recherche, plateforme, writeups.length]);
  const chip = (actif: boolean) =>
    `controle inline-flex h-[42px] shrink-0 items-center whitespace-nowrap rounded-full border px-[13px] text-[13px] font-medium transition-colors md:h-8 md:px-3 ${
      actif ? "border-border-hover bg-muted text-foreground" : "border-border text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col gap-[18px] md:gap-6">
      {/* Recherche et tri */}
      <div className="flex items-stretch gap-2 md:items-center">
        <div className="controle flex h-[42px] min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-border bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:h-9 md:rounded-lg">
          <Search size={15} className="shrink-0 text-muted-foreground" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un write-up..."
            aria-label="Rechercher un write-up"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none md:text-sm"
          />
          {recherche && (
            <button type="button" onClick={() => setRecherche("")} aria-label="Effacer la recherche">
              <XCircle size={15} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="relative shrink-0" ref={menuTri}>
          <button
            type="button"
            ref={boutonTri}
            onClick={() => setTriOuvert((v) => !v)}
            aria-label="Trier"
            aria-expanded={triOuvert}
            className="controle-desktop flex h-full w-11 items-center justify-center rounded-[10px] border border-border transition-colors hover:bg-muted md:h-9 md:w-auto md:gap-2 md:rounded-lg md:px-3 md:text-[13px] md:font-medium"
          >
            <ArrowUpDown size={20} className="md:hidden" />
            <span className="hidden md:inline">{labelTri}</span>
            <ChevronDown size={14} className="hidden text-muted-foreground md:block" />
          </button>
          {triOuvert && (
            <div className="absolute top-[calc(100%+6px)] right-0 z-30 min-w-[180px] rounded-[10px] border border-border bg-card p-1 shadow-[var(--shadow-md)]">
              {TRIS.map((t) => (
                <button
                  key={t.cle}
                  type="button"
                  onClick={() => {
                    setTri(t.cle);
                    setTriOuvert(false);
                  }}
                  className={`flex h-11 w-full items-center rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-muted md:h-8 md:text-[13px] ${
                    tri === t.cle ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plateformes et compteur */}
      <div className="flex min-h-11 items-center gap-2.5 md:min-h-8 md:justify-between md:gap-3">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex-none md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {plateformes.map((p) => (
            <button key={p} type="button" onClick={() => setPlateforme(p)} className={chip(p === plateforme)}>
              {p}
            </button>
          ))}
        </div>
        <span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground">
          {lignes.length} / {writeups.length}
        </span>
      </div>

      {/* Résultats */}
      {lignes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {lignes.map((w) => (
            <Ligne key={w.title} w={w} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 py-12 md:py-14">
          <span className="text-[15px] font-medium">Aucun résultat</span>
          <button
            type="button"
            onClick={() => {
              setRecherche("");
              setPlateforme("Tous");
            }}
            className="controle mt-1.5 inline-flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-medium transition-colors hover:bg-muted md:h-8 md:rounded-lg md:px-3.5 md:text-[13px]"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
