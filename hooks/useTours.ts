import { db } from '@/services/firebaseConfig';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export interface Tour {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number; // số ngày
    startDate: Date;
    endDate: Date;
    maxGuests: number;
    currentGuests: number;
    image: string;
    location: string;
    itinerary: string[];
    included: string[];
    status: 'active' | 'upcoming' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export const useTours = () => {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all tours
    const fetchTours = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const toursRef = collection(db, 'TOURS');
            const q = query(toursRef, orderBy('startDate', 'desc'));
            const snapshot = await getDocs(q);

            const toursList: Tour[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    maxGuests: data.maxGuests,
                    currentGuests: data.currentGuests || 0,
                    image: data.image,
                    location: data.location,
                    itinerary: data.itinerary || [],
                    included: data.included || [],
                    status: data.status || 'active',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                };
            });

            setTours(toursList);
        } catch (err: any) {
            console.error('Error fetching tours:', err);
            setError(err.message || 'Không thể tải danh sách tour.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Add new tour
    const addTour = useCallback(async (tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const toursRef = collection(db, 'TOURS');
            const now = Timestamp.now();

            const newTour = {
                ...tourData,
                startDate: Timestamp.fromDate(tourData.startDate),
                endDate: Timestamp.fromDate(tourData.endDate),
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await addDoc(toursRef, newTour);
            await fetchTours();
            return docRef.id;
        } catch (err: any) {
            console.error('Error adding tour:', err);
            throw new Error(err.message || 'Không thể thêm tour mới.');
        }
    }, [fetchTours]);

    // Update tour
    const updateTour = useCallback(async (tourId: string, tourData: Partial<Tour>) => {
        try {
            const tourRef = doc(db, 'TOURS', tourId);
            const updateData: any = {
                ...tourData,
                updatedAt: Timestamp.now(),
            };

            if (tourData.startDate) {
                updateData.startDate = Timestamp.fromDate(tourData.startDate);
            }
            if (tourData.endDate) {
                updateData.endDate = Timestamp.fromDate(tourData.endDate);
            }

            delete updateData.id;
            delete updateData.createdAt;

            await updateDoc(tourRef, updateData);
            await fetchTours();
        } catch (err: any) {
            console.error('Error updating tour:', err);
            throw new Error(err.message || 'Không thể cập nhật tour.');
        }
    }, [fetchTours]);

    // Delete tour
    const deleteTour = useCallback(async (tourId: string) => {
        try {
            const tourRef = doc(db, 'TOURS', tourId);
            await deleteDoc(tourRef);
            await fetchTours();
        } catch (err: any) {
            console.error('Error deleting tour:', err);
            throw new Error(err.message || 'Không thể xóa tour.');
        }
    }, [fetchTours]);

    // Load tours on mount
    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    return {
        tours,
        loading,
        error,
        fetchTours,
        addTour,
        updateTour,
        deleteTour,
    };
};
