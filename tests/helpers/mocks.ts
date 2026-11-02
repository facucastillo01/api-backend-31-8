import type { Categoria } from "../../src/categorias/categoria.js";
import type { CategoriasRepository } from "../../src/categorias/categorias.repository.js";
import type { Estadisticas, ListarProductosOpciones, Producto } from "../../src/productos/producto.js";
import type { ProductosRepository } from "../../src/productos/productos.repository.js";

// ---- Datos mock ----
export const categoriasMock: Categoria[] = [
  { id: 1, nombre: "Bebidas" },
  { id: 2, nombre: "Limpieza" }
];

export const productosMock: Producto[] = [
  { id: 1, nombre: "Agua mineral", precio: 1200, stock: 50, categoriaId: 1, fechaCreacion: "2026-01-01T00:00:00.000Z" },
  { id: 2, nombre: "Jugo de naranja", precio: 2500, stock: 0, categoriaId: 1, fechaCreacion: "2026-01-02T00:00:00.000Z" },
  { id: 3, nombre: "Lavandina", precio: 1800, stock: 20, categoriaId: 2, fechaCreacion: "2026-01-03T00:00:00.000Z" }
];

// ---- Repositorios mock en memoria (sin SQLite) ----
export class CategoriasRepositoryMock implements CategoriasRepository {
  constructor(private datos: Categoria[] = structuredClone(categoriasMock)) {}
  listar = () => [...this.datos];
  buscarPorId = (id: number) => this.datos.find((c) => c.id === id);
  buscarPorNombre = (n: string) => this.datos.find((c) => c.nombre.toLowerCase() === n.toLowerCase());
  crear = (dto: { nombre: string }) => {
    const c = { id: this.datos.length + 1, nombre: dto.nombre };
    this.datos.push(c);
    return c;
  };
  actualizar = (id: number, nombre: string) => {
    const c = this.buscarPorId(id);
    if (c) c.nombre = nombre;
    return c;
  };
  eliminar = (id: number) => {
    const antes = this.datos.length;
    this.datos = this.datos.filter((c) => c.id !== id);
    return this.datos.length < antes;
  };
}

export class ProductosRepositoryMock implements ProductosRepository {
  constructor(private datos: Producto[] = structuredClone(productosMock)) {}
  listar = (op: ListarProductosOpciones) => {
    const filtrados = this.datos.filter(
      (p) =>
        (!op.q || p.nombre.toLowerCase().includes(op.q.toLowerCase())) &&
        (op.categoriaId === undefined || p.categoriaId === op.categoriaId)
    );
    const inicio = (op.page - 1) * op.limit;
    return { items: filtrados.slice(inicio, inicio + op.limit), total: filtrados.length };
  };
  buscarPorId = (id: number) => this.datos.find((p) => p.id === id);
  crear = (p: Omit<Producto, "id">) => {
    const nuevo = { id: this.datos.length + 1, ...p };
    this.datos.push(nuevo);
    return nuevo;
  };
  actualizar = (id: number, cambios: Partial<Producto>) => {
    const p = this.buscarPorId(id);
    if (!p) return undefined;
    Object.assign(p, cambios);
    return p;
  };
  eliminar = (id: number) => {
    const antes = this.datos.length;
    this.datos = this.datos.filter((p) => p.id !== id);
    return this.datos.length < antes;
  };
  estadisticas = (categoriaId?: number): Estadisticas => {
    const lista = categoriaId === undefined ? this.datos : this.datos.filter((p) => p.categoriaId === categoriaId);
    return {
      totalProductos: lista.length,
      stockTotal: lista.reduce((a, p) => a + p.stock, 0),
      valorInventario: lista.reduce((a, p) => a + p.precio * p.stock, 0),
      productosSinStock: lista.filter((p) => p.stock === 0).length
    };
  };
}
