"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Calendar as CalendarIcon } from "lucide-react";


export type CalendarMoveBookingTarget = {
  customer_name: string;
  service: string;
  date: string;
  time: string;
};

export type CalendarMoveBookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: CalendarMoveBookingTarget | null;
  moveTargetDate: string;
  onMoveTargetDateChange: (value: string) => void;
  useCustomTime: boolean;
  onUseCustomTimeChange: (value: boolean) => void;
  customTime: string;
  onCustomTimeChange: (value: string) => void;
  loadingSlots: boolean;
  moveAvailableSlots: string[];
  minSelectableDate: string;
  formatTime: (time: string) => string;
  onMove: (timeSlot?: string) => void;
};

export function CalendarMoveBookingModal(props: CalendarMoveBookingModalProps) {
  const {
    isOpen,
    onClose,
    booking,
    moveTargetDate,
    onMoveTargetDateChange,
    useCustomTime,
    onUseCustomTimeChange,
    customTime,
    onCustomTimeChange,
    loadingSlots,
    moveAvailableSlots,
    minSelectableDate,
    formatTime,
    onMove,
  } = props;

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Move Booking</span>
          </div>
          {booking ? (
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              Moving: {booking.customer_name} - {booking.service}
            </p>
          ) : null}
        </ModalHeader>
        <ModalBody>
          {booking ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Current Booking
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Date:
                    </span>
                    <span className="ml-2 font-medium">
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Time:
                    </span>
                    <span className="ml-2 font-medium">
                      {formatTime(booking.time)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select New Date
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  min={minSelectableDate}
                  type="date"
                  value={moveTargetDate}
                  onChange={(e) => onMoveTargetDateChange(e.target.value)}
                />
              </div>

              {moveTargetDate ? (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select New Time
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        checked={useCustomTime}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        id="useCustomTime"
                        type="checkbox"
                        onChange={(e) =>
                          onUseCustomTimeChange(e.target.checked)
                        }
                      />
                      <label
                        className="text-sm text-gray-600 dark:text-gray-400"
                        htmlFor="useCustomTime"
                      >
                        Use custom time
                      </label>
                    </div>
                  </div>

                  {useCustomTime ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Custom Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          type="time"
                          value={customTime}
                          onChange={(e) => onCustomTimeChange(e.target.value)}
                        />
                        <button
                          className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          disabled={!customTime}
                          type="button"
                          onClick={() => onMove()}
                        >
                          Move
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {loadingSlots ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Available time slots for{" "}
                            {new Date(moveTargetDate).toLocaleDateString()}:
                          </div>
                          <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/50">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="animate-pulse rounded-lg bg-gray-200 px-3 py-2 dark:bg-gray-700"
                              >
                                <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-600" />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-purple-600" />
                            <span>Loading available slots...</span>
                          </div>
                        </div>
                      ) : moveAvailableSlots.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Available time slots for{" "}
                            {new Date(moveTargetDate).toLocaleDateString()}:
                          </div>
                          <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/50">
                            {moveAvailableSlots.map((timeSlot) => (
                              <button
                                key={timeSlot}
                                className="rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50"
                                type="button"
                                onClick={() => onMove(timeSlot)}
                              >
                                {formatTime(timeSlot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border bg-gray-50 py-8 text-center text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                          <div className="mb-2 text-lg">📅</div>
                          <div className="font-medium">
                            No available time slots
                          </div>
                          <div className="text-sm">
                            for {new Date(moveTargetDate).toLocaleDateString()}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            Try selecting a different date or use custom time
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
