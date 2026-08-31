"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Notebook } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";

export function AdminNotebookList({ notebooks }: { notebooks: Notebook[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleDisponible(notebook: Notebook) {
    setPendingId(notebook.id);
    await fetch(`/api/notebooks/${notebook.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !notebook.disponible }),
    });
    setPendingId(null);
    router.refresh();
  }

  async function handleDelete(notebook: Notebook) {
    if (!confirm(`¿Eliminar "${notebook.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setPendingId(notebook.id);
    await fetch(`/api/notebooks/${notebook.id}`, { method: "DELETE" });
    setPendingId(null);
    router.refresh();
  }

  if (notebooks.length === 0) {
    return (
      <EmptyState
        title="Todavía no cargaste ninguna publicación"
        description='Usá el botón "Nueva publicación" para cargar la primera.'
      />
    );
  }

  const disponibles = notebooks.filter((n) => n.disponible);
  const vendidas = notebooks.filter((n) => !n.disponible);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Disponibles ({disponibles.length})
        </h2>
        {disponibles.length === 0 ? (
          <p className="text-sm text-muted">No tenés publicaciones disponibles ahora mismo.</p>
        ) : (
          disponibles.map((notebook) => (
            <NotebookRow
              key={notebook.id}
              notebook={notebook}
              pending={pendingId === notebook.id}
              onToggleDisponible={() => toggleDisponible(notebook)}
              onDelete={() => handleDelete(notebook)}
            />
          ))
        )}
      </div>

      {vendidas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Vendidas ({vendidas.length})
          </h2>
          {vendidas.map((notebook) => (
            <NotebookRow
              key={notebook.id}
              notebook={notebook}
              pending={pendingId === notebook.id}
              onToggleDisponible={() => toggleDisponible(notebook)}
              onDelete={() => handleDelete(notebook)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotebookRow({
  notebook,
  pending,
  onToggleDisponible,
  onDelete,
}: {
  notebook: Notebook;
  pending: boolean;
  onToggleDisponible: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
        notebook.disponible ? "" : "opacity-70"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {notebook.fotos[0] && (
            <Image
              src={notebook.fotos[0]}
              alt={notebook.nombre}
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{notebook.nombre}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>
              {notebook.moneda} {new Intl.NumberFormat("es-AR").format(notebook.precio)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                notebook.disponible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted"
              }`}
            >
              {notebook.disponible ? "Disponible" : "Vendida"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/notebooks/${notebook.id}/editar`}
          className="btn-secondary px-3.5 py-1.5 text-sm"
        >
          Editar
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={onToggleDisponible}
          className="btn-secondary px-3.5 py-1.5 text-sm"
        >
          {notebook.disponible ? "Marcar vendida" : "Marcar disponible"}
        </button>
        <button type="button" disabled={pending} onClick={onDelete} className="btn-danger text-sm">
          Eliminar
        </button>
      </div>
    </div>
  );
}
