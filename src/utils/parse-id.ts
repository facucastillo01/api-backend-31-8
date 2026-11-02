import { AppError } from "../errors/app-error.js";

export function parseId(valor: unknown): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "INVALID_ID", "El identificador no es válido");
  }
  return id;
}
