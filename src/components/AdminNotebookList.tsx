"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Notebook } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { MarkSoldModal } from "@/components/MarkSoldModal";
import { EditSaleModal } from "@/components/EditSaleModal";

export function AdminNotebookList({ notebooks }: { notebooks: Notebook[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [soldTarget, setSoldTarget] = useState<Notebook | null>(null);
  const [editSaleTarget, setEditSaleTarget] = useState<Notebook | null>(null);

  async function markAvailable(notebook: Notebook) {
    setPendingId(notebook.id);
    await fetch(`/api/notebooks/${notebook.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: true }),
    });
    setPendingId(null);
    router.refresh();
  }

  async function confirmSold(precioVentaFinal: number) {
    if (!soldTarget) return;
    setPendingId(soldTarget.id);
    await fetch(`/api/notebooks/${soldTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: false, precio_venta_final: precioVentaFinal }),
    });
    setPendingId(null);
    setSoldTarget(null);
    router.refresh();
  }

  async function confirmEditSale(data: {
    costo: number | null;
    precioVentaFinal: number;
    vendidoEn: string;
  }) {
    if (!editSaleTarget) return;
    setPendingId(editSaleTarget.id);
    await fetch(`/api/notebooks/${editSaleTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        costo: data.costo,
        precio_venta_final: data.precioVentaFinal,
        vendido_en: data.vendidoEn,
      }),
    });
    setPendingId(null);
    setEditSaleTarget(null);
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
              onToggleDisponible={() => setSoldTarget(notebook)}
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
              onToggleDisponible={() => markAvailable(notebook)}
              onEditSale={() => setEditSaleTarget(notebook)}
              onDelete={() => handleDelete(notebook)}
            />
          ))}
        </div>
      )}

      {soldTarget && (
        <MarkSoldModal
          notebook={soldTarget}
          onConfirm={confirmSold}
          onCancel={() => setSoldTarget(null)}
        />
      )}

      {editSaleTarget && (
        <EditSaleModal
          notebook={editSaleTarget}
          onConfirm={confirmEditSale}
          onCancel={() => setEditSaleTarget(null)}
        />
      )}
    </div>
  );
}

function NotebookRow({
  notebook,
  pending,
  onToggleDisponible,
  onEditSale,
  onDelete,
}: {
  notebook: Notebook;
  pending: boolean;
  onToggleDisponible: () => void;
  onEditSale?: () => void;
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
        {onEditSale && (
          <button
            type="button"
            disabled={pending}
            onClick={onEditSale}
            className="btn-secondary px-3.5 py-1.5 text-sm"
          >
            Editar venta
          </button>
        )}
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
