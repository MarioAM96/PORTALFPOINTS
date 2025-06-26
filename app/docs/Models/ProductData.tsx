export interface ProductData {
  idcausal_subcategoria: number;
  nombre_causal: string;
  idsubcategoria_incidencia: string;
  estado_causal: string;
  fecha_registro_causal: string;
  usuario_registra_causal?: string | null;
  valor?: string | null;
  puntos: string;
  image_url: string;
}