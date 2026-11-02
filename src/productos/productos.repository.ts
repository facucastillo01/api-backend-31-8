import type { Db } from "../db/database.js";
import type { ActualizarProductoDto, Estadisticas, ListarProductosOpciones, Producto } from "./producto.js";

export interface ProductosRepository {
  listar(opciones: ListarProductosOpciones): { items: Producto[]; total: number };
  buscarPorId(id: number): Producto | undefined;
  crear(producto: Omit<Producto, "id">): Producto;
  actualizar(id: number, cambios: ActualizarProductoDto): Producto | undefined;
  eliminar(id: number): boolean;
  estadisticas(categoriaId?: number): Estadisticas;
}

interface Fila {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria_id: number;
  fecha_creacion: string;
}

const aProducto = (f: Fila): Producto => ({
  id: f.id,
  nombre: f.nombre,
  precio: f.precio,
  stock: f.stock,
  categoriaId: f.categoria_id,
  fechaCreacion: f.fecha_creacion
});

export class SqliteProductosRepository implements ProductosRepository {
  constructor(private readonly db: Db) {}

  listar(op: ListarProductosOpciones): { items: Producto[]; total: number } {
    const condiciones: string[] = [];
    const params: unknown[] = [];

    if (op.q) {
      condiciones.push("nombre LIKE ?");
      params.push(`%${op.q}%`);
    }
    if (op.categoriaId !== undefined) {
      condiciones.push("categoria_id = ?");
      params.push(op.categoriaId);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    // sort y order llegan validados contra una lista blanca (nunca del cliente directo)
    const orden = `${op.sort} ${op.order.toUpperCase()}, id ASC`;
    const offset = (op.page - 1) * op.limit;

    const total = (this.db.prepare(`SELECT COUNT(*) AS n FROM productos ${where}`).get(...params) as { n: number }).n;
    const filas = this.db
      .prepare(`SELECT * FROM productos ${where} ORDER BY ${orden} LIMIT ? OFFSET ?`)
      .all(...params, op.limit, offset) as Fila[];

    return { items: filas.map(aProducto), total };
  }

  buscarPorId(id: number): Producto | undefined {
    const fila = this.db.prepare("SELECT * FROM productos WHERE id = ?").get(id) as Fila | undefined;
    return fila ? aProducto(fila) : undefined;
  }

  crear(p: Omit<Producto, "id">): Producto {
    const info = this.db
      .prepare("INSERT INTO productos (nombre, precio, stock, categoria_id, fecha_creacion) VALUES (?, ?, ?, ?, ?)")
      .run(p.nombre, p.precio, p.stock, p.categoriaId, p.fechaCreacion);
    return { id: Number(info.lastInsertRowid), ...p };
  }

  actualizar(id: number, cambios: ActualizarProductoDto): Producto | undefined {
    const actual = this.buscarPorId(id);
    if (!actual) return undefined;
    const nuevo = { ...actual, ...cambios };
    this.db
      .prepare("UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ? WHERE id = ?")
      .run(nuevo.nombre, nuevo.precio, nuevo.stock, nuevo.categoriaId, id);
    return nuevo;
  }

  eliminar(id: number): boolean {
    return this.db.prepare("DELETE FROM productos WHERE id = ?").run(id).changes > 0;
  }

  estadisticas(categoriaId?: number): Estadisticas {
    const where = categoriaId === undefined ? "" : "WHERE categoria_id = ?";
    const params = categoriaId === undefined ? [] : [categoriaId];
    // COALESCE: con la tabla vacía SUM() devuelve NULL y queremos 0
    return this.db
      .prepare(
        `SELECT COUNT(*)                                   AS totalProductos,
                COALESCE(SUM(stock), 0)                    AS stockTotal,
                COALESCE(SUM(precio * stock), 0)           AS valorInventario,
                COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS productosSinStock
           FROM productos ${where}`
      )
      .get(...params) as Estadisticas;
  }
}
