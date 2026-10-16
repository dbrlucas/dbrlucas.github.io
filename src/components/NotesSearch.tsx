import { useEffect, useMemo, useState } from "react";
import { Search, XCircle } from "lucide-react";
import { useRechercheTexte } from "@/lib/recherche";
import { annoncer, compter } from "@/lib/annonce";

export type NoteRecherchable = {
  nom: string;
  desc: string;
  date: string;
  diff?: "Easy" | "Medium" | "Hard";
  plateforme?: string;
  parcours?: string;
  chemin: string[];
  href: string;
};

const PASTILLE = { Easy: "bg-easy", Medium: "bg-medium", Hard: "bg-hard" } as const;
const PILULE = "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-xs";

export default function NotesSearch({ notes }: { notes: NoteRecherchable[] }) {
  const [recherche, setRecherche] = useState("");
  const q = recherche.trim().toLowerCase();
  const dansLeTexte = useRechercheTexte(recherche);

  // Tant que la recherche est vide, on laisse voir le parcours des dossiers rendu par la page.
  useEffect(() => {
    const parcours = document.querySelector<HTMLElement>("[data-parcours]");
    if (parcours) parcours.hidden = q !== "";
  }, [q]);

  const resultats = useMemo(
    () =>
      q === ""
        ? []
        : notes.filter(
            (n) =>
              `${n.nom} ${n.desc} ${n.chemin.join(" ")} ${n.plateforme ?? ""} ${n.parcours ?? ""}`.toLowerCase().includes(q) ||
              dansLeTexte.has(n.href)
          ),
    [notes, q, dansLeTexte]
  );

  useEffect(() => {
    if (q === "") return;
    const minuterie = window.setTimeout(
      () => annoncer(resultats.length ? compter(resultats.length, "note trouvée", "notes trouvées") : "Aucun résultat"),
      500
    );
    return () => window.clearTimeout(minuterie);
  }, [q, resultats.length]);

  return (
    <>
      <div className="controle flex h-[42px] items-center gap-2 rounded-[10px] border border-border bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:h-9 md:rounded-lg">
        <Search size={15} className="shrink-0 text-muted-foreground" />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une note..."
          aria-label="Rechercher une note"
          className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none md:text-sm"
        />
        {recherche && (
          <button type="button" onClick={() => setRecherche("")} aria-label="Effacer la recherche">
            <XCircle size={15} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {q !== "" &&
        (resultats.length > 0 ? (
          <div className="flex flex-col gap-3">
            {resultats.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="grid grid-cols-1 gap-[7px] rounded-[14px] border border-border bg-card px-4 py-[14px] shadow-[var(--shadow-sm)] transition-colors hover:border-border-hover hover:bg-surface-hover md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6 md:px-[18px] md:py-4"
              >
                <span className="flex min-w-0 flex-col gap-[7px]">
                  {/* Sur mobile, la date est à droite du titre ; sur ordinateur, dans sa colonne à droite de la carte. */}
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-[15px] font-medium tracking-[-0.01em]">{n.nom}</span>
                    <span className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground md:hidden">{n.date}</span>
                  </span>
                  <span className="text-sm leading-[1.6] text-muted-foreground">{n.desc}</span>
                  {/* Sur mobile, faute de place, la catégorie se raccourcit (…) avant que les badges passent à la ligne ; ils n'y passent que sous 3,5 rem de catégorie (très petits écrans). */}
                  <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {n.parcours && (
                      <span className={`${PILULE} min-w-0 max-w-max flex-[1000_1_3.5rem] border border-brand-line bg-brand-tint text-brand-text md:flex-none`}>
                        <span className="truncate">{n.parcours}</span>
                      </span>
                    )}
                    {n.plateforme && (
                      <span className={`${PILULE} shrink-0 border border-border text-muted-foreground`}>{n.plateforme}</span>
                    )}
                    {n.diff && (
                      <span className={`${PILULE} shrink-0 gap-[5px] border border-border text-muted-foreground`}>
                        <span className={`size-1.5 shrink-0 rounded-full ${PASTILLE[n.diff]}`} />
                        {n.diff}
                      </span>
                    )}
                  </span>
                </span>
                <span className="hidden pt-0.5 font-mono text-xs whitespace-nowrap text-muted-foreground md:block">
                  {n.date}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-10 md:py-12">
            <span className="text-[15px] font-medium">Aucun résultat</span>
            <button
              type="button"
              onClick={() => setRecherche("")}
              className="controle mt-1.5 inline-flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-medium transition-colors hover:bg-muted md:h-8 md:rounded-lg md:px-3.5 md:text-[13px]"
            >
              Réinitialiser
            </button>
          </div>
        ))}
    </>
  );
}
