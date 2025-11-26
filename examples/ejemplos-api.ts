/**
 * Ejemplo de uso de la autenticación y carga de productos
 * 
 * Este archivo muestra cómo:
 * 1. Guardar el token después del login
 * 2. Cargar productos desde la API
 * 3. Manejar errores y estados de carga
 */

import { useState } from "react";
import { Alert } from "react-native";
import { postApi } from "@/app/utils/api";
import { guardarToken, eliminarToken } from "@/app/utils/auth";
import { obtenerProductosFiltrados, buscarProductos } from "@/app/utils/productApi";

// ============================================
// EJEMPLO 1: Login y guardar token
// ============================================

export const ejemploLogin = async (usuario: string, password: string) => {
    try {
        // Hacer login
        const response = await postApi("auth/login", { usuario, password });

        if (response.token) {
            // Guardar el token para usarlo en futuras peticiones
            guardarToken(response.token);
            Alert.alert("Éxito", "Sesión iniciada correctamente");
            return true;
        } else {
            Alert.alert("Error", response.message || "Credenciales incorrectas");
            return false;
        }
    } catch (error) {
        console.error("Error en login:", error);
        Alert.alert("Error", "No se pudo conectar con el servidor");
        return false;
    }
};

// ============================================
// EJEMPLO 2: Cerrar sesión
// ============================================

export const ejemploCerrarSesion = () => {
    eliminarToken();
    Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente");
};

// ============================================
// EJEMPLO 3: Cargar productos con filtros
// ============================================

export const ejemploCargarProductos = async () => {
    try {
        const response = await obtenerProductosFiltrados({
            columna_orden: "precio",
            orden: "DESC",
            limite: 20,
            desplazamiento: 0,
        });

        if (response.success && response.data) {
            console.log(`Se cargaron ${response.data.length} productos`);
            return response.data;
        } else {
            Alert.alert("Error", response.message || "No se pudieron cargar los productos");
            return [];
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
        Alert.alert("Error", "No se pudo conectar con el servidor");
        return [];
    }
};

// ============================================
// EJEMPLO 4: Buscar productos
// ============================================

export const ejemploBuscarProductos = async (textoBusqueda: string) => {
    if (!textoBusqueda || textoBusqueda.trim() === "") {
        return [];
    }

    try {
        const response = await buscarProductos(textoBusqueda, 50, 0);

        if (response.success && response.data) {
            console.log(`Se encontraron ${response.data.length} productos`);
            return response.data;
        } else {
            Alert.alert("Sin resultados", "No se encontraron productos con ese término");
            return [];
        }
    } catch (error) {
        console.error("Error buscando productos:", error);
        Alert.alert("Error", "No se pudo realizar la búsqueda");
        return [];
    }
};

// ============================================
// EJEMPLO 5: Componente con búsqueda (React)
// ============================================

export function ComponenteEjemploConBusqueda() {
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [productos, setProductos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);

    const buscar = async () => {
        if (!textoBusqueda.trim()) {
            return;
        }

        setCargando(true);
        try {
            const response = await buscarProductos(textoBusqueda, 50, 0);

            if (response.success && response.data) {
                setProductos(response.data);
            } else {
                Alert.alert("Error", response.message || "No se pudieron buscar productos");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo realizar la búsqueda");
        } finally {
            setCargando(false);
        }
    };

    // Aquí iría el JSX del componente...
    // Este es solo un ejemplo de la lógica
}

// ============================================
// EJEMPLO 6: Configuración del token manualmente
// ============================================

/**
 * Si necesitas usar un token específico sin guardarlo en localStorage,
 * puedes pasarlo directamente a las funciones de API:
 */
export const ejemploConTokenManual = async (token: string) => {
    // Importar la función request directa
    const { postApi } = await import("@/app/utils/api");

    try {
        // Pasar el token como tercer parámetro
        const response = await postApi(
            "products/filter",
            {
                columna_orden: "nombre",
                orden: "ASC",
                limite: 10,
                desplazamiento: 0,
            },
            token
        );

        return response;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};
