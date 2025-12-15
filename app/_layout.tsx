import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

// Màu xanh TravelGo
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1BA0E2",
    secondary: "#FF5E1F",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
