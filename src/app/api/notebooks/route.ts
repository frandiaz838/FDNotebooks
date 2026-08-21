import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/session";
import type { NotebookInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<NotebookInput>;

  if (!body.nombre || !body.marca || !body.precio) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios (nombre, marca, precio)." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("notebooks")
    .insert({
      nombre: body.nombre,
      marca: body.marca,
      modelo: body.modelo ?? "",
      procesador: body.procesador ?? "",
      ram: body.ram ?? "",
      almacenamiento: body.almacenamiento ?? "",
      pantalla: body.pantalla ?? "",
      estado_estetico: body.estado_estetico ?? "Bueno (detalles carcasa)",
      precio: body.precio,
      moneda: body.moneda ?? "ARS",
      descripcion: body.descripcion ?? null,
      fotos: body.fotos ?? [],
      disponible: body.disponible ?? true,
      destacado: body.destacado ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notebook: data }, { status: 201 });
}
