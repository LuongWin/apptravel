import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTours } from '@/hooks/useTours';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditTourScreen() {
    const { tourId } = useLocalSearchParams();
    const { tours, updateTour } = useTours();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        startDate: new Date(),
        endDate: new Date(),
        maxGuests: '',
        currentGuests: '0',
        image: '',
        location: '',
        status: 'upcoming' as 'active' | 'upcoming' | 'completed' | 'cancelled',
    });

    const [itinerary, setItinerary] = useState<string[]>(['']);
    const [included, setIncluded] = useState<string[]>(['']);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Load tour data
    useEffect(() => {
        const tour = tours.find((t) => t.id === tourId);
        if (tour) {
            setFormData({
                name: tour.name,
                description: tour.description || '',
                price: tour.price.toString(),
                duration: tour.duration.toString(),
                startDate: tour.startDate,
                endDate: tour.endDate,
                maxGuests: tour.maxGuests.toString(),
                currentGuests: tour.currentGuests.toString(),
                image: tour.image || '',
                location: tour.location,
                status: tour.status,
            });
            setItinerary(tour.itinerary && tour.itinerary.length > 0 ? tour.itinerary : ['']);
            setIncluded(tour.included && tour.included.length > 0 ? tour.included : ['']);
            setLoadingData(false);
        }
    }, [tourId, tours]);

    const handleAddItineraryDay = () => {
        setItinerary([...itinerary, '']);
    };

    const handleRemoveItineraryDay = (index: number) => {
        const newItinerary = itinerary.filter((_, i) => i !== index);
        setItinerary(newItinerary);
    };

    const handleItineraryChange = (index: number, value: string) => {
        const newItinerary = [...itinerary];
        newItinerary[index] = value;
        setItinerary(newItinerary);
    };

    const handleAddIncluded = () => {
        setIncluded([...included, '']);
    };

    const handleRemoveIncluded = (index: number) => {
        const newIncluded = included.filter((_, i) => i !== index);
        setIncluded(newIncluded);
    };

    const handleIncludedChange = (index: number, value: string) => {
        const newIncluded = [...included];
        newIncluded[index] = value;
        setIncluded(newIncluded);
    };

    const handleSubmit = async () => {
        // Validate
        if (!formData.name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên tour');
            return;
        }
        if (!formData.location.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa điểm');
            return;
        }
        if (!formData.price || isNaN(Number(formData.price))) {
            Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
            return;
        }
        if (!formData.duration || isNaN(Number(formData.duration))) {
            Alert.alert('Lỗi', 'Vui lòng nhập thời gian hợp lệ');
            return;
        }
        if (!formData.maxGuests || isNaN(Number(formData.maxGuests))) {
            Alert.alert('Lỗi', 'Vui lòng nhập số khách tối đa hợp lệ');
            return;
        }

        setLoading(true);

        try {
            const tourData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                duration: Number(formData.duration),
                startDate: formData.startDate,
                endDate: formData.endDate,
                maxGuests: Number(formData.maxGuests),
                currentGuests: Number(formData.currentGuests),
                image: formData.image.trim() || 'https://via.placeholder.com/400x300',
                location: formData.location.trim(),
                itinerary: itinerary.filter((item) => item.trim() !== ''),
                included: included.filter((item) => item.trim() !== ''),
                status: formData.status,
            };

            await updateTour(tourId as string, tourData);
            // Wait a bit for Firebase to propagate changes
            await new Promise(resolve => setTimeout(resolve, 500));
            Alert.alert('Thành công', 'Đã cập nhật tour thành công!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật tour');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#5B7FFF" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa Tour</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.label}>Tên tour *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tên tour"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Địa điểm *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: Hạ Long, Đà Lạt..."
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mô tả về tour"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Giá (VND) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Thời gian (ngày) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={formData.duration}
                            onChangeText={(text) => setFormData({ ...formData, duration: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Ngày khởi hành *</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <IconSymbol name="calendar" size={20} color="#666" />
                        <Text style={styles.dateText}>
                            {formData.startDate.toLocaleDateString('vi-VN')}
                        </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={formData.startDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowStartDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    setFormData({ ...formData, startDate: selectedDate });
                                }
                            }}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Ngày kết thúc *</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <IconSymbol name="calendar" size={20} color="#666" />
                        <Text style={styles.dateText}>
                            {formData.endDate.toLocaleDateString('vi-VN')}
                        </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                        <DateTimePicker
                            value={formData.endDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowEndDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    setFormData({ ...formData, endDate: selectedDate });
                                }
                            }}
                        />
                    )}
                </View>

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Số khách tối đa *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={formData.maxGuests}
                            onChangeText={(text) => setFormData({ ...formData, maxGuests: text })}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Đã đăng ký</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={formData.currentGuests}
                            onChangeText={(text) => setFormData({ ...formData, currentGuests: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Trạng thái</Text>
                    <View style={styles.statusContainer}>
                        {(['active', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    formData.status === status && styles.statusButtonActive,
                                ]}
                                onPress={() => setFormData({ ...formData, status })}
                            >
                                <Text
                                    style={[
                                        styles.statusButtonText,
                                        formData.status === status && styles.statusButtonTextActive,
                                    ]}
                                >
                                    {status === 'active' && 'Hoạt động'}
                                    {status === 'upcoming' && 'Sắp tới'}
                                    {status === 'completed' && 'Hoàn thành'}
                                    {status === 'cancelled' && 'Đã hủy'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>URL hình ảnh</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://..."
                        value={formData.image}
                        onChangeText={(text) => setFormData({ ...formData, image: text })}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.label}>Lịch trình</Text>
                        <TouchableOpacity onPress={handleAddItineraryDay}>
                            <IconSymbol name="plus.circle.fill" size={24} color="#5B7FFF" />
                        </TouchableOpacity>
                    </View>
                    {itinerary.map((item, index) => (
                        <View key={index} style={styles.dynamicField}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder={`Ngày ${index + 1}`}
                                value={item}
                                onChangeText={(text) => handleItineraryChange(index, text)}
                                multiline
                            />
                            {itinerary.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveItineraryDay(index)}>
                                    <IconSymbol name="minus.circle.fill" size={24} color="#FF4757" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.label}>Dịch vụ bao gồm</Text>
                        <TouchableOpacity onPress={handleAddIncluded}>
                            <IconSymbol name="plus.circle.fill" size={24} color="#5B7FFF" />
                        </TouchableOpacity>
                    </View>
                    {included.map((item, index) => (
                        <View key={index} style={styles.dynamicField}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Dịch vụ..."
                                value={item}
                                onChangeText={(text) => handleIncludedChange(index, text)}
                            />
                            {included.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemoveIncluded(index)}>
                                    <IconSymbol name="minus.circle.fill" size={24} color="#FF4757" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Đang xử lý...' : 'Cập nhật Tour'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
    },
    statusButtonActive: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    statusButtonText: {
        fontSize: 14,
        color: '#666',
    },
    statusButtonTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    dynamicField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    submitButton: {
        backgroundColor: '#5B7FFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
