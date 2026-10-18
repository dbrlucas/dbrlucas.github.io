import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRechercheTexte } from "@/lib/recherche";
import { annoncer, compter } from "@/lib/annonce";

/** Une note dans /index-notes.json, un write-up dans /index-writeups.json. */
type NoteIndex = { nom: string; desc: string; dossier: string; href: string };
type WriteupIndex = { titre: string; desc: string; plateforme: string; cat: string; href: string };

/** Listes téléchargées une seule fois, à la première ouverture de la recherche. */
let chargementNotes: Promise<NoteIndex[]> | null = null;
const chargerNotes = () =>
  (chargementNotes ??= fetch("/index-notes.json")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []));
let chargementWriteups: Promise<WriteupIndex[]> | null = null;
const chargerWriteups = () =>
  (chargementWriteups ??= fetch("/index-writeups.json")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []));

/** `extrait` : passage du texte où le terme apparaît, quand le titre ne le contient pas. */
type Entree = { label: string; indice: string; href: string; extrait?: string };

/** Titres d'abord, puis documents trouvés seulement dans leur texte. */
function fusionner(parTitre: Entree[], tous: Entree[], dansLeTexte: Map<string, string>): Entree[] {
  const dejaLa = new Set(parTitre.map((e) => e.href));
  const parTexte = tous
    .filter((e) => !dejaLa.has(e.href) && dansLeTexte.has(e.href))
    .map((e) => ({ ...e, extrait: dansLeTexte.get(e.href) }));
  return [...parTitre, ...parTexte].slice(0, 5);
}

const PAGES: Entree[] = [
  { label: "Accueil", indice: "Page", href: "/" },
  { label: "Write-ups", indice: "Page", href: "/write-ups/" },
  { label: "Notes", indice: "Page", href: "/notes/" },
  { label: "Projets", indice: "Page", href: "/projets/" }
];

export default function CommandPalette() {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [notes, setNotes] = useState<NoteIndex[]>([]);
  const [writeups, setWriteups] = useState<WriteupIndex[]>([]);
  const champ = useRef<HTMLInputElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  /** Élément qui avait le focus à l'ouverture : il le retrouve à la fermeture. */
  const precedent = useRef<HTMLElement | null>(null);
  const dansLeTexte = useRechercheTexte(recherche);
  /** État d'ouverture lisible depuis les écouteurs d'événements, posés une seule fois. */
  const ouvertRef = useRef(false);
  ouvertRef.current = ouvert;

  /**
   * L'ouverture ajoute une étape à l'historique : le bouton Retour du téléphone (ou du navigateur)
   * referme la recherche au lieu de quitter la page. Fermer autrement retire cette étape.
   */
  const fermer = () => {
    if (history.state?.rechercheOuverte) history.back();
    else setOuvert(false);
  };
  /**
   * Un résultat choisi retire d'abord l'étape d'historique de la recherche, puis ouvre la page :
   * sinon il faudrait appuyer deux fois sur Retour pour quitter la page d'origine.
   */
  const destination = useRef<string | null>(null);
  const aller = (ev: React.MouseEvent, href: string) => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (!history.state?.rechercheOuverte) return;
    ev.preventDefault();
    destination.current = href;
    history.back();
  };

  useEffect(() => {
    const ouvrir = () => {
      if (!ouvertRef.current) {
        precedent.current = document.activeElement as HTMLElement | null;
        history.pushState({ ...history.state, rechercheOuverte: true }, "");
      }
      setRecherche("");
      setOuvert(true);
      chargerNotes().then(setNotes);
      chargerWriteups().then(setWriteups);
    };
    const retour = () => {
      if (destination.current) {
        const href = destination.current;
        destination.current = null;
        window.location.assign(href);
        return;
      }
      if (ouvertRef.current && !history.state?.rechercheOuverte) setOuvert(false);
    };
    window.addEventListener("popstate", retour);
    document.querySelectorAll("[data-ouvrir-recherche]").forEach((b) => b.addEventListener("click", ouvrir));
    const clavier = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ouvrir();
      }
      if (e.key === "Escape" && ouvertRef.current) fermer();
    };
    window.addEventListener("keydown", clavier);
    return () => {
      document.querySelectorAll("[data-ouvrir-recherche]").forEach((b) => b.removeEventListener("click", ouvrir));
      window.removeEventListener("keydown", clavier);
      window.removeEventListener("popstate", retour);
    };
  }, []);

  useEffect(() => {
    if (ouvert) champ.current?.focus();
    else if (precedent.current) {
      precedent.current.focus();
      precedent.current = null;
    }
  }, [ouvert]);

  const q = recherche.trim().toLowerCase();
  const groupes = useMemo(() => {
    // Tant que rien n'est tapé, seules les pages du site sont proposées.
    if (q === "") return [{ titre: "Pages", entrees: PAGES }];
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q));
    const tousW = writeups.map((x) => ({ label: x.titre, indice: x.plateforme, href: x.href, cle: `${x.titre} ${x.cat}` }));
    const tousN = notes.map((x) => ({ label: x.nom, indice: x.dossier, href: x.href, cle: `${x.nom} ${x.desc}` }));
    const parTitre = (liste: (Entree & { cle: string })[]) =>
      liste.filter((x) => x.cle.toLowerCase().includes(q)).slice(0, 3);
    const w = fusionner(parTitre(tousW), tousW, dansLeTexte);
    const n = fusionner(parTitre(tousN), tousN, dansLeTexte);
    return [
      { titre: "Pages", entrees: pages },
      { titre: "Write-ups", entrees: w },
      { titre: "Notes", entrees: n }
    ].filter((g) => g.entrees.length > 0);
  }, [q, dansLeTexte, notes, writeups]);

  // Nombre de résultats annoncé aux lecteurs d'écran, une fois la frappe terminée.
  const nombre = groupes.reduce((n, g) => n + g.entrees.length, 0);
  useEffect(() => {
    if (!ouvert || q === "") return;
    const minuterie = window.setTimeout(() => annoncer(nombre ? compter(nombre, "résultat") : "Aucun résultat"), 500);
    return () => window.clearTimeout(minuterie);
  }, [ouvert, q, nombre]);

  /** Tab reste dans la palette ; les flèches passent du champ aux résultats et entre eux. */
  const clavier = (e: React.KeyboardEvent) => {
    const cibles = [...(panneau.current?.querySelectorAll<HTMLElement>("input, a[href], button") ?? [])];
    const i = cibles.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Tab" && cibles.length) {
      e.preventDefault();
      cibles[(i + (e.shiftKey ? -1 : 1) + cibles.length) % cibles.length].focus();
    }
    const liens = [champ.current, ...(panneau.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])].filter(Boolean) as HTMLElement[];
    const j = liens.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      liens[Math.min(liens.length - 1, Math.max(0, j + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
    }
  };

  if (!ouvert) return null;

  return (
    <>
      <div
        onClick={fermer}
        className="fixed inset-0 z-40 bg-black/45"
        aria-hidden="true"
      />
      <div
        ref={panneau}
        onKeyDown={clavier}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className="fixed top-[68px] right-3 left-3 z-50 overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.3)] md:top-[110px] md:right-auto md:left-1/2 md:w-[520px] md:-translate-x-1/2"
      >
        <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-3.5 md:h-12">
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <input
            ref={champ}
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher sur le site"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none md:text-sm"
          />
          <button
            type="button"
            onClick={fermer}
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Fermer
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 md:max-h-[420px]">
          {groupes.length === 0 ? (
            <p className="px-2.5 py-8 text-center text-[15px] text-muted-foreground md:text-sm">Aucun résultat.</p>
          ) : (
            groupes.map((g) => (
              <div key={g.titre} className="flex flex-col">
                <span className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
                  {g.titre}
                </span>
                {g.entrees.map((e) => (
                  <a
                    key={e.href}
                    href={e.href}
                    onClick={(ev) => aller(ev, e.href)}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted md:min-h-0"
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[15px] md:text-sm">{e.label}</span>
                      {e.extrait && (
                        <span
                          className="line-clamp-2 text-xs leading-[1.5] text-muted-foreground [&_mark]:rounded-sm [&_mark]:bg-brand-tint [&_mark]:px-0.5 [&_mark]:text-brand-text"
                          dangerouslySetInnerHTML={{ __html: e.extrait }}
                        />
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                      {e.indice}
                    </span>
                  </a>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
