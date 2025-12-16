// app/(tabs)/flights/index.tsx (CHỈ CÒN FORM VÀ ROUTER PUSH)

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import Component đã tách
import { ServiceTab } from '@/components/ServiceTab';
import { CustomInput } from '@/components/CustomInput';

// *** Đã loại bỏ: useFlights, FlightCard, và logic liên quan đến kết quả ***

const Colors = {
    primary: '#5B37B7', text: '#333', textSecondary: '#666', background: '#F9F9F9',
    white: '#FFFFFF', border: '#E0E0E0',
};

const FlightSearchScreen = () => {
    const [selectedTab, setSelectedTab] = useState('flights');
    const [from, setFrom] = useState('Hà Nội (HAN)');
    const [to, setTo] = useState('TP. HCM (SGN)');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [departDate, setDepartDate] = useState<Date>(new Date());
    const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
    const [showDepartPicker, setShowDepartPicker] = useState(false);
    const [showReturnPicker, setShowReturnPicker] = useState(false);

    // Hàm lấy mã sân bay
    const getCode = (str: string) => {
        const match = str.match(/\((.*?)\)/);
        return match ? match[1] : str;
    };

    // --- Handler Tìm kiếm: CHUYỂN SANG ROUTER PUSH ---
    const handleSearch = () => {
        if (!from || !to || !departDate) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ điểm đi, điểm đến và ngày bay.");
            return;
        }
        if (isRoundTrip && !returnDate) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn ngày về cho chuyến bay khứ hồi.");
            return;
        }

        const fromCode = getCode(from);
        const toCode = getCode(to);

        // Dùng Router để chuyển hướng đến màn hình results.tsx
        router.push({
            pathname: '/results/flight',
            params: {
                from: fromCode,
                to: toCode,
                departDate: departDate.toISOString(),
                isRoundTrip: isRoundTrip.toString(),
                returnDate: returnDate ? returnDate.toISOString() : undefined,
                // Thêm tên thành phố đầy đủ để hiển thị trong header của results.tsx
                fromName: from.replace(/\s*\([^)]*\)/, ''),
                toName: to.replace(/\s*\([^)]*\)/, ''),
            },
        });
    };

    // --- Handlers Date Picker ---
    const onDepartChange = (event: any, selectedDate?: Date) => {
        setShowDepartPicker(false);
        if (selectedDate) {
            setDepartDate(selectedDate);
            if (returnDate && selectedDate > returnDate) {
                setReturnDate(undefined);
            }
        }
    };

    const onReturnChange = (event: any, selectedDate?: Date) => {
        setShowReturnPicker(false);
        if (selectedDate) {
            setReturnDate(selectedDate);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{
                title: "Tìm kiếm", headerLeft: () => null, headerTitleStyle: { fontWeight: 'bold' },
                headerShadowVisible: false, headerStyle: { backgroundColor: Colors.background }
            }} />

            {/* Top Tabs */}
            <View style={styles.tabContainer}>
                <ServiceTab label="Vé máy bay" icon="airplane" active={selectedTab === 'flights'} onPress={() => setSelectedTab('flights')} />
                <ServiceTab label="Khách sạn" icon="business" active={selectedTab === 'hotels'} onPress={() => setSelectedTab('hotels')} />
                <ServiceTab label="Tour" icon="briefcase" active={selectedTab === 'tours'} onPress={() => setSelectedTab('tours')} />
            </View>

            {/* Main Card (Form) */}
            <View style={styles.card}>
                <CustomInput
                    label="Điểm đi" iconName="arrow-back-outline" placeholder="Chọn điểm khởi hành" value={from}
                    onPress={() => setFrom(from === 'Hà Nội (HAN)' ? 'Đà Nẵng (DAD)' : 'Hà Nội (HAN)')}
                />
                <CustomInput
                    label="Điểm đến" iconName="arrow-forward-outline" placeholder="Chọn điểm đến" value={to}
                    onPress={() => setTo(to === 'TP. HCM (SGN)' ? 'Đà Nẵng (DAD)' : 'TP. HCM (SGN)')}
                />

                <View style={styles.rowBetween}>
                    <Text style={styles.inputLabel}>Ngày bay</Text>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Khứ hồi?</Text>
                        <Switch trackColor={{ false: '#767577', true: Colors.primary }} thumbColor={Colors.white}
                            onValueChange={(val) => { setIsRoundTrip(val); if (!val) setReturnDate(undefined); }} value={isRoundTrip}
                        />
                    </View>
                </View>

                {/* Date Selection */}
                <TouchableOpacity style={styles.dateBox} onPress={() => setShowDepartPicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={styles.inputText}>{departDate ? format(departDate, 'dd/MM/yyyy') : 'Chọn ngày đi'}</Text>
                </TouchableOpacity>

                {isRoundTrip && (
                    <View style={{ marginTop: 15 }}>
                        <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Ngày Về</Text>
                        <TouchableOpacity style={styles.dateBox} onPress={() => setShowReturnPicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                            <Text style={styles.inputText}>{returnDate ? format(returnDate, 'dd/MM/yyyy') : 'Chọn ngày về'}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* DateTimePickers (Đã chuyển sang display="default") */}
                {showDepartPicker && (<DateTimePicker value={departDate} mode="date" display="default" onChange={onDepartChange} minimumDate={new Date()} />)}
                {showReturnPicker && (<DateTimePicker value={returnDate || new Date(departDate)} mode="date" display="default" onChange={onReturnChange} minimumDate={departDate} />)}

            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default FlightSearchScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 15, paddingTop: 60 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: '#eee', padding: 4, borderRadius: 12 },
    card: { backgroundColor: Colors.white, borderRadius: 16, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 15 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 4 },
    switchContainer: { flexDirection: 'row', alignItems: 'center' },
    switchLabel: { fontSize: 12, color: Colors.textSecondary, marginRight: 8 },
    dateBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, height: 45, backgroundColor: Colors.white },
    inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
    inputText: { fontSize: 15, color: Colors.text, flex: 1 },
    searchButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10 },
    searchButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});