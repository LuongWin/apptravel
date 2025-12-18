import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Modal, Alert, ImageBackground, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useNavigation } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { CustomInput } from '@/components/CustomInput';

const Colors = {
    primary: '#0194F3', // Traveloka Blue
    orange: '#FF5E1F',
    text: '#333',
    textSecondary: '#666',
    white: '#FFFFFF',
    border: '#E0E0E0',
    overlay: 'rgba(0,0,0,0.3)', // Updated opacity to 0.3
    cardBg: 'rgba(255,255,255,0.95)',
    success: '#28a745',
};

const LOCATIONS = ['Hà Nội', 'Đà Nẵng', 'TP.HCM'];

const HotelSearchScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [city, setCity] = useState('Đà Nẵng');
    const [showLocations, setShowLocations] = useState(false); // Dropdown visibility

    const [checkInDate, setCheckInDate] = useState<Date>(new Date());
    const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    });

    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [guestCount, setGuestCount] = useState(2);

    const handleSearch = () => {
        if (!city) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn địa điểm.");
            return;
        }

        router.push({
            pathname: '/hotels/results',
            params: {
                city,
                checkInDate: checkInDate.toISOString(),
                checkOutDate: checkOutDate.toISOString(),
                guestCount: guestCount.toString(),
            }
        });
    };

    const handleSelectLocation = (loc: string) => {
        setCity(loc);
        setShowLocations(false);
    };

    const onCheckInChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowCheckInPicker(false);
        if (selectedDate) {
            setCheckInDate(selectedDate);
            if (selectedDate >= checkOutDate) {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(selectedDate.getDate() + 1);
                setCheckOutDate(nextDay);
            }
        }
    };

    const onCheckOutChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowCheckOutPicker(false);
        if (selectedDate) setCheckOutDate(selectedDate);
    };

    return (
        <ImageBackground source={require('../../../assets/images/khungcanh.jpg')} style={styles.backgroundImage} resizeMode="cover">
            {/* Dark Overlay using absolute fill as requested */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.overlay }]} />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <Stack.Screen options={{ headerShown: false }} />

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* Header Text */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>Khám phá điểm đến</Text>
                            <Text style={styles.headerSubtitle}>Tìm kiếm khách sạn, resort, homestay giá tốt nhất</Text>
                        </View>

                        {/* Search Form Card */}
                        <View style={styles.card}>

                            {/* Location Input with Dropdown */}
                            <View style={{ zIndex: 10, marginBottom: 15 }}>
                                <CustomInput
                                    label="Địa điểm"
                                    iconName="location-outline"
                                    placeholder="Bạn muốn đi đâu?"
                                    value={city}
                                    onPress={() => setShowLocations(!showLocations)}
                                />

                                {showLocations && (
                                    <View style={styles.dropdownList}>
                                        {LOCATIONS.map((loc, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.dropdownItem}
                                                onPress={() => handleSelectLocation(loc)}
                                            >
                                                <Ionicons name="location-sharp" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                                                <Text style={styles.dropdownText}>{loc}</Text>
                                                {city === loc && <Ionicons name="checkmark" size={16} color={Colors.success} style={{ marginLeft: 'auto' }} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={{ marginBottom: 15 }}>
                                <TouchableOpacity style={styles.dateBox} onPress={() => setShowCheckInPicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                                    <View>
                                        <Text style={styles.dateLabel}>Ngày nhận phòng</Text>
                                        <Text style={styles.inputText}>{format(checkInDate, 'dd/MM/yyyy')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginBottom: 10 }}>
                                <TouchableOpacity style={styles.dateBox} onPress={() => setShowCheckOutPicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                                    <View>
                                        <Text style={styles.dateLabel}>Ngày trả phòng</Text>
                                        <Text style={styles.inputText}>{format(checkOutDate, 'dd/MM/yyyy')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Date Pickers */}
                            {Platform.OS === 'android' && showCheckInPicker && (
                                <DateTimePicker value={checkInDate} mode="date" display="default" onChange={onCheckInChange} minimumDate={new Date()} />
                            )}
                            {Platform.OS === 'android' && showCheckOutPicker && (
                                <DateTimePicker value={checkOutDate} mode="date" display="default" onChange={onCheckOutChange} minimumDate={checkInDate} />
                            )}

                            {/* iOS Modal Pickers */}
                            {Platform.OS === 'ios' && (
                                <>
                                    <Modal visible={showCheckInPicker} transparent={true} animationType="fade">
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <Text style={styles.modalTitle}>Ngày nhận phòng</Text>
                                                    <TouchableOpacity onPress={() => setShowCheckInPicker(false)}><Text style={styles.doneText}>Xong</Text></TouchableOpacity>
                                                </View>
                                                <DateTimePicker value={checkInDate} mode="date" display="inline" onChange={onCheckInChange} minimumDate={new Date()} style={styles.datePicker} themeVariant="light" accentColor={Colors.primary} />
                                            </View>
                                        </View>
                                    </Modal>
                                    <Modal visible={showCheckOutPicker} transparent={true} animationType="fade">
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <Text style={styles.modalTitle}>Ngày trả phòng</Text>
                                                    <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}><Text style={styles.doneText}>Xong</Text></TouchableOpacity>
                                                </View>
                                                <DateTimePicker value={checkOutDate} mode="date" display="inline" onChange={onCheckOutChange} minimumDate={checkInDate} style={styles.datePicker} themeVariant="light" accentColor={Colors.primary} />
                                            </View>
                                        </View>
                                    </Modal>
                                </>
                            )}

                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Text style={styles.searchButtonText}>Tìm Khách Sạn</Text>
                                <Ionicons name="search" size={20} color="white" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default HotelSearchScreen;

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    headerContainer: { marginTop: 10, marginBottom: 30 }, // Reduced margin top
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.white, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

    card: { backgroundColor: Colors.cardBg, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },

    dateBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, backgroundColor: Colors.white },
    dateLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
    inputText: { fontSize: 15, fontWeight: '600', color: Colors.text },

    searchButton: { flexDirection: 'row', backgroundColor: Colors.orange, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 25, shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    searchButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },

    // Dropdown Styles
    dropdownList: {
        position: 'absolute',
        top: 80, // Adjust based on input height
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 5,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 100,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dropdownText: { fontSize: 15, color: Colors.text, marginLeft: 4 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, paddingBottom: 20, width: '100%', maxWidth: 350, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#FAFAFA' },
    modalTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
    doneText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
    datePicker: { height: 320, width: '100%' },
});
