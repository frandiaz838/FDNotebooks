"use client";

import type { Notebook } from "@/lib/types";
import { gananciaItem } from "@/lib/ganancias";

function csvEscape(value: string | number) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportCsvButton({ vendidas }: { vendidas: Notebook[] }) {
  function handleExport() {
    const header = ["Fecha de venta", "Nombre", "Categoría", "Moneda", "Costo", "Precio de venta", "Ganancia"];
    const rows = vendidas.map((n) => [
      n.vendido_en ? new Date(n.vendido_en).toLocaleDateString("es-AR") : "",
      n.nombre,
      n.categoria,
      n.moneda,
      n.costo ?? 0,
      n.precio_venta_final ?? n.precio,
      gananciaItem(n),
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `fd-computacion-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={vendidas.length === 0}
      className="btn-secondary px-4 py-2 text-sm"
    >
      Descargar CSV
    </button>
  );
}
