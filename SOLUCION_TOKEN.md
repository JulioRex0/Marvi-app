# Solución rápida: Guardar token para pruebas

## 🔑 El problema

La aplicación muestra el error **"Permisos necesarios"** porque **no hay un token de autenticación guardado**.

---

## ✅ Solución 1: Iniciar sesión correctamente (RECOMENDADO)

### Si tienes una pantalla de login:

1. Ve a la pantalla de login
2. Ingresa tus credenciales
3. Asegúrate de que el código guarde el token después del login:

```typescript
import { guardarToken } from "@/app/utils/auth";

// En tu función de login:
const handleLogin = async (usuario: string, password: string) => {
    const response = await postApi("auth/login", { usuario, password });

    if (response.token) {
        // ⚠️ IMPORTANTE: Guardar el token
        guardarToken(response.token);
        router.push("/Menu");
    }
};
```

---

## 🚀 Solución 2: Guardar token manualmente para pruebas (TEMPORAL)

Si solo quieres probar rápidamente que la carga de productos funciona:

### Opción A: Desde la consola del navegador (Web)

1. Abre la aplicación en el navegador
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña "Console"
4. Pega este código y presiona Enter:

```javascript
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2FjdGl2byI6ImFkbWluIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsImlhdCI6MTc2MzgzNTQ1MiwiZXhwIjoxNzYzODM5MDUyfQ.-UVpP-cQEIIkW5UlWqgGi5LNDNTuAbCOBGbnFcB_CWI");
```

5. Recarga la página (`F5`)
6. Ahora los productos deberían cargarse

### Opción B: Crear un botón temporal de desarrollo

Agrega este código temporal en tu componente de login o en cualquier pantalla:

```typescript
import { guardarToken } from "@/app/utils/auth";
import { Button } from "react-native";

// Dentro de tu componente:
<Button
    title="[DEV] Guardar token de prueba"
    onPress={() => {
        const tokenPrueba = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2FjdGl2byI6ImFkbWluIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsImlhdCI6MTc2MzgzNTQ1MiwiZXhwIjoxNzYzODM5MDUyfQ.-UVpP-cQEIIkW5UlWqgGi5LNDNTuAbCOBGbnFcB_CWI";
        guardarToken(tokenPrueba);
        Alert.alert("Token guardado", "Ahora puedes ir al menú");
    }}
/>;
```

---

## ⚠️ Nota importante sobre el token

El token que proporcionaste:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2FjdGl2byI6ImFkbWluIiwidGlwb191c3VhcmlvIjoidXN1YXJpbyIsImlhdCI6MTc2MzgzNTQ1MiwiZXhwIjoxNzYzODM5MDUyfQ.-UVpP-cQEIIkW5UlWqgGi5LNDNTuAbCOBGbnFcB_CWI
```

**Expira en:** 1 hora desde su creación (según el payload del JWT)

Si el token ya expiró, necesitas:

1. Generar un nuevo token desde el backend
2. O iniciar sesión de nuevo

---

## 🔍 Verificar si el token está guardado

### En el navegador (Web):

1. Presiona `F12`
2. Ve a "Application" > "Local Storage"
3. Busca la entrada `token`
4. Si existe, verás el token guardado

### Con código:

```typescript
import { obtenerToken, tieneToken } from "@/app/utils/auth";

console.log("¿Hay token?", tieneToken());
console.log("Token actual:", obtenerToken());
```

---

## 📝 Checklist de verificación

-   [ ] El servidor backend está corriendo
-   [ ] Hay un token guardado en localStorage
-   [ ] El token no ha expirado (revisa la fecha `exp` en el payload)
-   [ ] El token es válido para tu servidor
-   [ ] La URL del servidor en `app/utils/api.ts` es correcta

---

## 🎯 Flujo correcto de la aplicación

```
1. Usuario abre la app
   ↓
2. Usuario va a login
   ↓
3. Usuario ingresa credenciales
   ↓
4. Backend responde con token
   ↓
5. App guarda el token con guardarToken()  ← ⚠️ CRÍTICO
   ↓
6. Usuario navega al menú
   ↓
7. Menú carga productos usando el token guardado
   ↓
8. ✅ Productos se muestran
```

---

## 🆘 Si aún no funciona después de guardar el token

1. **Verifica que el token sea válido:**

    - Copia el token
    - Ve a https://jwt.io
    - Pega el token
    - Verifica que la fecha `exp` no haya pasado

2. **Genera un nuevo token:**

    - Haz login en tu backend
    - Copia el nuevo token
    - Guárdalo con `localStorage.setItem("token", "NUEVO_TOKEN")`

3. **Verifica los logs:**
    - Busca en la consola: "🔑 Token obtenido:"
    - Debería decir "✅ Presente"
    - Si dice "❌ No hay token", el token no se guardó correctamente

---

## 💡 Solución permanente

Implementa correctamente el flujo de login:

```typescript
// En tu componente de login (index.tsx o similar)
import { postApi } from "@/app/utils/api";
import { guardarToken } from "@/app/utils/auth";
import { router } from "expo-router";
import { Alert } from "react-native";

const handleLogin = async (usuario: string, password: string) => {
    try {
        const response = await postApi("auth/login", {
            usuario,
            password,
        });

        if (response.token) {
            // ⭐ Guardar el token
            guardarToken(response.token);

            // Navegar al menú
            router.replace("/Menu");
        } else {
            Alert.alert("Error", "Credenciales incorrectas");
        }
    } catch (error) {
        Alert.alert("Error", "No se pudo conectar con el servidor");
    }
};
```

---

Con estos pasos, deberías poder ver los productos en tu aplicación! 🎉
