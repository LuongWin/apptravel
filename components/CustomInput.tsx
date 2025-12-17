import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Colors = {
    text: '#333',
    textSecondary: '#666',
    white: '#FFFFFF',
    border: '#E0E0E0',
};

type Props = {
    label: string;
    iconName: any;
    placeholder: string;
    value?: any;
    onPress: () => void;
    isDate?: boolean;
};

export const CustomInput = ({ label, iconName, placeholder, value, onPress, isDate = false }: Props) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
            <Ionicons name={iconName} size={20} color={Colors.textSecondary} style={styles.icon} />
            <Text style={[styles.inputText, !value && { color: '#999' }]}>
                {isDate && value ? format(value, 'dd/MM/yyyy', { locale: vi }) : (value || placeholder)}
            </Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    inputWrapper: { marginBottom: 12 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, height: 45, backgroundColor: Colors.white },
    icon: { marginRight: 10 },
    inputText: { fontSize: 15, color: Colors.text, flex: 1 },
});
