# language: es
Característica: Gestión de productos
  Como cliente de la API
  Quiero administrar productos
  Para mantener actualizado el catálogo

  Antecedentes:
    Dada una categoría "Bebidas"

  Escenario: Crear un producto con datos válidos
    Cuando creo un producto "Agua mineral" con precio 1200 y stock 50
    Entonces la respuesta tiene estado 201
    Y el producto devuelto se llama "Agua mineral"

  Escenario: Crear un producto sin nombre
    Cuando creo un producto "" con precio 1200 y stock 50
    Entonces la respuesta tiene estado 422

  Escenario: Consultar un producto existente
    Dado un producto "Jugo de naranja" con precio 2500 y stock 10
    Cuando consulto ese producto por su id
    Entonces la respuesta tiene estado 200
    Y el producto devuelto se llama "Jugo de naranja"

  Escenario: Consultar un producto inexistente
    Cuando consulto el producto con id 999
    Entonces la respuesta tiene estado 404

  Escenario: Consultar con un id inválido
    Cuando consulto el producto con id "abc"
    Entonces la respuesta tiene estado 400

  Escenario: Eliminar un producto existente
    Dado un producto "Soda" con precio 900 y stock 5
    Cuando elimino ese producto
    Entonces la respuesta tiene estado 204
