export interface Categoria {
  id: number;
  nombre: string;
}

export interface CrearCategoriaDto {
  nombre: string;
}

export interface ActualizarCategoriaDto {
  nombre?: string;
}
