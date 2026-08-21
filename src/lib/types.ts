export type EstadoEstetico =
  | "Nuevo"
  | "Excelente"
  | "Muy bueno"
  | "Bueno (detalles carcasa)"
  | "Outlet";

export interface Notebook {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  procesador: string;
  ram: string;
  almacenamiento: string;
  pantalla: string;
  estado_estetico: EstadoEstetico;
  precio: number;
  moneda: string;
  descripcion: string | null;
  fotos: string[];
  disponible: boolean;
  destacado: boolean;
  creado_en: string;
  actualizado_en: string;
}

export type NotebookInput = Omit<
  Notebook,
  "id" | "creado_en" | "actualizado_en"
>;
