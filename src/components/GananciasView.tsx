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

const STAT_ICONS = {
  vendidas: (
    <path
      d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  dias: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  costo: (
    <path
      d="M12 3v18M17 7.5c0-1.4-1.8-2.5-5-2.5s-5 1.4-5 3.5 2 3 5 3 5 1 5 3.5-2.2 3.5-5 3.5-5-1.1-5-2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  ingresos: (
    <path
      d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

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
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))] text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path
                d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ganancias</h1>
            <p className="text-sm text-muted">
              Costo, precio de venta y ganancia son privados — nunca se muestran en el catálogo.
            </p>
          </div>
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {resumen.map((r) => (
              <div key={r.moneda} className="card overflow-hidden">
                <div className="bg-[linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))] px-5 py-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/75">
                      {r.moneda} · Ganancia total
                    </span>
                    {r.margen !== null && (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                        {r.margen.toFixed(0)}% margen
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-3xl font-bold">
                    {r.moneda} {money(r.gananciaTotal)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                  <MiniStat icon={STAT_ICONS.vendidas} label="Vendidas" value={String(r.cantidad)} />
                  <MiniStat
                    icon={STAT_ICONS.dias}
                    label="Días prom."
                    value={r.diasPromedio !== null ? r.diasPromedio.toFixed(0) : "—"}
                  />
                  <MiniStat icon={STAT_ICONS.costo} label="Costo" value={`${r.moneda} ${money(r.costoTotal)}`} />
                  <MiniStat
                    icon={STAT_ICONS.ingresos}
                    label="Ingresos"
                    value={`${r.moneda} ${money(r.ingresosTotal)}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: lista de tarjetas */}
          <div className="flex flex-col gap-3 sm:hidden">
            {ordenadas.map((n) => {
              const ganancia = gananciaItem(n);
              return (
                <div key={n.id} className="card flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{n.nombre}</p>
                      <p className="text-xs text-muted">{n.categoria}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted">
                      {n.vendido_en ? new Date(n.vendido_en).toLocaleDateString("es-AR") : "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-background px-3 py-2.5 text-xs">
                    <div>
                      <p className="text-muted">Costo</p>
                      <p className="font-medium text-foreground">
                        {n.costo ? money(n.costo) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Venta</p>
                      <p className="font-medium text-foreground">
                        {money(n.precio_venta_final ?? n.precio)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Ganancia</p>
                      <p className={`font-semibold ${ganancia >= 0 ? "text-emerald-700" : "text-danger"}`}>
                        {money(ganancia)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditTarget(n)}
                    className="self-end text-sm font-medium text-accent hover:underline"
                  >
                    Editar venta
                  </button>
                </div>
              );
            })}
          </div>

          {/* Tablet/desktop: tabla */}
          <div className="card hidden overflow-hidden sm:block">
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
                      <tr key={n.id} className="transition-colors hover:bg-background">
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {n.vendido_en ? new Date(n.vendido_en).toLocaleDateString("es-AR") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{n.nombre}</p>
                          <p className="text-xs text-muted">{n.categoria}</p>
                        </td>
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

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
          {icon}
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
