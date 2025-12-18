import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHotelBookings } from '@/hooks/useHotelBookings';
import { format } from 'date-fns';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', price: '#FF5722', success: '#4CAF50',
};

const HotelBookingDetailScreen = () => {
    const params = useLocalSearchParams<{
        hotelName: string; roomName: string; roomPrice: string;
        hotelImage: string; checkInDate: string; checkOutDate: string;
        guestCount: string; totalNights: string;
    }>();

    const { createBooking, loading } = useHotelBookings();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const pricePerNight = parseInt(params.roomPrice || '0');
    const nights = parseInt(params.totalNights || '1');
    const totalPrice = pricePerNight * nights;

    const formattedCheckIn = format(new Date(params.checkInDate), 'dd/MM/yyyy');
    const formattedCheckOut = format(new Date(params.checkOutDate), 'dd/MM/yyyy');

    const handleConfirmBooking = async () => {
        if (!firstName || !lastName || !email || !phone) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin khách hàng.");
            return;
        }

        try {
            await createBooking({
                hotelId: 'temp_id', // Ideally pass real ID
                hotelName: params.hotelName,
                roomId: 'temp_room_id', // Ideally pass real ID
                roomName: params.roomName,
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                totalNights: nights,
                totalPrice: totalPrice,
                contactInfo: { firstName, lastName, email, phoneNumber: phone },
                guestCount: parseInt(params.guestCount),
            });

            Alert.alert("Thành công", "Đặt phòng thành công!", [
                { text: "Về trang chủ", onPress: () => router.dismissAll() }
            ]);
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Có lỗi xảy ra.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: "Xác nhận đặt phòng", headerTitleStyle: { fontWeight: 'bold' } }} />

            {/* Hotel Summary */}
            <View style={styles.card}>
                <View style={styles.hotelRow}>
                    <Image source={{ uri: params.hotelImage }} style={styles.hotelThumb} />
                    <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{params.hotelName}</Text>
                        <Text style={styles.roomName}>{params.roomName}</Text>
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.dateText}>{formattedCheckIn} - {formattedCheckOut} ({nights} đêm)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Tổng tiền ({nights} đêm):</Text>
                    <Text style={styles.totalPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</Text>
                </View>
            </View>

            {/* Guest Form */}
            <View style={styles.section}>
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
                    <Text style={styles.submitButtonText}>Thanh toán & Đặt phòng</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

export default HotelBookingDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },

    hotelRow: { flexDirection: 'row', alignItems: 'center' },
    hotelThumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
    hotelInfo: { marginLeft: 15, flex: 1 },
    hotelName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    roomName: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dateText: { fontSize: 13, color: Colors.textSecondary },

    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
    totalPrice: { fontSize: 18, fontWeight: 'bold', color: Colors.price },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: Colors.text },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 15 },

    submitButton: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
