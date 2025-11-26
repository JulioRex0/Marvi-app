# Guía Rápida: Cómo usar los productos de la API

## 🚀 Inicio Rápido

### 1. Configurar la URL del servidor

Edita `app/utils/api.ts` y asegúrate de que la URL del servidor sea correcta:

**Para desarrollo en Web:**
```typescript
// Ya está configurado para localhost
return "http://localhost:3000";
```

**Para desarrollo en Móvil (Android/iOS):**
```typescript
// Cambia esta IP por la de tu computadora
return "http://TU_IP_LOCAL:3000"; // Ejemplo: "http://192.168.1.100:3000"
```

💡 **Tip:** Para encontrar tu IP:
- Windows: Abre CMD y escribe `ipconfig`
- Mac/Linux: Abre Terminal y escribe `ifconfig` o `ip addr`

---

### 2. Guardar el token después del login

Cuando el usuario inicie sesión, debes guardar el token:

```typescript
import { postApi } from "@/app/utils/api";
import { guardarToken } from "@/app/utils/auth";

// En tu componente de login
const handleLogin = async (usuario: string, password: string) => {
    try {
        const response = await postApi("auth/login", { usuario, password });
        
        if (response.token) {
            guardarToken(response.token);
            router.push("/Menu"); // Navegar al menú
        }
    } catch (error) {
        Alert.alert("Error", "Credenciales incorrectas");
    }
};
```

---

### 3. Los productos se cargan automáticamente

El componente `Menu.tsx` ya está configurado para:
- ✅ Cargar productos automáticamente al abrir la pantalla
- ✅ Mostrar un indicador de carga mientras se obtienen los datos
- ✅ Mostrar errores si no puede conectarse
- ✅ Permitir reintentar si hay un error

**No necesitas hacer nada más**, solo asegúrate de que:
1. El servidor esté corriendo en `http://localhost:3000`
2. Hayas guardado el token después del login
3. La URL del servidor sea correcta

---

## 📦 Estructura de Producto de la API

Los productos vienen con esta estructura:

```typescript
{
  id_producto: 1,
  codigo: "PROD001",
  nombre: "Jabón Líquido",
  descripcion: "Jabón líquido para manos con aroma a lavanda",
  precio: 15.99,
  cantidad: 100,  // Este es el stock disponible
  imagen_url: "https://res.cloudinary.com/.../imagen.jpg"
}
```

---

## 🛒 Cómo funciona el carrito

El carrito ahora usa:
- `id_producto` - ID del producto desde la API
- `cantidad` - Stock disponible del producto
- `cantidad_carrito` - Cantidad agregada al carrito
- `imagen_url` - URL de la imagen (cargada desde internet)

---

## 🔧 Funciones API disponibles

Ya están creadas y listas para usar en `app/utils/productApi.ts`:

### Obtener todos los productos
```typescript
import { obtenerProductosFiltrados } from "@/app/utils/productApi";

const productos = await obtenerProductosFiltrados({
    columna_orden: "nombre",
    orden: "ASC",
    limite: 100,
    desplazamiento: 0
});
```

### Buscar productos
```typescript
import { buscarProductos } from "@/app/utils/productApi";

const resultados = await buscarProductos("Jabón", 50, 0);
```

### Obtener un producto específico
```typescript
import { obtenerProductoPorCodigo } from "@/app/utils/productApi";

const producto = await obtenerProductoPorCodigo("PROD001");
```

### Crear un producto (solo admin)
```typescript
import { crearProducto } from "@/app/utils/productApi";

const resultado = await crearProducto({
    codigo: "PROD002",
    nombre: "Nuevo producto",
    descripcion: "Descripción del producto",
    precio: 29.99,
    cantidad: 50,
    imagen_url: "https://ejemplo.com/imagen.jpg"
});
```

### Actualizar un producto (solo admin)
```typescript
import { actualizarProducto } from "@/app/utils/productApi";

const resultado = await actualizarProducto({
    id_producto: 1,
    codigo: "PROD001",
    nombre: "Producto actualizado",
    descripcion: "Nueva descripción",
    precio: 34.99,
    cantidad: 75,
    imagen_url: "https://ejemplo.com/nueva-imagen.jpg"
});
```

### Eliminar un producto (solo admin)
```typescript
import { eliminarProducto } from "@/app/utils/productApi";

const resultado = await eliminarProducto("PROD001");
```

---

## 🐛 Solución de Problemas

### ❌ "No se pudo conectar con el servidor"

**Soluciones:**
1. Verifica que el servidor esté corriendo:
   ```bash
   # El servidor debe estar corriendo en http://localhost:3000
   ```

2. Si estás probando en móvil:
   - Asegúrate de que tu celular y tu computadora estén en la misma red WiFi
   - Cambia `localhost` por la IP de tu computadora en `app/utils/api.ts`

3. Verifica que no haya firewall bloqueando la conexión

---

### ❌ "Error al cargar productos" o respuesta 401

**Soluciones:**
1. El token puede haber expirado. Cierra sesión y vuelve a iniciar sesión.

2. Verifica que el token se guardó correctamente:
   ```typescript
   import { obtenerToken } from "@/app/utils/auth";
   console.log("Token actual:", obtenerToken());
   ```

3. Asegúrate de que el endpoint de login devuelva un token válido

---

### ❌ Las imágenes no se muestran

**Soluciones:**
1. Verifica que las URLs de las imágenes sean válidas y accesibles
2. Asegúrate de que el servidor de imágenes (Cloudinary) permita CORS
3. Verifica que las URLs empiecen con `http://` o `https://`

---

## 🎯 Pasos siguientes recomendados

1. **Agregar campo de búsqueda** en la UI para filtrar productos
2. **Implementar paginación** para cargar productos de forma incremental
3. **Agregar pull-to-refresh** para actualizar la lista
4. **Implementar caché** para acceso offline
5. **Crear pantalla de administración** para agregar/editar/eliminar productos

---

## 📱 Probando la aplicación

### En Web:
```bash
npm run web
# o
npx expo start --web
```

### En Android:
```bash
npm run android
# o
npx expo start --android
```

### En iOS:
```bash
npm run ios
# o
npx expo start --ios
```

---

## 💡 Notas importantes

1. **Token**: El token se guarda automáticamente en `localStorage` en web. Para móvil, considera usar `@react-native-async-storage/async-storage`.

2. **Imágenes**: Las imágenes se cargan desde URLs (como Cloudinary). Asegúrate de que sean URLs públicas y accesibles.

3. **Stock**: El sistema controla automáticamente el stock disponible y no permite agregar más productos de los disponibles.

4. **Carrito**: El carrito se mantiene en memoria mientras la app esté abierta. Si quieres persistencia, considera usar AsyncStorage.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la consola del navegador (F12)
2. Revisa los logs del terminal donde corre Expo
3. Verifica los logs del servidor backend
4. Asegúrate de que todas las URLs y tokens sean correctos
