import { supabaseAdmin } from "@/lib/supabase/server";
import type { Notebook } from "@/lib/types";
import { GananciasView } from "@/components/GananciasView";

export const dynamic = "force-dynamic";

export default async function GananciasPage() {
  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .select("*")
    .eq("disponible", false)
    .order("vendido_en", { ascending: false });

  if (error) {
    return <p className="text-sm text-danger">Error cargando ventas: {error.message}</p>;
  }

  return <GananciasView vendidas={(data ?? []) as Notebook[]} />;
}
