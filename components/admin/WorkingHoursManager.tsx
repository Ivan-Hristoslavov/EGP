"use client";

import { useState, useEffect } from "react";
import { Clock, Save, RefreshCw, Calendar, Settings } from "lucide-react";
import { Button } from "@heroui/react";

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
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export default function WorkingHoursManager() {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [serviceDurations, setServiceDurations] = useState<ServiceDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  // Load working hours and service durations
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load working hours
      const hoursResponse = await fetch('/api/admin/working-hours');
      const hoursData = await hoursResponse.json();
      
      if (hoursData.workingHours) {
        setWorkingHours(hoursData.workingHours);
      } else {
        // Initialize with default working hours
        const defaultHours = DAYS.map(day => ({
          day_of_week: day.value,
          start_time: day.value === 0 || day.value === 6 ? "10:00" : "09:00",
          end_time: day.value === 0 || day.value === 6 ? "16:00" : "18:00",
          is_working_day: day.value !== 0, // Closed on Sunday
          buffer_minutes: 15,
          max_appointments: day.value === 6 ? 8 : 12
        }));
        setWorkingHours(defaultHours);
      }

      // Load service durations
      const servicesResponse = await fetch('/api/admin/service-durations');
      const servicesData = await servicesResponse.json();
      
      if (servicesData.services) {
        setServiceDurations(servicesData.services);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingHourChange = (dayOfWeek: number, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { ...hour, [field]: value }
          : hour
      )
    );
  };

  const handleServiceDurationChange = (id: string, field: keyof ServiceDuration, value: any) => {
    setServiceDurations(prev =>
      prev.map(service =>
        service.id === id
          ? { ...service, [field]: value }
          : service
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
      
      if (result.success) {
        alert('Working hours saved successfully!');
      } else {
        alert('Error saving working hours: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving working hours:', error);
      alert('Error saving working hours');
    } finally {
      setSaving(false);
    }
  };

  const generateTimeSlots = async () => {
    try {
      setGeneratingSlots(true);
      
      // Generate slots for the next 30 days
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
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Generated time slots for ${result.results.length} days!`);
      } else {
        alert('Error generating time slots: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating time slots:', error);
      alert('Error generating time slots');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
            color="primary"
            variant="light"
            onPress={generateTimeSlots}
            isLoading={generatingSlots}
            startContent={<Calendar className="w-4 h-4" />}
          >
            Generate Slots
          </Button>
          <Button
            color="primary"
            onPress={saveWorkingHours}
            isLoading={saving}
            startContent={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Working Hours Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Working Hours
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set your clinic operating hours for each day of the week
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Working Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Buffer (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Max Appointments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {workingHours.map((hour) => {
                const dayInfo = DAYS.find(d => d.value === hour.day_of_week);
                return (
                  <tr key={hour.day_of_week} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {dayInfo?.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hour.is_working_day}
                          onChange={(e) => handleWorkingHourChange(hour.day_of_week, 'is_working_day', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {hour.is_working_day ? 'Open' : 'Closed'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="time"
                        value={hour.start_time}
                        onChange={(e) => handleWorkingHourChange(hour.day_of_week, 'start_time', e.target.value)}
                        disabled={!hour.is_working_day}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="time"
                        value={hour.end_time}
                        onChange={(e) => handleWorkingHourChange(hour.day_of_week, 'end_time', e.target.value)}
                        disabled={!hour.is_working_day}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={hour.buffer_minutes}
                        onChange={(e) => handleWorkingHourChange(hour.day_of_week, 'buffer_minutes', parseInt(e.target.value))}
                        disabled={!hour.is_working_day}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 w-20"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={hour.max_appointments}
                        onChange={(e) => handleWorkingHourChange(hour.day_of_week, 'max_appointments', parseInt(e.target.value))}
                        disabled={!hour.is_working_day}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 w-20"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Durations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Service Durations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set duration and buffer time for each service
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Buffer (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {serviceDurations.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      onChange={(e) => handleServiceDurationChange(service.id, 'duration_minutes', parseInt(e.target.value))}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-20"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={service.buffer_minutes}
                      onChange={(e) => handleServiceDurationChange(service.id, 'buffer_minutes', parseInt(e.target.value))}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-20"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {service.duration_minutes + service.buffer_minutes} min
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Generate Time Slots</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Create available appointment slots for the next 30 days
            </p>
            <Button
              size="sm"
              color="primary"
              variant="light"
              onPress={generateTimeSlots}
              isLoading={generatingSlots}
            >
              Generate Now
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Save Settings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Save your working hours and service duration changes
            </p>
            <Button
              size="sm"
              color="primary"
              variant="light"
              onPress={saveWorkingHours}
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Refresh Data</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Reload working hours and service data from database
            </p>
            <Button
              size="sm"
              color="primary"
              variant="light"
              onPress={loadData}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
