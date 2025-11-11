import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function Users() {
    // Datos de ejemplo; en una app real vendrían de props/estado/Api
    const user = {
        name: "David Martinez",
        email: "david.martinez@example.com",
        // contraseña de ejemplo; en producción nunca guardar contraseñas en texto plano
        password: "***********",
        avatar: require("../assets/images/david.jpg"),
    };
    // estados para inputs editables
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(user.password);

    // Soporta avatar como URI (string) o como asset local (require)
    const avatarSource = typeof user.avatar === "string" ? { uri: user.avatar } : user.avatar;

    return (
        <ThemedView style={styles.container}>
            {/* Header con botón de volver (fijo arriba) */}
            <View style={styles.header}>
                <TouchableOpacity accessibilityLabel="Volver" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
                    <ThemedText style={styles.backText}>{"<"} Atrás</ThemedText>
                </TouchableOpacity>
            </View>
            <View style={styles.card}>
                <Image source={avatarSource} style={styles.avatar} />

                {/* Campos editables con etiquetas */}
                <ThemedText style={styles.label}>Nombre</ThemedText>
                <TextInput value={name} onChangeText={setName} placeholder="Nombre" style={[styles.input, styles.name]} />

                <ThemedText style={styles.label}>Correo</ThemedText>
                <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" style={[styles.input, styles.email]} />

                <ThemedText style={styles.label}>Contraseña</ThemedText>
                <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={[styles.input, styles.passwordInput]} />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        /* TODO: guardar cambios */
                    }}
                >
                    <ThemedText style={styles.buttonText}>Guardar cambios</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#dd5746",
        paddingTop: 36,
        paddingHorizontal: 12,
        height: 96,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 10,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    backText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    input: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#ffffff",
        color: "#000000",
        paddingVertical: 8,
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e6e6e6",
    },
    passwordInput: {
        // Mantener misma altura que input para uniformidad
        height: 48,
        marginBottom: 12,
        textAlignVertical: "center",
    },
    label: {
        alignSelf: "flex-start",
        marginBottom: 6,
        color: "#333",
        fontWeight: "600",
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "flex-start",
        // paddingTop increased so content sits below the fixed header
        paddingTop: 140,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        alignItems: "center",
        padding: 20,
        borderRadius: 12,
        elevation: 2,
    },
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    name: {
        marginBottom: 4,
        textAlign: "center",
    },
    email: {
        marginBottom: 12,
        textAlign: "center",
    },
    bio: {
        marginBottom: 12,
        textAlign: "center",
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: "#dd5746",
        marginTop: 20,
    },
    buttonText: {
        color: "#fffdfdff",
        fontWeight: "600",
    },
});
