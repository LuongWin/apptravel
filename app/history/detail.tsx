import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const Colors = {
    primary: '#0194F3',
    background: '#F5F5F5',
    white: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#EEEEEE',
    success: '#4CAF50',
    price: '#FF5E1F',
};

export default function HistoryDetailScreen() {
    const { bookingId, type } = useLocalSearchParams<{ bookingId: string, type: 'hotel' | 'flight' }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!bookingId || !type) return;
            setLoading(true);
            try {
                const collectionName = type === 'hotel' ? 'HOTEL_BOOKINGS' : 'FLIGHT_BOOKINGS';
                const docRef = doc(db, collectionName, bookingId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let bookingData = { id: docSnap.id, ...docSnap.data() } as any;

                    // Fallback for missing Hotel Image
                    if (type === 'hotel' && (!bookingData.hotelImage || bookingData.hotelImage === '') && bookingData.hotelId) {
                        try {
                            const hotelRef = doc(db, 'HOTELS', bookingData.hotelId);
                            const hotelSnap = await getDoc(hotelRef);
                            if (hotelSnap.exists()) {
                                const hotelData = hotelSnap.data();
                                if (hotelData.images && hotelData.images.length > 0) {
                                    bookingData.hotelImage = hotelData.images[0];
                                }
                            }
                        } catch (err) {
                            console.log("Error fetching fallback hotel image", err);
                        }
                    }

                    setBooking(bookingData);
                } else {
                    Alert.alert("Lỗi", "Không tìm thấy đơn hàng.");
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching detail:", error);
                Alert.alert("Lỗi", "Không thể tải thông tin chi tiết.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [bookingId, type]);



    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return format(date, 'dd/MM/yyyy HH:mm');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!booking) return null;

    const isHotel = type === 'hotel';
    const hotelImage = booking.hotelImage || booking.image || booking.imageUrl || 'https://via.placeholder.com/400x300?text=Hotel+Image';

    if (isHotel) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <Stack.Screen options={{ headerShown: false }} />

                {/* Hero Image */}
                <View style={[styles.heroContainer, { backgroundColor: '#EEE' }]}>
                    <Image
                        source={{ uri: hotelImage }}
                        style={styles.heroImage}
                        resizeMode="cover"
                        onError={(e) => console.log('Image Load Error', e.nativeEvent.error)}
                    />
                    {/* Gradient overlay for text readability if needed, or just header bg */}
                    <View style={styles.heroOverlay} />
                </View>

                {/* Custom Absolute Header */}
                <View style={[styles.absoluteHeader, { top: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.roundBackButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContentHotel} showsVerticalScrollIndicator={false}>
                    <View style={styles.hotelContentCard}>
                        {/* Title & Address */}
                        <Text style={styles.hotelTitle}>{booking.hotelName}</Text>
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.addressText}>{booking.address || 'Địa chỉ đang cập nhật'}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Status Badge */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Trạng thái</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Thành công</Text>
                            </View>
                        </View>
                        <View style={[styles.row, { marginTop: 10 }]}>
                            <Text style={styles.label}>Mã đơn hàng</Text>
                            <Text style={styles.valueCopy}>{booking.id.slice(0, 8).toUpperCase()}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Booking Details Grid */}
                        <Text style={styles.sectionTitle}>Chi tiết đặt phòng</Text>

                        <View style={styles.detailGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Nhận phòng</Text>
                                <Text style={styles.detailValue}>{format(new Date(booking.checkInDate), 'dd/MM/yyyy')}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Trả phòng</Text>
                                <Text style={styles.detailValue}>{format(new Date(booking.checkOutDate), 'dd/MM/yyyy')}</Text>
                            </View>
                        </View>

                        <View style={[styles.detailGrid, { marginTop: 15 }]}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Loại phòng</Text>
                                <Text style={styles.detailValue}>{booking.roomName}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Số phòng</Text>
                                <Text style={styles.detailValue}>{booking.roomQuantity || 1}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* User Info */}
                        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                            <Text style={styles.infoText}>{booking.contactInfo?.lastName} {booking.contactInfo?.firstName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
                            <Text style={styles.infoText}>{booking.contactInfo?.phoneNumber}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                            <Text style={styles.infoText}>{booking.contactInfo?.email}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Price */}
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                            <Text style={styles.hotelTotalPrice}>{formatPrice(booking.totalPrice)}</Text>
                        </View>

                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView >
            </View >
        );
    }

    // Default: Flight Layout (Preserved)
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Simple Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết vé máy bay</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Thành công</Text>
                        </View>
                    </View>
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <Text style={styles.label}>Mã đặt chỗ</Text>
                        <Text style={styles.value}>{booking.id.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <Text style={styles.label}>Ngày đặt</Text>
                        <Text style={styles.value}>{formatDate(booking.createdAt)}</Text>
                    </View>
                </View>

                {/* Product Detail */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin chuyến bay</Text>

                    <View style={styles.productRow}>
                        <Image
                            source={{ uri: booking.airlineLogo || booking.bookingImage || 'https://via.placeholder.com/50' }}
                            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                        />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{booking.outboundFlightSnapshot?.airline}</Text>
                            <Text style={styles.productSub}>{booking.outboundFlightSnapshot?.from} ➔ {booking.outboundFlightSnapshot?.to}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Ngày đi</Text>
                        <Text style={styles.value}>{booking.outboundFlightSnapshot?.date}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 8 }]}>
                        <Text style={styles.label}>Giờ đi</Text>
                        <Text style={styles.value}>{booking.outboundFlightSnapshot?.departureTime}</Text>
                    </View>
                </View>

                {/* Pricing */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thanh toán</Text>
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Tổng tiền</Text>
                        <Text style={styles.totalPrice}>
                            {formatPrice(booking.totalAmount)}
                        </Text>
                    </View>
                </View>

                {/* Contact Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tên</Text>
                        <Text style={styles.value}>{booking.contactInfo?.lastName} {booking.contactInfo?.firstName}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 8 }]}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{booking.contactInfo?.email}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 8 }]}>
                        <Text style={styles.label}>SĐT</Text>
                        <Text style={styles.value}>{booking.contactInfo?.phoneNumber}</Text>
                    </View>
                </View>



            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Flight Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    content: { padding: 16, paddingBottom: 100 },

    // Core Components
    card: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 14, color: Colors.textSecondary },
    value: { fontSize: 14, fontWeight: '500', color: Colors.text },
    valueCopy: { fontSize: 14, fontWeight: 'bold', color: Colors.text, fontFamily: 'monospace' },

    statusBadge: { backgroundColor: Colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },

    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    productInfo: { marginLeft: 12, flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    productSub: { fontSize: 14, color: Colors.textSecondary },

    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

    totalLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.price },



    // --- HOTEL SPECIFIC STYLES ---
    absoluteHeader: {
        position: 'absolute', left: 16, zIndex: 10,
    },
    roundBackButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8, borderRadius: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    heroContainer: {
        height: 350, width: '100%', position: 'absolute', top: 0,
    },
    heroImage: {
        width: '100%', height: '100%'
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    scrollContentHotel: {
        paddingTop: 300, // Overlap image (Hero 350 - 50 overlap)
        paddingBottom: 100
    },
    hotelContentCard: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24,
        minHeight: 500,
        marginTop: -30,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4
    },
    hotelTitle: {
        fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 8, marginRight: 10
    },
    addressRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15
    },
    addressText: {
        fontSize: 14, color: Colors.textSecondary, flex: 1
    },
    detailGrid: {
        flexDirection: 'row', justifyContent: 'space-between'
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13, color: Colors.textSecondary, marginBottom: 4
    },
    detailValue: {
        fontSize: 15, fontWeight: '600', color: Colors.text
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10
    },
    infoText: {
        fontSize: 15, color: Colors.text
    },
    hotelTotalPrice: {
        fontSize: 24, fontWeight: 'bold', color: Colors.price
    }
});
