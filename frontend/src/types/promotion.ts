export type PromotionType = 'porcentaje' | 'precio_fijo';

export interface Promotion {
  id: number;
  nombre: string;
  tipo: PromotionType;
  valor: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;   // YYYY-MM-DD
  activo: boolean;
}

export interface PromotionVariant {
  id: number;
  idVariante: number;
  tamano: string;
  precioVenta: number;
  nombreProducto: string;
  idProducto: number;
}

export interface PromotionWithVariants extends Promotion {
  variantes: PromotionVariant[];
}
