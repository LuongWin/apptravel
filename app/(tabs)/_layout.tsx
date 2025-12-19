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
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="flights/index"
        options={{
          title: "Vé máy bay",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "airplane" : "airplane-outline"} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="hotels/index"
        options={{
          title: "Khách sạn",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bed" : "bed-outline"} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tours/index"
        options={{
          title: "Tours",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />,
        }}
      />

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
