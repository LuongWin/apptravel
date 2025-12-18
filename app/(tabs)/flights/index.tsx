import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Alert, ScrollView, Platform, Modal, ImageBackground, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

// Import Component đã tách
import { CustomInput } from '@/components/CustomInput';

const { width } = Dimensions.get('window');

const Colors = {
    primary: '#0194F3', // Traveloka Blue
    orange: '#FF5E1F',
    text: '#333',
    textSecondary: '#666',
    white: '#FFFFFF',
    border: '#E0E0E0',
    overlay: 'rgba(0,0,0,0.3)', // Updated opacity to 0.3 as requested
    cardBg: 'rgba(255,255,255,0.95)',
    success: '#28a745',
};

const AIRPORTS = ['Hà Nội (HAN)', 'TP. HCM (SGN)', 'Đà Nẵng (DAD)', 'Nha Trang (CXR)', 'Phú Quốc (PQC)'];

const FlightSearchScreen = () => {
    const insets = useSafeAreaInsets();
    const [from, setFrom] = useState('Hà Nội (HAN)');
    const [to, setTo] = useState('TP. HCM (SGN)');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [departDate, setDepartDate] = useState<Date>(new Date());
    const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
    const [showDepartPicker, setShowDepartPicker] = useState(false);
    const [showReturnPicker, setShowReturnPicker] = useState(false);

    // Dropdown visibility state
    const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);

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
            pathname: '/flights/results',
            params: {
                from: fromCode,
                to: toCode,
                departDate: departDate.toISOString(),
                isRoundTrip: isRoundTrip.toString(),
                returnDate: returnDate ? returnDate.toISOString() : undefined,
                fromName: from.replace(/\s*\([^)]*\)/, ''),
                toName: to.replace(/\s*\([^)]*\)/, ''),
            },
        });
    };

    const handleSelectLocation = (loc: string, type: 'from' | 'to') => {
        if (type === 'from') setFrom(loc);
        else setTo(loc);
        setActiveDropdown(null);
    };

    const onDepartChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDepartPicker(false);
        if (selectedDate) {
            setDepartDate(selectedDate);
            if (returnDate && selectedDate > returnDate) {
                setReturnDate(undefined);
            }
        }
    };

    const onReturnChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowReturnPicker(false);
        if (selectedDate) setReturnDate(selectedDate);
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
                            <Text style={styles.headerTitle}>Tìm chuyến bay giá rẻ</Text>
                            <Text style={styles.headerSubtitle}>Khám phá những chân trời mới ngay hôm nay</Text>
                        </View>

                        {/* Main Form Card */}
                        <View style={styles.card}>

                            {/* FROM input */}
                            <View style={{ zIndex: 20 }}>
                                <CustomInput
                                    label="Điểm đi" iconName="airplane-outline" placeholder="Chọn điểm khởi hành" value={from}
                                    onPress={() => setActiveDropdown(activeDropdown === 'from' ? null : 'from')}
                                />
                                {activeDropdown === 'from' && (
                                    <View style={styles.dropdownList}>
                                        {AIRPORTS.map((loc, index) => (
                                            <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => handleSelectLocation(loc, 'from')}>
                                                <Ionicons name="airplane" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                                                <Text style={styles.dropdownText}>{loc}</Text>
                                                {from === loc && <Ionicons name="checkmark" size={16} color={Colors.success} style={{ marginLeft: 'auto' }} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.divider} />

                            {/* TO input */}
                            <View style={{ zIndex: 10 }}>
                                <CustomInput
                                    label="Điểm đến" iconName="location-outline" placeholder="Chọn điểm đến" value={to}
                                    onPress={() => setActiveDropdown(activeDropdown === 'to' ? null : 'to')}
                                />
                                {activeDropdown === 'to' && (
                                    <View style={styles.dropdownList}>
                                        {AIRPORTS.map((loc, index) => (
                                            <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => handleSelectLocation(loc, 'to')}>
                                                <Ionicons name="location-sharp" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                                                <Text style={styles.dropdownText}>{loc}</Text>
                                                {to === loc && <Ionicons name="checkmark" size={16} color={Colors.success} style={{ marginLeft: 'auto' }} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>


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
                                <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                                <View>
                                    <Text style={styles.dateLabel}>Ngày đi</Text>
                                    <Text style={styles.inputText}>{departDate ? format(departDate, 'dd/MM/yyyy') : 'Chọn ngày'}</Text>
                                </View>
                            </TouchableOpacity>

                            {isRoundTrip && (
                                <TouchableOpacity style={[styles.dateBox, { marginTop: 10 }]} onPress={() => setShowReturnPicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                                    <View>
                                        <Text style={styles.dateLabel}>Ngày về</Text>
                                        <Text style={styles.inputText}>{returnDate ? format(returnDate, 'dd/MM/yyyy') : 'Chọn ngày'}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* DateTimePickers */}
                            {/* Android */}
                            {Platform.OS === 'android' && showDepartPicker && (
                                <DateTimePicker value={departDate} mode="date" display="default" onChange={onDepartChange} minimumDate={new Date()} />
                            )}
                            {Platform.OS === 'android' && showReturnPicker && (
                                <DateTimePicker value={returnDate || new Date(departDate)} mode="date" display="default" onChange={onReturnChange} minimumDate={departDate} />
                            )}

                            {/* iOS */}
                            {Platform.OS === 'ios' && (
                                <>
                                    <Modal visible={showDepartPicker} transparent={true} animationType="fade">
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <Text style={styles.modalTitle}>Chọn ngày đi</Text>
                                                    <TouchableOpacity onPress={() => setShowDepartPicker(false)}><Text style={styles.doneText}>Xong</Text></TouchableOpacity>
                                                </View>
                                                <DateTimePicker value={departDate} mode="date" display="inline" onChange={onDepartChange} minimumDate={new Date()} style={styles.datePicker} themeVariant="light" accentColor={Colors.primary} />
                                            </View>
                                        </View>
                                    </Modal>
                                    <Modal visible={showReturnPicker} transparent={true} animationType="fade">
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <Text style={styles.modalTitle}>Chọn ngày về</Text>
                                                    <TouchableOpacity onPress={() => setShowReturnPicker(false)}><Text style={styles.doneText}>Xong</Text></TouchableOpacity>
                                                </View>
                                                <DateTimePicker value={returnDate || new Date(departDate)} mode="date" display="inline" onChange={onReturnChange} minimumDate={departDate} style={styles.datePicker} themeVariant="light" accentColor={Colors.primary} />
                                            </View>
                                        </View>
                                    </Modal>
                                </>
                            )}

                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                                <Ionicons name="search" size={20} color="white" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default FlightSearchScreen;

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    headerContainer: { marginTop: 10, marginBottom: 30 }, // Reduced margin top as SafeAreaView handles it
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.white, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

    card: { backgroundColor: Colors.cardBg, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },

    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 15 },
    switchContainer: { flexDirection: 'row', alignItems: 'center' },
    switchLabel: { fontSize: 14, color: Colors.textSecondary, marginRight: 8, fontWeight: '600' },
    inputLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.text },

    dateBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, backgroundColor: Colors.white },
    dateLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
    inputText: { fontSize: 15, fontWeight: '600', color: Colors.text },

    searchButton: { flexDirection: 'row', backgroundColor: Colors.orange, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 25, shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    searchButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },

    // Dropdown Styles
    dropdownList: {
        position: 'absolute',
        top: 75,
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
    doneText: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
    datePicker: { height: 320, width: '100%' },
});