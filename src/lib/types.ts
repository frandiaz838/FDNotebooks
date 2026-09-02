export type EstadoEstetico =
  | "Nuevo"
  | "Excelente"
  | "Muy bueno"
  | "Bueno (detalles carcasa)"
  | "Outlet";

export type EstadoBateria = "Buena" | "Regular" | "Agotada";

export type Categoria =
  | "Notebook"
  | "PC de escritorio"
  | "Consola"
  | "Monitor"
  | "Celular"
  | "Otro";

export interface Notebook {
  id: string;
  categoria: Categoria;
  nombre: string;
  marca: string;
  modelo: string;
  procesador: string;
  ram: string;
  almacenamiento: string;
  pantalla: string;
  sistema_operativo: string;
  estado_bateria: EstadoBateria;
  placa_video: string;
  joysticks_incluidos: string;
  juegos_incluidos: string;
  tasa_refresco: string;
  tipo_panel: string;
  estado_estetico: EstadoEstetico;
  precio: number;
  moneda: string;
  descripcion: string | null;
  fotos: string[];
  disponible: boolean;
  suspendida: boolean;
  destacado: boolean;
  // Privados: nunca se muestran en el catálogo público.
  costo: number | null;
  precio_venta_final: number | null;
  vendido_en: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type NotebookInput = Omit<
  Notebook,
  "id" | "creado_en" | "actualizado_en" | "vendido_en"
>;
