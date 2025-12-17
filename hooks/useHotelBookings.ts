import { useState } from "react";
import { db, auth } from "@/services/firebaseConfig";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

export interface HotelBookingData {
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalPrice: number;
  guestCount: number;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export const useHotelBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: HotelBookingData) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Bạn cần đăng nhập để đặt phòng.");
      }

      const bookingRef = `HOTEL-${Date.now()}`;

      const bookingPayload = {
        bookingId: bookingRef,
        userId: user.uid,
        createdAt: Timestamp.now(),
        status: "success",
        totalPrice: data.totalPrice,
        customerInfo: {
          fullName: `${data.contactInfo.lastName} ${data.contactInfo.firstName}`,
          email: data.contactInfo.email,
          phone: data.contactInfo.phoneNumber,
        },
        // Quan trọng: serviceType để phân biệt khi hiển thị list
        serviceType: "hotel",
        serviceDetails: {
          hotelId: data.hotelId,
          hotelName: data.hotelName,
          roomName: data.roomName,
          checkIn: data.checkInDate,
          checkOut: data.checkOutDate,
          nights: data.totalNights,
          guests: data.guestCount,
        },
      };

      // Lưu vào collection 'bookings'
      await setDoc(doc(db, "bookings", bookingRef), bookingPayload);
      return bookingRef;
    } catch (err: any) {
      console.error("Lỗi đặt phòng:", err);
      setError(err.message || "Không thể tạo đơn đặt phòng.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
};
