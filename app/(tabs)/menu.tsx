// app/(tabs)/menu.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function MenuScreen() {
  // Component thẻ dịch vụ
  const ServiceCard = ({ iconName, title, desc }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: "#E0F2FE" }]}>
        <Ionicons name={iconName} size={28} color="#1BA0E2" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục dịch vụ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          <ServiceCard iconName="airplane" title="Vé máy bay" desc="Tìm kiếm và đặt vé máy bay giá tốt nhất." />
          <ServiceCard iconName="business" title="Khách sạn" desc="Khám phá các khách sạn, resort tiện nghi." />
          <ServiceCard iconName="earth" title="Tour du lịch" desc="Trải nghiệm những chuyến đi đáng nhớ." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F7" },
  header: { paddingVertical: 16, alignItems: "center", backgroundColor: "#F4F5F7" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginRight: 16 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#666", lineHeight: 18 },
});
