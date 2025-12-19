import { useState, useCallback, useEffect } from 'react';
import { db } from '@/services/firebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';

export interface Room {
    id: string;
    hotelId: string;
    name: string;
    price: number;
    maxGuests: number;
    image?: string; 
}

export interface Hotel {
    id: string;
    name: string;
    address: string;
    location?: string; // Added location field
    rating: number;
    images: string[];
    amenities: string[];
    rooms?: Room[]; // Optional, populated after fetching rooms
}

export const useHotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [allHotels, setAllHotels] = useState<Hotel[]>([]); // Cache all hotels
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial fetch of ALL data (Hotels + Rooms)
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching all HOTELS and ROOMS...");

            // 1. Fetch ALL Hotels
            const hotelsRef = collection(db, 'HOTELS');
            const hotelSnapshot = await getDocs(hotelsRef);
            const rawHotels = hotelSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Hotel));

            // 2. Fetch ALL Rooms 
            const roomsRef = collection(db, 'ROOMS');
            const roomsSnapshot = await getDocs(roomsRef);
            const allRooms = roomsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Room));

            // 3. Map Rooms to Hotels
            const mappedHotels = rawHotels.map(hotel => ({
                ...hotel,
                rooms: allRooms.filter(room => room.hotelId === hotel.id)
            }));

            setAllHotels(mappedHotels);
            setHotels(mappedHotels); // Default show all
            console.log(`Loaded ${mappedHotels.length} hotels and ${allRooms.length} rooms.`);

        } catch (err: any) {
            console.error("Error fetching hotel data:", err);
            setError(err.message || "Không thể tải dữ liệu khách sạn.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const searchHotels = useCallback((keyword: string) => {
        if (!keyword.trim()) {
            setHotels(allHotels);
            return;
        }

        const lowerKeyword = keyword.toLowerCase().trim();
        let searchTerms = [lowerKeyword];

        // Handle specific location aliases
        if (lowerKeyword === 'tp.hcm' || lowerKeyword === 'tphcm') {
            searchTerms.push('hồ chí minh');
            searchTerms.push('ho chi minh');
            searchTerms.push('TP. Hồ Chí Minh'); // With space
            searchTerms.push('TP.HCM');
        }

        const filtered = allHotels.filter(hotel => {
            const nameLower = hotel.name.toLowerCase();
            const addressLower = hotel.address.toLowerCase();
            const locationLower = hotel.location ? hotel.location.toLowerCase() : '';

            return searchTerms.some(term =>
                nameLower.includes(term) ||
                addressLower.includes(term) ||
                locationLower.includes(term)
            );
        });

        console.log(`Search '${keyword}' found ${filtered.length} matches.`);
        setHotels(filtered);
    }, [allHotels]);

    return { hotels, loading, error, searchHotels, refresh: fetchAllData };
};
