import type { Db } from "../db/database.js";
import type { Categoria, CrearCategoriaDto } from "./categoria.js";

export interface CategoriasRepository {
  listar(): Categoria[];
  buscarPorId(id: number): Categoria | undefined;
  buscarPorNombre(nombre: string): Categoria | undefined;
  crear(dto: CrearCategoriaDto): Categoria;
  actualizar(id: number, nombre: string): Categoria | undefined;
  eliminar(id: number): boolean;
}

export class SqliteCategoriasRepository implements CategoriasRepository {
  constructor(private readonly db: Db) {}

  listar(): Categoria[] {
    return this.db.prepare("SELECT id, nombre FROM categorias ORDER BY id").all() as Categoria[];
  }

  buscarPorId(id: number): Categoria | undefined {
    return this.db.prepare("SELECT id, nombre FROM categorias WHERE id = ?").get(id) as Categoria | undefined;
  }

  buscarPorNombre(nombre: string): Categoria | undefined {
    return this.db
      .prepare("SELECT id, nombre FROM categorias WHERE nombre = ? COLLATE NOCASE")
      .get(nombre) as Categoria | undefined;
  }

  crear(dto: CrearCategoriaDto): Categoria {
    const info = this.db.prepare("INSERT INTO categorias (nombre) VALUES (?)").run(dto.nombre);
    return { id: Number(info.lastInsertRowid), nombre: dto.nombre };
  }

  actualizar(id: number, nombre: string): Categoria | undefined {
    this.db.prepare("UPDATE categorias SET nombre = ? WHERE id = ?").run(nombre, id);
    return this.buscarPorId(id);
  }

  eliminar(id: number): boolean {
    return this.db.prepare("DELETE FROM categorias WHERE id = ?").run(id).changes > 0;
  }
}
