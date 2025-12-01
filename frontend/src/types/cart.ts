export interface CartItem {
	id: number;
	idUsuario: number;
	idProducto: number;
	nombreProducto: string;
	imagenProducto: string;
	idVariante: number;
	tamano?: string;
	precioUnitario: number;
	cantidad: number;
	idPromocion?: number | null;
	nombrePromocion?: string | null;
	tipoPromocion?: string | null;
	valorPromocion?: number | null;
	precioConDescuento: number;
	subtotal: number;
	descuento: number;
}

export interface CartResumen {
	cantidadItems: number;
	cantidadProductos: number;
	subtotal: number;
	descuentos: number;
	total: number;
}

export interface CartResponse {
	items: CartItem[];
	resumen: CartResumen;
}
