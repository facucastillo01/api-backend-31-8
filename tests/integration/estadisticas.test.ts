import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearAppDePrueba } from "../helpers/app.js";

let app: ReturnType<typeof crearAppDePrueba>["app"];
let bebidas: number;
let limpieza: number;

const crearProducto = (nombre: string, precio: number, stock: number, categoriaId: number) =>
  request(app).post("/api/v1/productos").send({ nombre, precio, stock, categoriaId });

beforeEach(async () => {
  ({ app } = crearAppDePrueba());
  bebidas = (await request(app).post("/api/v1/categorias").send({ nombre: "Bebidas" })).body.data.id;
  limpieza = (await request(app).post("/api/v1/categorias").send({ nombre: "Limpieza" })).body.data.id;
});

describe("GET /api/v1/productos/estadisticas", () => {
  it("sin productos devuelve todo en cero", async () => {
    const r = await request(app).get("/api/v1/productos/estadisticas");

    expect(r.status).toBe(200);
    expect(r.body.data).toEqual({
      totalProductos: 0,
      stockTotal: 0,
      valorInventario: 0,
      productosSinStock: 0
    });
  });

  it("calcula totales con varios productos", async () => {
    await crearProducto("Agua mineral", 1200, 50, bebidas); // 60000
    await crearProducto("Jugo de naranja", 2500, 0, bebidas); // 0, sin stock
    await crearProducto("Lavandina", 1800, 20, limpieza); // 36000

    const r = await request(app).get("/api/v1/productos/estadisticas");

    expect(r.status).toBe(200);
    expect(r.body.data).toEqual({
      totalProductos: 3,
      stockTotal: 70,
      valorInventario: 96000,
      productosSinStock: 1
    });
  });

  describe("con filtro ?categoriaId=", () => {
    beforeEach(async () => {
      await crearProducto("Agua mineral", 1200, 50, bebidas);
      await crearProducto("Jugo de naranja", 2500, 0, bebidas);
      await crearProducto("Lavandina", 1800, 20, limpieza);
    });

    it("calcula solo sobre la categoría pedida", async () => {
      const r = await request(app).get(`/api/v1/productos/estadisticas?categoriaId=${bebidas}`);

      expect(r.status).toBe(200);
      expect(r.body.data).toEqual({
        totalProductos: 2,
        stockTotal: 50,
        valorInventario: 60000,
        productosSinStock: 1
      });
    });

    it("categoriaId inválido → 400", async () => {
      const r = await request(app).get("/api/v1/productos/estadisticas?categoriaId=abc");

      expect(r.status).toBe(400);
      expect(r.body.error.code).toBe("INVALID_CATEGORY");
    });

    it("categoría inexistente → 404", async () => {
      const r = await request(app).get("/api/v1/productos/estadisticas?categoriaId=999");

      expect(r.status).toBe(404);
      expect(r.body.error.code).toBe("CATEGORY_NOT_FOUND");
    });
  });
});
