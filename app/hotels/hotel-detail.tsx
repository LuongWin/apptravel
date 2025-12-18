import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Button, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Hotel, Room } from '@/hooks/useHotels';

const { width } = Dimensions.get('window');
const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5722', success: '#4CAF50',
};

const HOTEL_PLACEHOLDER = 'https://via.placeholder.com/400x300.png?text=No+Image';

// Amenity Icon Mapper
const getAmenityIcon = (amenity: string): keyof typeof Ionicons.glyphMap => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('pool') || lower.includes('hồ bơi')) return 'water';
    if (lower.includes('ba') || lower.includes('bar')) return 'beer';
    if (lower.includes('gym')) return 'barbell';
    if (lower.includes('spa')) return 'leaf';
    if (lower.includes('parking') || lower.includes('xe')) return 'car';
    if (lower.includes('ac') || lower.includes('lạnh')) return 'snow';
    if (lower.includes('restaurant') || lower.includes('nhà hàng') || lower.includes('ăn')) return 'restaurant';
    return 'checkmark-circle-outline';
};

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

// ... imports

const HotelDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const rooms = hotel?.rooms || [];
    // const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0; // Not used currently

    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchHotel = async () => {
            if (!id) return;
            try {
                setLoadingData(true);
                const docRef = doc(db, "HOTELS", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setHotel({ id: docSnap.id, ...docSnap.data() } as Hotel);
                } else {
                    Alert.alert("Lỗi", "Khách sạn không tồn tại.");
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching hotel:", error);
                Alert.alert("Lỗi", "Không thể tải thông tin khách sạn.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchHotel();
    }, [id]);


    const handleRoomSelect = (room: Room) => {
        if (!hotel) return;

        const bookingData = {
            hotelId: hotel.id,
            roomId: room.id,
            hotelName: hotel.name,
            roomName: room.name,
            roomPrice: room.price,
            hotelImage: hotel.images?.[0] || HOTEL_PLACEHOLDER,
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date(Date.now() + 86400000).toISOString(),
            guestCount: 2,
            totalNights: 1,
            // Add hotel address or other needed info here if schema demands
        };

        router.push({
            pathname: '/hotels/detail', // Booking Screen
            params: {
                booking: JSON.stringify(bookingData)
            }
        });
    };

    const renderRoomItem = (room: Room) => {
        const roomImage = room.image || hotel?.images?.[0] || HOTEL_PLACEHOLDER; // Fallback if room has no image
        return (
            <View style={styles.roomCard} key={room.id}>
                <View style={styles.roomImageContainer}>
                    <Image source={{ uri: roomImage }} style={styles.roomImage} resizeMode="cover" />
                </View>
                <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.roomMeta}>
                        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>Tối đa {room.maxGuests} khách</Text>
                    </View>

                    <View style={styles.roomPriceRow}>
                        <View>
                            <Text style={styles.pricePerNightText}>Giá 1 đêm</Text>
                            <Text style={styles.roomPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}</Text>
                        </View>
                        <TouchableOpacity style={styles.selectButton} onPress={() => handleRoomSelect(room)}>
                            <Text style={styles.selectButtonText}>Chọn</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loadingData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!hotel) return null;

    return (
        <ScrollView style={styles.container} bounces={false}>
            <Stack.Screen options={{
                title: hotel.name,
                headerTransparent: true,
                headerTintColor: '#fff',
                headerBlurEffect: 'dark',
                headerTitleStyle: { color: 'rgba(0,0,0,0)' },
                headerBackTitle: "Quay lại"
            }} />

            {/* Image Slider */}
            <View style={styles.sliderContainer}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={({ nativeEvent }) => {
                        const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
                        setActiveImage(slide);
                    }}
                    scrollEventThrottle={16}
                >
                    {(hotel.images || [HOTEL_PLACEHOLDER]).map((img, index) => (
                        <Image key={index} source={{ uri: img }} style={styles.sliderImage} resizeMode="cover" />
                    ))}
                </ScrollView>
                <View style={styles.pagination}>
                    <Text style={styles.paginationText}>{activeImage + 1} / {(hotel.images || []).length > 0 ? hotel.images.length : 1}</Text>
                </View>

                {/* Back Button Gradient Overlay for visibility - managed by header normally, but if transparent */}
                <View style={styles.headerGradient} />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.hotelName}>{hotel.name}</Text>

                <View style={styles.ratingRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{hotel.rating}</Text>
                    </View>
                    <Text style={styles.ratingLabel}>Xuất sắc</Text>
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color={Colors.primary} />
                    <Text style={styles.addressText}>{hotel.address}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Tiện nghi</Text>
                <View style={styles.amenitiesGrid}>
                    {(hotel.amenities || []).map((amenity, index) => (
                        <View key={index} style={styles.amenityItem}>
                            <Ionicons name={getAmenityIcon(amenity)} size={20} color={Colors.textSecondary} />
                            <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Chọn phòng</Text>
                {rooms.length > 0 ? (
                    rooms.map(room => renderRoomItem(room))
                ) : (
                    <View style={styles.emptyRooms}>
                        <Text>Hiện chưa có thông tin phòng cho khách sạn này.</Text>
                    </View>
                )}

            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

export default HotelDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    sliderContainer: { height: 300, position: 'relative' },
    sliderImage: { width: width, height: 300 },
    pagination: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    paginationText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.3)' }, // Simulate gradient

    contentContainer: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 20 },
    hotelName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    badge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
    badgeText: { color: 'white', fontWeight: 'bold' },
    ratingLabel: { fontSize: 14, fontWeight: '600', color: Colors.primary },

    locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    addressText: { flex: 1, marginLeft: 6, color: Colors.textSecondary, lineHeight: 20 },

    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },

    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    amenityItem: { flexDirection: 'row', alignItems: 'center', width: '45%', gap: 8 },
    amenityText: { color: Colors.textSecondary, fontSize: 14 },

    // Room Card
    roomCard: { backgroundColor: 'white', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    roomImageContainer: { height: 150, width: '100%' },
    roomImage: { width: '100%', height: '100%' },
    roomInfo: { padding: 15 },
    roomName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    roomMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 },
    metaText: { color: Colors.textSecondary, fontSize: 13 },

    roomPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    pricePerNightText: { fontSize: 12, color: Colors.textSecondary },
    roomPrice: { fontSize: 18, fontWeight: 'bold', color: Colors.price },
    selectButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    selectButtonText: { color: 'white', fontWeight: 'bold' },

    emptyRooms: { padding: 20, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10 }
});
