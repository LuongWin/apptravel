import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Hotel, Room } from '@/hooks/useHotels';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5722', star: '#FFC107'
};

const HotelDetailScreen = () => {
    const params = useLocalSearchParams<{
        hotel: string; checkInDate: string; checkOutDate: string; guestCount: string; totalNights: string;
    }>();

    const hotel: Hotel = params.hotel ? JSON.parse(params.hotel) : null;
    const totalNights = parseInt(params.totalNights || '1');

    if (!hotel) {
        return (
            <View style={styles.centered}>
                <Text>Không tìm thấy thông tin khách sạn.</Text>
            </View>
        );
    }

    const handleRoomSelect = (room: Room) => {
        const totalPrice = room.price * totalNights;
        router.push({
            pathname: '/hotels/detail',
            params: {
                hotelId: hotel.id,
                hotelName: hotel.name,
                roomId: room.id,
                roomName: room.name,
                pricePerNight: room.price.toString(),
                totalPrice: totalPrice.toString(),
                totalNights: params.totalNights,
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                guestCount: params.guestCount,
            }
        });
    };

    return (
        <ScrollView style={styles.container} bounces={false}>
            <Stack.Screen options={{
                title: hotel.name,
                headerBackTitle: '',
                headerTransparent: true,
                headerTintColor: '#fff',
                headerBlurEffect: 'dark',
                headerStyle: { backgroundColor: 'rgba(0,0,0,0.3)' }
            }} />

            {/* Image Gallery */}
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                {hotel.images && hotel.images.length > 0 ? (
                    hotel.images.map((img, index) => (
                        <Image key={index} source={{ uri: img }} style={styles.hotelImage} resizeMode="cover" />
                    ))
                ) : (
                    <View style={[styles.hotelImage, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={50} color="#888" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.contentContainer}>
                {/* Header Info */}
                <Text style={styles.name}>{hotel.name}</Text>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={18} color={Colors.star} />
                    <Text style={styles.ratingText}>{hotel.rating} / 5</Text>
                    <Text style={styles.ratingLabel}>(Tuyệt vời)</Text>
                </View>

                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <Text style={styles.address}>{hotel.address}</Text>
                </View>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tiện nghi</Text>
                        <View style={styles.amenitiesGrid}>
                            {hotel.amenities.map((amenity, idx) => (
                                <View key={idx} style={styles.amenityItem}>
                                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} />
                                    <Text style={styles.amenityText}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.divider} />

                {/* Rooms List */}
                <Text style={styles.sectionTitle}>Chọn phòng</Text>
                <Text style={styles.nightsLabel}>Giá cho {totalNights} đêm</Text>

                {hotel.rooms?.map(room => (
                    <View key={room.id} style={styles.roomCard}>
                        <View style={styles.roomHeader}>
                            <Text style={styles.roomName}>{room.name}</Text>
                            <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
                        </View>

                        <View style={styles.roomDetails}>
                            <Text style={styles.guestText}>Tối đa {room.maxGuests} người lớn</Text>

                            <View style={styles.priceContainer}>
                                <Text style={styles.totalPrice}>{(room.price * totalNights).toLocaleString('vi-VN')} ₫</Text>
                                <Text style={styles.perNightText}>{room.price.toLocaleString('vi-VN')} ₫/đêm</Text>
                            </View>

                            <TouchableOpacity style={styles.bookButton} onPress={() => handleRoomSelect(room)}>
                                <Text style={styles.bookButtonText}>Đặt phòng này</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default HotelDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageContainer: { height: 250, width: '100%' },
    hotelImage: { width: 400, height: 250 }, // Fixed width simplistic for paging or use Dimensions

    contentContainer: { flex: 1, backgroundColor: Colors.white, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    name: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    ratingText: { fontSize: 16, fontWeight: 'bold', marginLeft: 5, color: Colors.text },
    ratingLabel: { fontSize: 14, color: Colors.textSecondary, marginLeft: 5 },

    locationContainer: { flexDirection: 'row', marginBottom: 20 },
    address: { marginLeft: 8, color: Colors.textSecondary, flex: 1, lineHeight: 20 },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },

    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    amenityItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 8 },
    amenityText: { marginLeft: 6, color: Colors.textSecondary },

    nightsLabel: { color: Colors.textSecondary, marginBottom: 15 },

    roomCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 15, padding: 15 },
    roomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    roomName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    roomDetails: {},
    guestText: { color: Colors.textSecondary, marginBottom: 10 },

    priceContainer: { marginBottom: 10 },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.price },
    perNightText: { fontSize: 13, color: Colors.textSecondary },

    bookButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    bookButtonText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});
