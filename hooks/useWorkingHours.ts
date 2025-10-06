import { useState, useEffect } from 'react';
import { useAdminSettings } from './useAdminSettings';

export type WorkingHours = {
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
};

export function useWorkingHours() {
  const { settings, isLoading: settingsLoading, error: settingsError } = useAdminSettings();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    for (let hour = start; hour < end - 1; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 2).toString().padStart(2, '0');
      slots.push(`${startHour}:00 - ${endHour}:00`);
    }
    
    return slots;
  };

  useEffect(() => {
    if (!settingsLoading && settings) {
      // Generate time slots when settings are loaded
      const slots = generateTimeSlots(settings.workingHoursStart, settings.workingHoursEnd);
      setTimeSlots(slots);
    }
  }, [settings, settingsLoading]);

  return {
    workingHours: {
      workingHoursStart: settings.workingHoursStart,
      workingHoursEnd: settings.workingHoursEnd,
      workingDays: settings.workingDays
    },
    timeSlots,
    isLoading: settingsLoading,
    error: settingsError
  };
} 