import { Stack } from "expo-router";

export default function FlightLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="search" />
      <Stack.Screen name="results" />
      <Stack.Screen name="booking-confirm" />
    </Stack>
  );
}
