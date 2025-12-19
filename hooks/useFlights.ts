// hooks/useFlights.ts

import { useState, useCallback } from 'react';
import { db } from '@/services/firebaseConfig';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departAt: Date;
  arriveAt: Date; 
  price: number;
  duration: string;
}

// Hàm tiện ích: Lấy Timestamp của 00:00:00 ngày được chọn
const getStartOfDayTimestamp = (date: Date): Timestamp => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(startOfDay);
};

// Hàm tiện ích: Lấy Timestamp của 00:00:00 ngày tiếp theo
const getStartOfNextDayTimestamp = (date: Date): Timestamp => {
  const startOfNextDay = new Date(date);
  startOfNextDay.setDate(date.getDate() + 1);
  startOfNextDay.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(startOfNextDay);
};

interface SearchParams {
  from: string;
  to: string;
  date: Date;
}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tìm kiếm chuyến bay giữa hai thành phố trong một ngày cụ thể.
   * @param params - {from, to, date}
   * @param isReturnFlight - Nếu true, sẽ đảo ngược from/to.
   */
  const searchFlights = useCallback(async (params: SearchParams, isReturnFlight: boolean = false) => {
    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      if (!params.from || !params.to || !params.date) {
        throw new Error("Vui lòng nhập đầy đủ thông tin tìm kiếm.");
      }

      const startTimestamp = getStartOfDayTimestamp(params.date);
      const endTimestamp = getStartOfNextDayTimestamp(params.date);

      // Đảo ngược điểm đi/đến nếu là chuyến bay chiều về
      const departureCity = isReturnFlight ? params.to : params.from;
      const arrivalCity = isReturnFlight ? params.from : params.to;

      let flightQuery = query(
        collection(db, 'FLIGHTS'),
        where('from', '==', departureCity),
        where('to', '==', arrivalCity),
        where('departAt', '>=', startTimestamp),
        where('departAt', '<', endTimestamp)
      );

      const querySnapshot = await getDocs(flightQuery);

      const results: Flight[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          ...data,
          departAt: data.departAt.toDate(),
          arriveAt: data.arriveAt.toDate(),
        } as Flight);
      });

      // Sắp xếp theo thời gian khởi hành sớm nhất (đúng yêu cầu)
      results.sort((a, b) => a.departAt.getTime() - b.departAt.getTime());

      setFlights(results);
      return results;

    } catch (err: any) {
      console.error("Lỗi khi tìm kiếm:", err);
      setError(err.message || "Không thể tải chuyến bay. Vui lòng thử lại.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { flights, loading, error, searchFlights };
};