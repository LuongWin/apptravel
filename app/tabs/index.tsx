// app/(tabs)/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  // Component nút dịch vụ tròn tròn
  const ServiceItem = ({ title, icon, color, path }: any) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => router.push(path)} // <--- Quan trọng: chuyển trang ở đây
    >
      <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.username}>Traveler!</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Banner quảng cáo (giả) */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Khám phá thế giới cùng TravelGo</Text>
        </View>

        <Text style={styles.sectionTitle}>Dịch vụ</Text>

        {/* Hàng nút bấm chức năng */}
        <View style={styles.serviceGrid}>
          {/* 👇 Nút Vé máy bay */}
          <ServiceItem
            title="Vé máy bay"
            icon="airplane"
            color="#1BA0E2"
            path="/flights/search" // Trỏ đến file vừa tạo ở Bước 1
          />

          {/* Nút Khách sạn */}
          <ServiceItem
            title="Khách sạn"
            icon="business"
            color="#FF5E1F"
            path="/hotels/search" // Bạn cần tạo file này sau
          />

          {/* Nút khác */}
          <ServiceItem title="Tour" icon="map" color="#00C853" path="/(tabs)" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 20 },
  greeting: { fontSize: 14, color: "#666" },
  username: { fontSize: 20, fontWeight: "bold", color: "#333" },
  banner: { height: 150, backgroundColor: "#1BA0E2", borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#333" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  serviceItem: { width: "23%", alignItems: "center", marginBottom: 16 },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  serviceText: { fontSize: 12, color: "#333", textAlign: "center" },
});
