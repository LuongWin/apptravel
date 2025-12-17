import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Dữ liệu giả lập (Sau này thay bằng gọi API Firebase)
const MOCK_HOTELS = [
  {
    id: "1",
    name: "Muong Thanh Luxury",
    address: "270 Vo Nguyen Giap, Da Nang",
    price: 1500000,
    rating: 4.5,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/182352872.jpg?k=b4e95146c863372c366479133a82467978809169722340326887201648356942&o=&hp=1",
    amenities: ["wifi", "pool", "ac"],
  },
  {
    id: "2",
    name: "Novotel Han River",
    address: "36 Bach Dang, Da Nang",
    price: 2200000,
    rating: 4.8,
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/49843606.jpg?k=3247071987515b6992d9518e388102a98f731174665a3978971f11e9f2913506&o=&hp=1",
    amenities: ["wifi", "gym", "breakfast"],
  },
];

export default function HotelResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.cityTitle}>{params.city || "Điểm đến"}</Text>
          <Text style={styles.dateSub}>
            {params.checkInDate} - {params.checkOutDate}
          </Text>
        </View>
      </View>

      <FlatList
        data={MOCK_HOTELS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "./hotels/[id]",
                params: {
                  hotel: JSON.stringify(item),
                  ...params, // Truyền tiếp ngày tháng, số người
                },
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.hotelName}>{item.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingText}>{item.rating} (Tuyệt vời)</Text>
              </View>
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Chỉ từ</Text>
                <Text style={styles.priceVal}>{item.price.toLocaleString()} ₫</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  cityTitle: { fontSize: 16, fontWeight: "bold" },
  dateSub: { fontSize: 12, color: "#666" },

  card: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 15, overflow: "hidden", elevation: 3 },
  cardImage: { width: "100%", height: 180 },
  cardContent: { padding: 15 },
  hotelName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { fontSize: 12, color: "#666", marginLeft: 5 },
  address: { color: "#888", fontSize: 13, marginTop: 5 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15 },
  priceLabel: { fontSize: 12, color: "#666" },
  priceVal: { fontSize: 18, fontWeight: "bold", color: "#FF5722" },
});
