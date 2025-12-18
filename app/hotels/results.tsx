import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHotels, Hotel } from '@/hooks/useHotels';
import { differenceInCalendarDays, format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = {
    primary: '#0194F3', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5E1F', success: '#28a745',
    star: '#FFC107', warning: '#FF9800'
};

const HOTEL_PLACEHOLDER = 'https://via.placeholder.com/400x300.png?text=No+Image';

const HotelResultsScreen = () => {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        city: string; checkInDate: string; checkOutDate: string; guestCount: string;
    }>();

    const { hotels, loading, searchHotels } = useHotels();

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);

    // Calculate Total Nights
    const totalNights = useMemo(() => {
        const diff = differenceInCalendarDays(checkOut, checkIn);
        return diff > 0 ? diff : 1;
    }, [checkIn, checkOut]);

    useEffect(() => {
        // Search trigger
        searchHotels(params.city || '');
    }, [params.city, searchHotels]);

    const handleHotelPress = (hotel: Hotel) => {
        router.push({
            pathname: '/hotels/hotel-detail',
            params: {
                id: hotel.id, // Changed from hotelId to match hotel-detail expectation
                hotel: JSON.stringify(hotel),
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                guestCount: params.guestCount,
                totalNights: totalNights.toString(),
            }
        });
    };

    const renderHotelItem = ({ item }: { item: Hotel }) => {
        // Calculate min price
        let priceDisplay = "Đang cập nhật";
        let hasPrice = false;

        if (item.rooms && item.rooms.length > 0) {
            const minPrice = Math.min(...item.rooms.map(r => r.price));
            priceDisplay = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice);
            hasPrice = true;
        }

        const imageUrl = (item.images && item.images.length > 0) ? item.images[0] : HOTEL_PLACEHOLDER;

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleHotelPress(item)}>
                <View style={styles.hotelCard}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.hotelImage}
                        resizeMode="cover"
                    />

                    <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{item.name}</Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={Colors.star} />
                            <Text style={styles.ratingText}>{item.rating} • Tuyệt vời</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                        </View>

                        <View style={styles.amenitiesRow}>
                            {(item.amenities || []).slice(0, 3).map((am, index) => (
                                <Text key={index} style={styles.amenityTag}>{am}</Text>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.priceContainer}>
                            <Text style={styles.fromText}>Chỉ từ</Text>
                            {hasPrice ? (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceText}>{priceDisplay}</Text>
                                    <Text style={styles.nightText}>/ đêm</Text>
                                </View>
                            ) : (
                                <Text style={styles.updatingText}>Đang cập nhật giá</Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Custom Header
    const renderHeader = () => (
        <View style={{ paddingTop: insets.top, backgroundColor: Colors.primary, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="white" onPress={() => router.back()} style={{ marginRight: 15 }} />
                    <View>
                        <Text style={styles.headerTitle}>{params.city ? `${params.city}` : 'Kết quả tìm kiếm'}</Text>
                        <Text style={styles.headerSubtitle}>
                            {format(checkIn, 'dd/MM')} - {format(checkOut, 'dd/MM')} • {params.guestCount} khách
                        </Text>
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
                    <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Đang tìm khách sạn tốt nhất...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={hotels}
                keyExtractor={item => item.id}
                renderItem={renderHotelItem}
                contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 20 }}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text>Không tìm thấy khách sạn nào khớp với "{params.city}"</Text>
                    </View>
                }
            />
        </View>
    );
};

export default HotelResultsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

    // Header Styles
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },

    filtersBar: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
    filterItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    filterText: { marginLeft: 5, fontSize: 13, fontWeight: '600', color: Colors.text },

    hotelCard: { backgroundColor: Colors.white, borderRadius: 12, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    hotelImage: { width: '100%', height: 180, backgroundColor: '#eee' },
    hotelInfo: { padding: 15 },
    hotelName: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    ratingText: { marginLeft: 4, color: Colors.primary, fontWeight: '700', fontSize: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    addressText: { color: Colors.textSecondary, marginLeft: 4, flex: 1, fontSize: 13 },
    amenitiesRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
    amenityTag: { fontSize: 11, color: '#666', backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },

    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    fromText: { color: Colors.textSecondary, fontSize: 12 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    priceText: { color: Colors.price, fontWeight: 'bold', fontSize: 18 },
    nightText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 2 },
    updatingText: { color: Colors.warning, fontWeight: 'bold', fontStyle: 'italic' }
});
