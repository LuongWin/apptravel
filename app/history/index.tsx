import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { auth, db } from '@/services/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

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
    roomName?: string;
    // Flight specific
    outboundFlightSnapshot?: {
        from: string;
        to: string;
        airline: string;
        departureTime: string;
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

            setHistoryData(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('vi-VN');
    };

    const formatPrice = (price?: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const isHotel = activeTab === 'HOTEL';
        const title = isHotel ? item.hotelName : `${item.outboundFlightSnapshot?.from} - ${item.outboundFlightSnapshot?.to}`;
        const subtitle = isHotel ? item.roomName : item.outboundFlightSnapshot?.airline;
        const price = isHotel ? item.totalPrice : item.totalAmount;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={isHotel ? "bed" : "airplane"}
                            size={20}
                            color={Colors.white}
                        />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.bookingId}>Mã: {item.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Thành công</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}

                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalPrice}>{formatPrice(price)}</Text>
                    </View>
                </View>
            </View>
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.primary,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    bookingId: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    date: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: Colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    cardBody: {
        padding: 16,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.price,
    },
});
