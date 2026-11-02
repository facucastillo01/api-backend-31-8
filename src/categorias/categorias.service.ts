import { AppError } from "../errors/app-error.js";
import type { ActualizarCategoriaDto, Categoria, CrearCategoriaDto } from "./categoria.js";
import type { CategoriasRepository } from "./categorias.repository.js";

export class CategoriasService {
  constructor(private readonly repository: CategoriasRepository) {}

  obtenerTodas(): Categoria[] {
    return this.repository.listar();
  }

  obtenerPorId(id: number): Categoria {
    const categoria = this.repository.buscarPorId(id);
    if (!categoria) {
      throw new AppError(404, "CATEGORY_NOT_FOUND", "La categoría solicitada no existe");
    }
    return categoria;
  }

  crear(dto: CrearCategoriaDto): Categoria {
    if (this.repository.buscarPorNombre(dto.nombre)) {
      throw new AppError(409, "CATEGORY_DUPLICATED", "Ya existe una categoría con ese nombre");
    }
    return this.repository.crear(dto);
  }

  actualizar(id: number, dto: ActualizarCategoriaDto): Categoria {
    this.obtenerPorId(id);
    const existente = this.repository.buscarPorNombre(dto.nombre!);
    if (existente && existente.id !== id) {
      throw new AppError(409, "CATEGORY_DUPLICATED", "Ya existe una categoría con ese nombre");
    }
    return this.repository.actualizar(id, dto.nombre!)!;
  }

  eliminar(id: number): void {
    this.obtenerPorId(id);
    try {
      this.repository.eliminar(id);
    } catch (error) {
      if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new AppError(409, "CATEGORY_IN_USE", "No se puede eliminar: la categoría tiene productos asociados");
      }
      throw error;
    }
  }
}
