"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria, EstadoBateria, EstadoEstetico, Notebook, NotebookInput } from "@/lib/types";
import { PhotoUploader } from "@/components/PhotoUploader";
import { AffixInput } from "@/components/AffixInput";
import { CATEGORIAS } from "@/lib/categorias";
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
const SISTEMAS_OPERATIVOS_CELULAR = ["Android", "iOS"];
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

  const [categoria, setCategoria] = useState<Categoria>(initial?.categoria ?? "Notebook");

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
  const [placaVideo, setPlacaVideo] = useState(initial?.placa_video ?? "");
  const [joysticksIncluidos, setJoysticksIncluidos] = useState(
    initial?.joysticks_incluidos ?? ""
  );
  const [juegosIncluidos, setJuegosIncluidos] = useState(initial?.juegos_incluidos ?? "");
  const [tasaRefresco, setTasaRefresco] = useState(initial?.tasa_refresco ?? "");
  const [tipoPanel, setTipoPanel] = useState(initial?.tipo_panel ?? "");

  const [estadoEstetico, setEstadoEstetico] = useState<EstadoEstetico>(
    initial?.estado_estetico ?? "Excelente"
  );
  const [precio, setPrecio] = useState(initial?.precio ? String(initial.precio) : "");
  const [moneda, setMoneda] = useState(initial?.moneda ?? "ARS");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [fotos, setFotos] = useState<string[]>(initial?.fotos ?? []);
  const [disponible, setDisponible] = useState(initial?.disponible ?? true);
  const [destacado, setDestacado] = useState(initial?.destacado ?? false);
  const [costo, setCosto] = useState(initial?.costo ? String(initial.costo) : "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: NotebookInput = {
      categoria,
      nombre,
      marca,
      modelo,
      procesador,
      ram: formatRam(ram, ramTipo),
      almacenamiento: formatAlmacenamiento(almacenSize, almacenTipo),
      pantalla: formatPantalla(pantallaSize, resolucion, tactil),
      sistema_operativo: sistemaOperativo,
      estado_bateria: estadoBateria,
      placa_video: placaVideo,
      joysticks_incluidos: joysticksIncluidos,
      juegos_incluidos: juegosIncluidos,
      tasa_refresco: tasaRefresco,
      tipo_panel: tipoPanel,
      estado_estetico: estadoEstetico,
      precio: Number(precio) || 0,
      moneda,
      descripcion,
      fotos,
      disponible,
      suspendida: initial?.suspendida ?? false,
      destacado,
      costo: costo ? Number(costo) : null,
      precio_venta_final: initial?.precio_venta_final ?? null,
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
      setError(body.error ?? "No se pudo guardar la publicación.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const esNotebookOPC = categoria === "Notebook" || categoria === "PC de escritorio";
  const mostrarRam = esNotebookOPC || categoria === "Celular";
  const mostrarAlmacenamiento = esNotebookOPC || categoria === "Consola" || categoria === "Celular";
  const mostrarTipoAlmacenamiento = esNotebookOPC || categoria === "Consola";
  const mostrarPlacaVideo = esNotebookOPC;
  const mostrarSistemaOperativo = esNotebookOPC || categoria === "Celular";
  const mostrarBateria = categoria === "Notebook" || categoria === "Celular";
  const opcionesSistemaOperativo =
    categoria === "Celular" ? SISTEMAS_OPERATIVOS_CELULAR : SISTEMAS_OPERATIVOS;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Section title="Categoría" description="Define qué campos vas a poder cargar más abajo.">
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoria(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                categoria === cat
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Información básica" description="Cómo se va a identificar la publicación.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre / Modelo comercial">
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              placeholder={
                categoria === "Consola"
                  ? "PlayStation 4 Slim 1TB"
                  : categoria === "Monitor"
                    ? "Samsung 24'' Full HD"
                    : "Lenovo ThinkPad T480"
              }
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
        </div>
      </Section>

      <Section title="Especificaciones" description="Se arman automáticamente con el formato correcto.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {esNotebookOPC && (
            <Field label="Procesador">
              <input
                value={procesador}
                onChange={(e) => setProcesador(e.target.value)}
                className="input"
                placeholder="Intel Core i5-8250U"
              />
            </Field>
          )}

          {mostrarRam && (
            <Field label="Memoria RAM">
              {esNotebookOPC ? (
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
              ) : (
                <AffixInput
                  type="text"
                  inputMode="numeric"
                  suffix="GB"
                  value={ram}
                  onChange={(e) => setRam(onlyDigits(e.target.value))}
                  placeholder="8"
                />
              )}
            </Field>
          )}

          {mostrarAlmacenamiento && (
            <Field label="Almacenamiento">
              {mostrarTipoAlmacenamiento ? (
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
              ) : (
                <AffixInput
                  type="text"
                  inputMode="numeric"
                  suffix="GB"
                  value={almacenSize}
                  onChange={(e) => setAlmacenSize(onlyDigits(e.target.value))}
                  placeholder="128"
                />
              )}
            </Field>
          )}

          {mostrarPlacaVideo && (
            <Field label="Placa de video">
              <input
                value={placaVideo}
                onChange={(e) => setPlacaVideo(e.target.value)}
                className="input"
                placeholder={
                  categoria === "Notebook" ? "Integrada / NVIDIA MX450" : "NVIDIA GTX 1660"
                }
              />
            </Field>
          )}

          {mostrarSistemaOperativo && (
            <Field label="Sistema operativo">
              <select
                value={sistemaOperativo}
                onChange={(e) => setSistemaOperativo(e.target.value)}
                className="input"
              >
                {opcionesSistemaOperativo.map((so) => (
                  <option key={so} value={so}>
                    {so}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {mostrarBateria && (
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
          )}

          {categoria === "Consola" && (
            <Field label="Joysticks incluidos">
              <input
                value={joysticksIncluidos}
                onChange={(e) => setJoysticksIncluidos(e.target.value)}
                className="input"
                placeholder="2 joysticks originales"
              />
            </Field>
          )}

          {categoria === "Consola" && (
            <Field label="Juegos incluidos">
              <input
                value={juegosIncluidos}
                onChange={(e) => setJuegosIncluidos(e.target.value)}
                className="input"
                placeholder="FIFA 24, God of War"
              />
            </Field>
          )}

          {(categoria === "Notebook" || categoria === "Monitor") && (
            <Field label={categoria === "Monitor" ? "Tamaño" : "Tamaño de pantalla"}>
              <AffixInput
                type="text"
                inputMode="decimal"
                suffix={'"'}
                value={pantallaSize}
                onChange={(e) => setPantallaSize(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="14"
              />
            </Field>
          )}

          {(categoria === "Notebook" || categoria === "Monitor") && (
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
          )}

          {categoria === "Monitor" && (
            <Field label="Tasa de refresco">
              <AffixInput
                type="text"
                inputMode="numeric"
                suffix="Hz"
                value={tasaRefresco}
                onChange={(e) => setTasaRefresco(onlyDigits(e.target.value))}
                placeholder="144"
              />
            </Field>
          )}

          {categoria === "Monitor" && (
            <Field label="Tipo de panel">
              <input
                value={tipoPanel}
                onChange={(e) => setTipoPanel(e.target.value)}
                className="input"
                placeholder="IPS"
              />
            </Field>
          )}
        </div>

        {categoria === "Notebook" && (
          <label className="flex w-fit items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={tactil} onChange={(e) => setTactil(e.target.checked)} />
            Pantalla táctil
          </label>
        )}

        {categoria === "Otro" && (
          <p className="text-sm text-muted">
            Esta categoría no tiene especificaciones fijas — contá los detalles en la descripción
            de más abajo.
          </p>
        )}
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

      <Section
        title="Costo de compra (privado)"
        description="Solo lo ves vos en el panel — nunca se muestra en el catálogo. Sirve para calcular tu ganancia."
      >
        <div className="max-w-xs">
          <Field label="Cuánto pagaste por este equipo">
            <AffixInput
              type="text"
              inputMode="numeric"
              prefix="$"
              value={costo ? Number(costo).toLocaleString("es-AR") : ""}
              onChange={(e) => setCosto(onlyDigits(e.target.value))}
              placeholder="200.000"
            />
          </Field>
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
          {saving ? "Guardando..." : "Guardar publicación"}
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
