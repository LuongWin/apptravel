import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Modal, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useNavigation } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

import { ServiceTab } from '@/components/ServiceTab';
import { CustomInput } from '@/components/CustomInput';

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0', success: '#28a745',
};

const LOCATIONS = ['Hà Nội', 'Đà Nẵng', 'TP.HCM'];

const HotelSearchScreen = () => {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('hotels');
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

    // Tab Press Listener (optional reset logic kept from previous)
    useFocusEffect(
        useCallback(() => {
            // Placeholder for any specific focus logic
        }, [])
    );

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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <Stack.Screen options={{
                title: "Tìm Kiếm", headerLeft: () => null, headerTitleStyle: { fontWeight: 'bold' },
                headerShadowVisible: false, headerStyle: { backgroundColor: Colors.background }
            }} />

            {/* Top Tabs */}
            <View style={styles.tabContainer}>
                <ServiceTab label="Vé máy bay" icon="airplane" active={selectedTab === 'flights'} onPress={() => router.push('/(tabs)/flights')} />
                <ServiceTab label="Khách sạn" icon="business" active={selectedTab === 'hotels'} onPress={() => setSelectedTab('hotels')} />
                <ServiceTab label="Tour" icon="briefcase" active={selectedTab === 'tours'} onPress={() => setSelectedTab('tours')} />
            </View>

            {/* Search Form Card */}
            <View style={styles.card}>

                {/* Location Input with Dropdown */}
                <View style={{ zIndex: 10 }}>
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

                <View style={{ marginTop: 15, zIndex: 1 }}>
                    <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Ngày nhận phòng</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowCheckInPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={styles.inputText}>{format(checkInDate, 'dd/MM/yyyy')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 15, zIndex: 1 }}>
                    <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Ngày trả phòng</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowCheckOutPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={styles.inputText}>{format(checkOutDate, 'dd/MM/yyyy')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 15, zIndex: 1 }}>
                    <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Số khách</Text>
                    <View style={styles.guestCounter}>
                        <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={styles.counterBtn}>
                            <Ionicons name="remove" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.guestText}>{guestCount} Khách</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (guestCount >= 5) {
                                    Alert.alert("Thông báo", "Tối đa chỉ được đặt cho 5 người khách.");
                                } else {
                                    setGuestCount(guestCount + 1);
                                }
                            }}
                            style={styles.counterBtn}>
                            <Ionicons name="add" size={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
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
                                    <DateTimePicker value={checkInDate} mode="date" display="inline" onChange={onCheckInChange} minimumDate={new Date()} style={{ height: 320 }} themeVariant="light" accentColor={Colors.primary} textColor="black" />
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
                                    <DateTimePicker value={checkOutDate} mode="date" display="inline" onChange={onCheckOutChange} minimumDate={checkInDate} style={{ height: 320 }} themeVariant="light" accentColor={Colors.primary} textColor="black" />
                                </View>
                            </View>
                        </Modal>
                    </>
                )}
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Tìm Khách Sạn</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default HotelSearchScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 15, paddingTop: 60 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: '#eee', padding: 4, borderRadius: 12 },
    card: { backgroundColor: Colors.white, borderRadius: 16, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 15 },
    dateBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, height: 45, backgroundColor: Colors.white },
    inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
    inputText: { fontSize: 15, color: Colors.text, flex: 1 },
    searchButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10 },
    searchButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
    guestCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 5 },
    counterBtn: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
    guestText: { fontSize: 16, fontWeight: '600', color: Colors.text },

    // Dropdown Styles
    dropdownList: {
        position: 'absolute',
        top: 75, // Adjust based on input height
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
    dropdownText: {
        fontSize: 15,
        color: Colors.text,
        marginLeft: 4,
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, paddingBottom: 20, width: '100%', maxWidth: 350, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f9f9f9' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    doneText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
});
