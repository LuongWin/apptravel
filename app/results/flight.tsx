import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFlights, Flight } from '@/hooks/useFlights';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Import FlightCard
import FlightCard from '@/components/FlightCard';

// --- Constants (Dùng lại Colors) ---
const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', price: '#4F46E5',
};

// --- Helper: Get City Name (Chỉ là ví dụ, bạn nên đặt trong file Utils) ---
const getCityName = (code: string) => {
    const lookup: { [key: string]: string } = {
        'HAN': 'Hà Nội', 'SGN': 'TP. HCM', 'DAD': 'Đà Nẵng'
    };
    return lookup[code] || code;
};


// --- Screen: Flight Results ---
const FlightResultsScreen = () => {
    // Nhận tham số từ router.push của index.tsx
    const params = useLocalSearchParams<{
        from: string; to: string; departDate: string; isRoundTrip: string; returnDate?: string;
        fromName?: string; toName?: string;
    }>();

    const { flights, loading, error, searchFlights } = useFlights();

    // Setup States for Round Trip Logic
    const [isSearchingReturn, setIsSearchingReturn] = useState(false);
    const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);

    const isRoundTripBool = params.isRoundTrip === 'true';

    // Xác định thành phố đi/đến và ngày tìm kiếm hiện tại
    const departureCode = isSearchingReturn ? params.to : params.from;
    const arrivalCode = isSearchingReturn ? params.from : params.to;

    const searchDate = isSearchingReturn
        ? (params.returnDate ? new Date(params.returnDate) : null)
        : (params.departDate ? new Date(params.departDate) : null);

    const currentRouteText = `${getCityName(departureCode as string)} → ${getCityName(arrivalCode as string)}`;
    const currentSearchDateString = searchDate ? format(searchDate, 'dd/MM/yyyy', { locale: vi }) : 'N/A';

    // --- Fetch Data Logic ---
    const fetchData = useCallback(async () => {
        if (!searchDate || isNaN(searchDate.getTime())) return;

        // Dữ liệu truy vấn Firebase (Đảm bảo đảo ngược nếu đang tìm chuyến về)
        const searchParams = {
            from: departureCode as string,
            to: arrivalCode as string,
            date: searchDate,
        };

        await searchFlights(searchParams, isSearchingReturn);
        // Hook useFlights sẽ tự động xử lý loading/error/flights state
    }, [departureCode, arrivalCode, searchDate, searchFlights, isSearchingReturn]);

    // Kích hoạt Tải Dữ liệu khi màn hình được tải hoặc chế độ tìm kiếm thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Handle Book Action (Logic Khứ hồi) ---
    const handleBookPress = (flight: Flight) => {
        if (isRoundTripBool && !isSearchingReturn) {
            // Giai đoạn 1: Chọn chuyến đi xong, chuyển sang tìm chuyến về
            if (!params.returnDate) {
                Alert.alert("Lỗi", "Thiếu ngày về.");
                return;
            }
            setSelectedOutboundFlight(flight);
            setIsSearchingReturn(true); // Kích hoạt useEffect chạy lại để tìm chuyến về
            router.setParams({ // Tùy chọn: Đổi title/route trong URL nếu cần
                searchMode: 'return'
            });

        } else {
            // Giai đoạn 2 (Đã chọn cả đi và về) HOẶC Chuyến một chiều
            const bookingDetails = {
                outboundFlight: isSearchingReturn ? selectedOutboundFlight : flight,
                returnFlight: isSearchingReturn ? flight : null
            };

            // Chuyển hướng đến màn hình chi tiết (detail.tsx)
            router.push({
                pathname: '/flights/detail',
                params: {
                    booking: JSON.stringify(bookingDetails) // Truyền object booking 
                },
            });
        }
    };


    // --- Render Loading State ---
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
                    {isSearchingReturn ? "Đang tìm chuyến về..." : "Đang tìm chuyến đi..."}
                </Text>
            </View>
        );
    }

    // --- Render Results UI ---
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: isSearchingReturn ? "Chọn Chiều Về" : "Danh sách chuyến bay",
                    headerBackTitle: '', // Ẩn text quay lại
                    headerTintColor: Colors.text,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.background }
                }}
            />

            {/* Info Sub-header */}
            <View style={styles.subHeader}>
                <Text style={styles.subHeaderText}>
                    {isSearchingReturn ? "Chiều về: " : "Chiều đi: "}
                    {currentRouteText}
                </Text>
                <Text style={styles.dateText}>{currentSearchDateString}</Text>
            </View>

            {/* Thanh Tóm tắt Chuyến đi đã chọn (Chỉ hiện khi tìm chuyến về) */}
            {isSearchingReturn && selectedOutboundFlight && (
                <View style={styles.summaryBar}>
                    <Text style={styles.summaryText}>
                        Chiều đi: {selectedOutboundFlight.flightNumber} ({selectedOutboundFlight.from} → {selectedOutboundFlight.to})
                    </Text>
                </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <FlatList
                data={flights}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FlightCard flight={item} onBookPress={handleBookPress} />}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Ionicons name="airplane-outline" size={50} color="#CCC" />
                        <Text style={styles.emptyText}>Không tìm thấy chuyến bay nào.</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default FlightResultsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    subHeader: { paddingHorizontal: 20, paddingBottom: 10, backgroundColor: Colors.background },
    subHeaderText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    dateText: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
    emptyText: { color: Colors.textSecondary, marginTop: 10, fontSize: 16 },
    summaryBar: { padding: 15, backgroundColor: '#E8EAF6', borderTopWidth: 1, borderTopColor: '#C5CAE9' },
    summaryText: { color: '#304FFE', fontWeight: '600', textAlign: 'center' },
});
