export type Role = 'cliente' | 'admin' | 'almacen' | 'logistica' | 'despachador' | 'repartidor';

export interface Usuario {
	id: number;
	nombre: string;
	apellidos: string;
	dni: string;
	telefono: string;
	correo: string;
	rol: Role;
	activo: boolean;
}

export interface LoginPayload {
	correo: string;
	password: string;
}

export interface RegisterPayload {
	nombre: string;
	apellidos: string;
	dni: string;
	telefono: string;
	correo: string;
	password: string;
	rol?: Role;
}

export interface LoginResponse {
	message?: string;
	usuario?: Usuario;
}

export type CreateUserResponse = Usuario & { password?: string };
export type MeResponse = Usuario;
