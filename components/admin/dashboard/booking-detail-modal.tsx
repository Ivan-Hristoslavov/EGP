"use client";

import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { formLayout } from "@/config/design-system";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: string;
  payment_status: string;
  amount: number;
  notes: string | null;
};

export function DashboardBookingDetailModal(props: {
  booking: Booking | null;
  onClose: () => void;
  onGoBookings: () => void;
  getStatusColor: (
    s: string,
  ) => "success" | "warning" | "danger" | "default" | "primary";
}) {
  return (
    <Modal isOpen={Boolean(props.booking)} size="md" onClose={props.onClose}>
      <ModalContent>
        {(onClose) =>
          props.booking ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-lg font-semibold">Booking details</span>
                <span className="text-xs font-normal text-default-500">
                  {props.booking.customer_name}
                </span>
              </ModalHeader>
              <ModalBody className={`${formLayout.modalBody} gap-4`}>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                    Customer
                  </p>
                  <p className="font-medium">{props.booking.customer_name}</p>
                  {props.booking.customer_email ? (
                    <p className="text-sm text-default-500">
                      {props.booking.customer_email}
                    </p>
                  ) : null}
                  {props.booking.customer_phone ? (
                    <p className="text-sm text-default-500">
                      {props.booking.customer_phone}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                    Service
                  </p>
                  <p className="font-medium">{props.booking.service}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                      Date
                    </p>
                    <p>{new Date(props.booking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                      Time
                    </p>
                    <p>{props.booking.time}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                      Status
                    </p>
                    <Chip
                      color={props.getStatusColor(props.booking.status)}
                      size="sm"
                      variant="flat"
                    >
                      {props.booking.status}
                    </Chip>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                      Payment
                    </p>
                    <Chip
                      color={
                        props.booking.payment_status === "paid"
                          ? "success"
                          : "warning"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {props.booking.payment_status}
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                    Amount
                  </p>
                  <p className="font-semibold">£{props.booking.amount}</p>
                </div>
                {props.booking.notes ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-default-500">
                      Notes
                    </p>
                    <p className="text-sm">{props.booking.notes}</p>
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => {
                    onClose();
                    props.onGoBookings();
                  }}
                >
                  Go to bookings
                </Button>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          ) : null
        }
      </ModalContent>
    </Modal>
  );
}
