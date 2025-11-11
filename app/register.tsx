import { router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return alert("Escribe tu nombre para registrarte");

        // Navegar a /Users pasando datos como params
        router.push({ pathname: "/Users", params: { name: trimmed, email: email.trim(), role: role.trim() } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Registro</Text>

                <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Email (opcional)" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
                <TextInput placeholder="Rol (opcional)" value={role} onChangeText={setRole} style={styles.input} />

                <TouchableOpacity style={styles.button} onPress={submit} accessibilityLabel="Registrarse">
                    <Text style={styles.buttonText}>Registrarme</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    card: { margin: 16, backgroundColor: "#fff", padding: 16, borderRadius: 8, marginTop: 48 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginTop: 8 },
    button: { backgroundColor: "#dd5746", padding: 14, borderRadius: 8, marginTop: 16, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "700" },
});
