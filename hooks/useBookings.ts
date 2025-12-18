// hooks/useBookings.ts
import { auth, db } from '@/services/firebaseConfig';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useState } from 'react';

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
                status: 'success',
                createdAt: Timestamp.now(),
                ...data
            };

            const docRef = await addDoc(collection(db, 'FLIGHT_BOOKINGS'), bookingPayload);
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

export interface TourBookingData {
    tourId: string;
    tourName: string;
    selectedDate: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
    totalAmount: number;
    contactInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
    };
}

export const useTourBookings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTourBooking = async (data: TourBookingData) => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;

            const bookingPayload = {
                userId: user?.uid || 'guest',
                userEmail: user?.email || '',
                tourId: data.tourId,
                tourName: data.tourName,
                bookingDate: Timestamp.now(),
                departureDate: data.selectedDate,
                guests: {
                    adults: data.adultCount,
                    children: data.childCount,
                    infants: data.infantCount,
                    total: data.adultCount + data.childCount + data.infantCount
                },
                totalAmount: data.totalAmount,
                contactInfo: data.contactInfo || {},
                status: 'PENDING',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, 'TOUR_BOOKINGS'), bookingPayload);
            console.log("Tour booking created with ID: ", docRef.id);
            return docRef.id;

        } catch (err: any) {
            console.error("Error creating tour booking:", err);
            setError(err.message || "Không thể tạo đơn đặt tour. Vui lòng thử lại.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createTourBooking, loading, error };
};
