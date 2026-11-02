# API de productos y categorías

API REST para administrar un catálogo de productos agrupados por categoría. Se desarrolló como trabajo práctico de la Unidad 2 de Programación Backend (Tecnicatura Universitaria en Desarrollo Full Stack) y aplica el contenido de la unidad: diseño de contratos, validación, arquitectura por capas, manejo centralizado de errores y pruebas de endpoints.

Stack: Node.js, TypeScript, Express 5 y SQLite (better-sqlite3). Las pruebas usan Vitest, Supertest y Cucumber.

## Requisitos

- Node.js 20 o superior (desarrollado y probado con Node 22)
- npm

No hace falta instalar ningún motor de base de datos: SQLite se guarda en un archivo local.

## Puesta en marcha

```bash
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000/api/v1`. Para usar otro puerto: `PORT=4000 npm start`.

La base de datos se crea sola en `data/app.db` la primera vez que se inicia la aplicación. Para empezar de cero alcanza con borrar esa carpeta.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia el servidor y lo reinicia al detectar cambios |
| `npm test` | Pruebas unitarias y de integración (Vitest) |
| `npm run test:bdd` | Escenarios Gherkin (Cucumber) |
| `npm run typecheck` | Verifica los tipos sin generar archivos |

## Estructura

```
src/
├── app.ts                 Arma la aplicación Express e inyecta las dependencias
├── server.ts              Punto de entrada: abre la base y escucha en el puerto
├── db/                    Conexión y esquema de SQLite
├── errors/                AppError, el error de aplicación
├── middlewares/           Manejador de errores y ruta no encontrada
├── utils/                 Funciones auxiliares (validación de ids)
├── categorias/            routes, controller, service, repository, validators
└── productos/             routes, controller, service, repository, validators
tests/
├── helpers/               Datos y repositorios mock, app de prueba
├── unit/                  Pruebas de servicios con repositorios mock
└── integration/           Pruebas HTTP contra SQLite en memoria
features/                  Archivos .feature (Gherkin) y sus pasos
```

El flujo de una petición es `router → controller → service → repository → SQLite`. El controller traduce HTTP, el service aplica las reglas del dominio y el repository es el único que conoce SQL. Como los servicios reciben el repositorio por constructor, en las pruebas unitarias se reemplaza por una versión en memoria.

## Endpoints

Todas las rutas cuelgan de `/api/v1`.

### Categorías

| Método | Ruta | Descripción | Respuestas |
| --- | --- | --- | --- |
| GET | `/categorias` | Lista todas las categorías | 200 |
| GET | `/categorias/:id` | Obtiene una categoría | 200, 400, 404 |
| POST | `/categorias` | Crea una categoría | 201, 400, 409, 422 |
| PATCH | `/categorias/:id` | Cambia el nombre | 200, 400, 404, 409, 422 |
| DELETE | `/categorias/:id` | Elimina una categoría sin productos | 204, 400, 404, 409 |

### Productos

| Método | Ruta | Descripción | Respuestas |
| --- | --- | --- | --- |
| GET | `/productos` | Lista con filtros, orden y paginación | 200, 400 |
| GET | `/productos/estadisticas` | Resumen del inventario | 200, 400, 404 |
| GET | `/productos/:id` | Obtiene un producto | 200, 400, 404 |
| POST | `/productos` | Crea un producto | 201, 400, 422 |
| PUT | `/productos/:id` | Reemplaza el producto completo | 200, 400, 404, 422 |
| PATCH | `/productos/:id` | Modifica solo los campos enviados | 200, 400, 404, 422 |
| DELETE | `/productos/:id` | Elimina un producto | 204, 400, 404 |

Campos de un producto: `nombre` (texto, mínimo 3 caracteres), `precio` (número mayor que 0), `stock` (entero mayor o igual que 0) y `categoriaId` (id de una categoría existente). El servidor agrega `id` y `fechaCreacion`.

### Parámetros de `GET /productos`

| Parámetro | Descripción | Valor por defecto |
| --- | --- | --- |
| `page` | Página solicitada | 1 |
| `limit` | Elementos por página (máximo 100) | 10 |
| `q` | Texto a buscar en el nombre | – |
| `categoriaId` | Filtra por categoría | – |
| `sort` | `id`, `nombre`, `precio` o `stock` | `id` |
| `order` | `asc` o `desc` | `asc` |

Ejemplo: `/productos?q=agua&categoriaId=1&sort=precio&order=desc&page=1&limit=5`

### `GET /productos/estadisticas`

Devuelve la cantidad de productos, el stock total, el valor del inventario (suma de precio por stock) y la cantidad de productos sin stock. Acepta `?categoriaId=` para limitar el cálculo a una categoría.

```json
{
  "data": {
    "totalProductos": 3,
    "stockTotal": 70,
    "valorInventario": 96000,
    "productosSinStock": 1
  }
}
```

Con un `categoriaId` que no es un entero positivo responde 400 (`INVALID_CATEGORY`); si la categoría no existe, 404 (`CATEGORY_NOT_FOUND`).

## Formato de las respuestas

Un recurso: `{ "data": { ... } }`

Una colección paginada:

```json
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

Un error, siempre con la misma forma:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "El producto solicitado no existe",
    "details": []
  }
}
```

Criterio de códigos: 400 para solicitudes que no se pueden interpretar (id inválido, JSON roto, parámetros de consulta incorrectos), 422 para datos bien formados que incumplen una regla de validación, 404 para recursos inexistentes y 409 para conflictos (nombre de categoría repetido, categoría con productos asociados).

## Ejemplos con curl

```bash
B=http://localhost:3000/api/v1

# Crear una categoría y un producto
curl -i -X POST -H "Content-Type: application/json" \
  -d '{"nombre":"Bebidas"}' $B/categorias

curl -i -X POST -H "Content-Type: application/json" \
  -d '{"nombre":"Agua mineral","precio":1200,"stock":50,"categoriaId":1}' $B/productos

# Consultas
curl -i $B/productos/1
curl -i "$B/productos?q=agua&sort=precio&order=desc"
curl -i $B/productos/estadisticas
curl -i "$B/productos/estadisticas?categoriaId=1"

# Modificar y eliminar
curl -i -X PATCH -H "Content-Type: application/json" -d '{"stock":40}' $B/productos/1
curl -i -X DELETE $B/productos/1
```

Con Postman o Insomnia se usan las mismas URLs; en las peticiones con cuerpo hay que elegir *raw* en formato JSON.

## Pruebas

Hay tres niveles:

- **Unitarias** (`tests/unit`): ejercitan el servicio de productos con repositorios mock y datos fijos, sin base de datos ni HTTP.
- **Integración** (`tests/integration`): levantan la aplicación con Supertest sobre una base SQLite en memoria, nueva en cada prueba. Cubren la matriz de casos del punto 14 de la unidad: alta válida e inválida, consulta con id existente, inexistente e inválido, modificación, baja, filtros, página inexistente y ruta desconocida.
- **Aceptación** (`features`): escenarios Gherkin en español, escritos desde el punto de vista de quien consume la API.

## Cómo se desarrolló `/productos/estadisticas`

El endpoint se construyó con el ciclo de Extreme Programming: primero la prueba, después el código, después la limpieza.

1. Se escribieron la prueba de integración y el escenario Gherkin. Fallaron con 400, porque `/estadisticas` coincidía con la ruta `/:id` y se interpretaba como un identificador inválido.
2. Se implementó lo mínimo, de adentro hacia afuera: consulta en el repository, método en el service, handler en el controller y ruta. La ruta se declara antes de `/:id` justamente por lo anterior.
3. Segundo ciclo: se escribieron las pruebas del filtro por categoría (cinco fallaron porque el parámetro se ignoraba), se implementó el filtro y se refactorizó la validación de `categoriaId`, que ahora comparten el listado y las estadísticas.

## Decisiones de diseño

- El orden de la lista se arma con una lista blanca de columnas; el valor que llega por la URL nunca se concatena en el SQL. Los demás valores van como parámetros de la consulta.
- Las claves foráneas están activadas en SQLite, y el service traduce la violación de integridad al borrar una categoría con productos en un 409 con mensaje claro.
- Los errores internos no exponen detalles al cliente: se registran en consola y se responde un 500 genérico.
- No hay autenticación; corresponde a una unidad posterior.
