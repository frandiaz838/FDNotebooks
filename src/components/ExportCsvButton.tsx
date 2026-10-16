"use client";

import type { Notebook } from "@/lib/types";
import { diasHastaVender, gananciaItem, margenItem, ventaItem } from "@/lib/ganancias";
import { formatearFecha } from "@/lib/fechas";

const SEPARADOR = ";";

function celda(valor: string | number) {
  if (typeof valor === "number") {
    // Excel en es-AR espera coma decimal.
    return String(valor).replace(".", ",");
  }
  if (valor.includes(SEPARADOR) || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export function ExportCsvButton({
  ventas,
  moneda,
  clavePeriodo,
}: {
  ventas: Notebook[];
  moneda: string;
  clavePeriodo: string;
}) {
  function exportar() {
    const encabezado = [
      "Fecha de venta",
      "Nombre",
      "Categoría",
      "Moneda",
      `Costo (${moneda})`,
      `Venta (${moneda})`,
      `Ganancia (${moneda})`,
      "Margen %",
      "Días hasta vender",
    ];

    const filas = ventas.map((n) => {
      const margen = margenItem(n);
      const dias = diasHastaVender(n);
      return [
        formatearFecha(n.vendido_en),
        n.nombre,
        n.categoria,
        n.moneda,
        n.costo ?? 0,
        ventaItem(n),
        gananciaItem(n),
        margen !== null ? Number(margen.toFixed(1)) : "",
        dias !== null ? Math.round(dias) : "",
      ];
    });

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map(celda).join(SEPARADOR))
      .join("\r\n");

    // El BOM evita que Excel rompa los acentos.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `fd-ganancias-${clavePeriodo}-${moneda}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={ventas.length === 0}
      className="btn-secondary px-4 py-2 text-sm"
    >
      Descargar CSV
    </button>
  );
}
