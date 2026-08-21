import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Notebook } from "@/lib/types";
import { NotebookGallery } from "@/components/NotebookGallery";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ShareButton } from "@/components/ShareButton";
import { NotebookGrid } from "@/components/NotebookGrid";
import { estadoBateriaClasses, estadoEsteticoClasses } from "@/lib/estadoEstetico";

export const dynamic = "force-dynamic";

async function getNotebook(id: string) {
  const { data } = await supabase
    .from("notebooks")
    .select("*")
    .eq("id", id)
    .eq("disponible", true)
    .maybeSingle();
  return data as Notebook | null;
}

async function getRelacionadas(id: string, marca: string) {
  const { data } = await supabase
    .from("notebooks")
    .select("*")
    .eq("disponible", true)
    .neq("id", id)
    .order("marca", { ascending: true, nullsFirst: false })
    .limit(8);

  const notebooks = (data ?? []) as Notebook[];
  // priorizamos misma marca, después completamos con el resto
  const mismaMarca = notebooks.filter((n) => n.marca === marca);
  const otras = notebooks.filter((n) => n.marca !== marca);
  return [...mismaMarca, ...otras].slice(0, 3);
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const notebook = await getNotebook(id);
  if (!notebook) return {};

  const precioFormateado = new Intl.NumberFormat("es-AR").format(notebook.precio);
  const title = `${notebook.nombre} - FD Notebooks`;
  const description = `${notebook.moneda} ${precioFormateado} · ${notebook.procesador} · ${notebook.ram} · ${notebook.estado_estetico}`;
  const image = notebook.fotos[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function NotebookDetailPage({ params }: Props) {
  const { id } = await params;
  const notebook = await getNotebook(id);

  if (!notebook) {
    notFound();
  }

  const relacionadas = await getRelacionadas(notebook.id, notebook.marca);
  const precioFormateado = new Intl.NumberFormat("es-AR").format(notebook.precio);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <NotebookGallery fotos={notebook.fotos} alt={notebook.nombre} />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${estadoEsteticoClasses(notebook.estado_estetico)}`}
            >
              {notebook.estado_estetico}
            </span>
            <ShareButton title={notebook.nombre} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{notebook.nombre}</h1>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {notebook.moneda} {precioFormateado}
            </p>
            <p className="mt-1 text-xs text-muted">
              Unidad única · el estado puede variar levemente de otras que veas publicadas
            </p>
          </div>

          <dl className="card grid grid-cols-2 gap-x-4 gap-y-3 p-5 text-sm">
            <Spec label="Marca" value={notebook.marca} />
            <Spec label="Modelo" value={notebook.modelo} />
            <Spec label="Procesador" value={notebook.procesador} />
            <Spec label="RAM" value={notebook.ram} />
            <Spec label="Almacenamiento" value={notebook.almacenamiento} />
            <Spec label="Pantalla" value={notebook.pantalla} />
            <Spec label="Sistema operativo" value={notebook.sistema_operativo} />
            <Spec
              label="Batería"
              value={notebook.estado_bateria}
              valueClassName={estadoBateriaClasses(notebook.estado_bateria)}
            />
          </dl>

          {notebook.descripcion && (
            <div>
              <h2 className="font-semibold text-foreground">Descripción</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">
                {notebook.descripcion}
              </p>
            </div>
          )}

          <div className="mt-2">
            <WhatsAppButton
              nombre={notebook.nombre}
              precio={notebook.precio}
              moneda={notebook.moneda}
            />
          </div>
        </div>
      </div>

      {relacionadas.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground">También te puede interesar</h2>
          <NotebookGrid notebooks={relacionadas} />
        </div>
      )}
    </div>
  );
}

function Spec({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`font-medium ${valueClassName ?? "text-foreground"}`}>{value}</dd>
    </div>
  );
}
