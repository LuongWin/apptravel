import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '@/hooks/useBookings';
import { auth } from '@/services/firebaseConfig';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#DDDDDD', price: '#d32f2f',
    inputBg: '#FAFAFA' // Slightly off-white for inputs
};

const FlightDetailScreen = () => {
    const params = useLocalSearchParams<{ booking: string }>();
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const { createBooking, loading } = useBookings();

    // Form State
    const [contactInfo, setContactInfo] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', countryCode: '+84'
    });

    const [passenger, setPassenger] = useState({
        title: 'Mr', firstName: '', lastName: '',
        day: '', month: '', year: '',
        gender: 'Nam', nationality: 'Việt Nam'
    });

    // Auto-fill from Firebase Auth if available
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            // Attempt to pre-fill email and maybe name if stored in profile
            setContactInfo(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.displayName?.split(' ').pop() || '',
                lastName: user.displayName?.split(' ').slice(0, -1).join(' ') || '',
            }));
        }
    }, []);


    useEffect(() => {
        if (params.booking) {
            try {
                setBookingDetails(JSON.parse(params.booking));
            } catch (e) {
                console.error("Error parsing booking details:", e);
                Alert.alert("Lỗi", "Không thể tải thông tin chuyến bay.");
                router.back();
            }
        }
    }, [params.booking]);

    const calculateTotal = () => {
        if (!bookingDetails) return 0;
        let total = bookingDetails.outboundFlight?.price || 0;
        if (bookingDetails.returnFlight) {
            total += bookingDetails.returnFlight.price;
        }
        return total;
    };

    const handleContinue = async () => {
        // Validation
        if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phoneNumber) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin liên lạc (*).");
            return;
        }
        if (!passenger.firstName || !passenger.lastName || !passenger.day || !passenger.year) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin hành khách (*).");
            return;
        }

        // Construct Data
        const bookingData = {
            outboundFlightSnapshot: bookingDetails.outboundFlight,
            returnFlightSnapshot: bookingDetails.returnFlight,
            contactInfo: contactInfo,
            passengers: [{
                ...passenger,
                dateOfBirth: `${passenger.year}-${passenger.month}-${passenger.day}` // Simple formatting
            }],
            totalAmount: calculateTotal()
        };

        try {
            await createBooking(bookingData);
            Alert.alert("Thành công", "Đặt vé thành công!", [
                { text: "Về trang chủ", onPress: () => router.dismissAll() }
            ]);
        } catch (error) {
            // Error managed by hook/alert
        }
    };

    if (!bookingDetails) return null;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Thông tin đặt chỗ', headerBackTitle: '' }} />

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Flight Summary Header */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Chuyến bay đã chọn</Text>
                    <View style={styles.flightSummary}>
                        <Ionicons name="airplane" size={16} color={Colors.primary} />
                        <Text style={styles.flightRoute}>
                            {bookingDetails.outboundFlight.from} <Ionicons name="arrow-forward" /> {bookingDetails.outboundFlight.to}
                        </Text>
                    </View>
                    {bookingDetails.returnFlight && (
                        <View style={[styles.flightSummary, { marginTop: 8 }]}>
                            <Ionicons name="airplane" size={16} color={Colors.primary} style={{ transform: [{ scaleX: -1 }] }} />
                            <Text style={styles.flightRoute}>
                                {bookingDetails.returnFlight.from} <Ionicons name="arrow-forward" /> {bookingDetails.returnFlight.to}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Contact Info Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chi tiết liên lạc</Text>
                    <Text style={styles.cardSubtitle}>Xác nhận của quý khách sẽ được gửi đến đây</Text>
                    <Text style={styles.requiredLabel}>*Mục bắt buộc</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên *</Text>
                        <TextInput
                            style={styles.input}
                            value={contactInfo.firstName}
                            onChangeText={(t) => setContactInfo({ ...contactInfo, firstName: t })}
                            placeholder="Thắng"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ (vd: Nguyễn) *</Text>
                        <TextInput
                            style={styles.input}
                            value={contactInfo.lastName}
                            onChangeText={(t) => setContactInfo({ ...contactInfo, lastName: t })}
                            placeholder="Lương"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email ID *</Text>
                        <TextInput
                            style={styles.input}
                            value={contactInfo.email}
                            onChangeText={(t) => setContactInfo({ ...contactInfo, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại *</Text>
                        <TextInput
                            style={styles.input}
                            value={contactInfo.phoneNumber}
                            onChangeText={(t) => setContactInfo({ ...contactInfo, phoneNumber: t })}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Passenger Info Section */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="person" size={20} color={Colors.textSecondary} />
                        <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Hành khách 1: (Người lớn)</Text>
                    </View>

                    <Text style={styles.cardSubtitle}>Thông tin hành khách phải trùng khớp với hộ chiếu/CCCD</Text>
                    <Text style={styles.requiredLabel}>*Mục bắt buộc</Text>

                    {/* Gender Radio */}
                    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        {['Nam', 'Nữ'].map((g) => (
                            <TouchableOpacity key={g} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }} onPress={() => setPassenger({ ...passenger, gender: g })}>
                                <Ionicons name={passenger.gender === g ? "radio-button-on" : "radio-button-off"} size={24} color={Colors.text} />
                                <Text style={{ marginLeft: 8, fontSize: 16 }}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên đệm và Tên *</Text>
                        <TextInput
                            style={styles.input}
                            value={passenger.firstName}
                            onChangeText={(t) => setPassenger({ ...passenger, firstName: t })}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ *</Text>
                        <TextInput
                            style={styles.input}
                            value={passenger.lastName}
                            onChangeText={(t) => setPassenger({ ...passenger, lastName: t })}
                        />
                    </View>

                    <Text style={styles.label}>Ngày sinh *</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput style={[styles.input, { flex: 0.3 }]} placeholder="Ngày" keyboardType="numeric" onChangeText={(t) => setPassenger({ ...passenger, day: t })} />
                        <TextInput style={[styles.input, { flex: 0.3 }]} placeholder="Tháng" keyboardType="numeric" onChangeText={(t) => setPassenger({ ...passenger, month: t })} />
                        <TextInput style={[styles.input, { flex: 0.3 }]} placeholder="Năm" keyboardType="numeric" onChangeText={(t) => setPassenger({ ...passenger, year: t })} />
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalPrice}>{calculateTotal().toLocaleString('vi-VN')} ₫</Text>
                    <Text style={styles.taxLabel}>Bao gồm thuế</Text>
                </View>
                <TouchableOpacity style={[styles.continueButton, loading && { opacity: 0.7 }]} onPress={handleContinue} disabled={loading}>
                    <Text style={styles.continueText}>{loading ? "Đang xử lý..." : "Tiếp tục"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default FlightDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
    card: { backgroundColor: Colors.white, borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
    requiredLabel: { fontSize: 13, color: Colors.price, marginBottom: 15, fontWeight: '500' },

    flightSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', padding: 10, borderRadius: 8 },
    flightRoute: { fontSize: 16, fontWeight: '600', marginLeft: 10, color: Colors.text },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: Colors.inputBg, color: Colors.text },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, padding: 15, paddingBottom: 30, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'line-through' }, // Example strikethrough logic (optional)
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.price },
    taxLabel: { fontSize: 11, color: Colors.textSecondary },
    continueButton: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    continueText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
