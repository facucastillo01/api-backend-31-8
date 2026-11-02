# language: es
Característica: Estadísticas de inventario
  Como responsable del catálogo
  Quiero ver un resumen del inventario
  Para tomar decisiones de reposición

  Antecedentes:
    Dada una categoría "Bebidas"

  Escenario: Resumen con productos cargados
    Dado un producto "Agua mineral" con precio 1200 y stock 50
    Y un producto "Jugo de naranja" con precio 2500 y stock 0
    Cuando consulto las estadísticas de productos
    Entonces la respuesta tiene estado 200
    Y las estadísticas indican 2 productos, 50 unidades en stock y 1 sin stock
    Y el valor del inventario es 60000
