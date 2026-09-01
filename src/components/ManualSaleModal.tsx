"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AffixInput } from "@/components/AffixInput";
import { CATEGORIAS } from "@/lib/categorias";
import type { Categoria } from "@/lib/types";

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ManualSaleModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Notebook");
  const [costo, setCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [moneda, setMoneda] = useState("ARS");
  const [fecha, setFecha] = useState(hoyISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const vendidoEn = new Date(`${fecha}T12:00:00`).toISOString();

    const res = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        precio: Number(precioVenta) || 0,
        precio_venta_final: Number(precioVenta) || 0,
        costo: costo ? Number(costo) : null,
        moneda,
        disponible: false,
        vendido_en: vendidoEn,
        fotos: [],
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No se pudo cargar la venta.");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="card flex w-full max-w-sm flex-col gap-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold text-foreground">Cargar venta manual</h2>
          <p className="mt-1 text-sm text-muted">
            Para ventas que cerraste sin llegar a publicarlas en el sitio.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Qué vendiste</span>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input"
            placeholder="HP Pavilion (venta directa)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Categoría</span>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="input"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Costo</span>
            <AffixInput
              type="text"
              inputMode="numeric"
              prefix="$"
              value={costo ? Number(costo).toLocaleString("es-AR") : ""}
              onChange={(e) => setCosto(onlyDigits(e.target.value))}
              placeholder="200.000"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Precio de venta</span>
            <AffixInput
              required
              type="text"
              inputMode="numeric"
              prefix="$"
              value={precioVenta ? Number(precioVenta).toLocaleString("es-AR") : ""}
              onChange={(e) => setPrecioVenta(onlyDigits(e.target.value))}
              placeholder="300.000"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Moneda</span>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="input">
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fecha de venta</span>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-accent px-4 py-2 text-sm">
            {saving ? "Guardando..." : "Cargar venta"}
          </button>
        </div>
      </form>
    </div>
  );
}
