import type { Categoria, Notebook } from "@/lib/types";

export const CATEGORIAS: Categoria[] = [
  "Notebook",
  "PC de escritorio",
  "Consola",
  "Monitor",
  "Celular",
  "Otro",
];

export function resumenSpecs(n: Notebook): string[] {
  switch (n.categoria) {
    case "Notebook":
    case "PC de escritorio":
      return [n.procesador, n.ram, n.almacenamiento].filter(Boolean);
    case "Consola":
      return [n.almacenamiento, n.juegos_incluidos].filter(Boolean);
    case "Monitor":
      return [n.pantalla, n.tasa_refresco].filter(Boolean);
    case "Celular":
      return [n.ram, n.almacenamiento, n.estado_bateria].filter(Boolean);
    case "Otro":
    default:
      return [n.modelo].filter(Boolean);
  }
}

export function specsDetalle(n: Notebook): { label: string; value: string }[] {
  const base = [
    { label: "Marca", value: n.marca },
    { label: "Modelo", value: n.modelo },
  ];

  switch (n.categoria) {
    case "Notebook":
      return [
        ...base,
        { label: "Procesador", value: n.procesador },
        { label: "RAM", value: n.ram },
        { label: "Almacenamiento", value: n.almacenamiento },
        { label: "Placa de video", value: n.placa_video },
        { label: "Pantalla", value: n.pantalla },
        { label: "Sistema operativo", value: n.sistema_operativo },
        { label: "Batería", value: n.estado_bateria },
      ];
    case "PC de escritorio":
      return [
        ...base,
        { label: "Procesador", value: n.procesador },
        { label: "RAM", value: n.ram },
        { label: "Almacenamiento", value: n.almacenamiento },
        { label: "Placa de video", value: n.placa_video },
        { label: "Sistema operativo", value: n.sistema_operativo },
      ];
    case "Consola":
      return [
        ...base,
        { label: "Almacenamiento", value: n.almacenamiento },
        { label: "Joysticks incluidos", value: n.joysticks_incluidos },
        { label: "Juegos incluidos", value: n.juegos_incluidos },
      ];
    case "Monitor":
      return [
        ...base,
        { label: "Tamaño", value: n.pantalla },
        { label: "Tasa de refresco", value: n.tasa_refresco },
        { label: "Tipo de panel", value: n.tipo_panel },
      ];
    case "Celular":
      return [
        ...base,
        { label: "RAM", value: n.ram },
        { label: "Almacenamiento", value: n.almacenamiento },
        { label: "Sistema operativo", value: n.sistema_operativo },
        { label: "Batería", value: n.estado_bateria },
      ];
    case "Otro":
    default:
      return base;
  }
}
