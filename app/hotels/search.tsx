import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HotelSearchScreen() {
  const router = useRouter();
  const [city, setCity] = useState("Da Nang");
  const [guestCount, setGuestCount] = useState("2");

  // Giả lập ngày (Trong thực tế nên dùng thư viện DatePicker)
  const [checkIn, setCheckIn] = useState("2024-06-01");
  const [checkOut, setCheckOut] = useState("2024-06-03");

  const handleSearch = () => {
    // Chuyển sang trang kết quả kèm tham số
    router.push({
      pathname: "/hotels/results",
      params: { city, checkInDate: checkIn, checkOutDate: checkOut, guestCount },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm khách sạn</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Input Thành phố */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Điểm đến</Text>
          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={20} color="#1BA0E2" />
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Bạn muốn đi đâu?" />
          </View>
        </View>

        {/* Input Ngày */}
        <View style={{ flexDirection: "row", gap: 15 }}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Nhận phòng</Text>
            <View style={styles.inputBox}>
              <Ionicons name="calendar-outline" size={20} color="#1BA0E2" />
              <TextInput style={styles.input} value={checkIn} onChangeText={setCheckIn} />
            </View>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Trả phòng</Text>
            <View style={styles.inputBox}>
              <Ionicons name="calendar-outline" size={20} color="#1BA0E2" />
              <TextInput style={styles.input} value={checkOut} onChangeText={setCheckOut} />
            </View>
          </View>
        </View>

        {/* Input Số khách */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Số khách</Text>
          <View style={styles.inputBox}>
            <Ionicons name="people-outline" size={20} color="#1BA0E2" />
            <TextInput style={styles.input} value={guestCount} onChangeText={setGuestCount} keyboardType="numeric" />
          </View>
        </View>

        {/* Nút Tìm kiếm */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Tìm kiếm khách sạn</Text>
        </TouchableOpacity>

        {/* Gợi ý */}
        <Text style={styles.subTitle}>Điểm đến phổ biến</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {["Đà Nẵng", "Hà Nội", "TP.HCM", "Đà Lạt"].map((item) => (
            <TouchableOpacity key={item} style={styles.chip} onPress={() => setCity(item)}>
              <Text style={{ color: "#1BA0E2" }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15 },

  fieldGroup: { marginBottom: 20 },
  label: { fontWeight: "600", marginBottom: 8, color: "#555" },
  inputBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderRadius: 12, paddingHorizontal: 10, height: 50, backgroundColor: "#FAFAFA" },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },

  searchBtn: { backgroundColor: "#1BA0E2", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10, shadowColor: "#1BA0E2", shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  subTitle: { marginTop: 30, fontSize: 16, fontWeight: "bold" },
  chip: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: "#E3F2FD", borderRadius: 20, marginRight: 10 },
});
