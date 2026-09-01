import type { Notebook } from "@/lib/types";

export interface ResumenMoneda {
  moneda: string;
  cantidad: number;
  costoTotal: number;
  ingresosTotal: number;
  gananciaTotal: number;
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

    return {
      moneda,
      cantidad: items.length,
      costoTotal,
      ingresosTotal,
      gananciaTotal: ingresosTotal - costoTotal,
      diasPromedio,
    };
  });
}

export function gananciaItem(n: Notebook) {
  const venta = n.precio_venta_final ?? n.precio ?? 0;
  const costo = n.costo ?? 0;
  return venta - costo;
}
