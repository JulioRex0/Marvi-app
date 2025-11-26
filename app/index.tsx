// Importaciones necesarias para la pantalla principal
import { alertLoading, alertMessage } from "@/app/utils/alerts";
import { getApi, postApi } from "@/app/utils/api";
import { guardarToken } from "@/app/utils/auth";
import { validateEmail, validatePasswordLength } from "@/app/utils/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { Image } from "expo-image";
import { router } from "expo-router"; // Importar router para navegación
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
// Importación de componentes personalizados
import ParallaxScrollView from "@/components/parallax-scroll-view"; // Vista con efecto parallax
import { ThemedText } from "@/components/themed-text"; // Texto que se adapta al tema
import { ThemedView } from "@/components/themed-view"; // Vista que se adapta al tema

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const emailRef = useRef<TextInput | null>(null);
    const passwordRef = useRef<TextInput | null>(null);

    // Configuración de Google OAuth - Solo para web por ahora
    const [request, response, promptAsync] = Google.useAuthRequest(
        Platform.OS === "web"
            ? {
                  webClientId: "922337878533-9en9174r0fc9tqrtjc8a1bnf5jjd9lj2.apps.googleusercontent.com",
              }
            : {
                  // Para Android/iOS necesitas configurar Client IDs específicos
                  // Por ahora, dejarlo deshabilitado en móvil
                  webClientId: "922337878533-9en9174r0fc9tqrtjc8a1bnf5jjd9lj2.apps.googleusercontent.com",
                  androidClientId: "922337878533-9en9174r0fc9tqrtjc8a1bnf5jjd9lj2.apps.googleusercontent.com",
                  iosClientId: "922337878533-9en9174r0fc9tqrtjc8a1bnf5jjd9lj2.apps.googleusercontent.com",
              }
    );

    // Manejar respuesta de Google
    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleAuthSuccess(authentication.accessToken);
            }
        }
    }, [response]);

    const handleGoogleAuthSuccess = async (accessToken: string) => {
        try {
            console.log("Access token recibido:", accessToken);

            // Obtener info del usuario desde Google
            const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const userInfo = await userInfoResponse.json();
            console.log("Info del usuario:", userInfo);

            // Enviar al backend
            const result = await postApi("login/google", {
                credencial: accessToken,
                email: userInfo.email,
                nombre: userInfo.name,
                imagen: userInfo.picture,
            });

            console.log("Respuesta del backend:", result);

            if (result && result.success) {
                // Guardar token si existe
                const token = result.data?.token || result.token;
                if (token) {
                    console.log("✅ Guardando token de Google Sign-In");
                    guardarToken(token);
                }

                await alertMessage("¡Bienvenido!", `Hola ${userInfo.name}!`);
                router.push("/Menu");
            } else {
                await alertMessage("Error", result.message || "No se pudo iniciar sesión");
            }
        } catch (error) {
            console.error("Error al procesar Google Sign-In:", error);
            await alertMessage("Error", "No se pudo procesar el inicio de sesión");
        }
    };

    // Google Sign-In - Método unificado para web y móvil
    const handleGoogleSignIn = async () => {
        try {
            // Para móvil (Android/iOS), usar Expo AuthSession
            if (Platform.OS !== "web") {
                promptAsync();
                return;
            }

            // Para web, usar Google Identity Services
            const googleClientId = "922337878533-9en9174r0fc9tqrtjc8a1bnf5jjd9lj2.apps.googleusercontent.com";

            if (typeof (window as any).google !== "undefined") {
                (window as any).google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: async (response: any) => {
                        console.log("Token de Google recibido:", response.credential);

                        try {
                            const result = await postApi("login/google", {
                                credencial: response.credential,
                            });

                            console.log("Respuesta del backend:", result);

                            if (result && result.success) {
                                // Guardar token si existe
                                const token = result.data?.token || result.token;
                                if (token) {
                                    console.log("✅ Guardando token de Google Sign-In (Web)");
                                    guardarToken(token);
                                }

                                await alertMessage("¡Bienvenido!", "Inicio de sesión exitoso con Google");
                                router.push("/Menu");
                            } else {
                                await alertMessage("Error", result.message || "No se pudo iniciar sesión");
                            }
                        } catch (error) {
                            console.error("Error al enviar a backend:", error);
                            await alertMessage("Error", "No se pudo procesar el inicio de sesión");
                        }
                    },
                });

                (window as any).google.accounts.id.prompt();
            } else {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log("Script de Google cargado");
                    setTimeout(() => handleGoogleSignIn(), 500);
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error("Error en Google Sign-In:", error);
            await alertMessage("Error", "No se pudo iniciar sesión con Google");
        }
    };

    // Función para manejar el inicio de sesión
    const handleLogin = async () => {
        if (email.trim() === "") {
            await alertMessage("Error", "Por favor ingresa un correo electrónico");
            return;
        }

        if (password.trim() === "") {
            await alertMessage("Error", "Por favor ingresa tu contraseña");
            return;
        }

        if (!validateEmail(email)) {
            await alertMessage("Error", "Por favor ingresa un correo electrónico válido");
            return;
        }

        // Optionally validate password length using utility (>=8)
        if (!validatePasswordLength(password)) {
            await alertMessage("Error", "La contraseña debe tener al menos 8 caracteres");
            return;
        }

        // Si no es usuario de prueba, intentar login con API
        alertLoading("Iniciando sesión", "Validando credenciales...");
        try {
            console.log("Intentando login con API:", { correo: email });
            const response = await postApi("login/client", { correo: email, contrasena: password });
            console.log("Respuesta completa de la API:", response);

            if (response.success) {
                // Verificar si hay token en response.data
                const token = response.data?.token || response.token;
                if (token) {
                    console.log("✅ Token encontrado:", token.substring(0, 20) + "...");

                    // ⭐ IMPORTANTE: Guardar token usando la función auth
                    guardarToken(token);

                    // Decodificar JWT para obtener usuario_activo
                    try {
                        const base64Url = token.split(".")[1];
                        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                        const jsonPayload = decodeURIComponent(
                            atob(base64)
                                .split("")
                                .map((c) => {
                                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                                })
                                .join("")
                        );
                        const decoded = JSON.parse(jsonPayload);
                        console.log("JWT decodificado:", decoded);

                        if (decoded.usuario_activo) {
                            // Obtener datos completos del usuario desde la API
                            const userResponse = await getApi(`clients/${decoded.usuario_activo}`, token);

                            if (userResponse.success) {
                                // Guardar datos del usuario
                                localStorage.setItem("user", JSON.stringify(userResponse.data));
                                localStorage.setItem("usuario_activo", decoded.usuario_activo);
                                console.log("✅ Datos de usuario guardados");
                            } else {
                                // Si falla, guardar al menos el usuario_activo
                                localStorage.setItem("usuario_activo", decoded.usuario_activo);
                                console.log("⚠️ Solo se guardó usuario_activo");
                            }
                        }
                    } catch (decodeError) {
                        console.error("Error al decodificar JWT:", decodeError);
                    }
                } else {
                    // Si no hay token pero hay datos de usuario en response.data, guardarlos directamente
                    console.warn("⚠️ No hay token en la respuesta");
                    if (response.data?.usuario || response.data?.id_usuario) {
                        localStorage.setItem("user", JSON.stringify(response.data));
                        localStorage.setItem("usuario_activo", response.data.usuario || response.data.id_usuario);
                        // Guardar un token temporal para mantener la sesión
                        guardarToken("session-active");
                    }
                }

                if (Platform.OS === "web") {
                    await alertMessage("¡Bienvenido!", `Inicio de sesión exitoso`);
                    router.push("/Menu");
                } else {
                    Alert.alert("¡Bienvenido!", `Inicio de sesión exitoso`, [{ text: "Continuar", onPress: () => router.push("/Menu") }]);
                }
                setEmail("");
                setPassword("");
                return;
            }

            // Si la API retorna error, mostrarlo
            if (response && !response.success) {
                const errorMsg = response.message || "Credenciales incorrectas";
                console.log("Error de la API:", errorMsg);
                await alertMessage("Error de autenticación", String(errorMsg));
                return;
            }
        } catch (err) {
            console.error("Error al intentar login con API:", err);
            await alertMessage("Error de conexión", "No se pudo conectar con el servidor. Por favor verifica tu conexión.");
            return;
        }

        // Si llegamos aquí, las credenciales no son válidas
        await alertMessage("Error de autenticación", "Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales.");
    };

    const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 80;

    return (
        // Vista con efecto parallax que contiene todo el contenido
        <ParallaxScrollView
            // Colores de fondo del header según el tema (claro/oscuro)
            headerBackgroundColor={{ light: "#f7f7f7ff", dark: "#ffffffff" }}
            headerImage={<Image source={require("@/assets/images/MARVI LOGO.png")} style={styles.reactLogo} pointerEvents="none" />}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={keyboardVerticalOffset} style={{ flex: 1 }}>
                {/* Apartado para inicio de sesión */}
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

                    {/* Botón para ir a registro */}
                    <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/register")}>
                        <ThemedText style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</ThemedText>
                    </TouchableOpacity>

                    {/* Separador */}
                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <ThemedText style={styles.separatorText}>O continúa con</ThemedText>
                        <View style={styles.separatorLine} />
                    </View>

                    {/* Botón de Google Sign-In */}
                    <TouchableOpacity style={styles.googleSignInButton} onPress={handleGoogleSignIn}>
                        <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
                        <ThemedText style={styles.googleSignInText}>Continuar con Google</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
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
    // Botón de registro
    registerButton: {
        marginTop: 12,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#dd5746",
    },
    // Texto del botón de registro
    registerButtonText: {
        color: "#dd5746",
        fontSize: 14,
        fontWeight: "600",
    },
    // Separador
    separatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    separatorText: {
        marginHorizontal: 10,
        color: "#666",
        fontSize: 14,
    },
    // Google Sign-In
    googleSignInButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    googleSignInText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
});
