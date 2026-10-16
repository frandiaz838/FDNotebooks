"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notebook } from "@/lib/types";
import {
  agruparPorMes,
  calcularResumen,
  gananciaItem,
  type MesVentas,
  type ResumenMoneda,
} from "@/lib/ganancias";
import { claveMes, etiquetaMes, formatearFecha, formatearFechaHora } from "@/lib/fechas";
import { ManualSaleModal } from "@/components/ManualSaleModal";
import { EditSaleModal } from "@/components/EditSaleModal";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { EmptyState } from "@/components/EmptyState";

function money(n: number) {
  return new Intl.NumberFormat("es-AR").format(Math.round(n));
}

function plural(cantidad: number) {
  return cantidad === 1 ? "venta" : "ventas";
}

function gananciaColor(valor: number) {
  return valor >= 0 ? "text-emerald-700" : "text-danger";
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

  const historico = calcularResumen(vendidas);
  const meses = agruparPorMes(vendidas);
  const ahora = new Date();
  const mesActual = meses.find((mes) => mes.clave === claveMes(ahora));

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

  async function handleDelete(notebook: Notebook) {
    if (!confirm(`¿Borrar la venta de "${notebook.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    await fetch(`/api/notebooks/${notebook.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        <div className="flex flex-col gap-2 sm:items-end">
          <Reloj />
          <div className="flex gap-2">
            <ExportCsvButton vendidas={vendidas} />
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="btn-accent px-4 py-2 text-sm"
            >
              + Cargar venta manual
            </button>
          </div>
        </div>
      </div>

      {vendidas.length === 0 ? (
        <EmptyState
          title="Todavía no registraste ninguna venta"
          description='Marcá una publicación como "vendida" o cargá una venta manual para empezar a ver tus números acá.'
        />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {etiquetaMes(ahora)} · mes en curso
            </h2>

            {mesActual ? (
              <div
                className={`grid grid-cols-1 gap-4 ${
                  mesActual.resumenes.length > 1 ? "lg:grid-cols-2" : ""
                }`}
              >
                {mesActual.resumenes.map((resumen) => (
                  <TarjetaMes key={resumen.moneda} resumen={resumen} />
                ))}
              </div>
            ) : (
              <div className="card px-5 py-4 text-sm text-muted">
                Todavía no registraste ventas este mes. Abajo tenés el historial completo.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold uppercase tracking-wide">Histórico</span>
              {historico.map((h) => (
                <span
                  key={h.moneda}
                  className="rounded-full border border-border bg-card px-3 py-1"
                >
                  {h.moneda} {money(h.gananciaTotal)} de ganancia · {h.cantidad} {plural(h.cantidad)}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-8">
            {meses.map((mes) => (
              <BloqueMes
                key={mes.clave}
                mes={mes}
                onEdit={setEditTarget}
                onDelete={handleDelete}
              />
            ))}
          </section>
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

function Reloj() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Recién se pinta en el cliente: la hora del server no es la del navegador.
  if (!ahora) return <span className="h-4" />;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {formatearFechaHora(ahora)}
    </span>
  );
}

function TarjetaMes({ resumen }: { resumen: ResumenMoneda }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-[linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))] px-5 py-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/75">
            {resumen.moneda} · Ganancia del mes
          </span>
          {resumen.margen !== null && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
              {resumen.margen.toFixed(0)}% margen
            </span>
          )}
        </div>
        <p className="mt-1 text-3xl font-bold">
          {resumen.moneda} {money(resumen.gananciaTotal)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <MiniStat icon={STAT_ICONS.vendidas} label="Vendidas" value={String(resumen.cantidad)} />
        <MiniStat
          icon={STAT_ICONS.dias}
          label="Días prom."
          value={resumen.diasPromedio !== null ? resumen.diasPromedio.toFixed(0) : "—"}
        />
        <MiniStat
          icon={STAT_ICONS.costo}
          label="Costo"
          value={`${resumen.moneda} ${money(resumen.costoTotal)}`}
        />
        <MiniStat
          icon={STAT_ICONS.ingresos}
          label="Ingresos"
          value={`${resumen.moneda} ${money(resumen.ingresosTotal)}`}
        />
      </div>
    </div>
  );
}

function BloqueMes({
  mes,
  onEdit,
  onDelete,
}: {
  mes: MesVentas;
  onEdit: (notebook: Notebook) => void;
  onDelete: (notebook: Notebook) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">{mes.etiqueta}</h3>
        <span className="text-xs text-muted">
          {mes.items.length} {plural(mes.items.length)}
        </span>
      </div>

      {mes.resumenes.map((resumen) => (
        <div
          key={resumen.moneda}
          className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs"
        >
          <div className="min-w-0">
            <p className="text-muted">Costo {resumen.moneda}</p>
            <p className="truncate font-medium text-foreground">{money(resumen.costoTotal)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-muted">Ingresos</p>
            <p className="truncate font-medium text-foreground">{money(resumen.ingresosTotal)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-muted">Ganancia</p>
            <p className={`truncate font-semibold ${gananciaColor(resumen.gananciaTotal)}`}>
              {money(resumen.gananciaTotal)}
            </p>
          </div>
        </div>
      ))}

      {/* Mobile: lista de tarjetas */}
      <div className="flex flex-col gap-3 sm:hidden">
        {mes.items.map((n) => {
          const ganancia = gananciaItem(n);
          return (
            <div key={n.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{n.nombre}</p>
                  <p className="text-xs text-muted">{n.categoria}</p>
                </div>
                <p className="whitespace-nowrap text-xs text-muted">
                  {formatearFecha(n.vendido_en)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-background px-3 py-2.5 text-xs">
                <div>
                  <p className="text-muted">Costo</p>
                  <p className="font-medium text-foreground">{n.costo ? money(n.costo) : "—"}</p>
                </div>
                <div>
                  <p className="text-muted">Venta</p>
                  <p className="font-medium text-foreground">
                    {money(n.precio_venta_final ?? n.precio)}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Ganancia</p>
                  <p className={`font-semibold ${gananciaColor(ganancia)}`}>{money(ganancia)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => onDelete(n)}
                  className="text-sm font-medium text-danger hover:underline"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(n)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Editar venta
                </button>
              </div>
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
              {mes.items.map((n) => {
                const ganancia = gananciaItem(n);
                return (
                  <tr key={n.id} className="transition-colors hover:bg-background">
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {formatearFecha(n.vendido_en)}
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
                      className={`whitespace-nowrap px-4 py-3 font-semibold ${gananciaColor(ganancia)}`}
                    >
                      {n.moneda} {money(ganancia)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => onDelete(n)}
                          className="text-sm font-medium text-danger hover:underline"
                        >
                          Borrar
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(n)}
                          className="text-sm font-medium text-accent hover:underline"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
