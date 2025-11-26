import { alertLoading, alertMessage, alertToast } from "@/app/utils/alerts";
import { postApi } from "@/app/utils/api";
import { validateEmail, validatePasswordLength } from "@/app/utils/validations";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [primerApellido, setPrimerApellido] = useState("");
    const [segundoApellido, setSegundoApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmContrasena, setConfirmContrasena] = useState("");
    const [imagenUri, setImagenUri] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSelectImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                await alertMessage("Permiso denegado", "Se necesita acceso a la galería para seleccionar una imagen");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImagenUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error al seleccionar imagen:", error);
            await alertMessage("Error", "No se pudo seleccionar la imagen");
        }
    };

    const handleRegister = async () => {
        // Validaciones
        if (!nombreUsuario.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa un nombre de usuario");
            return;
        }

        if (!nombre.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa tu nombre");
            return;
        }

        if (!primerApellido.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa tu primer apellido");
            return;
        }

        if (!correo.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa tu correo electrónico");
            return;
        }

        if (!validateEmail(correo)) {
            await alertMessage("Correo inválido", "Por favor ingresa un correo electrónico válido");
            return;
        }

        if (!telefono.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa tu teléfono");
            return;
        }

        if (!direccion.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa tu dirección");
            return;
        }

        if (!contrasena.trim()) {
            await alertMessage("Campo requerido", "Por favor ingresa una contraseña");
            return;
        }

        if (!validatePasswordLength(contrasena)) {
            await alertMessage("Contraseña inválida", "La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (contrasena !== confirmContrasena) {
            await alertMessage("Contraseñas no coinciden", "Por favor verifica que ambas contraseñas sean iguales");
            return;
        }

        // Preparar datos
        const formData = new FormData();
        formData.append("cliente", nombreUsuario);
        formData.append("nombre", nombre);
        formData.append("primer_apellido", primerApellido);
        formData.append("segundo_apellido", segundoApellido);
        formData.append("correo", correo);
        formData.append("telefono", telefono);
        formData.append("direccion", direccion);
        formData.append("contrasena", contrasena);

        // Agregar imagen si existe
        if (imagenUri) {
            const uriParts = imagenUri.split(".");
            const fileType = uriParts[uriParts.length - 1];

            formData.append("imagen_src", {
                uri: imagenUri,
                name: `profile.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        alertLoading("Registrando usuario", "Por favor espera mientras procesamos tu registro...");
        setLoading(true);

        try {
            const response = await postApi("clients", formData);
            console.log("Respuesta de registro:", response);

            if (response && response.success) {
                await alertToast("Registro exitoso", "Tu cuenta ha sido creada correctamente", "success", "bottom-end");

                // Navegar al login
                if (Platform.OS === "web") {
                    router.replace("/");
                } else {
                    Alert.alert("¡Registro exitoso!", "Tu cuenta ha sido creada. Por favor inicia sesión.", [{ text: "Ir a inicio de sesión", onPress: () => router.replace("/") }]);
                }
            } else {
                const errorMessage = response?.message || "No se pudo completar el registro";
                await alertMessage("Error en registro", errorMessage);
            }
        } catch (error) {
            console.error("Error en registro:", error);
            await alertMessage("Error de conexión", "No se pudo conectar con el servidor. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ThemedText type="title" style={styles.title}>
                    Crear cuenta
                </ThemedText>
                <ThemedText style={styles.subtitle}>Completa el formulario para registrarte</ThemedText>

                {/* Foto de perfil */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={handleSelectImage} style={styles.imageContainer}>
                        {imagenUri ? (
                            <Image source={{ uri: imagenUri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <ThemedText style={styles.placeholderText}>📷</ThemedText>
                                <ThemedText style={styles.placeholderLabel}>Seleccionar foto</ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Campos del formulario */}
                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Nombre de usuario *</ThemedText>
                    <TextInput style={styles.input} placeholder="Tu nombre de usuario" placeholderTextColor="#999" value={nombreUsuario} onChangeText={setNombreUsuario} autoCapitalize="none" editable={!loading} />

                    <ThemedText style={styles.label}>Nombre *</ThemedText>
                    <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor="#999" value={nombre} onChangeText={setNombre} editable={!loading} />

                    <ThemedText style={styles.label}>Primer apellido *</ThemedText>
                    <TextInput style={styles.input} placeholder="Tu primer apellido" placeholderTextColor="#999" value={primerApellido} onChangeText={setPrimerApellido} editable={!loading} />

                    <ThemedText style={styles.label}>Segundo apellido</ThemedText>
                    <TextInput style={styles.input} placeholder="Tu segundo apellido (opcional)" placeholderTextColor="#999" value={segundoApellido} onChangeText={setSegundoApellido} editable={!loading} />

                    <ThemedText style={styles.label}>Correo electrónico *</ThemedText>
                    <TextInput style={styles.input} placeholder="correo@ejemplo.com" placeholderTextColor="#999" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" editable={!loading} />

                    <ThemedText style={styles.label}>Teléfono *</ThemedText>
                    <TextInput style={styles.input} placeholder="Tu número de teléfono" placeholderTextColor="#999" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" editable={!loading} />

                    <ThemedText style={styles.label}>Dirección *</ThemedText>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Tu dirección completa" placeholderTextColor="#999" value={direccion} onChangeText={setDireccion} multiline numberOfLines={2} editable={!loading} />

                    <ThemedText style={styles.label}>Contraseña *</ThemedText>
                    <View style={styles.passwordContainer}>
                        <TextInput style={[styles.input, styles.passwordInput]} placeholder="Mínimo 8 caracteres" placeholderTextColor="#999" value={contrasena} onChangeText={setContrasena} secureTextEntry={!showPassword} autoCapitalize="none" editable={!loading} />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                            <ThemedText>{showPassword ? "👁️" : "👁️‍🗨️"}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.label}>Confirmar contraseña *</ThemedText>
                    <View style={styles.passwordContainer}>
                        <TextInput style={[styles.input, styles.passwordInput]} placeholder="Repite tu contraseña" placeholderTextColor="#999" value={confirmContrasena} onChangeText={setConfirmContrasena} secureTextEntry={!showConfirmPassword} autoCapitalize="none" editable={!loading} />
                        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <ThemedText>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botones */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.registerButtonText}>Registrarse</ThemedText>}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()} disabled={loading}>
                        <ThemedText style={styles.cancelButtonText}>Volver al inicio</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        textAlign: "center",
        marginBottom: 8,
        color: "#333",
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 24,
        color: "#666",
        fontSize: 14,
    },
    imageSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#dd5746",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    placeholderImage: {
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 40,
        marginBottom: 4,
    },
    placeholderLabel: {
        fontSize: 12,
        color: "#666",
    },
    formSection: {
        marginBottom: 16,
    },
    label: {
        marginTop: 12,
        marginBottom: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        color: "#333",
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: "top",
    },
    passwordContainer: {
        position: "relative",
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 12,
        padding: 4,
    },
    buttonSection: {
        marginTop: 24,
        gap: 12,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    registerButton: {
        backgroundColor: "#dd5746",
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#f0f0f0",
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
});
