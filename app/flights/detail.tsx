import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '@/hooks/useBookings';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebaseConfig';
import { ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = {
    primary: '#0194F3', text: '#333', textSecondary: '#666', background: '#F5F5F5',
    white: '#FFFFFF', border: '#DDDDDD', price: '#d32f2f',
    inputBg: '#FAFAFA' // Slightly off-white for inputs
};

const FLIGHT_PLACEHOLDER = "https://via.placeholder.com/150?text=Flight+Logo"; // Fallback

const FlightDetailScreen = () => {
    const insets = useSafeAreaInsets();
    const { id, booking } = useLocalSearchParams<{ id: string; booking: string }>();
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const { createBooking, loading } = useBookings();

    // Success Modal State
    const [successModalVisible, setSuccessModalVisible] = useState(false);

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
            setContactInfo(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.displayName?.split(' ').pop() || '',
                lastName: user.displayName?.split(' ').slice(0, -1).join(' ') || '',
            }));
        }
    }, []);

    useEffect(() => {
        const fetchFlight = async () => {
            if (booking) {
                try {
                    const parsed = JSON.parse(booking);
                    setBookingDetails(parsed);
                    setLoadingData(false);
                } catch (e) {
                    console.error("Error parsing booking data", e);
                    Alert.alert("Lỗi", "Dữ liệu đặt vé không hợp lệ");
                    router.back();
                }
                return;
            }

            if (!id) return;
            try {
                setLoadingData(true);
                const docRef = doc(db, "FLIGHTS", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setBookingDetails({
                        outboundFlight: { id: docSnap.id, ...docSnap.data() },
                        returnFlight: null
                    });
                } else {
                    Alert.alert("Lỗi", "Chuyến bay không tồn tại.");
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching flight:", error);
                Alert.alert("Lỗi", "Không thể tải thông tin chuyến bay.");
            } finally {
                setLoadingData(false);
            }
        };

        fetchFlight();
    }, [id, booking]);

    const calculateTotal = () => {
        if (!bookingDetails) return 0;
        let total = bookingDetails.outboundFlight?.price || 0;
        // if (bookingDetails.returnFlight) {
        //     total += bookingDetails.returnFlight.price;
        // }
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

        // Logic fallback ảnh
        const flightInfo = bookingDetails.outboundFlight;
        const finalImage = flightInfo.airlineLogo && flightInfo.airlineLogo.length > 5
            ? flightInfo.airlineLogo
            : (flightInfo.image && flightInfo.image.length > 5 ? flightInfo.image : FLIGHT_PLACEHOLDER);

        // Construct Data
        const bookingData = {
            outboundFlightSnapshot: bookingDetails.outboundFlight,
            returnFlightSnapshot: bookingDetails.returnFlight,
            contactInfo: contactInfo,
            passengers: [{
                ...passenger,
                dateOfBirth: `${passenger.year}-${passenger.month}-${passenger.day}` // Simple formatting
            }],
            totalAmount: calculateTotal(),
            airlineLogo: finalImage, // NEW: Lưu ảnh trực tiếp vào đơn hàng
            bookingImage: finalImage // Redundant but safe
        };

        try {
            await createBooking(bookingData);
            setSuccessModalVisible(true);
        } catch (error) {
            // Error managed by hook/alert
        }
    };

    if (loadingData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!bookingDetails) return null;

    return (
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: Colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin đặt chỗ</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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

            {/* Success Modal */}
            <Modal
                visible={successModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                        </View>
                        <Text style={styles.successTitle}>Đặt vé thành công!</Text>
                        <Text style={styles.successMessage}>
                            Yêu cầu đặt vé của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                        </Text>
                        <View style={styles.successButtonGroup}>
                            <TouchableOpacity
                                style={styles.successButtonSecondary}
                                onPress={() => {
                                    setSuccessModalVisible(false);
                                    router.dismissAll();
                                    router.replace("/(tabs)/flights");
                                }}
                            >
                                <Text style={styles.successButtonSecondaryText}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.successButtonPrimary}
                                onPress={() => {
                                    setSuccessModalVisible(false);
                                    router.dismissAll();
                                    router.replace("/(tabs)/profile");
                                }}
                            >
                                <Text style={styles.successButtonPrimaryText}>Tiếp tục xem</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FlightDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 10 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },

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

    // Success Modal Styles
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { backgroundColor: 'white', borderRadius: 24, padding: 25, alignItems: 'center', width: '100%', maxWidth: 350, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
    successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
    successMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    successButtonGroup: { flexDirection: 'row', gap: 12, width: '100%' },
    successButtonSecondary: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
    successButtonSecondaryText: { color: '#666', fontSize: 16, fontWeight: '600' },
    successButtonPrimary: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#5B7FFF', alignItems: 'center' },
    successButtonPrimaryText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
