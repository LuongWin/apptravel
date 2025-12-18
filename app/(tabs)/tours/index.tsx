import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTours } from '@/hooks/useTours';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ToursScreen() {
    const { tours, loading, fetchTours } = useTours();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchBar, setShowSearchBar] = useState(false);
    const searchBarHeight = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef<TextInput>(null);

    // Filter tours based on search query
    const filteredTours = tours.filter((tour) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            tour.name.toLowerCase().includes(query) ||
            tour.location?.toLowerCase().includes(query) ||
            tour.description?.toLowerCase().includes(query)
        );
    });

    // Auto refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchTours();
        }, [fetchTours])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTours();
        setRefreshing(false);
    };

    const toggleSearch = () => {
        if (showSearchBar) {
            // Hide search
            Animated.timing(searchBarHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setShowSearchBar(false);
                setSearchQuery('');
            });
        } else {
            // Show search
            setShowSearchBar(true);
            Animated.timing(searchBarHeight, {
                toValue: 60,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                searchInputRef.current?.focus();
            });
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + ' VND';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#FF6B9D';
            case 'upcoming':
                return '#8B7DD8';
            case 'completed':
                return '#4CAF50';
            case 'cancelled':
                return '#999';
            default:
                return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Hoạt động';
            case 'upcoming':
                return 'Sắp tới';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const renderTourCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: '/tours/detail',
                params: { tourId: item.id },
            })}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.cardDate}>
                    Ngày khởi hành: {formatDate(item.startDate)}
                </Text>
                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
                <Text style={styles.cardPrice}>Giá: {formatPrice(item.price)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="globe.asia.australia.fill" size={28} color="#5B7FFF" />
                    </View>
                    <Text style={styles.headerTitle}>Tours</Text>
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
                    <IconSymbol
                        name={showSearchBar ? "xmark" : "magnifyingglass"}
                        size={24}
                        color="#333"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {showSearchBar && (
                <Animated.View style={[styles.searchContainer, { height: searchBarHeight }]}>
                    <View style={styles.searchInputContainer}>
                        <IconSymbol name="magnifyingglass" size={20} color="#999" />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Tìm kiếm tour theo tên, địa điểm..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <IconSymbol name="xmark.circle.fill" size={20} color="#CCC" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            )}

            {/* Search Results Info */}
            {searchQuery.trim() && (
                <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultText}>
                        Tìm thấy {filteredTours.length} kết quả cho &quot;{searchQuery}&quot;
                    </Text>
                </View>
            )}

            <FlatList
                data={filteredTours}
                renderItem={renderTourCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading
                                ? 'Đang tải...'
                                : searchQuery.trim()
                                    ? 'Không tìm thấy tour nào'
                                    : 'Chưa có tour nào'
                            }
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#E8EEFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    searchButton: {
        padding: 8,
    },
    searchContainer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        overflow: 'hidden',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        padding: 0,
    },
    searchResultInfo: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    searchResultText: {
        fontSize: 14,
        color: '#666',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5B7FFF',
        marginBottom: 12,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5B7FFF',
        gap: 6,
    },
    editButtonText: {
        color: '#5B7FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#FF4757',
        gap: 6,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5B7FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});
