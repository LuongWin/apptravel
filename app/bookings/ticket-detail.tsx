import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InvoiceDetailScreen() {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Lấy dữ liệu hóa đơn từ Firestore
  useEffect(() => {
    const fetchDetail = async () => {
      if (!bookingId) return;
      const docSnap = await getDoc(doc(db, "bookings", bookingId as string));
      if (docSnap.exists()) {
        setBooking(docSnap.data());
      }
      setLoading(false);
    };
    fetchDetail();
  }, [bookingId]);

  // Hàm tạo PDF
  const handleExportPDF = async () => {
    if (!booking) return;

    // Template HTML cho hóa đơn
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #1BA0E2; padding-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #1BA0E2; }
            .invoice-title { font-size: 20px; font-weight: bold; text-align: right; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .total { font-size: 20px; font-weight: bold; color: #FF5722; text-align: right; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">TRAVELGO</div>
            <div class="invoice-title">HÓA ĐƠN ĐIỆN TỬ<br><span style="font-size:14px; font-weight:normal">#${booking.bookingId}</span></div>
          </div>

          <div class="section">
            <div class="section-title">THÔNG TIN KHÁCH HÀNG</div>
            <div class="row"><span>Họ tên:</span> <strong>${booking.customerInfo.fullName}</strong></div>
            <div class="row"><span>Email:</span> <span>${booking.customerInfo.email}</span></div>
            <div class="row"><span>SĐT:</span> <span>${booking.customerInfo.phone}</span></div>
          </div>

          <div class="section">
            <div class="section-title">CHI TIẾT DỊCH VỤ</div>
            <div class="row"><span>Dịch vụ:</span> <strong>${booking.serviceType === "hotel" ? "Đặt phòng khách sạn" : "Vé máy bay"}</strong></div>
            <div class="row"><span>Tên:</span> <span>${booking.serviceDetails.hotelName || booking.serviceDetails.flightCode}</span></div>
            <div class="row"><span>Chi tiết:</span> <span>${booking.serviceDetails.roomName || "Hạng phổ thông"}</span></div>
            <div class="row"><span>Thời gian:</span> <span>${booking.serviceDetails.checkIn} - ${booking.serviceDetails.checkOut}</span></div>
          </div>

          <div class="total">
            TỔNG THANH TOÁN: ${booking.totalPrice.toLocaleString()} VND
          </div>
          
          <div class="footer">Cảm ơn quý khách đã sử dụng dịch vụ của TravelGo!</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo file PDF");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#1BA0E2" />;
  if (!booking) return <Text>Không tìm thấy đơn hàng</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Preview Hóa Đơn trên màn hình */}
        <View style={styles.paper}>
          <View style={styles.paperHeader}>
            <Text style={styles.brand}>TRAVELGO</Text>
            <Text style={styles.code}>{booking.bookingId}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Khách hàng</Text>
            <Text style={styles.value}>{booking.customerInfo.fullName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>Dịch vụ</Text>
            <Text style={styles.valueName}>{booking.serviceDetails.hotelName}</Text>
            <Text style={styles.value}>{booking.serviceDetails.roomName}</Text>
            <Text style={styles.valueTime}>
              {booking.serviceDetails.checkIn} - {booking.serviceDetails.checkOut}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalPrice}>{booking.totalPrice.toLocaleString()} ₫</Text>
          </View>
        </View>

        {/* Nút Xuất PDF */}
        <TouchableOpacity style={styles.btnExport} onPress={handleExportPDF}>
          <Ionicons name="document-text" size={20} color="#FFF" />
          <Text style={styles.btnText}>Xuất hóa đơn PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#FFF" },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15 },

  paper: { backgroundColor: "#FFF", padding: 20, borderRadius: 12, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  paperHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottomWidth: 2, borderBottomColor: "#1BA0E2", paddingBottom: 10 },
  brand: { fontSize: 20, fontWeight: "bold", color: "#1BA0E2" },
  code: { color: "#666" },

  section: { marginVertical: 10 },
  label: { fontSize: 12, color: "#888", marginBottom: 4, textTransform: "uppercase" },
  value: { fontSize: 16, color: "#333" },
  valueName: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 2 },
  valueTime: { fontSize: 14, color: "#666", marginTop: 2 },

  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 10 },

  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalPrice: { fontSize: 22, fontWeight: "bold", color: "#FF5722" },

  btnExport: { flexDirection: "row", backgroundColor: "#FF5722", padding: 15, borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 30 },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginLeft: 10 },
});
