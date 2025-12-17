// app/(auth)/login.tsx
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import { authStyles } from "./styles";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validate nhanh
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      // Sử dụng trim() cho email để cắt khoảng trắng thừa
      await signInWithEmailAndPassword(auth, email.trim(), password);

      Alert.alert("Đăng nhập thành công", "Chào mừng bạn trở lại!");
      router.replace("/(tabs)"); // Chuyển vào màn hình chính
    } catch (err: any) {
      console.log("Lỗi đăng nhập:", err.code, err.message);

      let msg = "Kiểm tra lại email hoặc mật khẩu.";
      if (err.code === "auth/invalid-email") msg = "Email không hợp lệ.";
      if (err.code === "auth/user-not-found") msg = "Tài khoản không tồn tại.";
      if (err.code === "auth/wrong-password") msg = "Sai mật khẩu.";
      if (err.code === "auth/too-many-requests") msg = "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.";

      Alert.alert("Đăng nhập thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 30, marginTop: 50 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#333" }}>Tài khoản</Text>
          </View>

          <View style={authStyles.card}>
            {/* Tab */}
            <View style={authStyles.tabRow}>
              <Pressable style={[authStyles.tab, authStyles.tabActive]}>
                <Text style={[authStyles.tabText, authStyles.tabTextActive]}>Đăng nhập</Text>
              </Pressable>
              <Pressable style={authStyles.tab} onPress={() => router.replace("/auth/register")}>
                <Text style={authStyles.tabText}>Đăng ký</Text>
              </Pressable>
            </View>

            {/* Email */}
            <View style={authStyles.fieldGroup}>
              <Text style={{ fontWeight: "600", color: "#333" }}>Email</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={authStyles.textInput} placeholderTextColor="#9ca3af" />
              </View>
            </View>

            {/* Password */}
            <View style={authStyles.fieldGroup}>
              <Text style={{ fontWeight: "600", color: "#333" }}>Mật khẩu</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} style={authStyles.iconLeft} />
                <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!showPassword} style={authStyles.textInput} placeholderTextColor="#9ca3af" />
                <Pressable style={authStyles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={authStyles.forgotRow}>
              <Pressable onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}>
                <Text style={authStyles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>

            {/* Button */}
            <Pressable style={[authStyles.primaryButton, { opacity: loading ? 0.7 : 1, backgroundColor: "#1BA0E2" }]} onPress={handleLogin} disabled={loading}>
              <Text style={authStyles.primaryButtonText}>{loading ? "Đang xử lý..." : "Đăng nhập"}</Text>
            </Pressable>

            {/* Social */}
            <View style={authStyles.dividerRow}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>Hoặc đăng nhập với</Text>
              <View style={authStyles.dividerLine} />
            </View>

            <View style={{ gap: 10 }}>
              <Pressable style={authStyles.socialButton}>
                <Ionicons name="logo-google" size={18} color="#4285F4" />
                <Text style={{ color: "#333" }}>Google</Text>
              </Pressable>
              <Pressable style={authStyles.socialButton}>
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                <Text style={{ color: "#333" }}>Facebook</Text>
              </Pressable>
            </View>

            <View style={authStyles.bottomRow}>
              <Text style={{ color: "#666" }}>Chưa có tài khoản?</Text>
              <Pressable onPress={() => router.replace("/auth/register")}>
                <Text style={authStyles.bottomLink}> Đăng ký ngay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
