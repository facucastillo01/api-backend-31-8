import express, { type Express } from "express";
import { CategoriasController } from "./categorias/categorias.controller.js";
import { crearCategoriasRouter } from "./categorias/categorias.routes.js";
import { CategoriasService } from "./categorias/categorias.service.js";
import { SqliteCategoriasRepository, type CategoriasRepository } from "./categorias/categorias.repository.js";
import type { Db } from "./db/database.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { ProductosController } from "./productos/productos.controller.js";
import { SqliteProductosRepository, type ProductosRepository } from "./productos/productos.repository.js";
import { crearProductosRouter } from "./productos/productos.routes.js";
import { ProductosService } from "./productos/productos.service.js";

export interface Repositorios {
  categorias: CategoriasRepository;
  productos: ProductosRepository;
}

export function repositoriosSqlite(db: Db): Repositorios {
  return { categorias: new SqliteCategoriasRepository(db), productos: new SqliteProductosRepository(db) };
}

// Inyección de dependencias por constructor: los tests pueden pasar repositorios mock
export function crearApp(repos: Repositorios): Express {
  const categoriasService = new CategoriasService(repos.categorias);
  const productosService = new ProductosService(repos.productos, repos.categorias);

  const app = express();
  app.use(express.json());

  app.use("/api/v1/categorias", crearCategoriasRouter(new CategoriasController(categoriasService)));
  app.use("/api/v1/productos", crearProductosRouter(new ProductosController(productosService)));

  app.use(notFound);
  app.use(errorHandler); // siempre al final
  return app;
}
