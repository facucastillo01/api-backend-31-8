import type { Request, Response } from "express";
import { parseId } from "../utils/parse-id.js";
import type { CategoriasService } from "./categorias.service.js";
import { validarActualizarCategoria, validarCrearCategoria } from "./categorias.validators.js";

export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  listar = (_req: Request, res: Response) => {
    res.status(200).json({ data: this.service.obtenerTodas() });
  };

  obtener = (req: Request, res: Response) => {
    res.status(200).json({ data: this.service.obtenerPorId(parseId(req.params.id)) });
  };

  crear = (req: Request, res: Response) => {
    const categoria = this.service.crear(validarCrearCategoria(req.body));
    res.location(`/api/v1/categorias/${categoria.id}`).status(201).json({ data: categoria });
  };

  actualizar = (req: Request, res: Response) => {
    const categoria = this.service.actualizar(parseId(req.params.id), validarActualizarCategoria(req.body));
    res.status(200).json({ data: categoria });
  };

  eliminar = (req: Request, res: Response) => {
    this.service.eliminar(parseId(req.params.id));
    res.status(204).send();
  };
}
