export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: number;
  fechaCreacion: string;
}

export interface CrearProductoDto {
  nombre: string;
  precio: number;
  stock: number;
  categoriaId: number;
}

export type ActualizarProductoDto = Partial<CrearProductoDto>;

export const CAMPOS_ORDENABLES = ["id", "nombre", "precio", "stock"] as const;
export type CampoOrden = (typeof CAMPOS_ORDENABLES)[number];

export interface ListarProductosOpciones {
  page: number;
  limit: number;
  q?: string;
  categoriaId?: number;
  sort: CampoOrden;
  order: "asc" | "desc";
}

export interface Estadisticas {
  totalProductos: number;
  stockTotal: number;
  valorInventario: number;
  productosSinStock: number;
}
