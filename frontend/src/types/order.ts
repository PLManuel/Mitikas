export interface OrderPayload {
  nombre: string;
  apellido: string;
  direccion?: string;
  idZonaDelivery?: number | null;
  idMetodoPago: number;
  datosTarjeta?: {
    numero: string;
    nombreTitular: string;
    expiracion: string;
    cvv: string;
  };
  idTarjetaSimulada?: number;
}
