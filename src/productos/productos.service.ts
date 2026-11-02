import type { CategoriasRepository } from "../categorias/categorias.repository.js";
import { AppError } from "../errors/app-error.js";
import type {
  ActualizarProductoDto,
  CrearProductoDto,
  Estadisticas,
  ListarProductosOpciones,
  Producto
} from "./producto.js";
import type { ProductosRepository } from "./productos.repository.js";

export class ProductosService {
  constructor(
    private readonly repository: ProductosRepository,
    private readonly categorias: CategoriasRepository
  ) {}

  listar(opciones: ListarProductosOpciones) {
    const { items, total } = this.repository.listar(opciones);
    return {
      data: items,
      meta: {
        page: opciones.page,
        limit: opciones.limit,
        total,
        totalPages: Math.ceil(total / opciones.limit)
      }
    };
  }

  obtenerPorId(id: number): Producto {
    const producto = this.repository.buscarPorId(id);
    if (!producto) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "El producto solicitado no existe");
    }
    return producto;
  }

  crear(dto: CrearProductoDto): Producto {
    this.exigirCategoria(dto.categoriaId);
    return this.repository.crear({ ...dto, fechaCreacion: new Date().toISOString() });
  }

  actualizar(id: number, dto: ActualizarProductoDto): Producto {
    this.obtenerPorId(id);
    if (dto.categoriaId !== undefined) this.exigirCategoria(dto.categoriaId);
    return this.repository.actualizar(id, dto)!;
  }

  eliminar(id: number): void {
    this.obtenerPorId(id);
    this.repository.eliminar(id);
  }

  obtenerEstadisticas(categoriaId?: number): Estadisticas {
    // En una consulta por URL, una categoría inexistente es un recurso no encontrado (404)
    if (categoriaId !== undefined) this.exigirCategoria(categoriaId, 404);
    return this.repository.estadisticas(categoriaId);
  }

  // 422 cuando la referencia viene en el cuerpo; 404 cuando viene en la URL
  private exigirCategoria(categoriaId: number, status: 404 | 422 = 422): void {
    if (!this.categorias.buscarPorId(categoriaId)) {
      throw new AppError(status, "CATEGORY_NOT_FOUND", "La categoría indicada no existe");
    }
  }
}
