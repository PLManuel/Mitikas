// src/types/deliveryZone.ts

export interface DeliveryZone {
  id: number;
  distrito: string;
  costo: number;
  diasEstimados: number;
  activo: boolean;
}

export interface DeliveryZoneInput {
  distrito: string;
  costo: number;
  diasEstimados: number;
}
