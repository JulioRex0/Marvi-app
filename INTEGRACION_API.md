# Integración de API de Productos

## Configuración realizada

Se ha integrado la API de productos en la aplicación React Native. Los cambios incluyen:

### 1. Archivos nuevos creados

-   **`types/product.ts`**: Define interfaces TypeScript para productos de la API
-   **`app/utils/productApi.ts`**: Funciones para interactuar con la API de productos
-   **`app/utils/auth.ts`**: Utilidades para manejar tokens de autenticación

### 2. Modificaciones en `app/Menu.tsx`

-   Se reemplazaron los productos estáticos por productos cargados desde la API
-   Se agregó manejo de estados de carga (`loading`) y errores
-   Se actualizaron las funciones del carrito para trabajar con los campos de la API:
    -   `id_producto` en lugar de `id`
    -   `cantidad` en lugar de `stock`
    -   `cantidad_carrito` para items en el carrito
    -   `imagen_url` en lugar de imágenes locales

## Endpoints disponibles

La aplicación puede consumir los siguientes endpoints:

### Obtener productos con filtros

```typescript
POST http://localhost:3000/products/filter
{
  "columna_orden": "nombre",
  "orden": "ASC",
  "limite": 100,
  "desplazamiento": 0
}
```

### Buscar productos

```typescript
POST http://localhost:3000/products/search
{
  "busqueda": "Jabón",
  "limite": 10,
  "desplazamiento": 0
}
```

### Obtener un producto específico

```typescript
GET http://localhost:3000/products/PROD001
```

### Crear producto

```typescript
POST http://localhost:3000/products
{
  "codigo": "PROD001",
  "nombre": "Jabón Líquido",
  "descripcion": "Jabón líquido para manos",
  "precio": 15.99,
  "cantidad": 100,
  "imagen_url": "https://example.com/imagen.jpg"
}
```

### Actualizar producto

```typescript
PUT http://localhost:3000/products
{
  "id_producto": 1,
  "codigo": "PROD001",
  "nombre": "Jabón Líquido Premium",
  "descripcion": "Jabón líquido mejorado",
  "precio": 18.99,
  "cantidad": 100,
  "imagen_url": "https://example.com/imagen.jpg"
}
```

### Eliminar producto

```typescript
DELETE http://localhost:3000/products/PROD001
```

## Configuración del servidor

### Para desarrollo web:

El archivo `app/utils/api.ts` está configurado para usar `http://localhost:3000` en web.

### Para desarrollo móvil:

Debes cambiar la IP en `app/utils/api.ts`:

```typescript
// Cambiar esta línea con tu IP local
return "http://192.168.10.50:3000";
```

Para encontrar tu IP local:

-   **Windows**: Ejecuta `ipconfig` en cmd y busca "Dirección IPv4"
-   **Mac/Linux**: Ejecuta `ifconfig` o `ip addr`

## Autenticación

### Guardar el token después del login:

```typescript
import { guardarToken } from "@/app/utils/auth";

// Después de hacer login exitoso
const response = await postApi("auth/login", { usuario: "admin", password: "123" });
if (response.token) {
    guardarToken(response.token);
}
```

### El token se usa automáticamente en las peticiones:

Las funciones en `productApi.ts` obtienen automáticamente el token guardado usando la función `getToken()`.

## Uso en el componente

El componente `Menu.tsx` ahora:

1. **Carga productos automáticamente** al montarse usando `useEffect`
2. **Muestra un indicador de carga** mientras obtiene los datos
3. **Muestra errores** si no puede conectarse al servidor
4. **Permite reintentar** si hay un error
5. **Muestra las imágenes desde URLs** en lugar de recursos locales

## Estados de la aplicación

-   **Cargando**: Muestra `ActivityIndicator` mientras se obtienen los productos
-   **Error**: Muestra mensaje de error y botón "Reintentar"
-   **Sin productos**: Muestra mensaje cuando no hay productos disponibles
-   **Con productos**: Muestra la lista de productos con sus imágenes desde la API

## Próximos pasos sugeridos

1. **Instalar AsyncStorage para móvil** (opcional):

    ```bash
    npx expo install @react-native-async-storage/async-storage
    ```

2. **Implementar búsqueda de productos**: Agregar un campo de búsqueda en la UI

3. **Implementar paginación**: Cargar más productos al hacer scroll

4. **Agregar pull-to-refresh**: Permitir refrescar la lista de productos

5. **Implementar caché**: Guardar productos en caché para acceso offline

## Ejemplo de estructura de producto desde la API

```typescript
{
  "id_producto": 1,
  "codigo": "PROD001",
  "nombre": "Jabón Líquido",
  "descripcion": "Jabón líquido para manos con aroma a lavanda",
  "precio": 15.99,
  "cantidad": 100,
  "imagen_url": "https://res.cloudinary.com/.../imagen.jpg",
  "fecha_registro": "2024-01-01T12:00:00Z",
  "fecha_actualizacion": "2024-01-01T12:00:00Z"
}
```

## Solución de problemas

### Error: "No se pudo conectar con el servidor"

-   Verifica que el servidor backend esté corriendo en `http://localhost:3000`
-   En móvil, verifica que la IP configurada sea correcta y que el dispositivo esté en la misma red

### Error: "Error al cargar productos"

-   Verifica que el token sea válido
-   Revisa los logs del servidor para ver el error específico
-   Verifica que los endpoints de la API sean correctos

### Las imágenes no se muestran

-   Verifica que las URLs de las imágenes sean accesibles
-   Asegúrate de que el servidor de imágenes (como Cloudinary) permita CORS
-   Revisa que las URLs estén correctamente formadas
