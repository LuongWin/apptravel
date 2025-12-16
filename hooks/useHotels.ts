import { useState, useCallback } from 'react';
import { db } from '@/services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Room {
    id: string;
    hotelId: string;
    name: string;
    price: number;
    maxGuests: number;
}

export interface Hotel {
    id: string;
    name: string;
    address: string;
    rating: number;
    images: string[];
    amenities: string[];
    rooms?: Room[]; // Optional, populated after fetching rooms
}

export const useHotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchHotels = useCallback(async (city: string) => {
        setLoading(true);
        setError(null);
        setHotels([]);

        try {
            console.log("Searching hotels in:", city);

            // 1. Fetch Hotels in the city
            // Note: This assumes a simple string match or you might need a more complex query setup
            const hotelsRef = collection(db, 'HOTELS');
            // Basic query: checks if address field >= city and < city + \uf8ff (prefix match)
            // Or simpler for now: Fetch all and filter client-side if dataset is small, 
            // BUT for production/firebase best practice, we should use 'where'.
            // For now, let's assume 'address' field contains the city name. 
            // Firestore doesn't support 'contains' natively easily. 
            // We will fetch all hotels (assuming small dataset) and filter or use a specific 'city' field if it existed.
            // Let's use a workaround: Fetch all for this demo or assume 'city' field exists.
            // Given the sample data has 'address', let's fetch matching address (inefficient but works for small demo)

            // BETTER APPROACH: Add a 'city' keyword field to your data. 
            // For this task, I will fetch all and filter client-side to ensure it works with the sample data provided.

            const hotelQuery = query(collection(db, 'HOTELS'));
            const hotelSnapshot = await getDocs(hotelQuery);

            const matchedHotels: Hotel[] = [];

            for (const doc of hotelSnapshot.docs) {
                const hotelData = doc.data() as Omit<Hotel, 'id'>;
                // Simple case-insensitive check
                // Expanded logic: If city is empty, treat as match all? Or just strictly check includes.
                // Fixed: Ensure we check includes safely.
                const addressUpper = hotelData.address ? hotelData.address.toUpperCase() : '';
                const cityUpper = city.toUpperCase();

                if (addressUpper.includes(cityUpper) || cityUpper === '') {

                    // 2. Fetch Rooms for this hotel
                    const roomsQuery = query(collection(db, 'ROOMS'), where('hotelId', '==', doc.id));
                    const roomsSnapshot = await getDocs(roomsQuery);
                    const rooms: Room[] = roomsSnapshot.docs.map(rDoc => ({
                        id: rDoc.id,
                        ...rDoc.data()
                    } as Room));

                    if (rooms.length > 0) {
                        matchedHotels.push({
                            id: doc.id,
                            ...hotelData,
                            rooms: rooms
                        });
                    }
                }
            }

            console.log(`Found ${matchedHotels.length} hotels matching '${city}'`);
            setHotels(matchedHotels);

        } catch (err: any) {
            console.error("Error searching hotels:", err);
            setError(err.message || "Không thể tải danh sách khách sạn.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { hotels, loading, error, searchHotels };
};
