// Tipos para productos de la API
export interface ProductoAPI {
    id_producto: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    imagen_url: string;
    fecha_registro?: string;
    fecha_actualizacion?: string;
}

export interface ProductoCarrito extends ProductoAPI {
    cantidad_carrito: number;
}

// Request types
export interface CreateProductoRequest {
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    imagen_url: string;
}

export interface UpdateProductoRequest extends CreateProductoRequest {
    id_producto: number;
}

export interface FilterProductosRequest {
    columna_orden?: string;
    orden?: "ASC" | "DESC";
    limite?: number;
    desplazamiento?: number;
}

export interface SearchProductosRequest {
    busqueda: string;
    limite?: number;
    desplazamiento?: number;
}

// Response types
export interface ProductoResponse {
    success: boolean;
    data?: ProductoAPI;
    message?: string;
}

export interface ProductosListResponse {
    success: boolean;
    data?: ProductoAPI[];
    total?: number;
    message?: string;
}
