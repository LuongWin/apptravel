import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { auth } from "../services/firebaseConfig"; // Đảm bảo đường dẫn đúng tới file config của bạn

// Theme màu xanh chủ đạo (giống Traveloka)
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

  // 1. Lắng nghe sự thay đổi trạng thái đăng nhập từ Firebase
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return subscriber; // Hủy lắng nghe khi unmount
  }, []);

  // 2. Auth Guard: Điều hướng tự động dựa trên trạng thái user
  useEffect(() => {
    if (initializing) return;

    // Kiểm tra xem user đang ở trong nhóm (auth) hay không
    const inAuthGroup = segments[0] === "auth";

    if (user && inAuthGroup) {
      // Đã đăng nhập nhưng đang ở trang Login/Register -> Chuyển vào trang chủ
      router.replace("/tabs");
    } else if (!user && !inAuthGroup) {
      // Chưa đăng nhập nhưng đang cố vào trang chủ/nội bộ -> Đá về Login
      router.replace("/auth/login");
    }
  }, [user, initializing, segments]);

  // Hiển thị vòng xoay loading khi đang kiểm tra Firebase
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1BA0E2" />
      </View>
    );
  }

  // 3. Cấu trúc Stack tổng của ứng dụng
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Định nghĩa các nhóm màn hình chính */}
        <Stack.Screen name="tabs" />
        <Stack.Screen name="auth" />
        {/* Các màn hình lẻ khác nếu có */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
