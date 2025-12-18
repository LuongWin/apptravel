import { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/services/firebaseConfig";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const [flights, setFlights] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Cheap Flights
        const flightsRef = collection(db, "FLIGHTS");
        // Giả sử có trường price hoặc createAt để sort, nếu không có thì bỏ orderBy
        const qFlights = query(flightsRef, limit(5)); // Lấy 5 bản ghi bất kỳ nếu chưa có logic sort
        const flightSnap = await getDocs(qFlights);
        const flightData = flightSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlights(flightData);

        // 2. Fetch Featured Tours
        const toursRef = collection(db, "TOURS");
        const qTours = query(toursRef, limit(5));
        const tourSnap = await getDocs(qTours);
        const tourData = tourSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTours(tourData);

        // 3. Fetch Featured Hotels
        const hotelsRef = collection(db, "HOTELS");
        const qHotels = query(hotelsRef, limit(5));
        const hotelSnap = await getDocs(qHotels);
        const hotelData = hotelSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHotels(hotelData);
      } catch (error) {
        console.log("Error fetching dashboard data:", error);
        // Alert.alert("Lỗi", "Không thể tải dữ liệu gợi ý.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount) return "0 ₫";
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const renderMenuItem = (icon: any, label: string, route: string, color: string) => (
    <Pressable
      style={styles.menuItem}
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "10" }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );

  const renderFlightItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Placeholder image nếu không có ảnh hãng bay hoặc điểm đến */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.from} - {item.to}
        </Text>
        <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
        <Text style={styles.airlineText}>{item.airline}</Text>
      </View>
    </View>
  );

  const renderTourItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location || "Việt Nam"}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Xin chào, {auth.currentUser?.email || "Bạn"}</Text>
          <Text style={styles.appName}>TravelGo!</Text>
        </View>
        <Pressable style={styles.avatarButton}>
          <Ionicons name="person-circle-outline" size={40} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Main Menu */}
        <View style={styles.menuGrid}>
          {renderMenuItem("airplane", "Vé máy bay", "/flights", "#1BA0E2")}
          {renderMenuItem("bed", "Khách sạn", "/hotels", "#FF5E1F")}
          {renderMenuItem("map", "Tours", "/tours", "#22C55E")}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1BA0E2" />
          </View>
        ) : (
          <>
            {/* Cheap Flights */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vé máy bay giá rẻ</Text>
              <Pressable onPress={() => router.push("/flights")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </Pressable>
            </View>
            <FlatList
              data={flights}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push({ pathname: "/flights/detail", params: { id: item.id } })}
                >
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.from} - {item.to}
                    </Text>
                    <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
                    <Text style={styles.airlineText}>{item.airline}</Text>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có chuyến bay nào.</Text>}
            />

            {/* Featured Hotels */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khách sạn ưu đãi</Text>
              <Pressable onPress={() => router.push("/hotels")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </Pressable>
            </View>
            <FlatList
              data={hotels}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push({ pathname: "/hotels/hotel-detail", params: { id: item.id } })}
                >
                  <Image
                    source={{ uri: item.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>
                      {item.rooms?.length
                        ? formatCurrency(Math.min(...item.rooms.map((r: any) => r.price)))
                        : "Đang cập nhật"}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có khách sạn nào.</Text>}
            />


            {/* Featured Tours */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tour nổi bật</Text>
              <Pressable onPress={() => router.push("/tours")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </Pressable>
            </View>
            <FlatList
              data={tours}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push({ pathname: "/tours/detail", params: { id: item.id } })}
                >
                  <Image
                    source={{ uri: item.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.locationText}>{item.location || "Việt Nam"}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tour nào.</Text>}
            />
          </>
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#1BA0E2",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
  },
  appName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarButton: {
    padding: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  menuGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  menuItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  seeAll: {
    color: "#1BA0E2",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  listContent: {
    paddingRight: 16,
    gap: 16,
    paddingBottom: 8, // for shadow
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: width * 0.45,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF5E1F",
  },
  airlineText: {
    fontSize: 12,
    color: "#6B7280",
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  locationText: {
    fontSize: 12,
    color: "#666"
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
    marginLeft: 10,
  }
});
