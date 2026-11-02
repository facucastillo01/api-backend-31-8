import { Router } from "express";
import type { CategoriasController } from "./categorias.controller.js";

export function crearCategoriasRouter(controller: CategoriasController): Router {
  const router = Router();
  router.get("/", controller.listar);
  router.get("/:id", controller.obtener);
  router.post("/", controller.crear);
  router.patch("/:id", controller.actualizar);
  router.delete("/:id", controller.eliminar);
  return router;
}
