import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function TicketDetailScreen() {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!bookingId) return;
      try {
        const docRef = doc(db, "bookings", bookingId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBooking(docSnap.data());
        }
      } catch (error) {
        console.error("Lỗi tải vé:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [bookingId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1BA0E2" />
      </View>
    );
  if (!booking)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy vé.</Text>
      </View>
    );

  const isHotel = booking.serviceType === "hotel";
  const details = booking.serviceDetails;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background màu xanh */}
      <View style={styles.headerBg}>
        <SafeAreaView>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vé điện tử</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* --- THẺ VÉ --- */}
        <View style={styles.ticketCard}>
          {/* Header Vé */}
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.brandText}>TRAVELGO TICKET</Text>
              <Text style={styles.statusText}>Đã thanh toán thành công</Text>
            </View>
            <Ionicons name={isHotel ? "bed" : "airplane"} size={32} color="#1BA0E2" />
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            {/* Value của QR Code chính là Mã Booking ID */}
            <QRCode value={booking.bookingId} size={160} />
            <Text style={styles.ticketCode}>{booking.bookingId}</Text>
            <Text style={styles.qrNote}>Vui lòng đưa mã này cho nhân viên để làm thủ tục</Text>
          </View>

          {/* Đường kẻ đứt nét cắt ngang vé */}
          <View style={styles.dashedLineContainer}>
            <View style={styles.circleLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.circleRight} />
          </View>

          {/* Thông tin chi tiết */}
          <View style={styles.infoSection}>
            <Text style={styles.serviceName}>{isHotel ? details.hotelName : details.flightCode}</Text>
            <Text style={styles.subInfo}>{isHotel ? details.address : "Chuyến bay nội địa"}</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Ngày {isHotel ? "nhận phòng" : "đi"}</Text>
                <Text style={styles.value}>{details.checkIn || details.departureTime}</Text>
              </View>
              <View style={styles.colRight}>
                <Text style={[styles.label, { textAlign: "right" }]}>Ngày {isHotel ? "trả phòng" : "đến"}</Text>
                <Text style={[styles.value, { textAlign: "right" }]}>{details.checkOut || details.arrivalTime}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>{isHotel ? "Loại phòng" : "Hạng ghế"}</Text>
                <Text style={styles.value}>{isHotel ? details.roomName : "Phổ thông"}</Text>
              </View>
              <View style={styles.colRight}>
                <Text style={[styles.label, { textAlign: "right" }]}>{isHotel ? "Thời gian" : "Thời lượng"}</Text>
                <Text style={[styles.value, { textAlign: "right" }]}>{isHotel ? `${details.nights} đêm` : "2h 30m"}</Text>
              </View>
            </View>
          </View>

          {/* Thông tin khách hàng (Footer xám) */}
          <View style={styles.greySection}>
            <Text style={styles.sectionTitle}>Khách hàng</Text>
            <Text style={styles.customerName}>{booking.customerInfo.fullName}</Text>
            <Text style={styles.customerContact}>
              {booking.customerInfo.email} • {booking.customerInfo.phone}
            </Text>
          </View>
        </View>

        {/* Nút Xuất Hóa Đơn */}
        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() =>
            router.push({
              pathname: "./bookings/invoice-detail",
              params: { bookingId: booking.bookingId },
            })
          }
        >
          <Ionicons name="receipt-outline" size={20} color="#1BA0E2" />
          <Text style={styles.invoiceBtnText}>Xem chi tiết & Xuất hóa đơn</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBg: { backgroundColor: "#1BA0E2", height: 160, position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 20 },
  headerNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  ticketCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 100,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  ticketHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  brandText: { fontSize: 16, fontWeight: "bold", color: "#1BA0E2" },
  statusText: { color: "#4CAF50", fontSize: 12, marginTop: 2 },

  qrSection: { alignItems: "center", paddingVertical: 30 },
  ticketCode: { marginTop: 15, fontWeight: "bold", fontSize: 18, letterSpacing: 2, color: "#333" },
  qrNote: { marginTop: 5, color: "#888", fontSize: 12, textAlign: "center", paddingHorizontal: 40 },

  dashedLineContainer: { height: 30, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dashedLine: { width: "84%", height: 1, borderWidth: 1, borderColor: "#DDD", borderStyle: "dashed", borderRadius: 1 },
  circleLeft: { position: "absolute", left: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: "#F5F5F5" },
  circleRight: { position: "absolute", right: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: "#F5F5F5" },

  infoSection: { padding: 20 },
  serviceName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subInfo: { color: "#666", marginBottom: 20, fontSize: 13 },
  row: { flexDirection: "row", marginBottom: 15 },
  col: { flex: 1 },
  colRight: { flex: 1, alignItems: "flex-end" },
  label: { fontSize: 12, color: "#888", marginBottom: 4 },
  value: { fontSize: 15, fontWeight: "600", color: "#333" },

  greySection: { backgroundColor: "#FAFAFA", padding: 20, borderTopWidth: 1, borderTopColor: "#EEE" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#888", marginBottom: 5, textTransform: "uppercase" },
  customerName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  customerContact: { color: "#666", fontSize: 13, marginTop: 2 },

  invoiceBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", margin: 20, padding: 15, backgroundColor: "#FFF", borderRadius: 10, borderWidth: 1, borderColor: "#1BA0E2" },
  invoiceBtnText: { color: "#1BA0E2", fontWeight: "bold", marginLeft: 10 },
});
