import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHotelBookings } from '@/hooks/useHotelBookings';
import { auth } from '@/services/firebaseConfig';
import { format } from 'date-fns';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#DDDDDD', price: '#d32f2f',
    inputBg: '#FAFAFA'
};

const HotelDetailScreen = () => {
    // Receive params as simple strings and parse them
    const params = useLocalSearchParams<{
        hotelId: string; hotelName: string; roomId: string; roomName: string;
        pricePerNight: string; totalPrice: string; totalNights: string;
        checkInDate: string; checkOutDate: string; guestCount: string;
    }>();

    const { createBooking, loading } = useHotelBookings();

    const [contactInfo, setContactInfo] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: ''
    });

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setContactInfo(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.displayName?.split(' ').pop() || '',
                lastName: user.displayName?.split(' ').slice(0, -1).join(' ') || '',
            }));
        }
    }, []);

    const handleConfirmBooking = async () => {
        if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phoneNumber) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin liên hệ.");
            return;
        }

        try {
            await createBooking({
                hotelId: params.hotelId,
                hotelName: params.hotelName,
                roomId: params.roomId,
                roomName: params.roomName,
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                totalNights: parseInt(params.totalNights),
                totalPrice: parseInt(params.totalPrice),
                guestCount: parseInt(params.guestCount),
                contactInfo: contactInfo
            });

            Alert.alert("Thành công", "Đặt phòng thành công!", [
                { text: "Về trang chủ", onPress: () => router.dismissAll() }
            ]);
        } catch (e) {
            // Already handled in hook
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Xác nhận đặt phòng', headerBackTitle: '' }} />

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Summary Card */}
                <View style={styles.card}>
                    <Text style={styles.hotelName}>{params.hotelName}</Text>
                    <Text style={styles.roomName}>{params.roomName}</Text>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Nhận phòng</Text>
                            <Text style={styles.val}>{format(new Date(params.checkInDate), 'dd/MM/yyyy')}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={Colors.textSecondary} />
                        <View>
                            <Text style={[styles.label, { textAlign: 'right' }]}>Trả phòng</Text>
                            <Text style={styles.val}>{format(new Date(params.checkOutDate), 'dd/MM/yyyy')}</Text>
                        </View>
                    </View>

                    <Text style={styles.nightsInfo}>{params.totalNights} đêm • {params.guestCount} khách</Text>
                </View>

                {/* Contact Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
                    <Text style={styles.required}>* Tất cả trường là bắt buộc</Text>

                    <TextInput
                        style={styles.input} placeholder="Họ *"
                        value={contactInfo.lastName} onChangeText={t => setContactInfo({ ...contactInfo, lastName: t })}
                    />
                    <TextInput
                        style={styles.input} placeholder="Tên *"
                        value={contactInfo.firstName} onChangeText={t => setContactInfo({ ...contactInfo, firstName: t })}
                    />
                    <TextInput
                        style={styles.input} placeholder="Email *" keyboardType="email-address"
                        value={contactInfo.email} onChangeText={t => setContactInfo({ ...contactInfo, email: t })}
                    />
                    <TextInput
                        style={styles.input} placeholder="Số điện thoại *" keyboardType="phone-pad"
                        value={contactInfo.phoneNumber} onChangeText={t => setContactInfo({ ...contactInfo, phoneNumber: t })}
                    />
                </View>

            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Tổng tiền ({params.totalNights} đêm)</Text>
                    <Text style={styles.totalPrice}>{parseInt(params.totalPrice).toLocaleString('vi-VN')} ₫</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, loading && { opacity: 0.7 }]}
                    onPress={handleConfirmBooking}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookBtnText}>Thanh toán</Text>}
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
};

export default HotelDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 15 },
    card: { backgroundColor: Colors.white, borderRadius: 12, padding: 15, marginBottom: 15, shadowOpacity: 0.05, elevation: 2 },
    hotelName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    roomName: { fontSize: 16, color: Colors.textSecondary, marginBottom: 10 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    label: { fontSize: 12, color: Colors.textSecondary },
    val: { fontSize: 15, fontWeight: '600', color: Colors.text },
    nightsInfo: { marginTop: 5, color: Colors.primary, fontWeight: '600' },

    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    required: { fontSize: 12, color: Colors.price, marginBottom: 15 },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: Colors.inputBg },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, padding: 15, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 12, color: Colors.textSecondary },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.price },
    bookBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    bookBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});
