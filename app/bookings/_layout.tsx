import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Màn hình Vé điện tử (QR Code) */}
      <Stack.Screen name="ticket-detail" />

      {/* Màn hình Chi tiết & Xuất hóa đơn */}
      <Stack.Screen name="invoice-detail" />
    </Stack>
  );
}
