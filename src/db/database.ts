import Database from "better-sqlite3";

export type Db = Database.Database;

export function crearBaseDeDatos(ruta: string = ":memory:"): Db {
  const db = new Database(ruta);
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS productos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre         TEXT    NOT NULL,
      precio         REAL    NOT NULL CHECK (precio > 0),
      stock          INTEGER NOT NULL CHECK (stock >= 0),
      categoria_id   INTEGER NOT NULL REFERENCES categorias(id),
      fecha_creacion TEXT    NOT NULL
    );
  `);
  return db;
}
