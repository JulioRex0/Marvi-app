import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    uri?: string;
    name?: string;
    size?: number;
    // allow either ImageStyle or ViewStyle without strict typing here for flexibility
    style?: any;
};

function initialsFromName(name?: string) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromString(str?: string) {
    const colors = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6"];
    if (!str) return colors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
}

export default function Avatar({ uri, name, size = 48, style }: Props) {
    const initials = initialsFromName(name);
    const bg = colorFromString(name);

    if (uri) {
        return (
            <Image
                source={{ uri }}
                // cast style to any to satisfy Image typings in this small component
                style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style as any]}
                contentFit="cover"
            />
        );
    }

    return (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }, style]}>
            <Text style={[styles.initials, { fontSize: Math.round(size / 2.5) }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        overflow: "hidden",
        backgroundColor: "#DDD",
    },
    fallback: {
        alignItems: "center",
        justifyContent: "center",
    },
    initials: {
        color: "white",
        fontWeight: "600",
    },
});
