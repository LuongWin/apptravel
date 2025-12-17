import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HotelDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse dữ liệu từ params (Vì ta truyền JSON string ở bước trước)
  const hotel = typeof params.hotel === "string" ? JSON.parse(params.hotel) : null;
  const totalNights = 2; // Giả sử tính được từ checkIn/checkOut

  if (!hotel)
    return (
      <View>
        <Text>Lỗi tải dữ liệu</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        {/* Ảnh Cover */}
        <Image source={{ uri: hotel.image }} style={styles.coverImage} />

        {/* Nút Back nằm đè lên ảnh */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.row}>
            <Ionicons name="location" size={16} color="#1BA0E2" />
            <Text style={styles.address}>{hotel.address}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Tiện nghi</Text>
          <View style={styles.amenities}>
            {hotel.amenities?.map((am: string) => (
              <View key={am} style={styles.chip}>
                <Text style={{ color: "#555" }}>{am}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Chọn phòng</Text>

          {/* Thẻ phòng 1 */}
          <View style={styles.roomCard}>
            <Text style={styles.roomName}>Deluxe King (Nhìn ra biển)</Text>
            <Text style={{ color: "#666", fontSize: 12 }}>2 người lớn • 1 giường đôi</Text>
            <View style={styles.roomFooter}>
              <View>
                <Text style={styles.price}>{hotel.price.toLocaleString()} ₫</Text>
                <Text style={{ fontSize: 10, color: "#888" }}>/ đêm</Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  router.push({
                    pathname: "./hotels/booking-confirm",
                    params: {
                      hotelId: hotel.id,
                      hotelName: hotel.name,
                      roomName: "Deluxe King",
                      pricePerNight: hotel.price.toString(),
                      totalPrice: (hotel.price * totalNights).toString(),
                      totalNights: totalNights.toString(),
                      checkIn: params.checkInDate,
                      checkOut: params.checkOutDate,
                    },
                  })
                }
              >
                <Text style={styles.bookBtnText}>Chọn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Thẻ phòng 2 */}
          <View style={styles.roomCard}>
            <Text style={styles.roomName}>Standard Room</Text>
            <Text style={{ color: "#666", fontSize: 12 }}>2 người lớn • 2 giường đơn</Text>
            <View style={styles.roomFooter}>
              <View>
                <Text style={styles.price}>{(hotel.price * 0.8).toLocaleString()} ₫</Text>
                <Text style={{ fontSize: 10, color: "#888" }}>/ đêm</Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  router.push({
                    pathname: "./hotels/booking-confirm",
                    params: {
                      hotelId: hotel.id,
                      hotelName: hotel.name,
                      roomName: "Standard Room",
                      pricePerNight: (hotel.price * 0.8).toString(),
                      totalPrice: (hotel.price * 0.8 * totalNights).toString(),
                      totalNights: totalNights.toString(),
                      checkIn: params.checkInDate,
                      checkOut: params.checkOutDate,
                    },
                  })
                }
              >
                <Text style={styles.bookBtnText}>Chọn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  coverImage: { width: width, height: 250 },
  backBtn: { position: "absolute", top: 50, left: 20, backgroundColor: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 20 },

  content: { padding: 20, marginTop: -20, backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  row: { flexDirection: "row", marginTop: 8, alignItems: "center" },
  address: { color: "#666", marginLeft: 5 },

  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  amenities: { flexDirection: "row", gap: 10 },
  chip: { backgroundColor: "#F5F5F5", padding: 8, borderRadius: 8 },

  roomCard: { borderWidth: 1, borderColor: "#EEE", borderRadius: 12, padding: 15, marginBottom: 15 },
  roomName: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  roomFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  price: { fontSize: 18, fontWeight: "bold", color: "#FF5722" },
  bookBtn: { backgroundColor: "#1BA0E2", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookBtnText: { color: "#FFF", fontWeight: "bold" },
});
