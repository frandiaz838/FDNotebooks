import { supabaseAdmin } from "@/lib/supabase/server";
import type { Notebook } from "@/lib/types";
import { GananciasView } from "@/components/GananciasView";

export const dynamic = "force-dynamic";

export default async function GananciasPage() {
  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .select("*")
    .eq("disponible", false)
    .eq("suspendida", false)
    .order("vendido_en", { ascending: false });

  // Lo toma error.tsx, que muestra el estado de error con reintento.
  if (error) {
    throw new Error(`No se pudieron cargar las ventas: ${error.message}`);
  }

  return <GananciasView vendidas={(data ?? []) as Notebook[]} />;
}
