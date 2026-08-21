"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EstadoBateria, EstadoEstetico, Notebook, NotebookInput } from "@/lib/types";
import { PhotoUploader } from "@/components/PhotoUploader";
import { AffixInput } from "@/components/AffixInput";
import {
  RESOLUCIONES,
  TIPOS_ALMACENAMIENTO,
  TIPOS_RAM,
  formatAlmacenamiento,
  formatPantalla,
  formatRam,
  parseAlmacenamiento,
  parsePantalla,
  parseRam,
  type Resolucion,
  type TipoAlmacenamiento,
  type TipoRam,
} from "@/lib/notebookFormat";

const ESTADOS: EstadoEstetico[] = ["Nuevo", "Excelente", "Muy bueno", "Bueno (detalles carcasa)", "Outlet"];
const MONEDAS = ["ARS", "USD"];
const SISTEMAS_OPERATIVOS = [
  "Windows 11",
  "Windows 10",
  "Windows 8",
  "Windows 7",
  "Linux",
  "Sin sistema operativo",
];
const ESTADOS_BATERIA: EstadoBateria[] = ["Buena", "Regular", "Agotada"];

type Props = { mode: "crear" } | { mode: "editar"; notebook: Notebook };

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

export function NotebookForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === "editar" ? props.notebook : null;

  const ramInicial = parseRam(initial?.ram ?? "");
  const almacenInicial = parseAlmacenamiento(initial?.almacenamiento ?? "");
  const pantallaInicial = parsePantalla(initial?.pantalla ?? "");

  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [marca, setMarca] = useState(initial?.marca ?? "");
  const [modelo, setModelo] = useState(initial?.modelo ?? "");
  const [procesador, setProcesador] = useState(initial?.procesador ?? "");

  const [ram, setRam] = useState(ramInicial.size);
  const [ramTipo, setRamTipo] = useState<TipoRam>(ramInicial.tipo);
  const [almacenSize, setAlmacenSize] = useState(almacenInicial.size);
  const [almacenTipo, setAlmacenTipo] = useState<TipoAlmacenamiento>(almacenInicial.tipo);
  const [pantallaSize, setPantallaSize] = useState(pantallaInicial.size);
  const [resolucion, setResolucion] = useState<Resolucion>(pantallaInicial.resolucion);
  const [tactil, setTactil] = useState(pantallaInicial.tactil);
  const [sistemaOperativo, setSistemaOperativo] = useState(
    initial?.sistema_operativo ?? "Windows 11"
  );
  const [estadoBateria, setEstadoBateria] = useState<EstadoBateria>(
    initial?.estado_bateria ?? "Buena"
  );

  const [estadoEstetico, setEstadoEstetico] = useState<EstadoEstetico>(
    initial?.estado_estetico ?? "Excelente"
  );
  const [precio, setPrecio] = useState(initial?.precio ? String(initial.precio) : "");
  const [moneda, setMoneda] = useState(initial?.moneda ?? "ARS");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [fotos, setFotos] = useState<string[]>(initial?.fotos ?? []);
  const [disponible, setDisponible] = useState(initial?.disponible ?? true);
  const [destacado, setDestacado] = useState(initial?.destacado ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: NotebookInput = {
      nombre,
      marca,
      modelo,
      procesador,
      ram: formatRam(ram, ramTipo),
      almacenamiento: formatAlmacenamiento(almacenSize, almacenTipo),
      pantalla: formatPantalla(pantallaSize, resolucion, tactil),
      sistema_operativo: sistemaOperativo,
      estado_bateria: estadoBateria,
      estado_estetico: estadoEstetico,
      precio: Number(precio) || 0,
      moneda,
      descripcion,
      fotos,
      disponible,
      destacado,
    };

    const url = props.mode === "editar" ? `/api/notebooks/${props.notebook.id}` : "/api/notebooks";
    const method = props.mode === "editar" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No se pudo guardar la notebook.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Section title="Información básica" description="Cómo se va a identificar la notebook.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre / Modelo comercial">
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              placeholder="Lenovo ThinkPad T480"
            />
          </Field>
          <Field label="Marca">
            <input
              required
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="input"
              placeholder="Lenovo"
            />
          </Field>
          <Field label="Modelo (código)">
            <input
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="input"
              placeholder="T480"
            />
          </Field>
          <Field label="Procesador">
            <input
              value={procesador}
              onChange={(e) => setProcesador(e.target.value)}
              className="input"
              placeholder="Intel Core i5-8250U"
            />
          </Field>
        </div>
      </Section>

      <Section title="Especificaciones" description="Se arman automáticamente con el formato correcto.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Memoria RAM">
            <div className="flex gap-2">
              <AffixInput
                type="text"
                inputMode="numeric"
                suffix="GB"
                value={ram}
                onChange={(e) => setRam(onlyDigits(e.target.value))}
                placeholder="8"
              />
              <select
                value={ramTipo}
                onChange={(e) => setRamTipo(e.target.value as TipoRam)}
                className="w-24 shrink-0 rounded-xl border border-border bg-card px-2.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-28"
              >
                {TIPOS_RAM.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Almacenamiento">
            <div className="flex gap-2">
              <AffixInput
                type="text"
                inputMode="numeric"
                suffix="GB"
                value={almacenSize}
                onChange={(e) => setAlmacenSize(onlyDigits(e.target.value))}
                placeholder="256"
              />
              <select
                value={almacenTipo}
                onChange={(e) => setAlmacenTipo(e.target.value as TipoAlmacenamiento)}
                className="w-24 shrink-0 rounded-xl border border-border bg-card px-2.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-28"
              >
                {TIPOS_ALMACENAMIENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Tamaño de pantalla">
            <AffixInput
              type="text"
              inputMode="decimal"
              suffix={'"'}
              value={pantallaSize}
              onChange={(e) => setPantallaSize(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="14"
            />
          </Field>

          <Field label="Resolución">
            <select
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value as Resolucion)}
              className="input"
            >
              {RESOLUCIONES.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sistema operativo">
            <select
              value={sistemaOperativo}
              onChange={(e) => setSistemaOperativo(e.target.value)}
              className="input"
            >
              {SISTEMAS_OPERATIVOS.map((so) => (
                <option key={so} value={so}>
                  {so}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estado de la batería">
            <select
              value={estadoBateria}
              onChange={(e) => setEstadoBateria(e.target.value as EstadoBateria)}
              className="input"
            >
              {ESTADOS_BATERIA.map((eb) => (
                <option key={eb} value={eb}>
                  {eb}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex w-fit items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={tactil} onChange={(e) => setTactil(e.target.checked)} />
          Pantalla táctil
        </label>
      </Section>

      <Section title="Precio y estado" description="Lo que va a ver el comprador primero.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Precio">
            <AffixInput
              required
              type="text"
              inputMode="numeric"
              prefix="$"
              value={precio ? Number(precio).toLocaleString("es-AR") : ""}
              onChange={(e) => setPrecio(onlyDigits(e.target.value))}
              placeholder="450.000"
            />
          </Field>
          <Field label="Moneda">
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="input">
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado estético">
            <select
              value={estadoEstetico}
              onChange={(e) => setEstadoEstetico(e.target.value as EstadoEstetico)}
              className="input"
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-3">
          <ToggleChip label="Disponible" checked={disponible} onChange={setDisponible} />
          <ToggleChip label="Destacado" checked={destacado} onChange={setDestacado} />
        </div>
      </Section>

      <Section title="Fotos" description="La primera foto es la que se ve en el catálogo.">
        <PhotoUploader value={fotos} onChange={setFotos} />
      </Section>

      <Section title="Descripción" description="Accesorios incluidos, detalles extra, lo que quieras contar.">
        <textarea
          value={descripcion ?? ""}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={14}
          className="input"
          placeholder="Incluye cargador original, teclado en español..."
        />
      </Section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-accent px-8 py-3 text-base">
          {saving ? "Guardando..." : "Guardar notebook"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card flex flex-col gap-4 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ToggleChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        checked
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-card text-muted hover:text-foreground"
      }`}
    >
      {checked ? "✓ " : ""}
      {label}
    </button>
  );
}
