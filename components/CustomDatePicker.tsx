"use client";

import { useState, useEffect } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate: string;
  maxDate: string;
  dayOffPeriods: Array<{
    start_date: string;
    end_date: string;
    title: string;
  }>;
  className?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  dayOffPeriods,
  className = ""
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Check if a date is in a day-off period
  const isDateDisabled = (date: string) => {
    return dayOffPeriods.some(period => {
      const dateObj = new Date(date + 'T00:00:00');
      const startDate = new Date(period.start_date + 'T00:00:00');
      const endDate = new Date(period.end_date + 'T23:59:59');
      return dateObj >= startDate && dateObj <= endDate;
    });
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Create date string in YYYY-MM-DD format without timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const isCurrentMonth = date.getMonth() === (parseInt(month) - 1);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = dateString === value;
      const isDisabled = date < minDateObj || date > maxDateObj || isDateDisabled(dateString);
      const isPast = date < todayStart;

      days.push({
        date,
        dateString,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
        isPast
      });
    }

    return days;
  };

  const handleDateClick = (dateString: string, isDisabled: boolean) => {
    if (!isDisabled) {
      onChange(dateString);
      setIsOpen(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: string) => {
    if (!date) return "Select date";
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-gray-900 dark:text-white" : "text-gray-500"}>
            {formatDate(value)}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {getCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day.dateString, day.isDisabled)}
                disabled={day.isDisabled}
                className={`
                  p-2 text-xs rounded-md transition-colors
                  ${day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
                  ${day.isToday ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}
                  ${day.isSelected ? 'bg-blue-500 text-white' : ''}
                  ${day.isDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}
                  ${day.isPast ? 'text-gray-300 dark:text-gray-600' : ''}
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>

          {/* Day-off warning */}
          {dayOffPeriods.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Day-off periods: {dayOffPeriods.map(period => 
                  `${period.start_date} to ${period.end_date}`
                ).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 