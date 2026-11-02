import { mkdirSync } from "node:fs";
import { crearApp, repositoriosSqlite } from "./app.js";
import { crearBaseDeDatos } from "./db/database.js";

mkdirSync("data", { recursive: true });
const db = crearBaseDeDatos("data/app.db");
const app = crearApp(repositoriosSqlite(db));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}/api/v1`));
