import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHotelBookings } from '@/hooks/useHotelBookings';
import { format } from 'date-fns';
import { auth } from '@/services/firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = {
    primary: '#0194F3', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5722', success: '#4CAF50',
    disabled: '#B0BEC5'
};

const HotelBookingDetailScreen = () => {
    const insets = useSafeAreaInsets();
    const { booking } = useLocalSearchParams<{ booking: string }>();
    const [bookingDetails, setBookingDetails] = React.useState<any>(null);

    const { createBooking, loading } = useHotelBookings();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // 1. State for Room Quantity
    const [roomQuantity, setRoomQuantity] = useState(1);
    const MIN_ROOMS = 1;
    const MAX_ROOMS = 5;

    // Parse booking data
    React.useEffect(() => {
        if (booking) {
            try {
                setBookingDetails(JSON.parse(booking));
            } catch (e) {
                Alert.alert("Lỗi", "Dữ liệu đặt phòng không hợp lệ");
                router.back();
            }
        }
    }, [booking]);

    // Auto-fill
    React.useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email || '');
            const names = (user.displayName || '').split(' ');
            setFirstName(names.pop() || '');
            setLastName(names.join(' '));
        }
    }, []);

    // 3. Price Calculation Logic
    const finalPrice = useMemo(() => {
        if (!bookingDetails) return 0;
        const price = bookingDetails.roomPrice || 0;
        const nights = bookingDetails.totalNights || 1;
        return price * nights * roomQuantity;
    }, [bookingDetails, roomQuantity]);

    // Quantity Handlers
    const handleDecrease = () => {
        if (roomQuantity > MIN_ROOMS) setRoomQuantity(q => q - 1);
    };

    const handleIncrease = () => {
        if (roomQuantity < MAX_ROOMS) setRoomQuantity(q => q + 1);
    };

    const handleConfirmBooking = async () => {
        if (!bookingDetails) return;

        if (!firstName || !lastName || !email || !phone) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin khách hàng.");
            return;
        }

        try {
            await createBooking({
                hotelId: bookingDetails.hotelId,
                hotelName: bookingDetails.hotelName,
                roomId: bookingDetails.roomId,
                roomName: bookingDetails.roomName,
                checkInDate: bookingDetails.checkInDate,
                checkOutDate: bookingDetails.checkOutDate,
                totalNights: bookingDetails.totalNights,
                totalPrice: finalPrice, // 4. Use calculated final price
                contactInfo: { firstName, lastName, email, phoneNumber: phone },
                guestCount: bookingDetails.guestCount || 2,
                roomQuantity: roomQuantity, // 4. Include room quantity
            });

            Alert.alert("Thành công", "Đặt phòng thành công!", [
                { text: "Về trang chủ", onPress: () => router.dismissAll() }
            ]);
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Có lỗi xảy ra.");
        }
    };

    if (!bookingDetails) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const pricePerNight = bookingDetails.roomPrice || 0;
    const nights = bookingDetails.totalNights || 1;
    const formattedCheckIn = format(new Date(bookingDetails.checkInDate), 'dd/MM/yyyy');
    const formattedCheckOut = format(new Date(bookingDetails.checkOutDate), 'dd/MM/yyyy');

    return (
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: Colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác nhận đặt phòng</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Hotel Summary */}
                <View style={styles.card}>
                    <View style={styles.hotelRow}>
                        <Image source={{ uri: bookingDetails.hotelImage }} style={styles.hotelThumb} />
                        <View style={styles.hotelInfo}>
                            <Text style={styles.hotelName}>{bookingDetails.hotelName}</Text>
                            <Text style={styles.roomName}>{bookingDetails.roomName}</Text>
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.dateText}>{formattedCheckIn} - {formattedCheckOut} ({nights} đêm)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 2. UI: Quantity Selector */}
                    <View style={styles.quantityContainer}>
                        <View>
                            <Text style={styles.quantityLabel}>Số lượng phòng</Text>
                            <Text style={styles.quantityHint}>Tối đa 5 phòng / giao dịch</Text>
                        </View>

                        <View style={styles.counterControl}>
                            <TouchableOpacity
                                onPress={handleDecrease}
                                disabled={roomQuantity <= MIN_ROOMS}
                                style={[styles.counterBtn, roomQuantity <= MIN_ROOMS && styles.counterBtnDisabled]}
                            >
                                <Ionicons name="remove" size={20} color="white" />
                            </TouchableOpacity>

                            <Text style={styles.counterValue}>{roomQuantity}</Text>

                            <TouchableOpacity
                                onPress={handleIncrease}
                                disabled={roomQuantity >= MAX_ROOMS}
                                style={[styles.counterBtn, roomQuantity >= MAX_ROOMS && styles.counterBtnDisabled]}
                            >
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Price Breakdown */}
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceDetailLabel}>Giá phòng / đêm</Text>
                            <Text style={styles.priceDetailValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerNight)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceDetailLabel}>Số đêm nghỉ</Text>
                            <Text style={styles.priceDetailValue}>x {nights}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceDetailLabel}>Số lượng phòng</Text>
                            <Text style={styles.priceDetailValue}>x {roomQuantity}</Text>
                        </View>
                        <View style={[styles.divider, { marginVertical: 8 }]} />
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tổng thanh toán:</Text>
                            <Text style={styles.totalPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}</Text>
                        </View>
                    </View>
                </View>

                {/* Guest Form */}
                <View style={[styles.card, styles.section]}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ (ví dụ: Nguyen)</Text>
                        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Nhập họ" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên đệm & Tên (ví dụ: Van A)</Text>
                        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Nhập tên" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09xxxxxxx" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" autoCapitalize="none" />
                    </View>
                </View>

                <View style={{ height: 20 }} />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                    onPress={handleConfirmBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View>
                            <Text style={styles.submitButtonText}>Thanh toán & Đặt phòng</Text>
                            <Text style={styles.submitButtonSubText}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default HotelBookingDetailScreen;

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    scrollContent: { padding: 15 },

    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },

    hotelRow: { flexDirection: 'row', alignItems: 'center' },
    hotelThumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
    hotelInfo: { marginLeft: 15, flex: 1 },
    hotelName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    roomName: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dateText: { fontSize: 13, color: Colors.textSecondary },

    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },

    // Quantity Selector Styles
    quantityContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quantityLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
    quantityHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

    counterControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 20, padding: 4 },
    counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    counterBtnDisabled: { opacity: 0.5, backgroundColor: Colors.disabled },
    counterValue: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: Colors.text },

    // Pricing Styles
    priceBreakdown: {},
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    priceDetailLabel: { fontSize: 14, color: Colors.textSecondary },
    priceDetailValue: { fontSize: 14, color: Colors.text, fontWeight: '500' },
    priceLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.price },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: Colors.text },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 15 },

    submitButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    submitButtonSubText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2, fontWeight: '600' }
});
