import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHotels, Hotel, Room } from '@/hooks/useHotels';
import { differenceInCalendarDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5722', success: '#4CAF50',
    star: '#FFC107'
};

const HotelResultsScreen = () => {
    const params = useLocalSearchParams<{
        city: string; checkInDate: string; checkOutDate: string; guestCount: string;
    }>();

    const { hotels, loading, error, searchHotels } = useHotels();

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);

    // Calculate Total Nights
    const totalNights = useMemo(() => {
        const diff = differenceInCalendarDays(checkOut, checkIn);
        return diff > 0 ? diff : 1;
    }, [checkIn, checkOut]);

    useEffect(() => {
        if (params.city) {
            searchHotels(params.city);
        }
    }, [params.city, searchHotels]);

    const handleHotelPress = (hotel: Hotel) => {
        // Pass hotel data and search params to the detail screen
        router.push({
            pathname: '/hotels/hotel-detail',
            params: {
                hotel: JSON.stringify(hotel),
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                guestCount: params.guestCount,
                totalNights: totalNights.toString(),
            }
        });
    };

    const renderHotelItem = ({ item }: { item: Hotel }) => {
        // Only show hotels that have rooms
        if (!item.rooms || item.rooms.length === 0) return null;

        // Calculate min price
        const minPrice = Math.min(...item.rooms.map(r => r.price));

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleHotelPress(item)}>
                <View style={styles.hotelCard}>
                    {/* Hotel Image (First Image) */}
                    {item.images && item.images.length > 0 ? (
                        <Image source={{ uri: item.images[0] }} style={styles.hotelImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.hotelImage, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="image-outline" size={40} color="#888" />
                        </View>
                    )}

                    <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{item.name}</Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color={Colors.star} />
                            <Text style={styles.ratingText}>{item.rating} • Tuyệt vời</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.priceContainer}>
                            <Text style={styles.fromText}>Chỉ từ</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceText}>{minPrice.toLocaleString('vi-VN')} ₫</Text>
                                <Text style={styles.nightText}>/ đêm</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text>Đang tìm khách sạn...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: `${params.city} (${totalNights} đêm)`,
                headerBackTitle: '', headerTintColor: Colors.text, headerShadowVisible: false, headerStyle: { backgroundColor: Colors.background }
            }} />

            {/* Header Info */}
            <View style={styles.filtersBar}>
                <Text style={styles.dateInfo}>{format(checkIn, 'dd/MM')} - {format(checkOut, 'dd/MM/yyyy')}</Text>
                <Text style={styles.guestInfo}>{params.guestCount} người</Text>
            </View>

            <FlatList
                data={hotels}
                keyExtractor={item => item.id}
                renderItem={renderHotelItem}
                contentContainerStyle={{ padding: 15 }}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.centered}>
                            <Text>Không tìm thấy khách sạn nào ở {params.city}</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

export default HotelResultsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    filtersBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
    dateInfo: { fontWeight: '600', color: Colors.text },
    guestInfo: { color: Colors.textSecondary },

    hotelCard: { backgroundColor: Colors.white, borderRadius: 12, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    hotelImage: { width: '100%', height: 200 },
    hotelInfo: { padding: 15 },
    hotelName: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    ratingText: { marginLeft: 4, color: Colors.textSecondary, fontWeight: '600' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    addressText: { color: Colors.textSecondary, marginLeft: 4, flex: 1 },

    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },

    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    fromText: { color: Colors.textSecondary, fontSize: 13 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    priceText: { color: Colors.price, fontWeight: 'bold', fontSize: 18 },
    nightText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 2 },
});
