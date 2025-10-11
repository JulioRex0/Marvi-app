// Importaciones necesarias para la pantalla principal
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";
// Importación de componentes personalizados
import ParallaxScrollView from "@/components/parallax-scroll-view"; // Vista con efecto parallax
import { ThemedText } from "@/components/themed-text"; // Texto que se adapta al tema
import { ThemedView } from "@/components/themed-view"; // Vista que se adapta al tema

export default function HomeScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const emailRef = useRef<TextInput | null>(null);
    const passwordRef = useRef<TextInput | null>(null);

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

        Alert.alert("Éxito", `Inicio de sesión exitoso para: ${email}`);
        // Limpiar los campos después del envío
        setEmail("");
        setPassword("");
    };

    return (
        // Vista con efecto parallax que contiene todo el contenido
        <ParallaxScrollView
            // Colores de fondo del header según el tema (claro/oscuro)
            headerBackgroundColor={{ light: "#f7f7f7ff", dark: "#ffffffff" }}
            headerImage={<Image source={require("@/assets/images/MARVI LOGO.png")} style={styles.reactLogo} pointerEvents="none" />}
        >
            {/* Apartado para añadir correo electrónico */}
            <ThemedView style={styles.emailContainer}>
                <ThemedText type="title" style={styles.emailTitle}>
                    Inicio de sesión
                </ThemedText>
                <ThemedText style={styles.emailDescription}>Por favor ingresa tu correo electrónico y contraseña</ThemedText>

                <TextInput ref={emailRef} style={styles.emailInput} placeholder="Ingresa tu correo electrónico" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} onTouchStart={() => emailRef.current?.focus()} />
                <TextInput ref={passwordRef} style={styles.emailInput} placeholder="Ingresa tu contraseña" placeholderTextColor="#999" value={password} onChangeText={setPassword} keyboardType="default" autoCapitalize="none" autoCorrect={false} secureTextEntry onTouchStart={() => passwordRef.current?.focus()} />

                {/* Botón para iniciar sesión */}
                <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                    <ThemedText style={styles.submitButtonText}>Iniciar sesión</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ParallaxScrollView>
    );
}

// Estilos del componente
const styles = StyleSheet.create({
    // Contenedor del título - dispone elementos en fila con espacio entre ellos
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // Contenedor de cada paso - añade espacio vertical entre elementos
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
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
    // Contenedor del apartado de correo electrónico
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
    // Título del apartado de correo
    emailTitle: {
        textAlign: "center",
        marginBottom: 8,
        color: "#333",
    },
    // Descripción del apartado de correo
    emailDescription: {
        textAlign: "center",
        marginBottom: 20,
        color: "#666",
        fontSize: 14,
    },
    // Campo de entrada del correo electrónico
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
    // Botón de envío
    submitButton: {
        backgroundColor: "#f74c18f3",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    // Texto del botón de envío
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
