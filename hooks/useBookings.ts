// hooks/useBookings.ts
import { useState } from 'react';
import { db, auth } from '@/services/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface BookingData {
    outboundFlightSnapshot: any;
    returnFlightSnapshot?: any;
    contactInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        countryCode: string;
    };
    passengers: {
        title: string; // Mr, Ms
        firstName: string;
        lastName: string;
        dateOfBirth: string; // ISO or DD/MM/YYYY
        gender: string;
        nationality: string;
    }[];
    totalAmount: number;
}

export const useBookings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBooking = async (data: BookingData) => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Bạn cần đăng nhập để thực hiện đặt vé.");
            }

            const bookingPayload = {
                userId: user.uid,
                bookingDate: Timestamp.now(),
                status: 'COMPLETED', // Or 'PENDING' if payment integration exists
                ...data
            };

            const docRef = await addDoc(collection(db, 'bookings'), bookingPayload);
            console.log("Booking created with ID: ", docRef.id);
            return docRef.id;

        } catch (err: any) {
            console.error("Error creating booking:", err);
            setError(err.message || "Không thể tạo đơn đặt chỗ. Vui lòng thử lại.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createBooking, loading, error };
};
