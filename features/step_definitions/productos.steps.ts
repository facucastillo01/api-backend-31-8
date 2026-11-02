import { Before, Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import request from "supertest";
import { crearAppDePrueba } from "../../tests/helpers/app.js";

interface Estado {
  app: ReturnType<typeof crearAppDePrueba>["app"];
  categoriaId?: number;
  productoId?: number;
  res?: request.Response;
}
let s: Estado;

Before(function () {
  s = { app: crearAppDePrueba().app };
});

const crearProducto = (nombre: string, precio: number, stock: number) =>
  request(s.app).post("/api/v1/productos").send({ nombre, precio, stock, categoriaId: s.categoriaId });

Given("una categoría {string}", async (nombre: string) => {
  const r = await request(s.app).post("/api/v1/categorias").send({ nombre });
  s.categoriaId = r.body.data.id;
});

Given("un producto {string} con precio {int} y stock {int}", async (n: string, p: number, st: number) => {
  const r = await crearProducto(n, p, st);
  s.productoId = r.body.data.id;
});

When("creo un producto {string} con precio {int} y stock {int}", async (n: string, p: number, st: number) => {
  s.res = await crearProducto(n, p, st);
});

When("consulto ese producto por su id", async () => {
  s.res = await request(s.app).get(`/api/v1/productos/${s.productoId}`);
});

When("consulto el producto con id {int}", async (id: number) => {
  s.res = await request(s.app).get(`/api/v1/productos/${id}`);
});

When("consulto el producto con id {string}", async (id: string) => {
  s.res = await request(s.app).get(`/api/v1/productos/${id}`);
});

When("elimino ese producto", async () => {
  s.res = await request(s.app).delete(`/api/v1/productos/${s.productoId}`);
});

Then("la respuesta tiene estado {int}", (estado: number) => {
  assert.equal(s.res!.status, estado);
});

Then("el producto devuelto se llama {string}", (nombre: string) => {
  assert.equal(s.res!.body.data.nombre, nombre);
});

When("consulto las estadísticas de productos", async () => {
  s.res = await request(s.app).get("/api/v1/productos/estadisticas");
});

Then(
  "las estadísticas indican {int} productos, {int} unidades en stock y {int} sin stock",
  (total: number, stock: number, sinStock: number) => {
    assert.equal(s.res!.body.data.totalProductos, total);
    assert.equal(s.res!.body.data.stockTotal, stock);
    assert.equal(s.res!.body.data.productosSinStock, sinStock);
  }
);

Then("el valor del inventario es {int}", (valor: number) => {
  assert.equal(s.res!.body.data.valorInventario, valor);
});
