import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { authStyles } from "./_styles";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !phone) return Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ các trường");
    if (password !== confirmPass) return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
    if (!agree) return Alert.alert("Lỗi", "Bạn cần đồng ý với điều khoản");

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName,
        email,
        phone,
        uid: cred.user.uid,
        role: "user",
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Thành công", "Tài khoản đã được tạo!");
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert("Lỗi đăng ký", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* LOGO */}
        <View style={authStyles.logoContainer}>
          <Ionicons name="airplane" size={50} color="#1BA0E2" />
          <Text style={authStyles.logoText}>TravelGo</Text>
        </View>
        <Text style={authStyles.headerTitle}>Tài khoản</Text>

        {/* TAB BAR */}
        <View style={authStyles.tabContainer}>
          <TouchableOpacity style={authStyles.tabButton} onPress={() => router.replace("/auth/login")}>
            <Text style={authStyles.tabText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[authStyles.tabButton, authStyles.activeTab]}>
            <Text style={[authStyles.tabText, authStyles.activeTabText]}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <View style={authStyles.formContainer}>
          {/* Họ và tên */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="person-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Họ và tên" style={authStyles.input} value={fullName} onChangeText={setFullName} />
          </View>

          {/* Email */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="mail-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Email" style={authStyles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>

          {/* Số điện thoại */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="phone-portrait-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Số điện thoại" style={authStyles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          {/* Mật khẩu */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Mật khẩu" style={authStyles.input} secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Xác nhận mật khẩu" style={authStyles.input} secureTextEntry={!showConfirm} value={confirmPass} onChangeText={setConfirmPass} />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={authStyles.helperText}>Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.</Text>

          {/* Checkbox */}
          <TouchableOpacity style={authStyles.checkboxContainer} onPress={() => setAgree(!agree)}>
            <Ionicons name={agree ? "checkbox" : "square-outline"} size={24} color={agree ? "#1BA0E2" : "#888"} />
            <Text style={authStyles.checkboxLabel}>
              Tôi đồng ý với <Text style={{ color: "#1BA0E2", fontWeight: "bold" }}>Điều khoản & Chính sách</Text>
            </Text>
          </TouchableOpacity>

          {/* Button Đăng ký */}
          <TouchableOpacity style={authStyles.submitButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={authStyles.submitButtonText}>Đăng ký</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={authStyles.dividerContainer}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>Hoặc đăng ký với</Text>
            <View style={authStyles.dividerLine} />
          </View>

          {/* Social Buttons (Xếp ngang như ảnh phải) */}
          <View style={{ flexDirection: "row", gap: 15 }}>
            <TouchableOpacity style={[authStyles.socialButton, { flex: 1 }]}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text style={authStyles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[authStyles.socialButton, { flex: 1 }]}>
              <Ionicons name="logo-facebook" size={22} color="#4267B2" />
              <Text style={authStyles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={authStyles.bottomTextContainer}>
            <Text style={authStyles.bottomText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={authStyles.bottomLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
