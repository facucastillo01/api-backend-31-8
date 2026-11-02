import { crearApp, repositoriosSqlite } from "../../src/app.js";
import { crearBaseDeDatos } from "../../src/db/database.js";

// Cada test recibe su propia base SQLite en memoria: aislada y rápida
export function crearAppDePrueba() {
  const db = crearBaseDeDatos(":memory:");
  const app = crearApp(repositoriosSqlite(db));
  return { app, db };
}
