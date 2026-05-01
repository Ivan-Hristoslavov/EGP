"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input, Textarea } from "@heroui/react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import { inputClassNames, formLayout } from "@/config/design-system";
import { Customer } from "@/types";

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerId: string, customerData: any) => Promise<void>;
  customer: Customer | null;
  isLoading?: boolean;
}

export function EditCustomerModal({
  isOpen,
  onClose,
  onSubmit,
  customer,
  isLoading = false,
}: EditCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !customer) {
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim() || null,
      notes: formData.notes.trim() || null,
    };

    await onSubmit(customer.id, customerData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  return (
    <Modal
      classNames={{ base: "max-w-[95vw] sm:max-w-2xl mx-2" }}
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
              <h3 className="text-lg sm:text-xl font-bold">Edit Customer</h3>
            </ModalHeader>
            <ModalBody className={formLayout.modalBody}>
              <div className={formLayout.sectionGap}>
                {Object.keys(errors).length > 0 && (
                  <Chip className="w-full" color="danger" variant="flat">
                    Please fix the errors below
                  </Chip>
                )}
                <div className={formLayout.gridFields}>
                  <Input
                    isClearable
                    isRequired
                    classNames={inputClassNames}
                    errorMessage={errors.name}
                    isDisabled={isLoading}
                    isInvalid={!!errors.name}
                    label="Full Name"
                    labelPlacement="outside"
                    placeholder="e.g., John Smith"
                    value={formData.name}
                    variant="bordered"
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  <Input
                    isClearable
                    isRequired
                    classNames={inputClassNames}
                    errorMessage={errors.email}
                    isDisabled={isLoading}
                    isInvalid={!!errors.email}
                    label="Email Address"
                    labelPlacement="outside"
                    placeholder="e.g., john@example.com"
                    type="email"
                    value={formData.email}
                    variant="bordered"
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                  />
                  <Input
                    isClearable
                    isRequired
                    classNames={inputClassNames}
                    errorMessage={errors.phone}
                    isDisabled={isLoading}
                    isInvalid={!!errors.phone}
                    label="Phone Number"
                    labelPlacement="outside"
                    placeholder="e.g. +44 7XXX XXXXXX"
                    type="tel"
                    value={formData.phone}
                    variant="bordered"
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                  />
                  <div className={formLayout.fullWidth}>
                    <Textarea
                      errorMessage={errors.address}
                      isDisabled={isLoading}
                      isInvalid={!!errors.address}
                      label="Address"
                      placeholder="Optional — full address including postcode"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        setErrors((prev) => ({ ...prev, address: "" }));
                      }}
                    />
                  </div>
                  <div className={formLayout.fullWidth}>
                    <Textarea
                      isDisabled={isLoading}
                      label="Notes"
                      placeholder="Any additional notes about this customer..."
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 gap-2 flex-col-reverse sm:flex-row">
              <Button isDisabled={isLoading} variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={handleSubmit}
              >
                Update Customer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
