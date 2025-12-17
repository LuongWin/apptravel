import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1BA0E2" }}>TravelGo Home</Text>
      <Text style={{ marginTop: 10 }}>Chào mừng bạn đến với TravelGo!</Text>

      <TouchableOpacity onPress={() => router.push("/auth/login")} style={{ marginTop: 30, backgroundColor: "#1BA0E2", padding: 15, borderRadius: 8 }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Đăng nhập / Đăng ký</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
