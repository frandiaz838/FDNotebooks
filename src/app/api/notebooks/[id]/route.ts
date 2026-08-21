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

  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .update({ ...body, actualizado_en: new Date().toISOString() })
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
