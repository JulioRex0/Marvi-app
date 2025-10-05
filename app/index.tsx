// Importaciones necesarias para la pantalla principal
import { Image } from "expo-image";
import { router } from "expo-router"; // Importar router para navegación
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
// Importación de componentes personalizados
import ParallaxScrollView from "@/components/parallax-scroll-view"; // Vista con efecto parallax
import { ThemedText } from "@/components/themed-text"; // Texto que se adapta al tema
import { ThemedView } from "@/components/themed-view"; // Vista que se adapta al tema

export default function HomeScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Usuario de prueba para inicio de sesión
    const testUser = {
        email: "admin@marvi.com",
        password: "123456",
    };

    // Función para manejar el inicio de sesión
    const handleLogin = () => {
        // Validar que ambos campos estén llenos
        if (email.trim() === "") {
            Alert.alert("Error", "Por favor ingresa un correo electrónico");
            return;
        }

        if (password.trim() === "") {
            Alert.alert("Error", "Por favor ingresa tu contraseña");
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
            return;
        }

        // Validación básica de contraseña (mínimo 6 caracteres)
        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }

        // Validar credenciales del usuario de prueba
        if (email === testUser.email && password === testUser.password) {
            // En web, Alert.alert no ejecuta los botones proporcionados, por eso navegamos directamente
            if (Platform.OS === "web") {
                // Mostrar una alerta simple y navegar inmediatamente
                Alert.alert("¡Bienvenido!", `Inicio de sesión exitoso para: ${email}`);
                router.push("/Menu");
                console.log("Usuario autenticado correctamente (web)");
            } else {
                // En nativo mostramos la alerta con botón para continuar
                Alert.alert("¡Bienvenido!", `Inicio de sesión exitoso para: ${email}`, [
                    {
                        text: "Continuar",
                        onPress: () => {
                            // Navegar al menú principal
                            router.push("/Menu");
                            console.log("Usuario autenticado correctamente");
                        },
                    },
                ]);
            }
            // Limpiar los campos después del envío exitoso
            setEmail("");
            setPassword("");
        } else {
            Alert.alert("Error de autenticación", "Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales.");
        }
    };

    const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 80;

    return (
        // Vista con efecto parallax que contiene todo el contenido
        <ParallaxScrollView
            // Colores de fondo del header según el tema (claro/oscuro)
            headerBackgroundColor={{ light: "#f7f7f7ff", dark: "#ffffffff" }}
            headerImage={<Image source={require("@/assets/images/MARVI LOGO.png")} style={styles.reactLogo} />}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={keyboardVerticalOffset} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {/* Apartado para inicio de sesión */}
                    <ThemedView style={styles.emailContainer}>
                        <ThemedText type="title" style={styles.emailTitle}>
                            Inicio de sesión
                        </ThemedText>
                        <ThemedText style={styles.emailDescription}>Por favor ingresa tu correo electrónico y contraseña</ThemedText>

                        <TextInput style={styles.emailInput} placeholder="Ingresa tu correo electrónico" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                        <TextInput style={styles.emailInput} placeholder="Ingresa tu contraseña" placeholderTextColor="#999" value={password} onChangeText={setPassword} keyboardType="default" autoCapitalize="none" autoCorrect={false} secureTextEntry />

                        {/* Botón para iniciar sesión */}
                        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                            <ThemedText style={styles.submitButtonText}>Iniciar sesión</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ParallaxScrollView>
    );
}

// Estilos del componente
const styles = StyleSheet.create({
    // Estilo del logo MARVI en el header - centrado horizontal y verticalmente
    reactLogo: {
        height: 200,
        width: 350,
        position: "absolute",
        top: "70%",
        left: "50%",
        transform: [
            { translateX: -175 }, // Mitad del ancho (350/2)
            { translateY: -100 }, // Mitad de la altura (200/2)
        ],
        resizeMode: "contain", // Mantiene las proporciones de la imagen
    },
    // Contenedor del apartado de inicio de sesión
    emailContainer: {
        padding: 20,
        margin: 16,
        borderRadius: 12,
        backgroundColor: "#f9f9f9",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Título del apartado de inicio de sesión
    emailTitle: {
        textAlign: "center",
        marginBottom: 8,
        color: "#333",
    },
    // Descripción del apartado de inicio de sesión
    emailDescription: {
        textAlign: "center",
        marginBottom: 20,
        color: "#666",
        fontSize: 14,
    },
    // Campo de entrada del correo electrónico y contraseña
    emailInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 16,
        color: "#333",
    },
    // Botón de inicio de sesión
    submitButton: {
        backgroundColor: "#dd5746",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    // Texto del botón de inicio de sesión
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
