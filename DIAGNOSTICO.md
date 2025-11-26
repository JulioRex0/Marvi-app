# Diagnóstico: Productos no se muestran

## 🔍 Pasos para diagnosticar el problema

### 1. Verificar que el servidor esté corriendo

Abre una terminal y verifica que tu servidor backend esté activo:

```bash
# El servidor debe estar corriendo en http://localhost:3000
# Deberías ver algo como: "Servidor corriendo en puerto 3000"
```

**Prueba manual:**
Abre tu navegador y ve a: `http://localhost:3000/products/filter`

Si ves un error de CORS o 401, es normal (necesitas el token).

---

### 2. Verificar la consola del navegador/Expo

**En Web:**

1. Presiona F12 para abrir las Developer Tools
2. Ve a la pestaña "Console"
3. Busca los logs que empiezan con 🔄, 📦, ✅, ❌

**En Expo (Terminal):**
Busca los logs en el terminal donde ejecutaste `npx expo start`

---

### 3. Verificar los logs

Deberías ver algo como esto en la consola:

```
🔄 Iniciando carga de productos...
🔑 Token obtenido: ✅ Presente
📝 Filtros a enviar: {columna_orden: "nombre", orden: "ASC", ...}
🌐 API Request: {url: "http://localhost:3000/products/filter", ...}
📡 Response Status: 200 OK
📄 Response Text: {"data": [...], "total": 10}
✅ API Success: JSON parsed
📦 Respuesta recibida: {success: true, data: [...]}
✅ Productos cargados exitosamente: 10
```

---

## ❌ Problemas comunes y soluciones

### Problema 1: "Error de conexión con el servidor"

**Causa:** El servidor no está corriendo o la URL es incorrecta.

**Solución:**

1. Verifica que el servidor esté corriendo en puerto 3000
2. Si estás en móvil, cambia la IP en `app/utils/api.ts`:
    ```typescript
    // Línea 15 aproximadamente
    return "http://TU_IP:3000"; // Ejemplo: "http://192.168.1.100:3000"
    ```
3. Encuentra tu IP:
    - Windows: `ipconfig` en cmd
    - Mac/Linux: `ifconfig` o `ip addr`

---

### Problema 2: "❌ No hay token" en la consola

**Causa:** No has iniciado sesión o el token no se guardó.

**Solución:**

1. Asegúrate de guardar el token después del login
2. Agrega esto en tu componente de login:

    ```typescript
    import { guardarToken } from "@/app/utils/auth";

    // Después de login exitoso:
    guardarToken(response.token);
    ```

3. Verifica que se guardó:
    - Abre la consola del navegador (F12)
    - Ve a "Application" > "Local Storage"
    - Busca la clave "token"

---

### Problema 3: Response Status: 401 Unauthorized

**Causa:** El token expiró o es inválido.

**Solución:**

1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que el token del ejemplo que proporcionaste sea válido:
    ```
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
3. Los tokens JWT suelen expirar en 1 hora

---

### Problema 4: Response Status: 404 Not Found

**Causa:** El endpoint no existe o la URL es incorrecta.

**Solución:**

1. Verifica que el servidor tenga el endpoint `POST /products/filter`
2. Revisa la URL en la consola, debería ser:
    ```
    http://localhost:3000/products/filter
    ```
3. Asegúrate de que no haya espacios o caracteres extra

---

### Problema 5: CORS Error (Cross-Origin Request Blocked)

**Causa:** El servidor no permite peticiones desde el origen de tu app.

**Solución:**
Configura CORS en tu servidor backend:

```javascript
// En tu servidor Node.js/Express
const cors = require("cors");
app.use(
    cors({
        origin: "*", // O especifica tu origen
        credentials: true,
    })
);
```

---

### Problema 6: "No hay productos disponibles" pero el servidor tiene datos

**Causa:** La respuesta del servidor no tiene el formato esperado.

**Solución:**

1. Revisa los logs de la consola, busca: `📦 Respuesta recibida:`
2. La respuesta debe tener este formato:

    ```json
    {
        "data": [
            {
                "id_producto": 1,
                "codigo": "PROD001",
                "nombre": "Jabón",
                "descripcion": "...",
                "precio": 15.99,
                "cantidad": 100,
                "imagen_url": "https://..."
            }
        ],
        "total": 1
    }
    ```

3. Si el formato es diferente, puede que necesites ajustar `productApi.ts`

---

## 🧪 Prueba manual con el token

Para probar manualmente que el endpoint funciona:

1. Abre Postman, Thunder Client, o usa curl
2. Haz una petición POST a `http://localhost:3000/products/filter`
3. Headers:
    ```
    Content-Type: application/json
    Authorization: Bearer TU_TOKEN_AQUI
    ```
4. Body:
    ```json
    {
        "columna_orden": "nombre",
        "orden": "ASC",
        "limite": 100,
        "desplazamiento": 0
    }
    ```

Si esta prueba funciona pero la app no, el problema está en el frontend.

---

## 📋 Checklist de verificación

-   [ ] El servidor backend está corriendo
-   [ ] La URL en `app/utils/api.ts` es correcta
-   [ ] Hay un token guardado (revisa localStorage)
-   [ ] El token es válido y no expiró
-   [ ] El endpoint `POST /products/filter` existe en el backend
-   [ ] La base de datos tiene productos
-   [ ] Los logs en la consola muestran información útil
-   [ ] No hay errores de CORS
-   [ ] La respuesta del servidor tiene el formato correcto

---

## 🆘 Si nada funciona

1. **Copia todos los logs de la consola** (los que empiezan con 🔄, 📦, ✅, ❌)
2. **Copia la respuesta del servidor** (busca "Response Text" en los logs)
3. **Verifica el formato de la respuesta** vs. el formato esperado
4. **Prueba con Postman** para aislar si el problema es del backend o frontend

---

## 🔧 Comando útiles

### Ver logs en tiempo real (Expo)

```bash
npx expo start
# Presiona 'w' para web
# Presiona 'a' para Android
# Presiona 'i' para iOS
```

### Limpiar caché de Expo

```bash
npx expo start -c
```

### Ver todos los endpoints disponibles

Revisa tu archivo de rutas del backend o la documentación de la API.
