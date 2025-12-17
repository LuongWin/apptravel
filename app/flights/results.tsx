import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Mock Data chuyến bay
const MOCK_FLIGHTS = [
  { id: "VN123", airline: "Vietnam Airlines", code: "VN-123", departTime: "08:00", arriveTime: "10:10", duration: "2h 10m", price: 1500000, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Vietnam_Airlines_Logo.svg/1200px-Vietnam_Airlines_Logo.svg.png" },
  { id: "VJ456", airline: "Vietjet Air", code: "VJ-456", departTime: "14:30", arriveTime: "16:40", duration: "2h 10m", price: 950000, logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/VietJet_Air_logo.svg/1200px-VietJet_Air_logo.svg.png" },
  { id: "QH789", airline: "Bamboo Airways", code: "QH-789", departTime: "19:00", arriveTime: "21:10", duration: "2h 10m", price: 1200000, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bamboo_Airways_logo.svg/2560px-Bamboo_Airways_logo.svg.png" },
];

export default function FlightResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.routeTitle}>
            {params.origin} ➝ {params.destination}
          </Text>
          <Text style={styles.dateSub}>
            {params.date} • {params.passengers} khách
          </Text>
        </View>
      </View>

      <FlatList
        data={MOCK_FLIGHTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "./flights/booking-confirm",
                params: {
                  flightData: JSON.stringify(item),
                  ...params, // Truyền tiếp thông tin ngày/khách
                },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
                <Text style={styles.airlineName}>{item.airline}</Text>
              </View>
              <Text style={styles.price}>{item.price.toLocaleString()} ₫</Text>
            </View>

            <View style={styles.flightInfo}>
              <View>
                <Text style={styles.time}>{item.departTime}</Text>
                <Text style={styles.airportCode}>HAN</Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={styles.duration}>{item.duration}</Text>
                <View style={styles.line} />
                <Text style={styles.type}>Bay thẳng</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.time}>{item.arriveTime}</Text>
                <Text style={styles.airportCode}>SGN</Text>
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
  routeTitle: { fontSize: 16, fontWeight: "bold" },
  dateSub: { fontSize: 12, color: "#666" },

  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  logo: { width: 30, height: 30, marginRight: 10 },
  airlineName: { fontWeight: "bold", color: "#555" },
  price: { fontSize: 18, fontWeight: "bold", color: "#FF5722" },

  flightInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 20, fontWeight: "bold", color: "#333" },
  airportCode: { color: "#888", fontSize: 12 },
  duration: { fontSize: 12, color: "#666", marginBottom: 5 },
  line: { width: 60, height: 1, backgroundColor: "#DDD", marginBottom: 5 },
  type: { fontSize: 10, color: "#1BA0E2" },
});
