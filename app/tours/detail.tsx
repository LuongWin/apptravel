import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTourBookings } from '@/hooks/useBookings';
import { useTours } from '@/hooks/useTours';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TourDetailScreen() {
    const { tourId } = useLocalSearchParams();
    const { tours, fetchTours } = useTours();
    const { createTourBooking, loading: bookingLoading } = useTourBookings();
    const [tour, setTour] = useState<any>(null);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [adultCount, setAdultCount] = useState(2);
    const [childCount, setChildCount] = useState(0);
    const [infantCount, setInfantCount] = useState(0);

    // Auto refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchTours();
        }, [fetchTours])
    );

    useEffect(() => {
        const foundTour = tours.find((t) => t.id === tourId);
        setTour(foundTour);
    }, [tourId, tours]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + ' VND';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + (i * 15));
            dates.push({
                display: `${date.getDate()}/${date.getMonth() + 1}`,
                full: date.toLocaleDateString('vi-VN')
            });
        }
        return dates;
    };

    const calculateTotalPrice = () => {
        if (!tour) return 0;
        const adultPrice = tour.price;
        const childPrice = tour.price * 0.7;
        const infantPrice = tour.price * 0.3;
        return (adultCount * adultPrice) + (childCount * childPrice) + (infantCount * infantPrice);
    };

    const handleBooking = () => {
        if (!tour) return;
        setBookingModalVisible(true);
        if (!selectedDate && getAvailableDates().length > 0) {
            setSelectedDate(getAvailableDates()[0].full);
        }
    };

    const handleConfirmBooking = async () => {
        if (!tour || !selectedDate) return;

        try {
            await createTourBooking({
                tourId: tour.id,
                tourName: tour.name,
                selectedDate: selectedDate,
                adultCount: adultCount,
                childCount: childCount,
                infantCount: infantCount,
                totalAmount: calculateTotalPrice(),
            });

            setBookingModalVisible(false);
            setSuccessModalVisible(true);

            // Reset form
            setTimeout(() => {
                setAdultCount(2);
                setChildCount(0);
                setInfantCount(0);
                setSelectedDate('');
            }, 500);
        } catch (err) {
            console.error('Booking error:', err);
            Alert.alert(
                'Lỗi',
                'Không thể tạo đơn đặt tour. Vui lòng thử lại.',
                [{ text: 'OK' }]
            );
        }
    };

    if (!tour) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scrollView}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: tour.image }}
                        style={styles.headerImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <IconSymbol name="chevron.left" size={24} color="#FFF" />
                    </TouchableOpacity>

                    {/* Price Badge */}
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceBadgeText}>
                            KH {formatDate(tour.startDate).split('/')[0]} {formatDate(tour.startDate).split('/')[1]} | {formatPrice(tour.price).replace(' VND', '')}/khách
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{tour.name}</Text>

                    {/* Departure Info */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <IconSymbol name="paperplane" size={18} color="#666" />
                            <Text style={styles.infoText}>Khởi hành từ: </Text>
                            <Text style={styles.infoValue}>{tour.location}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <IconSymbol name="ticket" size={18} color="#666" />
                            <Text style={styles.infoText}>Mã Tour: </Text>
                            <Text style={styles.infoValue}>TO{Math.floor(Math.random() * 90000) + 10000}</Text>
                        </View>
                    </View>

                    {/* Tour Package Includes */}
                    <View style={styles.packageSection}>
                        <Text style={styles.packageTitle}>Tour Trọn Gói bao gồm</Text>
                        <View style={styles.packageGrid}>
                            {tour.included && tour.included.slice(0, 6).map((item: string, index: number) => (
                                <View key={index} style={styles.packageItem}>
                                    <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                    <Text style={styles.packageText}>{item}</Text>
                                </View>
                            ))}
                            {(!tour.included || tour.included.length === 0) && (
                                <>
                                    <View style={styles.packageItem}>
                                        <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                        <Text style={styles.packageText}>Du thuyền tham quan</Text>
                                    </View>
                                    <View style={styles.packageItem}>
                                        <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                        <Text style={styles.packageText}>Vé máy bay</Text>
                                    </View>
                                    <View style={styles.packageItem}>
                                        <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                        <Text style={styles.packageText}>Khách sạn 3-4*</Text>
                                    </View>
                                    <View style={styles.packageItem}>
                                        <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                        <Text style={styles.packageText}>Hướng dẫn viên</Text>
                                    </View>
                                    <View style={styles.packageItem}>
                                        <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
                                        <Text style={styles.packageText}>Bảo hiểm du lịch</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Experience Section */}
                    {tour.itinerary && tour.itinerary.length > 0 && (
                        <View style={styles.experienceSection}>
                            <Text style={styles.experienceTitle}>Trải nghiệm thú vị trong tour</Text>
                            {tour.itinerary.map((item: string, index: number) => (
                                <View key={index} style={styles.experienceItem}>
                                    <Text style={styles.experienceBullet}>-</Text>
                                    <Text style={styles.experienceText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Description */}
                    {tour.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionTitle}>Mô tả chi tiết</Text>
                            <Text style={styles.descriptionText}>{tour.description}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Booking Button */}
            <View style={styles.bookingFooter}>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Từ</Text>
                    <Text style={styles.priceAmount}>{formatPrice(tour.price)}</Text>
                </View>
                <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
                    <Text style={styles.bookingButtonText}>Đặt vé</Text>
                </TouchableOpacity>
            </View>

            {/* Booking Modal */}
            <Modal
                visible={bookingModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setBookingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Lịch Trình và Giá Tour</Text>
                            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                                <IconSymbol name="xmark" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScrollView}>
                            {/* Date Selection */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionLabel}>Chọn Lịch Trình và Xem Giá</Text>
                                <View style={styles.dateButtons}>
                                    {getAvailableDates().map((date, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dateButton,
                                                selectedDate === date.full && styles.dateButtonActive
                                            ]}
                                            onPress={() => setSelectedDate(date.full)}
                                        >
                                            <Text style={[
                                                styles.dateButtonText,
                                                selectedDate === date.full && styles.dateButtonTextActive
                                            ]}>{date.display}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.dateButton}>
                                        <IconSymbol name="calendar" size={16} color="#333" />
                                        <Text style={styles.dateButtonText}>Tất cả</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Guest Selection */}
                            <View style={styles.guestSection}>
                                {/* Adults */}
                                <View style={styles.guestRow}>
                                    <View style={styles.guestInfo}>
                                        <Text style={styles.guestLabel}>Người lớn</Text>
                                        <Text style={styles.guestSubLabel}>{'> 10 tuổi'}</Text>
                                    </View>
                                    <View style={styles.guestPriceContainer}>
                                        <Text style={styles.guestPrice}>× {formatPrice(tour.price)}</Text>
                                        <View style={styles.counterContainer}>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setAdultCount(Math.max(1, adultCount - 1))}
                                            >
                                                <Text style={styles.counterButtonText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.counterText}>{adultCount}</Text>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setAdultCount(adultCount + 1)}
                                            >
                                                <Text style={styles.counterButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Children */}
                                <View style={styles.guestRow}>
                                    <View style={styles.guestInfo}>
                                        <Text style={styles.guestLabel}>Trẻ em</Text>
                                        <Text style={styles.guestSubLabel}>2 - 10 tuổi</Text>
                                    </View>
                                    <View style={styles.guestPriceContainer}>
                                        <View style={styles.counterContainer}>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setChildCount(Math.max(0, childCount - 1))}
                                            >
                                                <Text style={styles.counterButtonText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.counterText}>{childCount}</Text>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setChildCount(childCount + 1)}
                                            >
                                                <Text style={styles.counterButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Infants */}
                                <View style={styles.guestRow}>
                                    <View style={styles.guestInfo}>
                                        <Text style={styles.guestLabel}>Trẻ nhỏ</Text>
                                        <Text style={styles.guestSubLabel}>{'< 2 tuổi'}</Text>
                                    </View>
                                    <View style={styles.guestPriceContainer}>
                                        <View style={styles.counterContainer}>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setInfantCount(Math.max(0, infantCount - 1))}
                                            >
                                                <Text style={styles.counterButtonText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.counterText}>{infantCount}</Text>
                                            <TouchableOpacity
                                                style={styles.counterButton}
                                                onPress={() => setInfantCount(infantCount + 1)}
                                            >
                                                <Text style={styles.counterButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Contact Link */}
                            <TouchableOpacity style={styles.contactLink}>
                                <IconSymbol name="info.circle" size={16} color="#5B7FFF" />
                                <Text style={styles.contactLinkText}>Liên hệ để xác nhận chỗ</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Total and Book Button */}
                        <View style={styles.modalFooter}>
                            <View>
                                <Text style={styles.totalLabel}>Tổng Giá Tour</Text>
                                <Text style={styles.totalAmount}>{calculateTotalPrice().toLocaleString('vi-VN')} đ</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.requestButton, bookingLoading && styles.requestButtonDisabled]}
                                onPress={handleConfirmBooking}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.requestButtonText}>Yêu cầu đặt</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                            <IconSymbol name="checkmark.circle.fill" size={60} color="#4CAF50" />
                        </View>
                        <Text style={styles.successTitle}>Đặt tour thành công!</Text>
                        <Text style={styles.successMessage}>
                            Yêu cầu đặt tour của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                        </Text>
                        <View style={styles.successButtonGroup}>
                            <TouchableOpacity
                                style={styles.successButtonSecondary}
                                onPress={() => {
                                    setSuccessModalVisible(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.successButtonSecondaryText}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.successButtonPrimary}
                                onPress={() => {
                                    setSuccessModalVisible(false);
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: 300,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#FF4757',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    priceBadgeText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    location: {
        fontSize: 16,
        color: '#666',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#666',
    },
    packageSection: {
        marginBottom: 24,
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    packageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    packageItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8F9FF',
        padding: 12,
        borderRadius: 8,
    },
    packageText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    experienceSection: {
        marginBottom: 24,
    },
    experienceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    experienceItem: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    experienceBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#5B7FFF',
        marginTop: 6,
    },
    experienceText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        flex: 1,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    bookingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    priceAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF4757',
    },
    bookingButton: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    bookingButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalScrollView: {
        padding: 16,
    },
    dateSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    dateButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
        gap: 4,
    },
    dateButtonActive: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    dateButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dateButtonTextActive: {
        color: '#FFF',
    },
    guestSection: {
        marginBottom: 16,
    },
    guestRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    guestInfo: {
        flex: 1,
    },
    guestLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    guestSubLabel: {
        fontSize: 12,
        color: '#999',
    },
    guestPriceContainer: {
        alignItems: 'flex-end',
    },
    guestPrice: {
        fontSize: 14,
        color: '#FF4757',
        fontWeight: '600',
        marginBottom: 8,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    counterButtonText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    counterText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        minWidth: 24,
        textAlign: 'center',
    },
    contactLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    contactLinkText: {
        fontSize: 14,
        color: '#5B7FFF',
        textDecorationLine: 'underline',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        backgroundColor: '#FFF',
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF9500',
    },
    requestButton: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    requestButtonDisabled: {
        backgroundColor: '#FFB84D',
        opacity: 0.7,
    },
    requestButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    successIconContainer: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    successButtonGroup: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    successButtonPrimary: {
        flex: 1,
        backgroundColor: '#5B7FFF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    successButtonPrimaryText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    successButtonSecondary: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    successButtonSecondaryText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
    },
});
