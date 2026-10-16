// El server corre en UTC y el navegador en hora local: si cada uno formatea por
// su cuenta, una venta cargada de noche cae en días (y meses) distintos. Fijamos
// la zona del vendedor para que los dos agrupen y muestren lo mismo.
const ZONA = "America/Argentina/Buenos_Aires";

const formatoClave = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
});

const formatoMes = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA,
  year: "numeric",
  month: "long",
});

const formatoDia = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoDiaCorto = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function mayuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function claveMes(fecha: Date) {
  const partes = Object.fromEntries(
    formatoClave.formatToParts(fecha).map((parte) => [parte.type, parte.value])
  );
  // es-AR ignora el "2-digit" del mes, y sin el cero adelante "2026-9" ordena
  // por encima de "2026-10" al comparar como texto.
  return `${partes.year}-${partes.month.padStart(2, "0")}`;
}

export function etiquetaMes(fecha: Date) {
  return mayuscula(formatoMes.format(fecha));
}

export function etiquetaMesDesdeClave(clave: string) {
  const [anio, mes] = clave.split("-").map(Number);
  // Mediodía: evita que el cambio de zona corra la fecha al mes anterior.
  return etiquetaMes(new Date(anio, mes - 1, 1, 12));
}

export function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  return formatoDia.format(new Date(iso));
}

/** "vie 16 oct · 17:41" */
export function formatearFechaHoraCorta(fecha: Date) {
  const dia = formatoDiaCorto.format(fecha).replace(/,/g, "");
  return `${dia} · ${formatoHora.format(fecha)}`;
}
