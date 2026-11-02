import { AppError } from "../errors/app-error.js";
import {
  CAMPOS_ORDENABLES,
  type ActualizarProductoDto,
  type CampoOrden,
  type CrearProductoDto,
  type ListarProductosOpciones
} from "./producto.js";

function comoObjeto(datos: unknown): Record<string, unknown> {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new AppError(400, "INVALID_BODY", "El cuerpo debe ser un objeto JSON");
  }
  return datos as Record<string, unknown>;
}

const validadores = {
  nombre(v: unknown): string {
    if (typeof v !== "string" || v.trim().length < 3) {
      throw new AppError(422, "INVALID_NAME", "El nombre debe tener al menos tres caracteres");
    }
    return v.trim();
  },
  precio(v: unknown): number {
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
      throw new AppError(422, "INVALID_PRICE", "El precio debe ser un número mayor que cero");
    }
    return v;
  },
  stock(v: unknown): number {
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
      throw new AppError(422, "INVALID_STOCK", "El stock debe ser un entero mayor o igual que cero");
    }
    return v;
  },
  categoriaIdQuery(v: unknown): number {
    const id = Number(v);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "INVALID_CATEGORY", "categoriaId debe ser un entero positivo");
    }
    return id;
  },
  categoriaId(v: unknown): number {
    if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
      throw new AppError(422, "INVALID_CATEGORY", "categoriaId debe ser un entero positivo");
    }
    return v;
  }
};

export function validarCrearProducto(datos: unknown): CrearProductoDto {
  const o = comoObjeto(datos);
  return {
    nombre: validadores.nombre(o.nombre),
    precio: validadores.precio(o.precio),
    stock: validadores.stock(o.stock),
    categoriaId: validadores.categoriaId(o.categoriaId)
  };
}

export function validarActualizarProducto(datos: unknown): ActualizarProductoDto {
  const o = comoObjeto(datos);
  const dto: ActualizarProductoDto = {};
  if (o.nombre !== undefined) dto.nombre = validadores.nombre(o.nombre);
  if (o.precio !== undefined) dto.precio = validadores.precio(o.precio);
  if (o.stock !== undefined) dto.stock = validadores.stock(o.stock);
  if (o.categoriaId !== undefined) dto.categoriaId = validadores.categoriaId(o.categoriaId);
  if (Object.keys(dto).length === 0) {
    throw new AppError(422, "EMPTY_UPDATE", "No se envió ningún campo para modificar");
  }
  return dto;
}

export function validarListado(query: Record<string, unknown>): ListarProductosOpciones {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const sort = (query.sort ?? "id") as string;
  if (!CAMPOS_ORDENABLES.includes(sort as CampoOrden)) {
    throw new AppError(400, "INVALID_SORT", `sort debe ser uno de: ${CAMPOS_ORDENABLES.join(", ")}`);
  }
  const order = String(query.order ?? "asc").toLowerCase();
  if (order !== "asc" && order !== "desc") {
    throw new AppError(400, "INVALID_ORDER", "order debe ser asc o desc");
  }

  const categoriaId = query.categoriaId === undefined ? undefined : validadores.categoriaIdQuery(query.categoriaId);

  const q = typeof query.q === "string" && query.q.trim() !== "" ? query.q.trim() : undefined;
  return { page, limit, q, categoriaId, sort: sort as CampoOrden, order };
}

export function validarFiltroEstadisticas(query: Record<string, unknown>): { categoriaId?: number } {
  if (query.categoriaId === undefined) return {};
  return { categoriaId: validadores.categoriaIdQuery(query.categoriaId) };
}
