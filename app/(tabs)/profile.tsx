import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { width } = Dimensions.get('window');

const Colors = {
    primary: '#1BA0E2',
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    danger: '#FF3B30',
    border: '#E0E0E0'
};

const ProfileScreen = () => {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    // Use lowercase 'users' collection
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, [currentUser]);

    const handleLogout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            router.replace("/(auth)/login");
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể đăng xuất.");
                        }
                    }
                }
            ]
        );
    };

    const formatJoinDate = (timestamp: any) => {
        let date = new Date();
        if (timestamp?.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else if (currentUser?.metadata?.creationTime) {
            date = new Date(currentUser.metadata.creationTime);
        }

        try {
            return `Thành viên từ tháng ${format(date, 'M, yyyy', { locale: vi })}`;
        } catch (e) {
            return "Thành viên mới";
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Determine Display Values
    const displayName = userData?.fullName || currentUser?.displayName || "Người dùng";
    const displayEmail = userData?.email || currentUser?.email || "";
    const displayPhone = userData?.phone || currentUser?.phoneNumber || "Chưa cập nhật"; // 'phone' from firestore based on screenshot
    const displayAddress = userData?.address || "Chưa cập nhật";
    const joinDateRaw = userData?.createdAt || currentUser?.metadata.creationTime;

    return (
        <ScrollView
            style={styles.container}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        {/* Placeholder Avatar */}
                        <Image
                            source={{ uri: userData?.avatar || 'https://i.pravatar.cc/150?img=12' }}
                            style={styles.avatar}
                        />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={14} color="white" />
                        </View>
                    </View>
                    <Text style={styles.userName}>{displayName}</Text>
                    <Text style={styles.joinDate}>{formatJoinDate(joinDateRaw)}</Text>
                </View>
                <View style={styles.headerCurve} />
            </View>

            {/* Content Body */}
            <View style={styles.body}>

                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <View style={styles.card}>
                    {/* Email */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{displayEmail}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />

                    {/* Phone */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Số điện thoại</Text>
                            <Text style={styles.infoValue}>{displayPhone}</Text>
                        </View>
                        {/* Edit Button removed per request or implied simplified view */}
                    </View>
                    <View style={styles.divider} />

                    {/* Address */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Địa chỉ</Text>
                            <Text style={styles.infoValue}>{displayAddress}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Section */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Tài khoản</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                        </View>
                        <Text style={[styles.menuText, { color: Colors.danger }]}>Đăng xuất</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerCurve: {
        position: 'absolute',
        bottom: -25,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        zIndex: 0,
        width: width,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.white,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 5,
    },
    joinDate: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    body: {
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 15, // Updated radius
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1F5FE', // Light Blue
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 55,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#999',
        fontSize: 12
    }
});
