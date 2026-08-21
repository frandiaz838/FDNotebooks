import Image from "next/image";
import Link from "next/link";
import type { Notebook } from "@/lib/types";
import { estadoEsteticoClasses } from "@/lib/estadoEstetico";
import { resumenSpecs } from "@/lib/categorias";

export function NotebookCard({ notebook }: { notebook: Notebook }) {
  const foto = notebook.fotos[0];
  const precioFormateado = new Intl.NumberFormat("es-AR").format(notebook.precio);

  return (
    <Link
      href={`/notebooks/${notebook.id}`}
      className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {foto ? (
          <Image
            src={foto}
            alt={notebook.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            Sin foto
          </div>
        )}
        {notebook.destacado && (
          <span className="absolute left-3 top-3 rounded-full bg-[linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Destacada
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-foreground">{notebook.nombre}</h3>
        <p className="text-sm text-muted">{resumenSpecs(notebook).join(" · ")}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-foreground">
            {notebook.moneda} {precioFormateado}
          </span>
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${estadoEsteticoClasses(notebook.estado_estetico)}`}
          >
            {notebook.estado_estetico}
          </span>
        </div>
      </div>
    </Link>
  );
}
