import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/session";
import type { NotebookInput } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/notebooks/[id]">
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<NotebookInput>;

  const update: Partial<NotebookInput> & { actualizado_en: string; vendido_en?: string | null } = {
    ...body,
    actualizado_en: new Date().toISOString(),
  };

  // La fecha de venta se calcula del lado del servidor, no se confía en el cliente.
  // Suspender no es una venta, así que nunca genera vendido_en.
  if ("disponible" in body) {
    const esSuspension = body.disponible === false && body.suspendida === true;
    update.vendido_en = body.disponible === false && !esSuspension ? new Date().toISOString() : null;
  }

  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notebook: data });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/notebooks/[id]">
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  const { error } = await supabaseAdmin.from("notebooks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
