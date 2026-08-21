import { Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Notebook } from "@/lib/types";
import { NotebookGrid } from "@/components/NotebookGrid";
import { Filters } from "@/components/Filters";
import { AboutSection } from "@/components/AboutSection";
import { FaqSection } from "@/components/FaqSection";

export const dynamic = "force-dynamic";

async function getNotebooks(marca?: string, categoria?: string, orden?: string) {
  let query = supabase.from("notebooks").select("*").eq("disponible", true);

  if (marca) {
    query = query.eq("marca", marca);
  }

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  if (orden === "asc") {
    query = query.order("precio", { ascending: true });
  } else if (orden === "desc") {
    query = query.order("precio", { ascending: false });
  } else {
    query = query.order("destacado", { ascending: false }).order("creado_en", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error cargando notebooks:", error.message);
    return [];
  }
  return (data ?? []) as Notebook[];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; categoria?: string; orden?: string }>;
}) {
  const { marca, categoria, orden } = await searchParams;
  const notebooks = await getNotebooks(marca, categoria, orden);

  const { data: todas } = await supabase.from("notebooks").select("marca").eq("disponible", true);
  const marcas = Array.from(new Set((todas ?? []).map((n) => n.marca))).sort();

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-[linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Equipos disponibles
          </h1>
          <p className="max-w-xl text-sm text-white/80">
            Revisados y listos para usar. Coordinamos por WhatsApp y lo probás en persona antes
            de decidir.
          </p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <Suspense fallback={null}>
          <Filters marcas={marcas} />
        </Suspense>
        <NotebookGrid notebooks={notebooks} />
        <AboutSection />
        <FaqSection />
      </div>
    </div>
  );
}
