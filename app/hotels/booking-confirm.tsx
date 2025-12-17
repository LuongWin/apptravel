import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { auth, db } from "../../services/firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
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
      // Tạo mã đơn hàng ngẫu nhiên
      const bookingRef = `BKG-${Date.now().toString().slice(-6)}`;

      // Dữ liệu cần lưu
      const bookingData = {
        bookingId: bookingRef,
        userId: auth.currentUser?.uid,
        status: "success", // Mặc định thành công cho demo
        createdAt: Timestamp.now(),
        totalPrice: Number(params.totalPrice),
        customerInfo: { fullName, phone, email },
        serviceType: "hotel",
        // Snapshot dữ liệu phòng để in hóa đơn sau này
        serviceDetails: {
          hotelId: params.hotelId,
          hotelName: params.hotelName,
          roomName: params.roomName,
          pricePerNight: params.pricePerNight,
          nights: params.totalNights,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        },
      };

      // Lưu vào Firestore collection "bookings"
      await setDoc(doc(db, "bookings", bookingRef), bookingData);

      Alert.alert("Thành công", "Đặt phòng thành công! Kiểm tra vé trong mục Vé của tôi.", [{ text: "Xem vé ngay", onPress: () => router.push("/(tabs)/explore") }]);
    } catch (e: any) {
      Alert.alert("Lỗi", "Không thể đặt phòng: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận & Thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Tóm tắt đơn hàng */}
        <View style={styles.card}>
          <Text style={styles.hotelName}>{params.hotelName}</Text>
          <Text style={styles.roomName}>{params.roomName}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Nhận phòng:</Text>
            <Text style={styles.val}>{params.checkIn}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trả phòng:</Text>
            <Text style={styles.val}>{params.checkOut}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Thời gian:</Text>
            <Text style={styles.val}>{params.totalNights} đêm</Text>
          </View>
        </View>

        {/* Form thông tin */}
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <View style={styles.form}>
          <Text style={styles.labelInput}>Họ và tên</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />

          <Text style={styles.labelInput}>Số điện thoại</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0909xxxxxx" />

          <Text style={styles.labelInput}>Email (nhận vé điện tử)</Text>
          <TextInput style={[styles.input, { backgroundColor: "#EEE" }]} value={email} editable={false} />
        </View>
      </ScrollView>

      {/* Footer Thanh toán */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalPrice}>{Number(params.totalPrice).toLocaleString()} ₫</Text>
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

  card: { backgroundColor: "#FFF", padding: 15, borderRadius: 12, marginBottom: 20 },
  hotelName: { fontSize: 18, fontWeight: "bold", color: "#1BA0E2" },
  roomName: { color: "#666", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { color: "#666" },
  val: { fontWeight: "600" },

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
