import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của Tab để dùng header riêng trong từng trang
        tabBarActiveTintColor: "#1BA0E2", // Màu xanh Traveloka khi active
        tabBarInactiveTintColor: "#888",
        tabBarStyle:
          Platform.OS === "android"
            ? {
                height: 60,
                paddingBottom: 10,
                paddingTop: 5,
              }
            : {},
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      {/* Tab 1: Trang chủ */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
        }}
      />

      {/* Tab 2: Lịch sử đặt vé */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Vé của tôi",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "ticket" : "ticket-outline"} size={24} color={color} />,
        }}
      />

      {/* Tab 3: Tài khoản */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
