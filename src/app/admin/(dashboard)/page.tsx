import { supabaseAdmin } from "@/lib/supabase/server";
import type { Notebook } from "@/lib/types";
import { AdminNotebookList } from "@/components/AdminNotebookList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Error cargando notebooks: {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Publicaciones</h1>
      <AdminNotebookList notebooks={(data ?? []) as Notebook[]} />
    </div>
  );
}
