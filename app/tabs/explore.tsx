import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBookings = async () => {
    if (!auth.currentUser) return;
    try {
      // Query: Lấy booking của user hiện tại, sắp xếp mới nhất lên đầu
      const q = query(collection(db, "bookings"), where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"));

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(list);
    } catch (err) {
      console.log("Lỗi lấy lịch sử:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động load lại khi màn hình được focus (quay lại từ trang đặt vé)
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const renderItem = ({ item }: any) => {
    const isHotel = item.serviceType === "hotel";
    const dateStr = item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "dd/MM/yyyy") : "N/A";

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "./bookings/ticket-detail", params: { bookingId: item.id } })}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
            <Ionicons name={isHotel ? "bed" : "airplane"} size={14} color="#FFF" />
            <Text style={styles.tagText}>{isHotel ? "Khách sạn" : "Máy bay"}</Text>
          </View>
          <Text style={[styles.status, { color: item.status === "success" ? "#4CAF50" : "#F44336" }]}>{item.status === "success" ? "Đã thanh toán" : "Chờ xử lý"}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.serviceName}>{isHotel ? item.serviceDetails?.hotelName : item.serviceDetails?.flightCode}</Text>
          <Text style={styles.dateText}>Ngày đặt: {dateStr}</Text>
          <Text style={styles.priceText}>{item.totalPrice?.toLocaleString()} ₫</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailLink}>Xem vé điện tử &gt;</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vé của tôi</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1BA0E2" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={60} color="#DDD" />
              <Text style={{ color: "#888", marginTop: 10 }}>Bạn chưa có chuyến đi nào.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },

  card: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 12, padding: 15, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  tagContainer: { flexDirection: "row", backgroundColor: "#1BA0E2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignItems: "center", gap: 4 },
  tagText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  status: { fontSize: 12, fontWeight: "600" },

  cardBody: { marginBottom: 10 },
  serviceName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  dateText: { color: "#666", fontSize: 12 },
  priceText: { color: "#FF5722", fontWeight: "bold", fontSize: 16, marginTop: 4 },

  cardFooter: { borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 8 },
  detailLink: { color: "#1BA0E2", fontSize: 12, textAlign: "right", fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 60 },
});
