import { Platform } from "react-native";

/**
 * Guardar token de autenticación
 */
export const guardarToken = (token: string): void => {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem("token", token);
        } else {
            // Para React Native, considera usar AsyncStorage o SecureStore
            // import AsyncStorage from '@react-native-async-storage/async-storage';
            // await AsyncStorage.setItem('token', token);
            console.warn("Token guardado en web. Para móvil, usa AsyncStorage o SecureStore");
        }
    } catch (error) {
        console.error("Error guardando token:", error);
    }
};

/**
 * Obtener token de autenticación
 */
export const obtenerToken = (): string | null => {
    try {
        if (Platform.OS === "web") {
            return localStorage.getItem("token");
        } else {
            // Para React Native, considera usar AsyncStorage o SecureStore
            // return await AsyncStorage.getItem('token');
            console.warn("Obteniendo token en web. Para móvil, usa AsyncStorage o SecureStore");
            return null;
        }
    } catch (error) {
        console.error("Error obteniendo token:", error);
        return null;
    }
};

/**
 * Eliminar token de autenticación (cerrar sesión)
 */
export const eliminarToken = (): void => {
    try {
        if (Platform.OS === "web") {
            localStorage.removeItem("token");
        } else {
            // Para React Native, considera usar AsyncStorage o SecureStore
            // await AsyncStorage.removeItem('token');
            console.warn("Token eliminado en web. Para móvil, usa AsyncStorage o SecureStore");
        }
    } catch (error) {
        console.error("Error eliminando token:", error);
    }
};

/**
 * Verificar si hay un token guardado
 */
export const tieneToken = (): boolean => {
    const token = obtenerToken();
    return token !== null && token !== "";
};
