import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import { View, ActivityIndicator } from "react-native";

// Màu xanh TravelGo
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#1BA0E2",
        secondary: "#FF5E1F",
    },
};

export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const segments = useSegments();

    function onAuthStateChangedHandler(user: User | null) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
        return subscriber; // unsubscribe on unmount
    }, []);

    useEffect(() => {
        if (initializing) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!user && !inAuthGroup) {
            // Nếu chưa đăng nhập và không ở trang login/register -> đá về login
            router.replace("/(auth)/login");
        } else if (user && inAuthGroup) {
            // Nếu đã đăng nhập mà lại vào login -> đá về tabs
            router.replace("/(tabs)");
        }
    }, [user, initializing, segments]);

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#1BA0E2" />
            </View>
        );
    }

    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
            </Stack>
            <StatusBar style="auto" />
        </PaperProvider>
    );
}
