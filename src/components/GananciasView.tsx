"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Notebook } from "@/lib/types";
import { calcularResumen, gananciaItem } from "@/lib/ganancias";
import { ManualSaleModal } from "@/components/ManualSaleModal";
import { EditSaleModal } from "@/components/EditSaleModal";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { EmptyState } from "@/components/EmptyState";

function money(n: number) {
  return new Intl.NumberFormat("es-AR").format(Math.round(n));
}

export function GananciasView({ vendidas }: { vendidas: Notebook[] }) {
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const [editTarget, setEditTarget] = useState<Notebook | null>(null);
  const resumen = calcularResumen(vendidas);

  async function confirmEdit(data: {
    costo: number | null;
    precioVentaFinal: number;
    vendidoEn: string;
  }) {
    if (!editTarget) return;
    await fetch(`/api/notebooks/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        costo: data.costo,
        precio_venta_final: data.precioVentaFinal,
        vendido_en: data.vendidoEn,
      }),
    });
    setEditTarget(null);
    router.refresh();
  }

  const ordenadas = [...vendidas].sort((a, b) => {
    const fa = a.vendido_en ? new Date(a.vendido_en).getTime() : 0;
    const fb = b.vendido_en ? new Date(b.vendido_en).getTime() : 0;
    return fb - fa;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ganancias</h1>
          <p className="text-sm text-muted">
            Costo, precio de venta y ganancia son datos privados — nunca se muestran en el
            catálogo público.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton vendidas={vendidas} />
          <button type="button" onClick={() => setShowManual(true)} className="btn-accent px-4 py-2 text-sm">
            + Cargar venta manual
          </button>
        </div>
      </div>

      {vendidas.length === 0 ? (
        <EmptyState
          title="Todavía no registraste ninguna venta"
          description='Marcá una publicación como "vendida" o cargá una venta manual para empezar a ver tus números acá.'
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resumen.map((r) => (
              <div key={r.moneda} className="card flex flex-col gap-4 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {r.moneda}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Vendidas" value={String(r.cantidad)} />
                  <Stat
                    label="Días en catálogo (prom.)"
                    value={r.diasPromedio !== null ? r.diasPromedio.toFixed(0) : "—"}
                  />
                  <Stat label="Costo total" value={`${r.moneda} ${money(r.costoTotal)}`} />
                  <Stat label="Ingresos totales" value={`${r.moneda} ${money(r.ingresosTotal)}`} />
                </div>
                <div className="rounded-xl bg-accent-soft px-4 py-3">
                  <p className="text-xs font-medium text-accent">Ganancia total</p>
                  <p
                    className={`text-xl font-bold ${r.gananciaTotal >= 0 ? "text-emerald-700" : "text-danger"}`}
                  >
                    {r.moneda} {money(r.gananciaTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Costo</th>
                    <th className="px-4 py-3 font-medium">Venta</th>
                    <th className="px-4 py-3 font-medium">Ganancia</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ordenadas.map((n) => {
                    const ganancia = gananciaItem(n);
                    return (
                      <tr key={n.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {n.vendido_en ? new Date(n.vendido_en).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{n.nombre}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {n.costo ? `${n.moneda} ${money(n.costo)}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {n.moneda} {money(n.precio_venta_final ?? n.precio)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 font-semibold ${ganancia >= 0 ? "text-emerald-700" : "text-danger"}`}
                        >
                          {n.moneda} {money(ganancia)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setEditTarget(n)}
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showManual && <ManualSaleModal onClose={() => setShowManual(false)} />}

      {editTarget && (
        <EditSaleModal
          notebook={editTarget}
          onConfirm={confirmEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
