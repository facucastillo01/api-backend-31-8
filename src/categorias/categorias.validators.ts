import { AppError } from "../errors/app-error.js";
import type { ActualizarCategoriaDto, CrearCategoriaDto } from "./categoria.js";

function comoObjeto(datos: unknown): Record<string, unknown> {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new AppError(400, "INVALID_BODY", "El cuerpo debe ser un objeto JSON");
  }
  return datos as Record<string, unknown>;
}

function validarNombre(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim().length < 3) {
    throw new AppError(422, "INVALID_NAME", "El nombre debe tener al menos tres caracteres");
  }
  return valor.trim();
}

export function validarCrearCategoria(datos: unknown): CrearCategoriaDto {
  return { nombre: validarNombre(comoObjeto(datos).nombre) };
}

export function validarActualizarCategoria(datos: unknown): ActualizarCategoriaDto {
  const objeto = comoObjeto(datos);
  if (objeto.nombre === undefined) {
    throw new AppError(422, "EMPTY_UPDATE", "No se envió ningún campo para modificar");
  }
  return { nombre: validarNombre(objeto.nombre) };
}
