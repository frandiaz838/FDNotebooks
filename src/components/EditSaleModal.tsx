"use client";

import { useState } from "react";
import { AffixInput } from "@/components/AffixInput";
import type { Notebook } from "@/lib/types";

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function toDateInput(iso: string | null) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

export function EditSaleModal({
  notebook,
  onConfirm,
  onCancel,
}: {
  notebook: Notebook;
  onConfirm: (data: { costo: number | null; precioVentaFinal: number; vendidoEn: string }) => void;
  onCancel: () => void;
}) {
  const [costo, setCosto] = useState(notebook.costo ? String(notebook.costo) : "");
  const [precioFinal, setPrecioFinal] = useState(
    String(notebook.precio_venta_final ?? notebook.precio)
  );
  const [fecha, setFecha] = useState(toDateInput(notebook.vendido_en));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-foreground">Editar venta</h2>
        <p className="mt-1 text-sm text-muted">{notebook.nombre}</p>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Costo</span>
            <AffixInput
              type="text"
              inputMode="numeric"
              prefix={notebook.moneda === "USD" ? "US$" : "$"}
              value={costo ? Number(costo).toLocaleString("es-AR") : ""}
              onChange={(e) => setCosto(onlyDigits(e.target.value))}
              placeholder="200.000"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
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

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fecha de venta</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                costo: costo ? Number(costo) : null,
                precioVentaFinal: Number(precioFinal) || 0,
                vendidoEn: new Date(`${fecha}T12:00:00`).toISOString(),
              })
            }
            className="btn-accent px-4 py-2 text-sm"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
