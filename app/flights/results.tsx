import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, FlatList, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFlights, Flight } from '@/hooks/useFlights';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import FlightCard (Assuming it exists and exports default)
import FlightCard from '@/components/FlightCard';

// --- Constants ---
const Colors = {
    primary: '#0194F3', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5E1F',
    success: '#28a745',
};

// --- Helper: Get City Name ---
const getCityName = (code: string) => {
    const lookup: { [key: string]: string } = {
        'HAN': 'Hà Nội', 'SGN': 'TP. HCM', 'DAD': 'Đà Nẵng', 'CXR': 'Nha Trang', 'PQC': 'Phú Quốc'
    };
    return lookup[code] || code;
};

// --- Screen: Flight Results ---
const FlightResultsScreen = () => {
    const insets = useSafeAreaInsets();
    // 1. Receive params
    const params = useLocalSearchParams<{
        from: string; to: string; departDate: string; isRoundTrip: string; returnDate?: string;
        fromName?: string; toName?: string;
    }>();

    const { flights, loading, error, searchFlights } = useFlights();

    // 2. State for Round Trip
    const [isSearchingReturn, setIsSearchingReturn] = useState(false);
    const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);

    const isRoundTripBool = params.isRoundTrip === 'true';

    // 3. Determine Search Criteria based on "Phase" (Outbound vs Return)
    const departureCode = isSearchingReturn ? params.to : params.from;
    const arrivalCode = isSearchingReturn ? params.from : params.to;

    const searchDateStr = isSearchingReturn ? params.returnDate : params.departDate;
    const searchDate = searchDateStr ? new Date(searchDateStr) : null;

    const currentRouteText = `${getCityName(departureCode as string)} → ${getCityName(arrivalCode as string)}`;
    const currentSearchDateString = searchDate ? format(searchDate, 'dd/MM/yyyy', { locale: vi }) : 'N/A';

    // 4. Fetch Data Logic
    const fetchData = useCallback(async () => {
        if (!searchDate || isNaN(searchDate.getTime())) return;

        console.log(`Searching flights: ${departureCode} -> ${arrivalCode} on ${searchDate}`);

        await searchFlights({
            from: departureCode as string,
            to: arrivalCode as string,
            date: searchDate,
        }, false); // Pass false because we already swapped cities manually above (departureCode/arrivalCode)
    }, [departureCode, arrivalCode, searchDate, searchFlights, isSearchingReturn]);

    // Initial Fetch & Refetch on Phase Change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 5. Handle Flight Selection
    const handleBookPress = (flight: Flight) => {
        if (isRoundTripBool && !isSearchingReturn) {
            // Case 1: Round Trip - Selected Outbound
            if (!params.returnDate) {
                Alert.alert("Lỗi", "Vui lòng chọn ngày về cho chuyến bay khứ hồi.");
                return;
            }

            Alert.alert(
                "Đã chọn chuyến đi",
                `Bạn đã chọn chuyến ${flight.flightNumber}. Bây giờ hãy chọn chuyến về.`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setSelectedOutboundFlight(flight);
                            setIsSearchingReturn(true); // Switches "Phase" -> triggers re-render -> new search
                        }
                    }
                ]
            );

        } else {
            // Case 2: One Way OR Round Trip (Selected Return)
            const bookingDetails = {
                outboundFlight: isSearchingReturn ? selectedOutboundFlight : flight,
                returnFlight: isSearchingReturn ? flight : null
            };

            // Navigate to Detail Screen
            router.push({
                pathname: '/flights/detail',
                params: {
                    booking: JSON.stringify(bookingDetails)
                },
            });
        }
    };

    // --- Render Helpers ---

    // Custom Header
    const renderHeader = () => (
        <View style={{ paddingTop: insets.top, backgroundColor: Colors.primary, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.headerContent}>
                <View style={styles.row}>
                    <Ionicons name="arrow-back" size={24} color="white" onPress={() => router.back()} style={{ marginRight: 15 }} />
                    <View>
                        <Text style={styles.headerTitle}>{isSearchingReturn ? "Chọn Chiều Về" : "Chọn Chiều Đi"}</Text>
                        <View style={styles.routeContainer}>
                            <Ionicons name={isSearchingReturn ? "airplane-outline" : "airplane"} size={16} color="white" style={{ transform: [{ scaleX: isSearchingReturn ? -1 : 1 }], marginRight: 6 }} />
                            <Text style={styles.headerSubtitle}>
                                {currentRouteText} • {currentSearchDateString}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );


    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                {renderHeader()}
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
                        {isSearchingReturn ? "Đang tìm chuyến về..." : "Đang tìm chuyến đi..."}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            {/* Selected Outbound Summary (Only when picking return) */}
            {isSearchingReturn && selectedOutboundFlight && (
                <View style={styles.summaryBar}>
                    <View style={styles.summaryRow}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                        <Text style={styles.summaryLabel}>Chiều đi đã chọn:</Text>
                    </View>
                    <Text style={styles.summaryText}>
                        {selectedOutboundFlight.flightNumber} ({format(new Date(selectedOutboundFlight.departAt), 'HH:mm')})
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Không tìm thấy chuyến bay nào.</Text>
                    <Text style={styles.errorSubText}>Vui lòng thử lại với ngày khác.</Text>
                </View>
            )}

            <FlatList
                data={flights}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FlightCard flight={item} onBookPress={handleBookPress} />}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
                ListEmptyComponent={() => (
                    !loading && !error ? (
                        <View style={styles.centered}>
                            <Ionicons name="airplane-outline" size={50} color="#CCC" />
                            <Text style={styles.emptyText}>Không có chuyến bay nào.</Text>
                        </View>
                    ) : null
                )}
            />
        </View>
    );
};

export default FlightResultsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, padding: 20 },

    // Custom Header Styles
    headerContent: { paddingHorizontal: 20 },
    row: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    routeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },


    summaryBar: { padding: 12, backgroundColor: '#E8F5E9', borderBottomWidth: 1, borderBottomColor: '#C8E6C9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryLabel: { marginLeft: 6, color: '#2E7D32', fontWeight: '600' },
    summaryText: { color: '#2E7D32', fontWeight: 'bold' },

    errorText: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
    errorSubText: { color: Colors.textSecondary, marginTop: 5, fontSize: 14 },
    emptyText: { color: Colors.textSecondary, marginTop: 10, fontSize: 16 },
});
