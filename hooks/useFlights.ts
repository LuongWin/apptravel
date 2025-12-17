import { useState, useCallback } from "react";
import { db } from "@/services/firebaseConfig";
import { collection, query, getDocs, Timestamp } from "firebase/firestore";

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string; // Tương ứng field 'flightCode'
  from: string;
  to: string;
  departAt: Date;
  arriveAt: Date;
  price: number;
  duration: string;
  logo: string;
}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = useCallback(async (origin: string, destination: string, date: Date) => {
    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      // Demo: Fetch tất cả FLIGHTS và lọc client-side
      const q = query(collection(db, "FLIGHTS"));
      const querySnapshot = await getDocs(q);

      const results: Flight[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          ...data,
          // Convert Timestamp Firestore sang JS Date
          departAt: data.departAt?.toDate ? data.departAt.toDate() : new Date(),
          arriveAt: data.arriveAt?.toDate ? data.arriveAt.toDate() : new Date(),
        } as Flight);
      });

      // Lọc theo Nơi đi và Nơi đến
      // Lưu ý: origin/destination input có thể là "Hà Nội (HAN)", ta chỉ lấy "Hà Nội" để so sánh
      const originKey = origin.split("(")[0].trim();
      const destKey = destination.split("(")[0].trim();

      const filtered = results.filter((f) => f.from.includes(originKey) && f.to.includes(destKey));

      // Sắp xếp theo giờ bay
      filtered.sort((a, b) => a.departAt.getTime() - b.departAt.getTime());

      setFlights(filtered);
      return filtered;
    } catch (err: any) {
      console.error("Lỗi tìm chuyến bay:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { flights, loading, error, searchFlights };
};
