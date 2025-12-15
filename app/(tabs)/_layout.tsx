// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1BA0E2",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 85 : 60,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
      }}
    >
      {/* Tab 1: Trang chủ (Welcome) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
        }}
      />

      {/* Tab 2: Menu (Mới thêm vào) */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu", // Tên hiển thị trên thanh tab
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />,
        }}
      />

      {/* Tab 3: Chuyến đi */}
      <Tabs.Screen
        name="trips"
        options={{
          title: "Chuyến đi",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={24} color={color} />,
        }}
      />

      {/* Tab 4: Hồ sơ */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
