import type { EstadoBateria, EstadoEstetico } from "@/lib/types";

const ESTILOS: Record<EstadoEstetico, string> = {
  Nuevo: "bg-info-soft text-info",
  Excelente: "bg-success-soft text-success",
  "Muy bueno": "bg-success-soft text-success",
  "Bueno (detalles carcasa)": "bg-warning-soft text-warning",
  Outlet: "bg-neutral-soft text-muted",
};

export function estadoEsteticoClasses(estado: EstadoEstetico) {
  return ESTILOS[estado] ?? "bg-neutral-soft text-muted";
}

const ESTILOS_BATERIA: Record<EstadoBateria, string> = {
  Buena: "text-success",
  Regular: "text-warning",
  Agotada: "text-danger",
};

export function estadoBateriaClasses(estado: EstadoBateria) {
  return ESTILOS_BATERIA[estado] ?? "text-foreground";
}
