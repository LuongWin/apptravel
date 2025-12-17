import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { authStyles } from "./_styles";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* LOGO + Header */}
        <View style={authStyles.logoContainer}>
          <Ionicons name="airplane" size={50} color="#1BA0E2" />
          <Text style={authStyles.logoText}>TravelGo</Text>
        </View>
        <Text style={authStyles.headerTitle}>Tài khoản</Text>

        {/* TAB BAR (Giống ảnh) */}
        <View style={authStyles.tabContainer}>
          <TouchableOpacity style={[authStyles.tabButton, authStyles.activeTab]}>
            <Text style={[authStyles.tabText, authStyles.activeTabText]}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={authStyles.tabButton} onPress={() => router.replace("/auth/register")}>
            <Text style={authStyles.tabText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <View style={authStyles.formContainer}>
          {/* Input Email */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="mail-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Email hoặc Số điện thoại" style={authStyles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>

          {/* Input Password */}
          <View style={authStyles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} style={authStyles.inputIcon} />
            <TextInput placeholder="Mật khẩu" style={authStyles.input} secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={authStyles.forgotPassText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Button Đăng nhập */}
          <TouchableOpacity style={authStyles.submitButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={authStyles.submitButtonText}>Đăng nhập</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={authStyles.dividerContainer}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>Hoặc đăng nhập với</Text>
            <View style={authStyles.dividerLine} />
          </View>

          {/* Social Buttons (Xếp dọc như ảnh trái) */}
          <TouchableOpacity style={authStyles.socialButton}>
            <Ionicons name="logo-google" size={22} color="#DB4437" />
            <Text style={authStyles.socialText}>Đăng nhập với Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={authStyles.socialButton}>
            <Ionicons name="logo-facebook" size={22} color="#4267B2" />
            <Text style={authStyles.socialText}>Đăng nhập với Facebook</Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={authStyles.bottomTextContainer}>
            <Text style={authStyles.bottomText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.replace("/auth/register")}>
              <Text style={authStyles.bottomLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
