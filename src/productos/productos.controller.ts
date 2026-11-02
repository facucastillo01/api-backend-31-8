import type { Request, Response } from "express";
import { parseId } from "../utils/parse-id.js";
import type { ProductosService } from "./productos.service.js";
import {
  validarActualizarProducto,
  validarCrearProducto,
  validarFiltroEstadisticas,
  validarListado
} from "./productos.validators.js";

export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  listar = (req: Request, res: Response) => {
    res.status(200).json(this.service.listar(validarListado(req.query)));
  };

  estadisticas = (req: Request, res: Response) => {
    const { categoriaId } = validarFiltroEstadisticas(req.query);
    res.status(200).json({ data: this.service.obtenerEstadisticas(categoriaId) });
  };

  obtener = (req: Request, res: Response) => {
    res.status(200).json({ data: this.service.obtenerPorId(parseId(req.params.id)) });
  };

  crear = (req: Request, res: Response) => {
    const producto = this.service.crear(validarCrearProducto(req.body));
    res.location(`/api/v1/productos/${producto.id}`).status(201).json({ data: producto });
  };

  // PUT: representación completa
  reemplazar = (req: Request, res: Response) => {
    const producto = this.service.actualizar(parseId(req.params.id), validarCrearProducto(req.body));
    res.status(200).json({ data: producto });
  };

  // PATCH: cambios parciales
  actualizar = (req: Request, res: Response) => {
    const producto = this.service.actualizar(parseId(req.params.id), validarActualizarProducto(req.body));
    res.status(200).json({ data: producto });
  };

  eliminar = (req: Request, res: Response) => {
    this.service.eliminar(parseId(req.params.id));
    res.status(204).send();
  };
}
