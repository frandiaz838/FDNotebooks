"use client";

import { useEffect, useRef, useState } from "react";
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
  sinCosto,
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

function plural(cantidad: number) {
  return cantidad === 1 ? "venta" : "ventas";
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type CampoOrden = "fecha" | "costo" | "venta" | "ganancia" | "margen" | "dias";
type Orden = { campo: CampoOrden; direccion: "asc" | "desc" };

export function GananciasView({ vendidas }: { vendidas: Notebook[] }) {
  const router = useRouter();
  const mesActual = claveMes(new Date());
  const periodos = periodosConVentas(vendidas, mesActual);

  const [claveActiva, setClaveActiva] = useState(mesActual);
  const [monedaElegida, setMonedaElegida] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>({ campo: "fecha", direccion: "desc" });
  const [showManual, setShowManual] = useState(false);
  const [editTarget, setEditTarget] = useState<Notebook | null>(null);
  const [porBorrar, setPorBorrar] = useState<Notebook | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const indice = Math.max(
    0,
    periodos.findIndex((periodo) => periodo.clave === claveActiva)
  );
  const periodo = periodos[indice];

  const monedas = monedasDe(vendidas);
  const moneda =
    monedaElegida && monedas.includes(monedaElegida) ? monedaElegida : monedas[0] ?? "ARS";

  // La venta en espera de borrado ya no cuenta para nada: si siguiera sumando
  // en los totales, los numeros no coincidirian con la tabla.
  const visibles = vendidas.filter((n) => n.id !== porBorrar?.id);

  const ventasPeriodo = ventasDelPeriodo(visibles, periodo.clave).filter(
    (n) => n.moneda === moneda
  );
  const resumen = resumirVentas(ventasPeriodo, moneda);
  const resumenAnterior = resumenDelMesAnterior(visibles, periodo.clave, moneda);
  const historico = resumirVentas(visibles, moneda);
  const primeraSinCosto = ventasPeriodo.find(sinCosto) ?? null;

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

  async function borrarDeVerdad(notebook: Notebook) {
    await fetch(`/api/notebooks/${notebook.id}`, { method: "DELETE" });
    router.refresh();
  }

  function pedirBorrado(notebook: Notebook) {
    // Si habia otra esperando, se confirma ahora para no perderla de vista.
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      if (porBorrar) void borrarDeVerdad(porBorrar);
    }

    setPorBorrar(notebook);
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      setPorBorrar(null);
      void borrarDeVerdad(notebook);
    }, 6000);
  }

  function onOrdenar(campo: CampoOrden) {
    setOrden((previo) =>
      previo.campo === campo
        ? { campo, direccion: previo.direccion === "asc" ? "desc" : "asc" }
        : { campo, direccion: "desc" }
    );
  }

  function deshacerBorrado() {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setPorBorrar(null);
  }

  // Si se sale de la pantalla antes de que venza el plazo, la venta no se
  // borra: ante la duda es mejor conservarla.
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

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
          <ExportCsvButton ventas={filas} moneda={moneda} clavePeriodo={periodo.clave} />
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="btn-accent px-4 py-2 text-sm"
          >
            + Cargar venta manual
          </button>
        </div>
      </div>

      {/* Subgrid: todas las tarjetas comparten las filas, así etiquetas y
          valores quedan a la misma altura aunque el número cambie de tamaño. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-7 lg:grid-rows-[auto_auto_auto]">
        <TarjetaGanancia resumen={resumen} anterior={resumenAnterior} moneda={moneda} />
        <Kpi label={`Ingresos (${moneda})`} valor={monto(resumen.ingresosTotal)} />
        <Kpi label={`Costo (${moneda})`} valor={monto(resumen.costoTotal)} />
        <Kpi label="Margen" valor={resumen.margen !== null ? porcentaje(resumen.margen) : "—"} />
        <Kpi label="Ventas" valor={`${resumen.cantidad}`} unidad={plural(resumen.cantidad)} />
        <Kpi
          className="col-span-2 lg:col-span-1"
          label="Días prom."
          valor={resumen.diasPromedio !== null ? nfEntero.format(resumen.diasPromedio) : "—"}
          unidad={resumen.diasPromedio !== null ? "días" : undefined}
        />
      </div>

      {resumen.sinCosto > 0 && primeraSinCosto && (
        <p
          role="status"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            {resumen.sinCosto === 1
              ? "1 venta sin costo cargado: queda fuera del margen y de la comparación."
              : `${resumen.sinCosto} ventas sin costo cargado: quedan fuera del margen y de la comparación.`}
          </span>
          <button
            type="button"
            onClick={() => setEditTarget(primeraSinCosto)}
            className="font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/50"
          >
            Cargar costo
          </button>
        </p>
      )}

      <p className="text-[15px]">
        <span className="text-muted">Acumulado total</span>{" "}
        <span className="font-semibold text-foreground">
          {moneda} {monto(historico.gananciaTotal)} · {historico.cantidad}{" "}
          {plural(historico.cantidad)}
        </span>
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

        {/* En desktop se ordena desde los encabezados de la tabla. */}
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted sm:hidden">
          Ordenar por
          <select
            value={orden.campo}
            onChange={(evento) =>
              setOrden({ campo: evento.target.value as CampoOrden, direccion: "desc" })
            }
            className="input w-auto py-2"
          >
            <option value="fecha">Fecha</option>
            <option value="ganancia">Ganancia</option>
            <option value="margen">Margen</option>
            <option value="dias">Días</option>
          </select>
        </label>
      </div>

      <TablaVentas
        filas={filas}
        moneda={moneda}
        hayVentas={ventasPeriodo.length > 0}
        etiquetaPeriodo={periodo.etiqueta}
        orden={orden}
        onOrdenar={onOrdenar}
        onEditar={setEditTarget}
        onBorrar={pedirBorrado}
      />

      {porBorrar && <AvisoDeshacer notebook={porBorrar} onDeshacer={deshacerBorrado} />}

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

function valorOrden(n: Notebook, campo: CampoOrden) {
  switch (campo) {
    case "costo":
      return n.costo ?? -Infinity;
    case "venta":
      return ventaItem(n);
    case "ganancia":
      return gananciaItem(n);
    case "margen":
      return margenItem(n) ?? -Infinity;
    case "dias":
      return diasHastaVender(n) ?? -Infinity;
    default:
      return n.vendido_en ? new Date(n.vendido_en).getTime() : 0;
  }
}

function ordenar(items: Notebook[], orden: Orden) {
  const factor = orden.direccion === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = valorOrden(a, orden.campo);
    const vb = valorOrden(b, orden.campo);
    if (va === vb) return 0;
    return (va < vb ? -1 : 1) * factor;
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
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
  // Compara los mismos totales que muestra la tarjeta: un porcentaje debajo de
  // una cifra se lee como el cambio de esa cifra, no de otra base.
  const variacionPorcentual = variacion(resumen.gananciaTotal, anterior?.gananciaTotal ?? 0);
  const subio = (variacionPorcentual ?? 0) >= 0;

  return (
    // El borde de .card no está en capa y le gana a la utilidad: hay que forzarlo.
    <div className="card col-span-2 flex flex-col gap-2 !border-accent/35 p-5 shadow-sm lg:grid lg:grid-rows-subgrid lg:row-span-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Ganancia ({moneda})
      </p>
      <p className="text-[2.5rem] font-bold leading-none tabular-nums text-foreground lg:self-end">
        {monto(resumen.gananciaTotal)}
        {resumen.sinCosto > 0 && (
          <span
            title={`Incluye ${resumen.sinCosto} venta${
              resumen.sinCosto === 1 ? "" : "s"
            } sin costo cargado`}
            className="ml-1 cursor-help align-super text-lg text-warning"
          >
            *
          </span>
        )}
      </p>
      {variacionPorcentual === null ? (
        <p className="text-[13px] text-muted">Sin ventas el mes anterior</p>
      ) : (
        <p
          className={`flex items-center gap-1 text-[13px] font-semibold ${
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

function Kpi({
  label,
  valor,
  unidad,
  className = "",
}: {
  label: string;
  valor: string;
  unidad?: string;
  className?: string;
}) {
  return (
    <div className={`card flex flex-col gap-2 p-4 lg:grid lg:grid-rows-subgrid lg:row-span-3 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-semibold leading-none tabular-nums text-foreground lg:self-end">
        {valor}
        {unidad && <span className="ml-1 text-sm font-normal text-muted">{unidad}</span>}
      </p>
      <span />
    </div>
  );
}

function AvisoDeshacer({
  notebook,
  onDeshacer,
}: {
  notebook: Notebook;
  onDeshacer: () => void;
}) {
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-border bg-foreground px-4 py-3 text-sm text-[var(--btn-primary-text)] shadow-lg"
    >
      <span className="min-w-0 truncate">Borraste la venta de {notebook.nombre}</span>
      <button
        type="button"
        onClick={onDeshacer}
        className="shrink-0 rounded-full px-3 py-1.5 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        Deshacer
      </button>
    </div>
  );
}

function ThOrden({
  campo,
  orden,
  onOrdenar,
  numerica = false,
  children,
}: {
  campo: CampoOrden;
  orden: Orden;
  onOrdenar: (campo: CampoOrden) => void;
  numerica?: boolean;
  children: React.ReactNode;
}) {
  const activo = orden.campo === campo;
  const ascendente = orden.direccion === "asc";

  return (
    <th
      scope="col"
      aria-sort={activo ? (ascendente ? "ascending" : "descending") : "none"}
      className={`font-medium ${numerica ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onOrdenar(campo)}
        className={`group flex w-full items-center gap-1 px-4 py-3 uppercase tracking-wide transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 ${
          numerica ? "justify-end" : "justify-start"
        } ${activo ? "text-foreground" : ""}`}
      >
        {children}
        <span aria-hidden className={activo ? "" : "opacity-0 group-hover:opacity-40"}>
          {activo ? (ascendente ? "▲" : "▼") : "▼"}
        </span>
      </button>
    </th>
  );
}

function TablaVentas({
  filas,
  moneda,
  hayVentas,
  etiquetaPeriodo,
  orden,
  onOrdenar,
  onEditar,
  onBorrar,
}: {
  filas: Notebook[];
  moneda: string;
  hayVentas: boolean;
  etiquetaPeriodo: string;
  orden: Orden;
  onOrdenar: (campo: CampoOrden) => void;
  onEditar: (n: Notebook) => void;
  onBorrar: (n: Notebook) => void;
}) {
  if (filas.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 px-5 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-soft text-muted">
          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-2">
            <path
              d="M3 17l6-6 4 4 8-8M21 7v6M21 7h-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="font-semibold text-foreground">
          {hayVentas ? "Ninguna venta coincide con la búsqueda" : `Sin ventas en ${etiquetaPeriodo}`}
        </p>
        <p className="max-w-sm text-sm text-muted">
          {hayVentas
            ? "Probá con otro nombre o limpiá el buscador."
            : "Cuando marques una publicación como vendida, o cargues una venta manual, va a aparecer acá."}
        </p>
      </div>
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
              <ThOrden campo="fecha" orden={orden} onOrdenar={onOrdenar}>Fecha</ThOrden>
              <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
              <ThOrden campo="costo" orden={orden} onOrdenar={onOrdenar} numerica>
                Costo ({moneda})
              </ThOrden>
              <ThOrden campo="venta" orden={orden} onOrdenar={onOrdenar} numerica>
                Venta ({moneda})
              </ThOrden>
              <ThOrden campo="ganancia" orden={orden} onOrdenar={onOrdenar} numerica>
                Ganancia ({moneda})
              </ThOrden>
              <ThOrden campo="margen" orden={orden} onOrdenar={onOrdenar} numerica>
                Margen
              </ThOrden>
              <ThOrden campo="dias" orden={orden} onOrdenar={onOrdenar} numerica>
                Días
              </ThOrden>
              <th scope="col" className="w-px py-3 pl-1 pr-3">
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
                    <span className="flex flex-wrap items-center gap-1">
                      <Pill>{n.categoria}</Pill>
                      {sinCosto(n) && <PillSinCosto />}
                    </span>
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
                  <td className="whitespace-nowrap py-3 pl-4 pr-2 text-right tabular-nums text-muted">
                    {dias !== null ? nfEntero.format(dias) : "—"}
                  </td>
                  <td className="w-px whitespace-nowrap py-3 pl-1 pr-3">
                    <div className="flex justify-end gap-0.5">
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
          <span className="flex flex-wrap items-center gap-1">
            <Pill>{notebook.categoria}</Pill>
            {sinCosto(notebook) && <PillSinCosto />}
          </span>
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

function PillSinCosto() {
  return (
    <span
      title="Sin costo cargado: la ganancia figura completa"
      className="mt-1 inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3 fill-none stroke-current stroke-[2.5]">
        <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Sin costo
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
