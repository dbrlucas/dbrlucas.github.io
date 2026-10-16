import type { APIRoute, GetStaticPaths } from "astro";
import { tousLesApercus, type Apercu } from "@/lib/apercus";
import { imageApercu } from "@/lib/image-apercu";

/** Une image d'aperçu par page : /og/accueil.png, /og/write-ups/sherlock-brutus.png… */
export const getStaticPaths = (async () =>
  (await tousLesApercus()).map((apercu) => ({
    params: { chemin: apercu.chemin === "/" ? "accueil" : apercu.chemin.slice(1) },
    props: { apercu }
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await imageApercu((props as { apercu: Apercu }).apercu)), {
    headers: { "Content-Type": "image/png" }
  });
