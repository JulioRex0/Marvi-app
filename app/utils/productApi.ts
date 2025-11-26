import type { CreateProductoRequest, FilterProductosRequest, ProductoResponse, ProductosListResponse, SearchProductosRequest, UpdateProductoRequest } from "@/types/product";
import { deleteApi, getApi, postApi, putApi } from "./api";

// Obtener el token desde localStorage (web) o desde algún estado global
const getToken = (): string | null => {
    try {
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
            return localStorage.getItem("token");
        }
    } catch {
        console.warn("No se pudo acceder al token");
    }
    return null;
};

/**
 * Obtener todos los productos con filtros
 */
export const obtenerProductosFiltrados = async (filtros: FilterProductosRequest = {}): Promise<ProductosListResponse> => {
    const token = getToken();
    console.log("🔑 Token obtenido:", token ? "✅ Presente" : "❌ No hay token");

    const defaultFiltros: FilterProductosRequest = {
        columna_orden: "nombre",
        orden: "ASC",
        limite: 100,
        desplazamiento: 0,
        ...filtros,
    };

    console.log("📝 Filtros a enviar:", defaultFiltros);

    try {
        console.log("🌐 Haciendo petición a: POST products/filter");
        const response = await postApi("products/filter", defaultFiltros, token || undefined);

        console.log("📦 Respuesta completa:", JSON.stringify(response, null, 2));

        if (response.success === false) {
            return {
                success: false,
                message: response.message || "Error en la respuesta del servidor",
                data: [],
            };
        }

        return {
            success: true,
            data: response.data || response || [],
            total: response.total || (response.data || response)?.length || 0,
        };
    } catch (error) {
        console.error("❌ Error obteniendo productos:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error al obtener los productos",
            data: [],
        };
    }
};

/**
 * Buscar productos por texto
 */
export const buscarProductos = async (busqueda: string, limite: number = 50, desplazamiento: number = 0): Promise<ProductosListResponse> => {
    const token = getToken();
    const body: SearchProductosRequest = {
        busqueda,
        limite,
        desplazamiento,
    };

    try {
        const response = await postApi("products/search", body, token || undefined);
        return {
            success: true,
            data: response.data || [],
            total: response.total || 0,
        };
    } catch (error) {
        console.error("Error buscando productos:", error);
        return {
            success: false,
            message: "Error al buscar productos",
            data: [],
        };
    }
};

/**
 * Obtener un producto específico por código
 */
export const obtenerProductoPorCodigo = async (codigo: string): Promise<ProductoResponse> => {
    const token = getToken();

    try {
        const response = await getApi(`products/${codigo}`, token || undefined);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error obteniendo producto:", error);
        return {
            success: false,
            message: "Error al obtener el producto",
        };
    }
};

/**
 * Crear un nuevo producto
 */
export const crearProducto = async (producto: CreateProductoRequest): Promise<ProductoResponse> => {
    const token = getToken();

    try {
        const response = await postApi("products", producto, token || undefined);
        return {
            success: true,
            data: response.data,
            message: "Producto creado exitosamente",
        };
    } catch (error) {
        console.error("Error creando producto:", error);
        return {
            success: false,
            message: "Error al crear el producto",
        };
    }
};

/**
 * Actualizar un producto existente
 */
export const actualizarProducto = async (producto: UpdateProductoRequest): Promise<ProductoResponse> => {
    const token = getToken();

    try {
        const response = await putApi("products", producto, token || undefined);
        return {
            success: true,
            data: response.data,
            message: "Producto actualizado exitosamente",
        };
    } catch (error) {
        console.error("Error actualizando producto:", error);
        return {
            success: false,
            message: "Error al actualizar el producto",
        };
    }
};

/**
 * Eliminar un producto por código
 */
export const eliminarProducto = async (codigo: string): Promise<{ success: boolean; message: string }> => {
    const token = getToken();

    try {
        await deleteApi(`products/${codigo}`, token || undefined);
        return {
            success: true,
            message: "Producto eliminado exitosamente",
        };
    } catch (error) {
        console.error("Error eliminando producto:", error);
        return {
            success: false,
            message: "Error al eliminar el producto",
        };
    }
};
