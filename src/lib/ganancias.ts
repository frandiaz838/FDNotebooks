import type { Notebook } from "@/lib/types";
import { claveMes, etiquetaMesDesdeClave } from "@/lib/fechas";

export const SIN_FECHA = "sin-fecha";

export interface ResumenMoneda {
  moneda: string;
  cantidad: number;
  costoTotal: number;
  ingresosTotal: number;
  gananciaTotal: number;
  margen: number | null;
  diasPromedio: number | null;
  sinCosto: number;
}

export interface Periodo {
  clave: string;
  etiqueta: string;
}

export function ventaItem(n: Notebook) {
  return n.precio_venta_final ?? n.precio ?? 0;
}

export function gananciaItem(n: Notebook) {
  return ventaItem(n) - (n.costo ?? 0);
}

export function margenItem(n: Notebook) {
  const venta = ventaItem(n);
  if (venta <= 0) return null;
  return (gananciaItem(n) / venta) * 100;
}

export function sinCosto(n: Notebook) {
  return !n.costo;
}

export function diasHastaVender(n: Notebook) {
  if (!n.vendido_en) return null;
  const ms = new Date(n.vendido_en).getTime() - new Date(n.creado_en).getTime();
  const dias = ms / (1000 * 60 * 60 * 24);
  return dias >= 0 ? dias : null;
}

// Única fuente de los totales: todo lo que se muestre arriba sale de acá.
export function resumirVentas(items: Notebook[], moneda: string): ResumenMoneda {
  const propios = items.filter((n) => n.moneda === moneda);

  const costoTotal = propios.reduce((suma, n) => suma + (n.costo ?? 0), 0);
  const ingresosTotal = propios.reduce((suma, n) => suma + ventaItem(n), 0);
  const gananciaTotal = ingresosTotal - costoTotal;

  const dias = propios
    .map(diasHastaVender)
    .filter((d): d is number => d !== null);

  return {
    moneda,
    cantidad: propios.length,
    costoTotal,
    ingresosTotal,
    gananciaTotal,
    margen: ingresosTotal > 0 ? (gananciaTotal / ingresosTotal) * 100 : null,
    diasPromedio: dias.length > 0 ? dias.reduce((a, b) => a + b, 0) / dias.length : null,
    sinCosto: propios.filter(sinCosto).length,
  };
}

export function monedasDe(items: Notebook[]) {
  return Array.from(new Set(items.map((n) => n.moneda))).sort((a, b) => a.localeCompare(b));
}

export function clavePeriodo(n: Notebook) {
  return n.vendido_en ? claveMes(new Date(n.vendido_en)) : SIN_FECHA;
}

export function ventasDelPeriodo(vendidas: Notebook[], clave: string) {
  return vendidas
    .filter((n) => clavePeriodo(n) === clave)
    .sort((a, b) => {
      const fa = a.vendido_en ? new Date(a.vendido_en).getTime() : 0;
      const fb = b.vendido_en ? new Date(b.vendido_en).getTime() : 0;
      return fb - fa;
    });
}

export function claveAnterior(clave: string) {
  if (clave === SIN_FECHA) return null;
  const [anio, mes] = clave.split("-").map(Number);
  const previo = mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
  return `${previo.anio}-${String(previo.mes).padStart(2, "0")}`;
}

/** Meses navegables: desde la venta más vieja hasta el mes actual, sin huecos. */
export function periodosConVentas(vendidas: Notebook[], mesActual: string): Periodo[] {
  const claves = new Set(vendidas.map(clavePeriodo));
  const meses = Array.from(claves).filter((clave) => clave !== SIN_FECHA);
  meses.push(mesActual);

  const ordenados = meses.sort();
  const masViejo = ordenados[0];
  const completo: string[] = [];

  let cursor = mesActual;
  while (cursor && cursor >= masViejo) {
    completo.push(cursor);
    cursor = claveAnterior(cursor) as string;
  }

  const periodos: Periodo[] = completo.map((clave) => ({
    clave,
    etiqueta: etiquetaMesDesdeClave(clave),
  }));

  // Las ventas viejas sin fecha cargada quedarían invisibles al navegar por
  // mes, así que se llega a ellas como un período más, al final.
  if (claves.has(SIN_FECHA)) {
    periodos.push({ clave: SIN_FECHA, etiqueta: "Sin fecha de venta" });
  }

  return periodos;
}

export function variacion(actual: number, anterior: number) {
  if (anterior === 0) return null;
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}
