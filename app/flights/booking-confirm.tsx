import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { auth, db } from "../../services/firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FlightBookingConfirm() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Parse dữ liệu chuyến bay
  const flight = params.flightData ? JSON.parse(params.flightData as string) : null;

  const [fullName, setFullName] = useState(auth.currentUser?.displayName || "");
  const [phone, setPhone] = useState("");
  const [email] = useState(auth.currentUser?.email || "");

  const handleConfirmBooking = async () => {
    if (!fullName || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và số điện thoại.");
      return;
    }

    setLoading(true);
    try {
      const bookingRef = `FLT-${Date.now().toString().slice(-6)}`;

      const bookingData = {
        bookingId: bookingRef,
        userId: auth.currentUser?.uid,
        status: "success",
        createdAt: Timestamp.now(),
        totalPrice: flight.price,
        customerInfo: { fullName, phone, email },
        serviceType: "flight", // Đánh dấu là vé máy bay
        // Snapshot dữ liệu để hiển thị ở trang Vé của tôi
        serviceDetails: {
          flightId: flight.id,
          flightCode: flight.code,
          airline: flight.airline,
          origin: params.origin,
          destination: params.destination,
          departureTime: `${params.date} ${flight.departTime}`,
          arrivalTime: `${params.date} ${flight.arriveTime}`,
          duration: flight.duration,
          passengers: params.passengers,
        },
      };

      await setDoc(doc(db, "bookings", bookingRef), bookingData);

      Alert.alert("Thành công", "Đặt vé máy bay thành công!", [{ text: "Xem vé ngay", onPress: () => router.push("/(tabs)/explore") }]);
    } catch (e: any) {
      Alert.alert("Lỗi", "Không thể đặt vé: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!flight)
    return (
      <View>
        <Text>Lỗi dữ liệu chuyến bay</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt chỗ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Tóm tắt chuyến bay */}
        <View style={styles.card}>
          <Text style={styles.airline}>
            {flight.airline} ({flight.code})
          </Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.bigTime}>{flight.departTime}</Text>
              <Text style={styles.date}>{params.date}</Text>
            </View>
            <Ionicons name="airplane" size={20} color="#1BA0E2" />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.bigTime}>{flight.arriveTime}</Text>
              <Text style={styles.date}>{params.date}</Text>
            </View>
          </View>
          <Text style={{ textAlign: "center", color: "#888", marginVertical: 10 }}>
            {params.origin} ➝ {params.destination}
          </Text>
        </View>

        {/* Form thông tin */}
        <Text style={styles.sectionTitle}>Thông tin hành khách</Text>
        <View style={styles.form}>
          <Text style={styles.labelInput}>Họ và tên</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />

          <Text style={styles.labelInput}>Số điện thoại</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalPrice}>{flight.price.toLocaleString()} ₫</Text>
        </View>
        <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handleConfirmBooking} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Thanh toán</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#FFF" },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15 },

  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 12, marginBottom: 20 },
  airline: { fontWeight: "bold", color: "#1BA0E2", marginBottom: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bigTime: { fontSize: 24, fontWeight: "bold", color: "#333" },
  date: { color: "#666", fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },
  form: { backgroundColor: "#FFF", padding: 15, borderRadius: 12 },
  labelInput: { fontSize: 12, color: "#666", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },

  footer: { padding: 20, backgroundColor: "#FFF", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEE" },
  totalLabel: { fontSize: 12, color: "#666" },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: "#FF5722" },
  payBtn: { backgroundColor: "#FF5722", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  payBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
