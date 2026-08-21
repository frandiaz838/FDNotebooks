export const TIPOS_ALMACENAMIENTO = ["SSD", "HDD"] as const;
export type TipoAlmacenamiento = (typeof TIPOS_ALMACENAMIENTO)[number];

export const TIPOS_RAM = ["DDR3", "DDR4", "DDR5"] as const;
export type TipoRam = (typeof TIPOS_RAM)[number];

export const RESOLUCIONES = ["Full HD", "2K", "4K"] as const;
export type Resolucion = (typeof RESOLUCIONES)[number];

export function formatRam(size: string, tipo: TipoRam) {
  return size ? `${size}GB ${tipo}` : "";
}

export function parseRam(ram: string) {
  const size = ram.match(/\d+/)?.[0] ?? "";
  const match = ram.match(/ddr\s*(3|4|5)/i);
  const tipo: TipoRam = match ? (`DDR${match[1]}` as TipoRam) : "DDR4";
  return { size, tipo };
}

export function formatAlmacenamiento(size: string, tipo: TipoAlmacenamiento) {
  return size ? `${size}GB ${tipo}` : "";
}

export function parseAlmacenamiento(value: string) {
  const size = value.match(/\d+/)?.[0] ?? "";
  const tipo: TipoAlmacenamiento = /hdd/i.test(value) ? "HDD" : "SSD";
  return { size, tipo };
}

export function formatPantalla(size: string, resolucion: Resolucion, tactil: boolean) {
  if (!size) return "";
  return `${size}" ${resolucion}${tactil ? " Táctil" : ""}`;
}

export function parsePantalla(value: string) {
  const size = value.match(/\d+(\.\d+)?/)?.[0] ?? "";
  const resolucion: Resolucion = /4k/i.test(value) ? "4K" : /2k/i.test(value) ? "2K" : "Full HD";
  const tactil = /t[aá]ctil/i.test(value);
  return { size, resolucion, tactil };
}
