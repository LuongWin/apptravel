import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { auth, db } from '@/services/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
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

type BookingType = 'HOTEL' | 'FLIGHT';

interface HistoryItem {
    id: string;
    userId: string;
    createdAt: Timestamp;
    status: string;
    totalAmount?: number;
    totalPrice?: number;
    // Hotel specific
    hotelName?: string;
    hotelId?: string;
    roomName?: string;
    hotelImage?: string;
    checkInDate?: string;
    checkOutDate?: string;
    // Flight specific
    // Flight specific
    airlineLogo?: string; // NEW: persisted top-level
    bookingImage?: string; // NEW: persisted top-level
    outboundFlightSnapshot?: {
        from: string;
        to: string;
        airline: string;
        departureTime: string;
        date: string; // Assuming 'date' is stored like '2023-10-27' or similar
        image?: string; // or logo
        airlineLogo?: string;
    };
}

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<BookingType>('HOTEL');
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkAuthAndFetch();
        }, [activeTab])
    );

    const checkAuthAndFetch = async () => {
        const user = auth.currentUser;
        if (!user) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }
        setIsAuthenticated(true);
        fetchHistory(user.uid);
    };

    const fetchHistory = async (userId: string) => {
        setLoading(true);
        try {
            const collectionName = activeTab === 'HOTEL' ? 'HOTEL_BOOKINGS' : 'FLIGHT_BOOKINGS';
            const q = query(
                collection(db, collectionName),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const data: HistoryItem[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as HistoryItem));

            if (activeTab === 'HOTEL') {
                // Determine which items need a fallback image
                const enhancedData = await Promise.all(data.map(async (item) => {
                    // Check if hotelImage is missing/empty but hotelId exists
                    if ((!item.hotelImage || item.hotelImage.length === 0) && item.hotelId) {
                        try {
                            const hotelRef = doc(db, 'HOTELS', item.hotelId);
                            const hotelSnap = await getDoc(hotelRef);
                            if (hotelSnap.exists()) {
                                const hotelData = hotelSnap.data();
                                // Assuming images is an array of strings
                                if (hotelData.images && Array.isArray(hotelData.images) && hotelData.images.length > 0) {
                                    return { ...item, hotelImage: hotelData.images[0] };
                                }
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch fallback image for hotel ${item.hotelId}`, err);
                        }
                    }
                    return item;
                }));
                setHistoryData(enhancedData);
            } else {
                setHistoryData(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price?: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const isHotel = activeTab === 'HOTEL';

        let imageUrl = '';
        let title = '';
        let dateInfo = '';
        let price = 0;

        if (isHotel) {
            title = item.hotelName || 'Khách sạn';
            imageUrl = item.hotelImage || 'https://via.placeholder.com/150';
            price = item.totalPrice || 0;

            // Date formatting
            const checkIn = item.checkInDate ? format(new Date(item.checkInDate), 'dd/MM/yyyy') : '';
            const checkOut = item.checkOutDate ? format(new Date(item.checkOutDate), 'dd/MM/yyyy') : '';
            dateInfo = `${checkIn} - ${checkOut}`;

        } else {
            // Flight
            const flight = item.outboundFlightSnapshot;
            title = flight ? `${flight.from} ➔ ${flight.to}` : 'Chuyến bay';
            title = flight ? `${flight.from} ➔ ${flight.to}` : 'Chuyến bay';
            // Prioritize persisted top-level images, then snapshot images, then placeholder
            imageUrl = item.airlineLogo || item.bookingImage || flight?.airlineLogo || flight?.image || 'https://via.placeholder.com/150';
            price = item.totalAmount || 0;

            // Flight Date: HH:mm - dd/MM/yyyy
            // Assuming flight.date is YYYY-MM-DD and flight.departureTime is HH:mm
            let flightDateFormatted = '';
            if (flight?.date) {
                // Try to parse standard format
                try {
                    // If date is strict YYYY-MM-DD
                    const d = new Date(flight.date);
                    // Manual format or use date-fns if parsing works
                    flightDateFormatted = format(d, 'dd/MM/yyyy');
                } catch (e) {
                    flightDateFormatted = flight.date; // Use raw if parse fails
                }
            }
            dateInfo = `${flight?.departureTime || '--:--'} - ${flightDateFormatted}`;
        }

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/history/detail', params: { bookingId: item.id, type: isHotel ? 'hotel' : 'flight' } })}
            >
                <View style={styles.card}>
                    <View style={styles.row}>
                        {/* Left: Image */}
                        <Image source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />

                        {/* Right: Info */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>

                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.dateText}>{dateInfo}</Text>
                            </View>

                            <View style={styles.footerRow}>
                                <Text style={styles.totalPrice}>{formatPrice(price)}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Thành công</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Lịch sử đặt chỗ</Text>
                </View>
                <View style={styles.centerContent}>
                    <Ionicons name="lock-closed-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.message}>Vui lòng đăng nhập để xem lịch sử</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Remove the old header logic if replacing entirely, or adapt inline. User asked to "tách riêng phần Header" (separate Header). 
                I will implement it inline first as a const or just JSX to match the request "Tạo một <View> làm nền cho Header...". 
            */}
            <View style={[styles.header, { height: 60 + insets.top, paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch sử đặt chỗ</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'HOTEL' && styles.activeTab]}
                    onPress={() => setActiveTab('HOTEL')}
                >
                    <Text style={[styles.tabText, activeTab === 'HOTEL' && styles.activeTabText]}>Khách sạn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'FLIGHT' && styles.activeTab]}
                    onPress={() => setActiveTab('FLIGHT')}
                >
                    <Text style={[styles.tabText, activeTab === 'FLIGHT' && styles.activeTabText]}>Chuyến bay</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={historyData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContent}>
                            <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.message}>Chưa có lịch sử đặt chỗ</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        // Height and padding top are now dynamic via style prop
        zIndex: 10,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: 4,
        margin: 16,
        borderRadius: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
    listContent: {
        padding: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 12,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 16,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    row: {
        flexDirection: 'row',
    },
    thumb: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.price,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -10, // Slight overlap for modern look if desired, or 0
        overflow: 'hidden',
    },

    itemSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 8,
    }, statusBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.success,
        fontSize: 12,
        fontWeight: '600',
    },
});
