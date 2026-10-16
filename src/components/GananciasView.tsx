"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Notebook } from "@/lib/types";
import {
  claveAnterior,
  diasHastaVender,
  gananciaItem,
  margenItem,
  monedasDe,
  periodosConVentas,
  resumirVentas,
  variacion,
  ventaItem,
  ventasDelPeriodo,
  type ResumenMoneda,
} from "@/lib/ganancias";
import { claveMes, formatearFecha } from "@/lib/fechas";
import { ManualSaleModal } from "@/components/ManualSaleModal";
import { EditSaleModal } from "@/components/EditSaleModal";
import { ExportCsvButton } from "@/components/ExportCsvButton";

const MARGEN_BAJO = 15;

const nfEntero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const nfDecimal = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

function monto(valor: number) {
  return nfEntero.format(Math.round(valor));
}

function porcentaje(valor: number) {
  return `${nfDecimal.format(valor)}%`;
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type Orden = "fecha" | "ganancia" | "margen";

export function GananciasView({ vendidas }: { vendidas: Notebook[] }) {
  const router = useRouter();
  const mesActual = claveMes(new Date());
  const periodos = periodosConVentas(vendidas, mesActual);

  const [claveActiva, setClaveActiva] = useState(mesActual);
  const [monedaElegida, setMonedaElegida] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("fecha");
  const [showManual, setShowManual] = useState(false);
  const [editTarget, setEditTarget] = useState<Notebook | null>(null);

  const indice = Math.max(
    0,
    periodos.findIndex((periodo) => periodo.clave === claveActiva)
  );
  const periodo = periodos[indice];

  const monedas = monedasDe(vendidas);
  const moneda =
    monedaElegida && monedas.includes(monedaElegida) ? monedaElegida : monedas[0] ?? "ARS";

  const ventasPeriodo = ventasDelPeriodo(vendidas, periodo.clave).filter(
    (n) => n.moneda === moneda
  );
  const resumen = resumirVentas(ventasPeriodo, moneda);
  const resumenAnterior = resumenDelMesAnterior(vendidas, periodo.clave, moneda);
  const historico = resumirVentas(vendidas, moneda);

  const filas = ordenar(filtrar(ventasPeriodo, busqueda), orden);

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

  async function borrar(notebook: Notebook) {
    if (!confirm(`¿Borrar la venta de "${notebook.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    await fetch(`/api/notebooks/${notebook.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BotonPaso
            etiqueta="Mes anterior"
            direccion="anterior"
            disabled={indice >= periodos.length - 1}
            onClick={() => setClaveActiva(periodos[indice + 1].clave)}
          />
          <h1 className="min-w-44 text-center text-lg font-bold text-foreground sm:min-w-52">
            {periodo.etiqueta}
          </h1>
          <BotonPaso
            etiqueta="Mes siguiente"
            direccion="siguiente"
            disabled={indice <= 0}
            onClick={() => setClaveActiva(periodos[indice - 1].clave)}
          />
        </div>

        <div className="flex items-center gap-2">
          {monedas.length > 1 && (
            <div className="flex rounded-full border border-border bg-card p-0.5">
              {monedas.map((codigo) => (
                <button
                  key={codigo}
                  type="button"
                  onClick={() => setMonedaElegida(codigo)}
                  aria-pressed={codigo === moneda}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    codigo === moneda
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {codigo}
                </button>
              ))}
            </div>
          )}
          <ExportCsvButton vendidas={filas} />
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="btn-accent px-4 py-2 text-sm"
          >
            + Cargar venta manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <TarjetaGanancia resumen={resumen} anterior={resumenAnterior} moneda={moneda} />
        <Kpi label={`Ingresos (${moneda})`} valor={monto(resumen.ingresosTotal)} />
        <Kpi label={`Costo (${moneda})`} valor={monto(resumen.costoTotal)} />
        <Kpi
          label="Margen"
          valor={resumen.margen !== null ? porcentaje(resumen.margen) : "—"}
        />
        <Kpi
          label="Ventas · Días prom."
          valor={`${resumen.cantidad} · ${
            resumen.diasPromedio !== null ? nfEntero.format(resumen.diasPromedio) : "—"
          }`}
        />
      </div>

      <p className="text-lg font-semibold text-foreground">
        Histórico: {moneda} {monto(historico.gananciaTotal)} de ganancia en{" "}
        {historico.cantidad} {historico.cantidad === 1 ? "venta" : "ventas"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Buscar por nombre</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-muted stroke-2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre"
            // El padding de .input no está en capa y le gana a pl-10.
            className="input !pl-10"
          />
        </label>

        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted">
          Ordenar por
          <select
            value={orden}
            onChange={(evento) => setOrden(evento.target.value as Orden)}
            className="input w-auto py-2"
          >
            <option value="fecha">Fecha</option>
            <option value="ganancia">Ganancia</option>
            <option value="margen">Margen</option>
          </select>
        </label>
      </div>

      <TablaVentas filas={filas} moneda={moneda} onEditar={setEditTarget} onBorrar={borrar} />

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

function resumenDelMesAnterior(vendidas: Notebook[], clave: string, moneda: string) {
  const anterior = claveAnterior(clave);
  if (!anterior) return null;
  return resumirVentas(ventasDelPeriodo(vendidas, anterior), moneda);
}

function filtrar(items: Notebook[], busqueda: string) {
  const termino = normalizar(busqueda.trim());
  if (!termino) return items;
  return items.filter((n) => normalizar(n.nombre).includes(termino));
}

function ordenar(items: Notebook[], orden: Orden) {
  const copia = [...items];
  if (orden === "ganancia") {
    return copia.sort((a, b) => gananciaItem(b) - gananciaItem(a));
  }
  if (orden === "margen") {
    return copia.sort((a, b) => (margenItem(b) ?? -Infinity) - (margenItem(a) ?? -Infinity));
  }
  return copia.sort((a, b) => {
    const fa = a.vendido_en ? new Date(a.vendido_en).getTime() : 0;
    const fb = b.vendido_en ? new Date(b.vendido_en).getTime() : 0;
    return fb - fa;
  });
}

function BotonPaso({
  etiqueta,
  direccion,
  disabled,
  onClick,
}: {
  etiqueta: string;
  direccion: "anterior" | "siguiente";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
        <path
          d={direccion === "anterior" ? "M15 19 8 12l7-7" : "m9 5 7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function TarjetaGanancia({
  resumen,
  anterior,
  moneda,
}: {
  resumen: ResumenMoneda;
  anterior: ResumenMoneda | null;
  moneda: string;
}) {
  const variacionPorcentual = variacion(resumen.gananciaTotal, anterior?.gananciaTotal ?? 0);
  const subio = (variacionPorcentual ?? 0) >= 0;

  return (
    <div className="card col-span-2 flex flex-col justify-between gap-3 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Ganancia ({moneda})
      </p>
      <p className="text-[2.5rem] font-bold leading-none tabular-nums text-foreground">
        {monto(resumen.gananciaTotal)}
      </p>
      {variacionPorcentual === null ? (
        <p className="text-xs text-muted">Sin ventas el mes anterior</p>
      ) : (
        <p
          className={`flex items-center gap-1 text-xs font-semibold ${
            subio ? "text-success" : "text-danger"
          }`}
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]">
            <path
              d={subio ? "M12 19V5m0 0-6 6m6-6 6 6" : "M12 5v14m0 0 6-6m-6 6-6-6"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {subio ? "+" : "−"}
          {porcentaje(Math.abs(variacionPorcentual))}
          <span className="font-normal text-muted">vs. mes anterior</span>
        </p>
      )}
    </div>
  );
}

function Kpi({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="card flex flex-col justify-between gap-2 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-semibold tabular-nums text-foreground">{valor}</p>
    </div>
  );
}

function TablaVentas({
  filas,
  moneda,
  onEditar,
  onBorrar,
}: {
  filas: Notebook[];
  moneda: string;
  onEditar: (n: Notebook) => void;
  onBorrar: (n: Notebook) => void;
}) {
  if (filas.length === 0) {
    return (
      <p className="card px-5 py-6 text-center text-sm text-muted">
        No hay ventas para mostrar en este período.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: cada venta como tarjeta */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filas.map((n) => (
          <TarjetaVenta
            key={n.id}
            notebook={n}
            moneda={moneda}
            onEditar={onEditar}
            onBorrar={onBorrar}
          />
        ))}
      </div>

      {/* Sin overflow-hidden: cualquier recorte en un ancestro anula el sticky del thead. */}
      <div className="card hidden sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-[var(--header-alto)] z-[5] bg-neutral-soft text-xs uppercase tracking-wide text-muted [&>tr>th:first-child]:rounded-tl-2xl [&>tr>th:last-child]:rounded-tr-2xl">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
              <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Costo ({moneda})</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Venta ({moneda})</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Ganancia ({moneda})</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Margen</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Días</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filas.map((n) => {
              const ganancia = gananciaItem(n);
              const margen = margenItem(n);
              const dias = diasHastaVender(n);

              return (
                <tr key={n.id} className="transition-colors hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                    {formatearFecha(n.vendido_en)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{n.nombre}</p>
                    <Pill>{n.categoria}</Pill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                    {n.costo ? monto(n.costo) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                    {monto(ventaItem(n))}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                      ganancia < 0 ? "text-danger" : "text-foreground"
                    }`}
                  >
                    {ganancia < 0 ? "−" : ""}
                    {monto(Math.abs(ganancia))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    <ValorMargen margen={margen} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                    {dias !== null ? nfEntero.format(dias) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <BotonIcono
                        etiqueta={`Editar la venta de ${n.nombre}`}
                        onClick={() => onEditar(n)}
                        icono="editar"
                      />
                      <BotonIcono
                        etiqueta={`Borrar la venta de ${n.nombre}`}
                        onClick={() => onBorrar(n)}
                        icono="borrar"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TarjetaVenta({
  notebook,
  moneda,
  onEditar,
  onBorrar,
}: {
  notebook: Notebook;
  moneda: string;
  onEditar: (n: Notebook) => void;
  onBorrar: (n: Notebook) => void;
}) {
  const ganancia = gananciaItem(notebook);
  const margen = margenItem(notebook);
  const dias = diasHastaVender(notebook);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{notebook.nombre}</p>
          <Pill>{notebook.categoria}</Pill>
        </div>
        <p className="whitespace-nowrap text-xs tabular-nums text-muted">
          {formatearFecha(notebook.vendido_en)}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-background px-3 py-2.5 text-xs">
        <div>
          <dt className="text-muted">Costo ({moneda})</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {notebook.costo ? monto(notebook.costo) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Venta</dt>
          <dd className="font-medium tabular-nums text-foreground">{monto(ventaItem(notebook))}</dd>
        </div>
        <div>
          <dt className="text-muted">Ganancia</dt>
          <dd
            className={`font-semibold tabular-nums ${
              ganancia < 0 ? "text-danger" : "text-foreground"
            }`}
          >
            {ganancia < 0 ? "−" : ""}
            {monto(Math.abs(ganancia))}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-3 text-xs text-muted">
          <ValorMargen margen={margen} />
          <span className="tabular-nums">
            {dias !== null ? `${nfEntero.format(dias)} días` : "—"}
          </span>
        </p>
        <div className="flex gap-1">
          <BotonIcono
            etiqueta={`Editar la venta de ${notebook.nombre}`}
            onClick={() => onEditar(notebook)}
            icono="editar"
          />
          <BotonIcono
            etiqueta={`Borrar la venta de ${notebook.nombre}`}
            onClick={() => onBorrar(notebook)}
            icono="borrar"
          />
        </div>
      </div>
    </div>
  );
}

function ValorMargen({ margen }: { margen: number | null }) {
  if (margen === null) return <span className="text-muted">—</span>;

  const bajo = margen < MARGEN_BAJO;
  const negativo = margen < 0;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        negativo ? "text-danger" : bajo ? "text-warning" : "text-muted"
      }`}
    >
      {bajo && (
        <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {porcentaje(margen)}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1 inline-flex rounded-full bg-neutral-soft px-2 py-0.5 text-[11px] font-medium text-muted">
      {children}
    </span>
  );
}

const ICONOS = {
  editar: (
    <path
      d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  borrar: (
    <path
      d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

function BotonIcono({
  etiqueta,
  onClick,
  icono,
}: {
  etiqueta: string;
  onClick: () => void;
  icono: keyof typeof ICONOS;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        icono === "borrar" ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
        {ICONOS[icono]}
      </svg>
    </button>
  );
}
