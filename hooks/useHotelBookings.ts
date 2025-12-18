import { useState } from 'react';
import { db, auth } from '@/services/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface HotelBookingData {
    hotelId: string;
    hotelName: string;
    roomId: string;
    roomName: string;
    checkInDate: string;
    checkOutDate: string;
    totalNights: number;
    totalPrice: number;
    contactInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    guestCount: number;
    roomQuantity?: number;
    hotelImage?: string;
    address?: string;
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

            const bookingPayload = {
                userId: user.uid,
                status: 'success',
                createdAt: Timestamp.now(),
                ...data
            };

            const docRef = await addDoc(collection(db, 'HOTEL_BOOKINGS'), bookingPayload);
            console.log("Hotel booking created ID:", docRef.id);
            return docRef.id;

        } catch (err: any) {
            console.error("Error creating hotel booking:", err);
            setError(err.message || "Không thể tạo đơn đặt phòng.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createBooking, loading, error };
};
