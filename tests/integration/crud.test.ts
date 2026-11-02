import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearAppDePrueba } from "../helpers/app.js";

let app: ReturnType<typeof crearAppDePrueba>["app"];
let categoriaId: number;

beforeEach(async () => {
  ({ app } = crearAppDePrueba());
  const r = await request(app).post("/api/v1/categorias").send({ nombre: "Bebidas" });
  categoriaId = r.body.data.id;
});

const nuevo = (extra = {}) => ({ nombre: "Agua mineral", precio: 1200, stock: 50, categoriaId, ...extra });

describe("Productos - matriz de casos del punto 14", () => {
  it("crear con datos válidos → 201 y Location", async () => {
    const r = await request(app).post("/api/v1/productos").send(nuevo());
    expect(r.status).toBe(201);
    expect(r.headers.location).toBe(`/api/v1/productos/${r.body.data.id}`);
    expect(r.body.data).toMatchObject({ nombre: "Agua mineral", precio: 1200, stock: 50 });
  });

  it("crear sin nombre → 422", async () => {
    const r = await request(app).post("/api/v1/productos").send(nuevo({ nombre: undefined }));
    expect(r.status).toBe(422);
    expect(r.body.error.code).toBe("INVALID_NAME");
  });

  it("crear con JSON mal formado → 400", async () => {
    const r = await request(app).post("/api/v1/productos").set("Content-Type", "application/json").send("{roto");
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe("INVALID_JSON");
  });

  it("consultar ID existente → 200", async () => {
    const { body } = await request(app).post("/api/v1/productos").send(nuevo());
    const r = await request(app).get(`/api/v1/productos/${body.data.id}`);
    expect(r.status).toBe(200);
    expect(r.body.data.id).toBe(body.data.id);
  });

  it("consultar ID inexistente → 404", async () => {
    expect((await request(app).get("/api/v1/productos/999")).status).toBe(404);
  });

  it("consultar ID inválido → 400", async () => {
    const r = await request(app).get("/api/v1/productos/abc");
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe("INVALID_ID");
  });

  it("PATCH con campo válido → 200", async () => {
    const { body } = await request(app).post("/api/v1/productos").send(nuevo());
    const r = await request(app).patch(`/api/v1/productos/${body.data.id}`).send({ stock: 5 });
    expect(r.status).toBe(200);
    expect(r.body.data).toMatchObject({ stock: 5, nombre: "Agua mineral" });
  });

  it("PUT reemplaza el recurso completo → 200", async () => {
    const { body } = await request(app).post("/api/v1/productos").send(nuevo());
    const r = await request(app).put(`/api/v1/productos/${body.data.id}`).send(nuevo({ nombre: "Soda", precio: 900 }));
    expect(r.status).toBe(200);
    expect(r.body.data).toMatchObject({ nombre: "Soda", precio: 900 });
  });

  it("eliminar existente → 204 y luego 404", async () => {
    const { body } = await request(app).post("/api/v1/productos").send(nuevo());
    expect((await request(app).delete(`/api/v1/productos/${body.data.id}`)).status).toBe(204);
    expect((await request(app).get(`/api/v1/productos/${body.data.id}`)).status).toBe(404);
  });

  it("filtro q → solo elementos coincidentes", async () => {
    await request(app).post("/api/v1/productos").send(nuevo());
    await request(app).post("/api/v1/productos").send(nuevo({ nombre: "Jugo de naranja" }));
    const r = await request(app).get("/api/v1/productos?q=jugo");
    expect(r.body.data.map((p: { nombre: string }) => p.nombre)).toEqual(["Jugo de naranja"]);
  });

  it("página inexistente → colección vacía con metadatos", async () => {
    await request(app).post("/api/v1/productos").send(nuevo());
    const r = await request(app).get("/api/v1/productos?page=5&limit=10");
    expect(r.status).toBe(200);
    expect(r.body.data).toEqual([]);
    expect(r.body.meta).toMatchObject({ page: 5, total: 1, totalPages: 1 });
  });

  it("ruta desconocida → 404", async () => {
    const r = await request(app).get("/api/v1/nada");
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});

describe("Categorías", () => {
  it("CRUD completo con búsqueda por id", async () => {
    const creada = await request(app).post("/api/v1/categorias").send({ nombre: "Limpieza" });
    expect(creada.status).toBe(201);
    const id = creada.body.data.id;

    expect((await request(app).get(`/api/v1/categorias/${id}`)).body.data.nombre).toBe("Limpieza");
    expect((await request(app).patch(`/api/v1/categorias/${id}`).send({ nombre: "Hogar" })).body.data.nombre).toBe("Hogar");
    expect((await request(app).get("/api/v1/categorias")).body.data).toHaveLength(2);
    expect((await request(app).delete(`/api/v1/categorias/${id}`)).status).toBe(204);
  });

  it("nombre duplicado → 409", async () => {
    const r = await request(app).post("/api/v1/categorias").send({ nombre: "bebidas" });
    expect(r.status).toBe(409);
  });

  it("no se puede borrar una categoría con productos → 409", async () => {
    await request(app).post("/api/v1/productos").send(nuevo());
    const r = await request(app).delete(`/api/v1/categorias/${categoriaId}`);
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe("CATEGORY_IN_USE");
  });
});
