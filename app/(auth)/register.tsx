// app/(auth)/register.tsx
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import thêm để lưu data
import { auth, db } from "@/services/firebaseConfig"; // Import db từ config
import { authStyles } from "./styles";

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = async () => {
    // 1. Validate dữ liệu
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi mật khẩu", "Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (!agreeTerms) {
      Alert.alert("Chưa đồng ý", "Bạn cần đồng ý với Điều khoản & Chính sách.");
      return;
    }

    try {
      setLoading(true);

      // 2. Tạo tài khoản Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 3. Lưu thông tin bổ sung vào Firestore
      // Tạo document trong collection "users" với ID trùng với UID của user
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        uid: user.uid,
        createdAt: new Date().toISOString(),
        role: "user", // Ví dụ thêm phân quyền
      });

      Alert.alert("Thành công", "Đăng ký tài khoản và lưu thông tin thành công!");
      router.replace("/login");
    } catch (err: any) {
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") msg = "Email này đã được sử dụng.";
      if (err.code === "auth/invalid-email") msg = "Email không hợp lệ.";
      // Log lỗi ra console để dễ debug nếu Firestore bị lỗi permission
      console.error("Lỗi đăng ký:", err);
      Alert.alert("Đăng ký thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 20, marginTop: 40 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#333" }}>Tài khoản</Text>
          </View>

          <View style={authStyles.card}>
            {/* Tab */}
            <View style={authStyles.tabRow}>
              <Pressable style={authStyles.tab} onPress={() => router.replace("/login")}>
                <Text style={authStyles.tabText}>Đăng nhập</Text>
              </Pressable>
              <Pressable style={[authStyles.tab, authStyles.tabActive]}>
                <Text style={[authStyles.tabText, authStyles.tabTextActive]}>Đăng ký</Text>
              </Pressable>
            </View>

            {/* Form Fields */}
            {/* Họ tên */}
            <View style={authStyles.fieldGroup}>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="person-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={fullName} onChangeText={setFullName} placeholder="Họ và tên" style={authStyles.textInput} placeholderTextColor="#9ca3af" />
              </View>
            </View>

            {/* Email */}
            <View style={authStyles.fieldGroup}>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={authStyles.textInput} placeholderTextColor="#9ca3af" />
              </View>
            </View>

            {/* SĐT */}
            <View style={authStyles.fieldGroup}>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="phone-portrait-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" style={authStyles.textInput} placeholderTextColor="#9ca3af" />
              </View>
            </View>

            {/* Mật khẩu */}
            <View style={authStyles.fieldGroup}>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureTextEntry={!showPassword} style={authStyles.textInput} placeholderTextColor="#9ca3af" />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                </Pressable>
              </View>
            </View>

            {/* Xác nhận MK */}
            <View style={authStyles.fieldGroup}>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Xác nhận mật khẩu" secureTextEntry={!showConfirmPassword} style={authStyles.textInput} placeholderTextColor="#9ca3af" />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                </Pressable>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: "#666", lineHeight: 18 }}>Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.</Text>

            {/* Checkbox */}
            <Pressable style={authStyles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
              <Ionicons name={agreeTerms ? "checkbox" : "square-outline"} size={24} color={agreeTerms ? "#1BA0E2" : "#9ca3af"} />
              <Text style={authStyles.termsText}>
                Tôi đồng ý với <Text style={{ color: "#1BA0E2", fontWeight: "bold" }}>Điều khoản & Chính sách</Text>
              </Text>
            </Pressable>

            {/* Button */}
            <Pressable style={[authStyles.primaryButton, { opacity: loading ? 0.7 : 1, backgroundColor: "#1BA0E2" }]} onPress={handleRegister} disabled={loading}>
              <Text style={authStyles.primaryButtonText}>{loading ? "Đang xử lý..." : "Đăng ký"}</Text>
            </Pressable>

            {/* Footer */}
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <Text style={{ color: "#666", marginBottom: 10 }}>Hoặc đăng ký với</Text>
              <View style={{ flexDirection: "row", gap: 15, width: "100%" }}>
                <Pressable style={[authStyles.socialButton, { flex: 1 }]}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text style={{ color: "#333", fontWeight: "500" }}>Google</Text>
                </Pressable>
                <Pressable style={[authStyles.socialButton, { flex: 1 }]}>
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  <Text style={{ color: "#333", fontWeight: "500" }}>Facebook</Text>
                </Pressable>
              </View>
            </View>

            <View style={authStyles.bottomRow}>
              <Text style={{ color: "#666" }}>Đã có tài khoản?</Text>
              <Pressable onPress={() => router.replace("/login")}>
                <Text style={authStyles.bottomLink}> Đăng nhập</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
