"use client";

import { useState, useEffect } from "react";
import { Clock, Save, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@heroui/react";
import { useToast } from "@/components/Toast";

interface WorkingHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  buffer_minutes: number;
  max_appointments: number;
}


const DAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

const DAY_ORDER = DAYS.map(day => day.value);

const sortWorkingHours = (hours: WorkingHour[]) =>
  [...hours].sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week));

const createDefaultHour = (dayValue: number): WorkingHour => ({
  day_of_week: dayValue,
  start_time: dayValue === 0 || dayValue === 6 ? "10:00" : "09:00",
  end_time: dayValue === 0 || dayValue === 6 ? "16:00" : "18:00",
  is_working_day: dayValue !== 0,
  buffer_minutes: 15,
  max_appointments: dayValue === 6 ? 8 : dayValue === 0 ? 0 : 12,
});

const mergeWithDefaults = (hours: WorkingHour[]) =>
  sortWorkingHours(
    DAYS.map((day) => {
      const base = createDefaultHour(day.value);
      const existing = hours.find((hour) => hour.day_of_week === day.value);
      return existing ? { ...base, ...existing } : base;
    })
  );

export default function WorkingHoursManager() {
  const { showSuccess, showError } = useToast();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load working hours and service durations
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (options?: { silent?: boolean; showToast?: boolean }) => {
    const silent = options?.silent ?? false;
    let succeeded = false;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const hoursResponse = await fetch('/api/admin/working-hours');
      const hoursData = await hoursResponse.json();
      
      if (!hoursResponse.ok) {
        throw new Error(hoursData.error || 'Failed to load working hours');
      }

      const normalizedHours = hoursData.workingHours
        ? mergeWithDefaults(hoursData.workingHours)
        : mergeWithDefaults([]);

      setWorkingHours(normalizedHours);
      succeeded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      showError(
        "Couldn't load schedule",
        error instanceof Error ? error.message : 'Something went wrong while loading your data.'
      );
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }

      if (succeeded && options?.showToast) {
        showSuccess('Schedule refreshed', 'Working hours are up to date.');
      }
    }
  };

  const handleWorkingHourChange = (dayOfWeek: number, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => 
      sortWorkingHours(
        prev.map(hour => {
          if (hour.day_of_week !== dayOfWeek) return hour;

          let updated: WorkingHour = { ...hour, [field]: value };

          if (field === 'is_working_day') {
            if (value) {
              const defaults = createDefaultHour(dayOfWeek);
              const fallbackMax = defaults.max_appointments || 8;
              updated = {
                ...updated,
                start_time: updated.start_time || defaults.start_time,
                end_time: updated.end_time || defaults.end_time,
                max_appointments:
                  updated.max_appointments && updated.max_appointments > 0
                    ? updated.max_appointments
                    : fallbackMax,
              };
            } else {
              updated = {
                ...updated,
                max_appointments: 0,
              };
            }
          }

          return updated;
        })
      )
    );
  };


  const saveWorkingHours = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/working-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workingHours }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save working hours');
      }

      if (result.workingHours) {
        setWorkingHours(mergeWithDefaults(result.workingHours));
      }

      showSuccess('Working hours saved', 'Your weekly schedule has been updated.');
    } catch (error) {
      console.error('Error saving working hours:', error);
      showError(
        'Save failed',
        error instanceof Error ? error.message : 'Unable to save your working hours.'
      );
    } finally {
      setSaving(false);
    }
  };


  const generateTimeSlots = async () => {
    try {
      setGeneratingSlots(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const response = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate time slots');
      }

      const generatedCount = Array.isArray(result.summaries)
        ? result.summaries.filter((summary: any) => !summary.skipped && summary.generated > 0).length
        : 0;

      showSuccess(
        'Time slots generated',
        generatedCount > 0
          ? `Availability created for ${generatedCount} day${generatedCount === 1 ? '' : 's'}.`
          : 'Availability has been recalculated with no new open days.'
      );
    } catch (error) {
      console.error('Error generating time slots:', error);
      showError(
        'Generation failed',
        error instanceof Error ? error.message : 'Unable to generate time slots right now.'
      );
    } finally {
      setGeneratingSlots(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading working hours...</span>
      </div>
    );
  }

  const todayDow = new Date().getDay(); // 0 for Sunday, 6 for Saturday

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f5f1e9] dark:bg-gray-900/50 rounded-lg">
            <Clock className="w-6 h-6 text-[#9d9585] dark:text-[#c9c1b0]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Working Hours
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your clinic hours and generate appointment availability
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onPress={generateTimeSlots}
            isLoading={generatingSlots}
            className="bg-gradient-to-r from-[#b5ad9d] to-[#ddd5c3] text-[#3f3a31] hover:from-[#9d9585] hover:to-[#c9c1b0] font-semibold"
            startContent={<Calendar className="w-4 h-4" />}
          >
            Generate Slots
          </Button>
          <Button
            onPress={saveWorkingHours}
            isLoading={saving}
            className="bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] hover:from-[#8c846f] hover:to-[#b5ad9d] font-semibold"
            startContent={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Working Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workingHours.map((hour) => {
              const dayInfo = DAYS.find((d) => d.value === hour.day_of_week);
              const isToday = hour.day_of_week === todayDow;
              const isClosed = !hour.is_working_day;
              const summaryText = isClosed
                ? 'Clinic closed for bookings'
                : `Open ${hour.start_time} – ${hour.end_time}`;

              return (
                <div
                  key={hour.day_of_week}
                  className={`rounded-2xl border-2 ${
                    isToday
                      ? 'border-[#c4b5a0] ring-2 ring-[#c4b5a0]/30 shadow-xl bg-gradient-to-br from-[#fdfbf8] to-[#faf7f1] dark:from-gray-900/50 dark:to-gray-800/50'
                      : 'border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-800'
                  } px-6 py-6 transition-all duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#9d9585] dark:text-[#c9c1b0] px-2 py-1 rounded-md bg-[#f5f1e9] dark:bg-gray-700/50">
                          {dayInfo?.short}
                        </span>
                        {isToday && (
                          <span className="text-xs font-bold text-white bg-gradient-to-r from-[#9d9585] to-[#b5ad9d] dark:from-[#6b5f4b] dark:to-[#9d9585] px-3 py-1 rounded-full shadow-sm">
                            Today
                          </span>
                        )}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {dayInfo?.label ?? 'Day'}
                      </h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{summaryText}</p>
                    </div>

                    <label className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#c9c1b0] dark:hover:border-gray-600 transition-colors cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={hour.is_working_day}
                        onChange={(e) =>
                          handleWorkingHourChange(hour.day_of_week, 'is_working_day', e.target.checked)
                        }
                        className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 text-[#9d9585] focus:ring-2 focus:ring-[#c9c1b0]/40 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{hour.is_working_day ? 'Open' : 'Closed'}</span>
                    </label>
                  </div>

                  {isClosed ? (
                    <div className="rounded-xl border-2 border-dashed border-[#e4d9c8] dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 px-5 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-1">
                          <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Clinic Closed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Toggle to "Open" to enable appointments</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2.5 h-6 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#9d9585] dark:text-[#c9c1b0] flex-shrink-0" />
                            <span>Opens at</span>
                          </label>
                          <input
                            type="time"
                            value={hour.start_time}
                            onChange={(e) =>
                              handleWorkingHourChange(hour.day_of_week, 'start_time', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-12"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2.5 h-6 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#9d9585] dark:text-[#c9c1b0] flex-shrink-0" />
                            <span>Closes at</span>
                          </label>
                          <input
                            type="time"
                            value={hour.end_time}
                            onChange={(e) =>
                              handleWorkingHourChange(hour.day_of_week, 'end_time', e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-12"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2.5 h-6 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#9d9585] dark:text-[#c9c1b0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Buffer (min)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={hour.buffer_minutes}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                hour.day_of_week,
                                'buffer_minutes',
                                Math.max(0, parseInt(e.target.value, 10) || 0)
                              )
                            }
                            className="w-full rounded-xl border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-12"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2.5 h-6 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#9d9585] dark:text-[#c9c1b0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Max Appointments</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={hour.max_appointments}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                hour.day_of_week,
                                'max_appointments',
                                Math.max(1, parseInt(e.target.value, 10) || 1)
                              )
                            }
                            className="w-full rounded-xl border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
}
