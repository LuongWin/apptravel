import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // _layout.tsx gốc sẽ tự động chuyển về trang Login
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  };

  const email = auth.currentUser?.email;
  const displayName = userData?.fullName || email?.split("@")[0];
  const avatarChar = displayName ? displayName[0].toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarChar}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={22} color="#555" />
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={22} color="#555" />
          <Text style={styles.menuText}>Phương thức thanh toán</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={22} color="#555" />
          <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {/* Nút Đăng xuất */}
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0, marginTop: 20 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={[styles.menuText, { color: "#FF3B30", fontWeight: "bold" }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { alignItems: "center", padding: 30, backgroundColor: "#FFF", marginBottom: 15 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1BA0E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: "#FFF", fontWeight: "bold" },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },

  menuContainer: { backgroundColor: "#FFF", paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: "#333" },
});
