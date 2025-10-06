"use client";

import { useState, useCallback } from "react";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (() => void) | (() => Promise<void>);
  onCancel: () => void;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    isLoading: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDestructive: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = useCallback((
    options: ConfirmationOptions,
    onConfirm: (() => void) | (() => Promise<void>)
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        isLoading: false,
        onConfirm: async () => {
          try {
            setState(prev => ({ ...prev, isLoading: true }));
            await onConfirm();
            setState(prev => ({ ...prev, isOpen: false, isLoading: false }));
            resolve(true);
          } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            console.error("Confirmation action failed:", error);
            throw error;
          }
        },
        onCancel: () => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (state.isLoading) return;
    state.onCancel();
  }, [state.isLoading, state.onCancel]);

  const handleConfirm = useCallback(() => {
    if (state.isLoading) return;
    state.onConfirm();
  }, [state.isLoading, state.onConfirm]);

  return {
    confirm,
    modalProps: {
      isOpen: state.isOpen,
      onClose: handleClose,
      onConfirm: handleConfirm,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      isDestructive: state.isDestructive,
      isLoading: state.isLoading
    }
  };
} 