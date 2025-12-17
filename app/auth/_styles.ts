import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1BA0E2", // Màu xanh thương hiệu
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  // Phần Tab (Đăng nhập / Đăng ký)
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#1BA0E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Phần Form
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50, // Chiều cao giống ảnh
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  inputIcon: {
    marginRight: 10,
    color: "#666",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    height: "100%",
  },
  forgotPassText: {
    textAlign: "right",
    color: "#1BA0E2",
    fontWeight: "600",
    marginTop: -5,
    marginBottom: 20,
  },

  // Nút bấm chính
  submitButton: {
    backgroundColor: "#1BA0E2",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#1BA0E2",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Divider (Hoặc đăng nhập với)
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
    fontSize: 12,
  },

  // Social Buttons
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    height: 50,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  socialText: {
    marginLeft: 10,
    fontWeight: "600",
    color: "#333",
  },

  // Bottom Link
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  bottomText: {
    color: "#666",
  },
  bottomLink: {
    color: "#1BA0E2",
    fontWeight: "bold",
    marginLeft: 5,
  },

  // Register Specific
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: "#333",
    flex: 1,
  },
});
