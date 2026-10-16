import type { Notebook } from "@/lib/types";
import { claveMes, etiquetaMes } from "@/lib/fechas";

const SIN_FECHA = "sin-fecha";

export interface MesVentas {
  clave: string;
  etiqueta: string;
  items: Notebook[];
  resumenes: ResumenMoneda[];
}

export interface ResumenMoneda {
  moneda: string;
  cantidad: number;
  costoTotal: number;
  ingresosTotal: number;
  gananciaTotal: number;
  margen: number | null;
  diasPromedio: number | null;
}

function diasEntre(desde: string, hasta: string) {
  const ms = new Date(hasta).getTime() - new Date(desde).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function calcularResumen(vendidas: Notebook[]): ResumenMoneda[] {
  const porMoneda = new Map<string, Notebook[]>();
  for (const n of vendidas) {
    const lista = porMoneda.get(n.moneda) ?? [];
    lista.push(n);
    porMoneda.set(n.moneda, lista);
  }

  return Array.from(porMoneda.entries()).map(([moneda, items]) => {
    const costoTotal = items.reduce((sum, n) => sum + (n.costo ?? 0), 0);
    const ingresosTotal = items.reduce(
      (sum, n) => sum + (n.precio_venta_final ?? n.precio ?? 0),
      0
    );

    const dias = items
      .filter((n) => n.vendido_en)
      .map((n) => diasEntre(n.creado_en, n.vendido_en as string))
      .filter((d) => d >= 0);
    const diasPromedio = dias.length > 0 ? dias.reduce((a, b) => a + b, 0) / dias.length : null;

    const gananciaTotal = ingresosTotal - costoTotal;

    return {
      moneda,
      cantidad: items.length,
      costoTotal,
      ingresosTotal,
      gananciaTotal,
      margen: ingresosTotal > 0 ? (gananciaTotal / ingresosTotal) * 100 : null,
      diasPromedio,
    };
  })
  .sort((a, b) => a.moneda.localeCompare(b.moneda));
}

function masRecientePrimero(a: Notebook, b: Notebook) {
  const fa = a.vendido_en ? new Date(a.vendido_en).getTime() : 0;
  const fb = b.vendido_en ? new Date(b.vendido_en).getTime() : 0;
  return fb - fa;
}

export function agruparPorMes(vendidas: Notebook[]): MesVentas[] {
  const porMes = new Map<string, Notebook[]>();
  for (const n of vendidas) {
    const clave = n.vendido_en ? claveMes(new Date(n.vendido_en)) : SIN_FECHA;
    const lista = porMes.get(clave) ?? [];
    lista.push(n);
    porMes.set(clave, lista);
  }

  return Array.from(porMes.entries())
    .sort(([claveA], [claveB]) => {
      if (claveA === SIN_FECHA) return 1;
      if (claveB === SIN_FECHA) return -1;
      return claveB.localeCompare(claveA);
    })
    .map(([clave, items]) => ({
      clave,
      etiqueta:
        clave === SIN_FECHA
          ? "Sin fecha de venta"
          : etiquetaMes(new Date(items[0].vendido_en as string)),
      items: [...items].sort(masRecientePrimero),
      resumenes: calcularResumen(items),
    }));
}

export function gananciaItem(n: Notebook) {
  const venta = n.precio_venta_final ?? n.precio ?? 0;
  const costo = n.costo ?? 0;
  return venta - costo;
}
