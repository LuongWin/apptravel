import { Stack } from "expo-router";

export default function HotelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Màn hình Tìm kiếm */}
      <Stack.Screen name="search" />

      {/* Màn hình Kết quả (Cần hiện nút Back) */}
      <Stack.Screen name="results" />

      {/* Màn hình Chi tiết (Cần hiện nút Back) */}
      <Stack.Screen name="[id]" />

      {/* Màn hình Xác nhận (Cần hiện nút Back) */}
      <Stack.Screen name="booking-confirm" />
    </Stack>
  );
}
