import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Colors = {
    primary: '#5B37B7',
    textSecondary: '#666',
    white: '#FFFFFF',
    activeTabText: '#FFFFFF',
};

type Props = {
    label: string;
    icon: any;
    active: boolean;
    onPress: () => void;
};

export const ServiceTab = ({ label, icon, active, onPress }: Props) => (
    <TouchableOpacity
        style={[styles.tabItem, active && styles.tabItemActive]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={18} color={active ? Colors.white : Colors.textSecondary} style={{ marginRight: 5 }} />
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    tabItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, flex: 1, justifyContent: 'center' },
    tabItemActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    tabTextActive: { color: Colors.activeTabText },
});
