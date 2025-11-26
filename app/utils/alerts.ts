import { Alert, Platform } from "react-native";

export const alertConfirm = (title: string, message: string, _icon?: string): Promise<boolean> => {
    if (typeof window !== "undefined" && Platform.OS === "web") {
        return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }

    return new Promise((resolve) => {
        Alert.alert(
            title,
            message,
            [
                { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                { text: "Aceptar", onPress: () => resolve(true) },
            ],
            { cancelable: true }
        );
    });
};

export const alertLoading = (_title: string, _message?: string) => {
    // For now this is a no-op helper. The screen can show an ActivityIndicator.
    // Keep it to preserve original API.
    // Could be extended to display a global loading overlay.
    console.log("loading:", _title, _message);
};

export const alertMessage = (title: string, message?: string, _type?: string, _timeout?: number) => {
    if (typeof window !== "undefined" && Platform.OS === "web") {
        window.alert(`${title}${message ? "\n\n" + message : ""}`);
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        Alert.alert(title, message || "", [{ text: "OK", onPress: () => resolve() }], { cancelable: true });
    });
};

export const alertToast = (title: string, message?: string, _type?: string, _position?: string) => {
    // Minimal toast: use alertMessage as fallback
    return alertMessage(title, message);
};

export default { alertConfirm, alertLoading, alertMessage, alertToast };
