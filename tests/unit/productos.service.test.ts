import { beforeEach, describe, expect, it } from "vitest";
import { ProductosService } from "../../src/productos/productos.service.js";
import { CategoriasRepositoryMock, ProductosRepositoryMock } from "../helpers/mocks.js";

describe("ProductosService (con repositorios mock)", () => {
  let service: ProductosService;

  beforeEach(() => {
    service = new ProductosService(new ProductosRepositoryMock(), new CategoriasRepositoryMock());
  });

  it("devuelve un producto existente", () => {
    expect(service.obtenerPorId(1).nombre).toBe("Agua mineral");
  });

  it("lanza 404 si el producto no existe", () => {
    expect(() => service.obtenerPorId(999)).toThrowError(expect.objectContaining({ status: 404, code: "PRODUCT_NOT_FOUND" }));
  });

  it("crea un producto y le asigna fecha de creación", () => {
    const p = service.crear({ nombre: "Gaseosa", precio: 1500, stock: 10, categoriaId: 1 });
    expect(p.id).toBeGreaterThan(0);
    expect(new Date(p.fechaCreacion).toString()).not.toBe("Invalid Date");
  });

  it("rechaza (422) un producto con categoría inexistente", () => {
    expect(() => service.crear({ nombre: "Gaseosa", precio: 1500, stock: 10, categoriaId: 99 })).toThrowError(
      expect.objectContaining({ status: 422, code: "CATEGORY_NOT_FOUND" })
    );
  });

  it("devuelve metadatos de paginación", () => {
    const r = service.listar({ page: 1, limit: 2, sort: "id", order: "asc" });
    expect(r.data).toHaveLength(2);
    expect(r.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it("filtra por texto", () => {
    const r = service.listar({ page: 1, limit: 10, q: "agua", sort: "id", order: "asc" });
    expect(r.data.map((p) => p.nombre)).toEqual(["Agua mineral"]);
  });

  describe("obtenerEstadisticas", () => {
    it("sin filtro resume todo el inventario", () => {
      expect(service.obtenerEstadisticas()).toEqual({
        totalProductos: 3,
        stockTotal: 70,
        valorInventario: 96000,
        productosSinStock: 1
      });
    });

    it("con categoriaId resume solo esa categoría", () => {
      expect(service.obtenerEstadisticas(2)).toEqual({
        totalProductos: 1,
        stockTotal: 20,
        valorInventario: 36000,
        productosSinStock: 0
      });
    });

    it("lanza 404 si la categoría no existe", () => {
      expect(() => service.obtenerEstadisticas(99)).toThrowError(
        expect.objectContaining({ status: 404, code: "CATEGORY_NOT_FOUND" })
      );
    });
  });
});
