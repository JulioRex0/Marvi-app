import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: any;
    categoria: string;
    stock: number;
}

interface ProductoCarrito extends Producto {
    cantidad: number;
}

const PRODUCTOS: Producto[] = [
    {
        id: 1,
        nombre: "Suavizante Suavitel 1L",
        descripcion: "Suavizante de telas Suavitel en presentación de 1 litro.",
        precio: 40.0,
        imagen: require("@/assets/images/suavitel.jpg"),
        categoria: "Suavizantes",
        stock: 15,
    },
    {
        id: 2,
        nombre: "Jabón líquido Ariel 5L",
        descripcion: "Jabón líquido Ariel en presentación de 5 litros.",
        precio: 95.0,
        imagen: require("@/assets/images/ariel.jpg"),
        categoria: "Jabon liquido",
        stock: 8,
    },
    {
        id: 3,
        nombre: "Jabon en polvo Ariel 2kg",
        descripcion: "Detergente en polvo de alta eficacia para ropa blanca y de color.",
        precio: 85.0,
        imagen: require("@/assets/images/ariel polvo.png"),
        categoria: "Polvo",
        stock: 20,
    },
    {
        id: 4,
        nombre: "Jabon en Capsulas 16pz",
        descripcion: "Suavizante para telas con fragancia duradera y protección de fibras.",
        precio: 112.0,
        imagen: require("@/assets/images/capsulas.png"),
        categoria: "Capsulas",
        stock: 300,
    },
    {
        id: 5,
        nombre: "Blanqueador Cloralex 1L",
        descripcion: "Cloro concentrado para blanquear y desinfectar ropa y superficies.",
        precio: 25.0,
        imagen: require("@/assets/images/cloro.png"),
        categoria: "Blanqueadores",
        stock: 18,
    },
    {
        id: 6,
        nombre: "Jabon de barra Zote blanco 500g",
        descripcion: "Jabón en barra Zote, ideal para lavado a mano y tratamiento de manchas.",
        precio: 39.99,
        imagen: require("@/assets/images/zote chido.png"),
        categoria: "Barra",
        stock: 22,
    },
];

// -------------------------
// Componente principal
// -------------------------
export default function Menu() {
    const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
    const [vistaActual, setVistaActual] = useState<"productos" | "carrito">("productos");
    const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});

    // Navegación
    const handleLogout = () => router.replace("/");

    // Carrito: agregar / eliminar / modificar
    const agregarAlCarrito = (producto: Producto, cantidad: number = 1) => {
        const existente = carrito.find((p) => p.id === producto.id);
        const qty = Math.max(1, Math.floor(cantidad));
        if (qty > producto.stock) {
            return Alert.alert("Stock insuficiente", `Solo tenemos ${producto.stock} unidades disponibles`);
        }
        if (existente) {
            const nuevaCantidad = existente.cantidad + qty;
            if (nuevaCantidad > producto.stock) return Alert.alert("Stock insuficiente", `Solo tenemos ${producto.stock} unidades disponibles`);
            setCarrito((prev) => prev.map((p) => (p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p)));
            return Alert.alert("Producto actualizado", `${producto.nombre} actualizado en el carrito`);
        }
        setCarrito((prev) => [...prev, { ...producto, cantidad: qty }]);
        setSelectedQuantities((prev) => ({ ...prev, [producto.id]: 1 }));
        return Alert.alert("Producto agregado", `${producto.nombre} agregado al carrito`);
    };

    const eliminarDelCarrito = (id: number) => {
        const producto = carrito.find((p) => p.id === id);

        if (Platform.OS === "web") {
            const ok = (global as any).confirm(`¿Estás seguro de que deseas eliminar ${producto?.nombre} del carrito?`);
            if (ok) setCarrito((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        Alert.alert("Eliminar producto", `¿Estás seguro de que deseas eliminar ${producto?.nombre} del carrito?`, [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => setCarrito((prev) => prev.filter((p) => p.id !== id)) },
        ]);
    };

    const modificarCantidad = (id: number, nuevaCantidad: number) => {
        const producto = PRODUCTOS.find((p) => p.id === id);
        if (!producto) return;
        if (nuevaCantidad === 0) return eliminarDelCarrito(id);
        if (nuevaCantidad > producto.stock) return Alert.alert("Stock insuficiente", `Solo tenemos ${producto.stock} unidades disponibles`);
        setCarrito((prev) => prev.map((p) => (p.id === id ? { ...p, cantidad: nuevaCantidad } : p)));
    };

    const calcularTotal = () => carrito.reduce((t, item) => t + item.precio * item.cantidad, 0);

    const procederAlCheckout = () => {
        if (carrito.length === 0) return Alert.alert("Carrito vacío", "Agrega productos antes de proceder al pago");
        Alert.alert("Compra exitosa", `Total a pagar: $${calcularTotal().toFixed(2)}\n\nGracias por tu compra!`, [
            {
                text: "OK",
                onPress: () => {
                    setCarrito([]);
                    setVistaActual("productos");
                },
            },
        ]);
    };

    const Header = ({ title }: { title: string }) => (
        <View style={styles.header}>
            <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVistaActual("carrito")} style={styles.cartIcon}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="cart-outline" size={20} color="#fff" />
                    <Text style={[styles.cartIconText, { marginLeft: 6 }]}>({carrito.length})</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderProductos = () => (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
                <Header title="   MARVI" />
                <View style={styles.productsGrid}>
                    {PRODUCTOS.map((producto) => {
                        const existente = carrito.find((p) => p.id === producto.id);
                        const remaining = producto.stock - (existente?.cantidad || 0);
                        const maxAllowed = Math.max(0, remaining);
                        const rawSelected = selectedQuantities[producto.id] ?? (maxAllowed > 0 ? 1 : 0);
                        const displayQty = Math.min(Math.max(rawSelected, 0), maxAllowed);

                        return (
                            <View key={producto.id} style={styles.productCard}>
                                <Image source={producto.imagen} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{producto.nombre}</Text>
                                    <Text style={styles.productCategory}>{producto.categoria}</Text>
                                    <Text style={styles.productDescription}>{producto.descripcion}</Text>
                                    <Text style={styles.productPrice}>${producto.precio.toFixed(2)}</Text>
                                    <Text style={styles.productStock}>Stock: {producto.stock} unidades</Text>

                                    {maxAllowed === 0 ? (
                                        <Text style={{ color: "#cc0e0eff", marginTop: 8, fontWeight: "bold" }}>Agotado</Text>
                                    ) : (
                                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                                            <TouchableOpacity style={[styles.quantityButton, { width: 34, height: 34 }]} onPress={() => setSelectedQuantities((prev) => ({ ...prev, [producto.id]: Math.max(1, (prev[producto.id] || 1) - 1) }))} disabled={displayQty <= 1}>
                                                <Text style={styles.quantityButtonText}>-</Text>
                                            </TouchableOpacity>

                                            <Text style={[styles.quantityText, { marginHorizontal: 8, minWidth: 28, textAlign: "center" }]}>{displayQty}</Text>

                                            <TouchableOpacity style={[styles.quantityButton, { width: 34, height: 34 }]} onPress={() => setSelectedQuantities((prev) => ({ ...prev, [producto.id]: Math.min((prev[producto.id] || 1) + 1, maxAllowed) }))} disabled={displayQty >= maxAllowed}>
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={[styles.addButton, { marginLeft: 12, paddingHorizontal: 12, opacity: displayQty > 0 ? 1 : 0.5 }]} onPress={() => agregarAlCarrito(producto, displayQty)} disabled={displayQty <= 0}>
                                                <Text style={styles.addButtonText}>Añadir {displayQty > 1 ? `(${displayQty})` : ""}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.floatingCartButton} onPress={() => setVistaActual("carrito")} accessibilityLabel="Abrir carrito">
                <MaterialCommunityIcons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.floatingCartText}>
                    {carrito.length} • ${calcularTotal().toFixed(2)}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCarrito = () => (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setVistaActual("productos")} style={styles.backTouchable}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                {/* Centered title container so the title is perfectly centered horizontally */}
                <View style={styles.headerCenter} pointerEvents="none">
                    <Text style={styles.centeredHeaderTitle}>Mi Carrito</Text>
                </View>
                <View style={styles.cartIcon}>
                    <Text style={styles.cartIconText}>({carrito.length})</Text>
                </View>
            </View>
            {carrito.length === 0 ? (
                <View style={styles.emptyCart}>
                    <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => setVistaActual("productos")}>
                        <Text style={styles.backButtonText}>Ir a comprar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Total: ${calcularTotal().toFixed(2)}</Text>
                    </View>
                    {carrito.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            <Image source={item.imagen} style={styles.cartItemImage} />
                            <View style={styles.cartItemInfo}>
                                <Text style={styles.cartItemName}>{item.nombre}</Text>
                                <Text style={styles.cartItemPrice}>${item.precio.toFixed(2)} c/u</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity style={styles.quantityButton} onPress={() => modificarCantidad(item.id, item.cantidad - 1)}>
                                        <Text style={styles.quantityButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.cantidad}</Text>
                                    <TouchableOpacity style={styles.quantityButton} onPress={() => modificarCantidad(item.id, item.cantidad + 1)}>
                                        <Text style={styles.quantityButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.cartItemTotal}>Subtotal: ${(item.precio * item.cantidad).toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarDelCarrito(item.id)} accessibilityLabel={`Eliminar ${item.nombre}`}>
                                <MaterialCommunityIcons name="trash-can" size={22} color="#dd5746" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={styles.checkoutContainer}>
                        <TouchableOpacity style={styles.checkoutButton} onPress={procederAlCheckout}>
                            <Text style={styles.checkoutButtonText}>Proceder al pago - ${calcularTotal().toFixed(2)}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    );

    return vistaActual === "productos" ? renderProductos() : renderCarrito();
}

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    ViewTop: {
        marginTop: 30,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    // Encabezado del menú
    header: {
        backgroundColor: "#dd5746",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    // Logo MARVI en el header - circular
    logo: {
        width: 35,
        height: 35,
        borderRadius: 20,
        marginTop: 20,
        resizeMode: "cover",
        backgroundColor: "#ac9494ffd3dff",
        borderWidth: 3,
        borderColor: "#fff",
    },

    perfil: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: "cover",
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#fff",
    },

    // Título del header
    headerTitle: {
        color: "#ffffffff",
        fontSize: 28,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        marginTop: 20,
    },

    // Texto del total
    totalText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Texto de carrito vacío
    emptyText: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },

    // Botón de volver
    backButton: {
        backgroundColor: "#dd5746",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },

    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // Contenedor de checkout
    checkoutContainer: {
        padding: 20,
        backgroundColor: "#fff",
        marginTop: 20,
    },

    // Botón de checkout
    checkoutButton: {
        backgroundColor: "#dd5746",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    // Texto del botón de checkout
    checkoutButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    welcomeText: {
        color: "#ffffffff",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        opacity: 0.9,
    },
    menuContainer: {
        padding: 20,
    },
    menuItem: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuText: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
    },
    logoutButton: {
        backgroundColor: "#dc3545",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginTop: 12,
        marginBottom: 18,
        alignSelf: "center",
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },

    emptyCart: {
        marginTop: 50,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    viewCard: {
        marginTop: 15,
        borderRadius: 12,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    productDetails: {
        flex: 2,
        paddingLeft: 15,
        justifyContent: "space-between",
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    productDescription: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 8,
        lineHeight: 20,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    cartIcon: {
        marginTop: 15,
        padding: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 8,
    },
    cartIconText: {
        color: "#ffffffff",
        fontWeight: "bold",
        fontSize: 14,
    },
    backText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    // boton <--- volver
    backTouchable: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 12,
    },
    productsGrid: {
        padding: 10,
    },
    productCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productInfo: {
        flex: 1,
    },
    productCategory: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
        fontStyle: "italic",
    },
    productStock: {
        fontSize: 12,
        color: "#888",
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: "#dd5746",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    totalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        marginHorizontal: 10,
        marginBottom: 15,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartItem: {
        backgroundColor: "#fff",
        padding: 15,
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    cartItemPrice: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    cartItemTotal: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#cc0e0eff",
        marginTop: 8,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    quantityButton: {
        backgroundColor: "#dd5746",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    quantityText: {
        marginHorizontal: 15,
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    deleteButton: {
        padding: 10,
    },
    deleteButtonText: {
        fontSize: 20,
    },
    // Botón flotante de carrito
    floatingCartButton: {
        position: "absolute",
        right: 16,
        bottom: 24,
        backgroundColor: "#dd5746",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    floatingCartText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "bold",
    },
    headerCenter: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    // texto "Mi Carrito"
    centeredHeaderTitle: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 15,
    },
});
