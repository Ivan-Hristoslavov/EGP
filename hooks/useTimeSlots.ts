import { useState, useEffect } from 'react';

interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface UseTimeSlotsResult {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  fetchTimeSlots: (date: string) => Promise<void>;
}

export function useTimeSlots(): UseTimeSlotsResult {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/time-slots?date=${date}`);
      const data = await response.json();

      if (data.success) {
        setTimeSlots(data.slots || []);
      } else {
        setError(data.error || 'Failed to fetch time slots');
        setTimeSlots([]);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Network error occurred');
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    timeSlots,
    isLoading,
    error,
    fetchTimeSlots
  };
}
