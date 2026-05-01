"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      backdrop="blur"
      hideCloseButton={isLoading}
      isDismissable={!isLoading}
      isOpen={isOpen}
      size="md"
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDestructive
                      ? "bg-danger-100 dark:bg-danger-900/30"
                      : "bg-warning-100 dark:bg-warning-900/30"
                  }`}
                >
                  {isDestructive ? (
                    <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
            </ModalHeader>
            <ModalBody>
              <p className="text-default-600 dark:text-default-400 leading-relaxed">
                {message}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button isDisabled={isLoading} variant="light" onPress={onClose}>
                {cancelText}
              </Button>
              <Button
                color={isDestructive ? "danger" : "primary"}
                isDisabled={isLoading}
                isLoading={isLoading}
                onPress={onConfirm}
              >
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
