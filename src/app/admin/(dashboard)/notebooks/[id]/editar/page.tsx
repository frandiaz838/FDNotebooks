import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Notebook } from "@/lib/types";
import { NotebookForm } from "@/components/NotebookForm";

export default async function EditarNotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdmin.from("notebooks").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Editar publicación</h1>
      <NotebookForm mode="editar" notebook={data as Notebook} />
    </div>
  );
}
