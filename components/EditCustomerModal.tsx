"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input, Textarea } from "@heroui/react";
import { inputClassNames, formLayout } from "@/config/design-system";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

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
  isLoading = false
}: EditCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
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
        notes: customer.notes || ""
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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
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
      address: formData.address.trim(),
      notes: formData.notes.trim() || null
    };

    await onSubmit(customer.id, customerData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
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
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      classNames={{ base: "max-w-[95vw] sm:max-w-2xl mx-2" }}
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
                  <Chip color="danger" variant="flat" className="w-full">
                    Please fix the errors below
                  </Chip>
                )}
            <div className={formLayout.gridFields}>
                  <Input
                    label="Full Name"
                    placeholder="e.g., John Smith"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    isRequired
                    isClearable
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    isDisabled={isLoading}
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={inputClassNames}
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="e.g., john@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    isRequired
                    isClearable
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    isDisabled={isLoading}
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={inputClassNames}
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="e.g. +44 7XXX XXXXXX"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    isRequired
                    isClearable
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone}
                    isDisabled={isLoading}
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={inputClassNames}
                  />
              <div className={formLayout.fullWidth}>
                    <Textarea
                      label="Address"
                      placeholder="Full address including postcode"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  rows={3}
                      isRequired
                      isInvalid={!!errors.address}
                      errorMessage={errors.address}
                      isDisabled={isLoading}
                    />
              </div>
                  <div className={formLayout.fullWidth}>
                    <Textarea
                      label="Notes"
                      placeholder="Any additional notes about this customer..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
                      isDisabled={isLoading}
            />
          </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 gap-2 flex-col-reverse sm:flex-row">
              <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
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