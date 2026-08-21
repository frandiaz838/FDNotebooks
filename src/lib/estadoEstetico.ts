import type { EstadoBateria, EstadoEstetico } from "@/lib/types";

const ESTILOS: Record<EstadoEstetico, string> = {
  Nuevo: "bg-blue-50 text-blue-700",
  Excelente: "bg-emerald-50 text-emerald-700",
  "Muy bueno": "bg-teal-50 text-teal-700",
  "Bueno (detalles carcasa)": "bg-amber-50 text-amber-700",
  Outlet: "bg-slate-100 text-slate-600",
};

export function estadoEsteticoClasses(estado: EstadoEstetico) {
  return ESTILOS[estado] ?? "bg-slate-100 text-muted";
}

const ESTILOS_BATERIA: Record<EstadoBateria, string> = {
  Buena: "text-emerald-700",
  Regular: "text-amber-700",
  Agotada: "text-danger",
};

export function estadoBateriaClasses(estado: EstadoBateria) {
  return ESTILOS_BATERIA[estado] ?? "text-foreground";
}
