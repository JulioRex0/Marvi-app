import { Platform } from "react-native";

// Detectar plataforma y usar la URL correcta
const getApiBase = () => {
    // Si hay variable de entorno, usarla
    if (typeof process !== "undefined" && process.env.API_BASE) {
        return process.env.API_BASE;
    }

    // En web, usar localhost
    if (Platform.OS === "web") {
        return "http://localhost:3000";
    }

    // En móvil, usar la IP local de WiFi
    return "http://192.168.10.50:3000";
};

const API_BASE = getApiBase();

const safeToken = (token?: string) => {
    if (token) return token;
    try {
        if (typeof window !== "undefined") return localStorage.getItem("token") || "";
    } catch {
        return "";
    }
};

async function request(method: string, endpoint: string, data?: any, token?: string) {
    const url = `${API_BASE}/${endpoint}`;
    const finalToken = safeToken(token);
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const headers: Record<string, string> = {};
    if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;
    if (!isFormData && data && method !== "GET") headers["Content-Type"] = "application/json";

    const options: RequestInit = {
        method,
        headers,
    };

    if (method !== "GET" && data !== undefined) {
        options.body = isFormData ? data : JSON.stringify(data);
    }

    console.log("🌐 API Request:", {
        url,
        method,
        hasToken: !!finalToken,
        headers,
        body: method !== "GET" ? data : undefined,
    });

    try {
        const res = await fetch(url, options);
        console.log("📡 Response Status:", res.status, res.statusText);

        const text = await res.text().catch(() => "");
        console.log("📄 Response Text:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));

        let json = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = null;
        }

        if (!res.ok) {
            console.error("❌ API Error:", {
                status: res.status,
                message: (json && (json.message || json.error)) || text || res.statusText,
            });
            return { success: false, status: res.status, message: (json && (json.message || json.error)) || text || res.statusText };
        }

        console.log("✅ API Success:", json ? "JSON parsed" : "No JSON");
        return json ?? { success: true };
    } catch (err) {
        console.error("❌ API request error:", err);
        throw err;
    }
}

export const getApi = (endpoint: string, token?: string) => request("GET", endpoint, undefined, token);
export const postApi = (endpoint: string, data?: any, token?: string) => request("POST", endpoint, data, token);
export const putApi = (endpoint: string, data?: any, token?: string) => request("PUT", endpoint, data, token);
export const patchApi = (endpoint: string, data?: any, token?: string) => request("PATCH", endpoint, data, token);
export const deleteApi = (endpoint: string, token?: string) => request("DELETE", endpoint, undefined, token);

export default { getApi, postApi, putApi, patchApi, deleteApi };
