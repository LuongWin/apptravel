import { useState, useCallback } from "react";
import { db } from "@/services/firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";

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
  rooms?: Room[];
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
      // Lấy tất cả khách sạn (Với app demo thì ổn, thực tế nên dùng where)
      const hotelQuery = query(collection(db, "HOTELS"));
      const hotelSnapshot = await getDocs(hotelQuery);

      const matchedHotels: Hotel[] = [];

      for (const doc of hotelSnapshot.docs) {
        const hotelData = doc.data() as Omit<Hotel, "id">;
        const addressUpper = hotelData.address ? hotelData.address.toUpperCase() : "";
        const cityUpper = city.toUpperCase();

        // Lọc phía Client: Nếu địa chỉ chứa tên thành phố
        if (addressUpper.includes(cityUpper) || cityUpper === "") {
          // Lấy phòng của khách sạn này
          // Lưu ý: Collection tên là 'ROOMS'
          const roomsQuery = query(collection(db, "ROOMS"));
          const roomsSnapshot = await getDocs(roomsQuery);

          // Lọc phòng thuộc khách sạn này
          const rooms: Room[] = roomsSnapshot.docs.map((rDoc) => ({ id: rDoc.id, ...rDoc.data() } as Room)).filter((r) => r.hotelId === doc.id);

          if (rooms.length > 0) {
            matchedHotels.push({
              id: doc.id,
              ...hotelData,
              rooms: rooms,
            });
          }
        }
      }

      setHotels(matchedHotels);
    } catch (err: any) {
      console.error("Lỗi tìm khách sạn:", err);
      setError(err.message || "Không thể tải danh sách khách sạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotels, loading, error, searchHotels };
};
