import { alertConfirm, alertLoading, alertMessage, alertToast } from "@/app/utils/alerts";
import { getApi, patchApi, putApi } from "@/app/utils/api";
import { validateEmail } from "@/app/utils/validations";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    // Datos del usuario
    const [userId, setUserId] = useState("");
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [primerApellido, setPrimerApellido] = useState("");
    const [segundoApellido, setSegundoApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [imagenUri, setImagenUri] = useState<string | null>(null);

    // Contraseñas
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Token y sesión
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        try {
            // Obtener usuario_activo desde localStorage
            const usuarioActivo = typeof window !== "undefined" ? localStorage.getItem("usuario_activo") : null;
            console.log("Usuario activo:", usuarioActivo);

            // Primero intentar cargar desde localStorage
            const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
            console.log("Datos cargados desde localStorage:", raw);
            const session = raw ? JSON.parse(raw) : null;

            if (session) {
                setUserId(session.id_usuario || session.id || "");
                setNombreUsuario(session.usuario || "");
                setNombre(session.nombre || "");
                setPrimerApellido(session.primer_apellido || "");
                setSegundoApellido(session.segundo_apellido || "");
                setCorreo(session.correo || "");
                setTelefono(session.telefono || "");
                setDireccion(session.direccion || "");
                setImagenUri(session.imagen_src || null);
            } else {
                console.log("No se encontró sesión en localStorage");
            }

            // Si hay token y usuario_activo, intentar obtener datos actualizados de la API
            if (token && usuarioActivo) {
                try {
                    console.log("Obteniendo datos del cliente desde API:", usuarioActivo);
                    const response = await getApi("clients", token);
                    console.log("Respuesta de la API:", response);

                    if (response && response.success && response.data) {
                        // Si data es un array, buscar el usuario por nombre de usuario
                        let userData = null;
                        if (Array.isArray(response.data)) {
                            userData = response.data.find((user: any) => user.usuario === usuarioActivo || user.id_usuario === usuarioActivo);
                        } else {
                            userData = response.data;
                        }

                        if (userData) {
                            setUserId(userData.id_usuario || userData.id || "");
                            setNombreUsuario(userData.usuario || "");
                            setNombre(userData.nombre || "");
                            setPrimerApellido(userData.primer_apellido || "");
                            setSegundoApellido(userData.segundo_apellido || "");
                            setCorreo(userData.correo || "");
                            setTelefono(userData.telefono || "");
                            setDireccion(userData.direccion || "");
                            setImagenUri(userData.imagen_src || null);

                            // Actualizar localStorage con datos frescos
                            localStorage.setItem("user", JSON.stringify(userData));
                        }
                    }
                } catch (apiError) {
                    console.warn("No se pudo cargar datos actualizados de la API:", apiError);
                    // Continuar con datos de localStorage
                }
            }
        } catch (err) {
            console.error("Error al cargar datos del usuario:", err);
            await alertMessage("Error", "No se pudieron cargar los datos del usuario");
        } finally {
            setLoading(false);
        }
    };

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
                const newUri = result.assets[0].uri;
                await handleUpdateImage(newUri);
            }
        } catch (error) {
            console.error("Error al seleccionar imagen:", error);
            await alertMessage("Error", "No se pudo seleccionar la imagen");
        }
    };

    const handleUpdateImage = async (uri: string) => {
        const confirmed = await alertConfirm("Actualizar foto de perfil", "¿Deseas cambiar tu foto de perfil?", "question");

        if (!confirmed) return;

        const formData = new FormData();
        formData.append("usuario", nombreUsuario);

        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("imagen", {
            uri,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
        } as any);

        alertLoading("Actualizando foto", "Por favor espera...");
        setLoadingImage(true);

        try {
            const response = await patchApi("users/image", formData, token);

            if (response && response.success) {
                // Usar la URL devuelta por el servidor si está disponible
                const newImageUrl = response.imagen_src || response.data?.imagen_src || uri;
                setImagenUri(newImageUrl);

                // Actualizar en localStorage
                const raw = localStorage.getItem("user");
                if (raw) {
                    const user = JSON.parse(raw);
                    user.imagen_src = newImageUrl;
                    localStorage.setItem("user", JSON.stringify(user));
                }
                await alertToast("Foto actualizada", "Tu foto de perfil se actualizó correctamente", "success", "bottom-end");
            } else {
                await alertMessage("Error", response?.message || "No se pudo actualizar la foto");
            }
        } catch (error) {
            console.error("Error al actualizar imagen:", error);
            await alertMessage("Error de conexión", "No se pudo conectar con el servidor");
        } finally {
            setLoadingImage(false);
        }
    };

    const handleSaveProfile = async () => {
        // Validaciones
        if (!nombreUsuario.trim()) {
            await alertMessage("Campo requerido", "El nombre de usuario es obligatorio");
            return;
        }

        if (!nombre.trim()) {
            await alertMessage("Campo requerido", "El nombre es obligatorio");
            return;
        }

        if (!primerApellido.trim()) {
            await alertMessage("Campo requerido", "El primer apellido es obligatorio");
            return;
        }

        if (!correo.trim()) {
            await alertMessage("Campo requerido", "El correo es obligatorio");
            return;
        }

        if (!validateEmail(correo)) {
            await alertMessage("Correo inválido", "Por favor ingresa un correo electrónico válido");
            return;
        }

        if (!telefono.trim()) {
            await alertMessage("Campo requerido", "El teléfono es obligatorio");
            return;
        }

        if (!direccion.trim()) {
            await alertMessage("Campo requerido", "La dirección es obligatoria");
            return;
        }

        const data = {
            id_usuario: userId,
            usuario: nombreUsuario,
            nombre,
            primer_apellido: primerApellido,
            segundo_apellido: segundoApellido,
            correo,
            telefono,
            direccion,
        };

        alertLoading("Actualizando perfil", "Por favor espera mientras se guardan los cambios...");
        const previousLoading = loading;
        setLoading(true);

        try {
            const response = await putApi("users", data, token);

            if (response && response.success) {
                // Mantener la imagen actual en los datos guardados
                const updatedData = { ...data, imagen_src: imagenUri };
                localStorage.setItem("user", JSON.stringify(updatedData));
                await alertToast("Perfil actualizado", "Tu información se actualizó correctamente", "success", "bottom-end");
                setEditing(false);
            } else {
                await alertMessage("Error", response?.message || "No se pudo actualizar el perfil");
            }
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            await alertMessage("Error de conexión", "No se pudo conectar con el servidor");
        } finally {
            setLoading(previousLoading);
        }
    };

    const handleChangePassword = async () => {
        // Validaciones
        if (!contrasenaActual.trim()) {
            await alertMessage("Campo requerido", "Ingresa tu contraseña actual");
            return;
        }

        if (!contrasenaNueva.trim()) {
            await alertMessage("Campo requerido", "Ingresa tu nueva contraseña");
            return;
        }

        if (contrasenaNueva.length < 8) {
            await alertMessage("Contraseña inválida", "La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (contrasenaNueva !== confirmarContrasena) {
            await alertMessage("Contraseñas no coinciden", "La nueva contraseña y su confirmación deben ser iguales");
            return;
        }

        const data = {
            usuario: nombreUsuario,
            contrasena_actual: contrasenaActual,
            contrasena_nueva: contrasenaNueva,
        };

        alertLoading("Cambiando contraseña", "Por favor espera...");
        setLoadingPassword(true);

        try {
            const response = await patchApi("users/password", data, token);

            if (response && response.success) {
                await alertToast("Contraseña actualizada", "Tu contraseña se cambió correctamente", "success", "bottom-end");
                setContrasenaActual("");
                setContrasenaNueva("");
                setConfirmarContrasena("");
                setEditingPassword(false);
            } else {
                await alertMessage("Error", response?.message || "No se pudo cambiar la contraseña");
            }
        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            await alertMessage("Error de conexión", "No se pudo conectar con el servidor");
        } finally {
            setLoadingPassword(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#dd5746" />
                <ThemedText style={{ marginTop: 16, color: "#666" }}>Cargando perfil...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ThemedText style={styles.backText}>← Volver</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Foto de perfil */}
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        {imagenUri ? (
                            <Image source={{ uri: imagenUri.startsWith("http") ? imagenUri : `http://localhost:3000${imagenUri}` }} style={styles.profileImage} defaultSource={require("@/assets/images/icon.png")} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <ThemedText style={styles.placeholderText}>👤</ThemedText>
                            </View>
                        )}
                    </View>
                    <ThemedText type="subtitle" style={styles.userName}>
                        {nombreUsuario || "Usuario"}
                    </ThemedText>
                </View>

                {/* Información personal */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Información Personal
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Nombre completo</ThemedText>
                        <ThemedText style={styles.infoValue}>
                            {nombre} {primerApellido} {segundoApellido}
                        </ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Correo electrónico</ThemedText>
                        <ThemedText style={styles.infoValue}>{correo || "No especificado"}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Teléfono</ThemedText>
                        <ThemedText style={styles.infoValue}>{telefono || "No especificado"}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Dirección</ThemedText>
                        <ThemedText style={styles.infoValue}>{direccion || "No especificada"}</ThemedText>
                    </View>
                </View>

                {/* Separador */}
                <View style={styles.divider} />

                {/* Acciones */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Acciones
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={async () => {
                            const confirmed = await alertConfirm("Cerrar sesión", "¿Estás seguro que deseas cerrar sesión?", "question");
                            if (confirmed) {
                                // Limpiar datos de sesión
                                localStorage.removeItem("user");
                                localStorage.removeItem("token");
                                // Redirigir al login
                                router.replace("/");
                            }
                        }}
                    >
                        <ThemedText style={styles.primaryButtonText}>Cerrar sesión</ThemedText>
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
    header: {
        marginBottom: 20,
    },
    backButton: {
        marginBottom: 12,
    },
    backText: {
        color: "#dd5746",
        fontSize: 16,
        fontWeight: "600",
    },
    headerTitle: {
        textAlign: "center",
        color: "#333",
    },
    imageSection: {
        alignItems: "center",
        marginBottom: 32,
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
    imageHint: {
        marginTop: 8,
        fontSize: 12,
        color: "#999",
        textAlign: "center",
    },
    userName: {
        marginTop: 12,
        textAlign: "center",
        color: "#333",
        fontSize: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
        color: "#333",
    },
    infoRow: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 16,
        color: "#333",
        fontWeight: "400",
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
        marginTop: 16,
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButton: {
        backgroundColor: "#dd5746",
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButton: {
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    secondaryButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 24,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
});
