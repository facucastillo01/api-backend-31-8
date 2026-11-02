# API Backend – Unidad 2 (Express + TypeScript + SQLite)

Arquitectura por capas (punto 7): `routes → controller → service → repository → SQLite`.
Entidades: **categorias** y **productos** (CRUD completo, búsqueda por id, filtros, orden y paginación).

## Uso

```bash
npm install
npm start            # http://localhost:3000/api/v1   (crea data/app.db)
npm test             # Vitest: unitarios con mocks + integración (Supertest, SQLite en memoria)
npm run test:bdd     # Cucumber / Gherkin en español
```

## Endpoint nuevo (desarrollado con XP / TDD)

`GET /api/v1/productos/estadisticas[?categoriaId=N]` → resumen del inventario.

| Caso | Respuesta |
| --- | --- |
| Sin productos | 200, todos los valores en 0 |
| Con productos | 200 `{ totalProductos, stockTotal, valorInventario, productosSinStock }` |
| `?categoriaId=1` | 200, calculado solo sobre esa categoría |
| `?categoriaId=abc` | 400 `INVALID_CATEGORY` |
| `?categoriaId=999` | 404 `CATEGORY_NOT_FOUND` |

### Ciclo XP seguido

| Ciclo | RED (test primero) | GREEN (mínimo código) | REFACTOR |
| --- | --- | --- | --- |
| 1 | `estadisticas.test.ts` + `estadisticas.feature` fallan con 400 (`/estadisticas` caía en `/:id`) | repository → service → controller → ruta (declarada **antes** de `/:id`) | – |
| 2 | 5 tests fallan (el filtro se ignoraba) | filtro `categoriaId` en validator, service y SQL | `exigirCategoria(id, status)` y regla `categoriaIdQuery` reutilizadas |

## Pruebas manuales con curl

```bash
B=http://localhost:3000/api/v1
curl -i $B/productos/estadisticas
curl -i "$B/productos/estadisticas?categoriaId=1"
curl -i -X POST -H "Content-Type: application/json" -d '{"nombre":"Bebidas"}' $B/categorias
curl -i -X POST -H "Content-Type: application/json" \
  -d '{"nombre":"Agua mineral","precio":1200,"stock":50,"categoriaId":1}' $B/productos
```

En **Postman**: método `GET`, URL `http://localhost:3000/api/v1/productos/estadisticas`,
pestaña *Params* → `categoriaId = 1` (opcional) → *Send*.
