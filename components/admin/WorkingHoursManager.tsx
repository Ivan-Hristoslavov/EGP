"use client";

import { useState, useEffect } from "react";
import { Clock, Save, RefreshCw, Calendar, Settings } from "lucide-react";
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

interface ServiceDuration {
  id: string;
  service_name: string;
  duration_minutes: number;
  buffer_minutes: number;
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
  const [serviceDurations, setServiceDurations] = useState<ServiceDuration[]>([]);
  const [serviceDurationsOriginal, setServiceDurationsOriginal] = useState<ServiceDuration[]>([]);
  const [serviceDurationsDirty, setServiceDurationsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDurations, setSavingDurations] = useState(false);
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

      const servicesResponse = await fetch('/api/admin/service-durations');
      const servicesData = await servicesResponse.json();
      
      if (!servicesResponse.ok) {
        throw new Error(servicesData.error || 'Failed to load service durations');
      }

      setServiceDurations(servicesData.services || []);
      setServiceDurationsOriginal((servicesData.services || []).map((svc: ServiceDuration) => ({ ...svc })));
      setServiceDurationsDirty(false);
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
        showSuccess('Schedule refreshed', 'Working hours and durations are up to date.');
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

  const getChangedServiceDurations = (list: ServiceDuration[] = serviceDurations) => {
    const originalById = new Map(serviceDurationsOriginal.map((item) => [item.id, item]));
    return list.filter((service) => {
      const original = originalById.get(service.id);
      if (!original) return true;
      return (
        service.duration_minutes !== original.duration_minutes ||
        service.buffer_minutes !== original.buffer_minutes
      );
    });
  };

  const handleServiceDurationChange = (id: string, field: keyof ServiceDuration, value: any) => {
    setServiceDurations(prev => {
      const next = prev.map(service =>
        service.id === id
          ? { ...service, [field]: value }
          : service
      );
      setServiceDurationsDirty(getChangedServiceDurations(next).length > 0);
      return next;
    });
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

  const saveServiceDurations = async () => {
    const changes = getChangedServiceDurations();
    if (changes.length === 0) {
      setServiceDurationsDirty(false);
      showSuccess('Nothing to save', 'Service durations are already up to date.');
      return;
    }

    try {
      setSavingDurations(true);
      await Promise.all(
        changes.map((service) =>
          fetch('/api/admin/service-durations', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: service.id,
              duration_minutes: service.duration_minutes,
              buffer_minutes: service.buffer_minutes,
            }),
          }).then(async (response) => {
            const payload = await response.json();
            if (!response.ok || !payload.success) {
              throw new Error(payload.error || 'Failed to update service duration');
            }
            return payload.service;
          })
        )
      );

      setServiceDurationsOriginal(serviceDurations.map((svc) => ({ ...svc })));
      setServiceDurationsDirty(false);
      showSuccess('Service durations saved', 'Updated treatment timings have been applied.');
    } catch (error) {
      console.error('Error saving service durations:', error);
      showError(
        'Save failed',
        error instanceof Error ? error.message : 'Unable to update service durations right now.'
      );
    } finally {
      setSavingDurations(false);
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
              Working Hours & Time Slots
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your clinic hours and appointment availability
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e4d9c8] dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#e4d9c8] dark:border-gray-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#f5f1e9] dark:bg-gray-900/60">
            <Settings className="w-5 h-5 text-[#6b5f4b] dark:text-[#c9c1b0]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Working Hours</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set the availability for each day of the week
            </p>
          </div>
        </div>
        <div className="p-6">
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
                  className={`rounded-2xl border ${
                    isToday
                      ? 'border-[#c4b5a0] ring-2 ring-[#c4b5a0]/30 shadow-lg'
                      : 'border-[#e4d9c8] dark:border-gray-700'
                  } bg-[#fdfbf8] dark:bg-gray-900/40 px-5 py-6 transition-shadow duration-200`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wide text-[#9d9585] dark:text-[#c9c1b0]">
                          {dayInfo?.short}
                        </span>
                        {isToday && (
                          <span className="text-xs font-semibold text-[#6b5f4b] dark:text-[#c9c1b0] bg-[#f0ede7] dark:bg-gray-800 px-2 py-1 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {dayInfo?.label ?? 'Day'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{summaryText}</p>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={hour.is_working_day}
                        onChange={(e) =>
                          handleWorkingHourChange(hour.day_of_week, 'is_working_day', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-[#9d9585] focus:ring-[#c9c1b0]"
                      />
                      <span>{hour.is_working_day ? 'Open' : 'Closed'}</span>
                    </label>
                  </div>

                  {isClosed ? (
                    <div className="mt-4 rounded-xl border border-dashed border-[#e4d9c8] dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 px-4 py-5 text-sm text-gray-600 dark:text-gray-400">
                      Clients cannot book this day. Toggle to "Open" to enable appointments.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Opens at
                          </span>
                          <input
                            type="time"
                            value={hour.start_time}
                            onChange={(e) =>
                              handleWorkingHourChange(hour.day_of_week, 'start_time', e.target.value)
                            }
                            className="w-full rounded-lg border border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Closes at
                          </span>
                          <input
                            type="time"
                            value={hour.end_time}
                            onChange={(e) =>
                              handleWorkingHourChange(hour.day_of_week, 'end_time', e.target.value)
                            }
                            className="w-full rounded-lg border border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Buffer between appointments (min)
                          </span>
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
                            className="w-full rounded-lg border border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Maximum appointments per day
                          </span>
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
                            className="w-full rounded-lg border border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
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
      </div>

      {/* Service Durations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e4d9c8] dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#e4d9c8] dark:border-gray-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#f5f1e9] dark:bg-gray-900/60">
            <Clock className="w-5 h-5 text-[#6b5f4b] dark:text-[#c9c1b0]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Durations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set duration and buffer time for each service
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f1e9] dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Duration (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Buffer (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Total Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede7] dark:divide-gray-700">
              {serviceDurations.map((service) => (
                <tr key={service.id} className="hover:bg-[#fdfbf8] dark:hover:bg-gray-900/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {service.service_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="15"
                      max="300"
                      value={service.duration_minutes}
                      onChange={(e) =>
                        handleServiceDurationChange(service.id, 'duration_minutes', parseInt(e.target.value, 10) || service.duration_minutes)
                      }
                      className="border border-[#e4d9c8] dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-20 focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={service.buffer_minutes}
                      onChange={(e) =>
                        handleServiceDurationChange(service.id, 'buffer_minutes', Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      className="border border-[#e4d9c8] dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-20 focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {service.duration_minutes + service.buffer_minutes} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e4d9c8] dark:border-gray-700 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#6b5f4b] dark:text-[#c9c1b0] uppercase tracking-wide">Quick actions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage availability, durations and cached slots from one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onPress={generateTimeSlots}
            isLoading={generatingSlots}
            className="bg-gradient-to-r from-[#b5ad9d] to-[#ddd5c3] text-[#3f3a31] hover:from-[#9d9585] hover:to-[#c9c1b0]"
          >
            Generate slots
          </Button>
          <Button
            size="sm"
            onPress={saveWorkingHours}
            isLoading={saving}
            className="bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] hover:from-[#8c846f] hover:to-[#b5ad9d]"
          >
            Save hours
          </Button>
          <Button
            size="sm"
            onPress={saveServiceDurations}
            isLoading={savingDurations}
            isDisabled={!serviceDurationsDirty && !savingDurations}
            className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] hover:from-[#8c846f] hover:to-[#b5ad9d] disabled:opacity-60"
          >
            Save durations
          </Button>
          <Button
            size="sm"
            onPress={() => loadData({ silent: true, showToast: true })}
            isLoading={refreshing}
            className="bg-white dark:bg-gray-900 text-[#6b5f4b] dark:text-[#c9c1b0] border border-[#e4d9c8] dark:border-gray-700 hover:bg-[#f0ede7] dark:hover:bg-gray-800"
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
