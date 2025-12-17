import { useState } from "react";
import { db, auth } from "@/services/firebaseConfig";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

export interface FlightBookingData {
  flightId: string;
  flightCode: string;
  airline: string;
  departTime: string;
  arriveTime: string;
  origin: string;
  destination: string;
  date: string;
  totalPrice: number;
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export const useFlightBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: FlightBookingData) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Bạn cần đăng nhập để thực hiện đặt vé.");
      }

      const bookingRef = `FLT-${Date.now()}`;

      const bookingPayload = {
        bookingId: bookingRef,
        userId: user.uid,
        createdAt: Timestamp.now(),
        status: "success",
        totalPrice: data.totalPrice,
        customerInfo: data.contactInfo,

        // Quan trọng: serviceType flight
        serviceType: "flight",
        serviceDetails: {
          flightId: data.flightId,
          flightCode: data.flightCode,
          airline: data.airline,
          origin: data.origin,
          destination: data.destination,
          departTime: data.departTime,
          arriveTime: data.arriveTime,
          date: data.date,
        },
      };

      // Lưu vào cùng collection 'bookings'
      await setDoc(doc(db, "bookings", bookingRef), bookingPayload);
      return bookingRef;
    } catch (err: any) {
      console.error("Lỗi đặt vé máy bay:", err);
      setError(err.message || "Không thể tạo đơn đặt chỗ.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
};
