"use client";

import { useState } from "react";
import { AffixInput } from "@/components/AffixInput";
import type { Notebook } from "@/lib/types";

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

export function MarkSoldModal({
  notebook,
  onConfirm,
  onCancel,
}: {
  notebook: Notebook;
  onConfirm: (precioVentaFinal: number) => void;
  onCancel: () => void;
}) {
  const [precioFinal, setPrecioFinal] = useState(String(notebook.precio));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-foreground">¿A cuánto la vendiste?</h2>
        <p className="mt-1 text-sm text-muted">
          {notebook.nombre} — publicada a {notebook.moneda}{" "}
          {new Intl.NumberFormat("es-AR").format(notebook.precio)}
        </p>

        <label className="mt-4 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Precio de venta final</span>
          <AffixInput
            type="text"
            inputMode="numeric"
            prefix={notebook.moneda === "USD" ? "US$" : "$"}
            value={precioFinal ? Number(precioFinal).toLocaleString("es-AR") : ""}
            onChange={(e) => setPrecioFinal(onlyDigits(e.target.value))}
            autoFocus
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Number(precioFinal) || 0)}
            className="btn-accent px-4 py-2 text-sm"
          >
            Confirmar venta
          </button>
        </div>
      </div>
    </div>
  );
}
