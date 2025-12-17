import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flight } from '@/hooks/useFlights';
import { format } from 'date-fns';

const Colors = {
    primary: '#5B37B7',
    secondary: '#E0C6FF', // Light purple for badges
    text: '#1F2937',
    textGray: '#6B7280',
    white: '#FFFFFF',
    border: '#F3F4F6',
    price: '#4F46E5', // Distinct blue-purple for price
    success: '#10B981',
};

const FlightCard = ({ flight, onBookPress }: { flight: Flight, onBookPress: (flight: Flight) => void }) => {
    const departTime = format(flight.departAt, 'HH:mm');
    const arriveTime = format(flight.arriveAt, 'HH:mm');
    const priceText = flight.price.toLocaleString('vi-VN');

    // MOCK DATA REMOVED: No random seats generation.
    // Ticket Class is static for now as it's not in DB, but serves as UI decoration.
    const ticketClass = "Phổ thông";

    return (
        <View style={styles.card}>
            {/* Top Row: Airline & Badge */}
            <View style={styles.headerRow}>
                <View style={styles.airlineInfo}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="airplane" size={16} color={Colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.flightCode}>{flight.airline} {flight.flightNumber}</Text>
                        {/* Mock 'Seats Remaining' removed */}
                    </View>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{ticketClass}</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Middle Row: Route & Time */}
            <View style={styles.body}>
                <View style={styles.routeRow}>
                    <Text style={styles.cityText}>{flight.from}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.textGray} style={{ marginHorizontal: 8 }} />
                    <Text style={styles.cityText}>{flight.to}</Text>
                </View>
                <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color={Colors.textGray} style={{ marginRight: 4 }} />
                    <Text style={styles.timeText}>
                        {departTime} - {arriveTime} <Text style={styles.durationText}>({flight.duration})</Text>
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom Row: Price & Action */}
            <View style={styles.footer}>
                <Text style={styles.price}>{priceText}đ</Text>
                <TouchableOpacity style={styles.bookButton} onPress={() => onBookPress(flight)}>
                    <Text style={styles.bookButtonText}>Đặt</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FlightCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        // Shadow for "floating" effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    airlineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    flightCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
    },
    seatsText: {
        fontSize: 12,
        color: Colors.textGray,
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#F3E8FF', // Light purple
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    },
    body: {
        marginBottom: 4,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cityText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        color: Colors.textGray,
    },
    durationText: {
        color: Colors.textGray,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.price,
    },
    bookButton: {
        backgroundColor: Colors.price,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    bookButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});
