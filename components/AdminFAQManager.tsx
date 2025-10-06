"use client";

import React, { useState, useEffect } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import { FAQItem } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";

// Modal Component
function FAQModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem, 
  formData, 
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingItem: FAQItem | null;
  formData: any;
  setFormData: (data: any) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingItem ? "Edit FAQ Item" : "Add New FAQ Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, question: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter the FAQ question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, answer: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Enter the FAQ answer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.value === "active" }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="active">Active (Visible to customers)</option>
                <option value="inactive">Inactive (Hidden from customers)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {editingItem ? "Update FAQ" : "Add FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminFAQManager({ triggerModal }: { triggerModal?: boolean }) {
  const { faqItems, isLoading, error, addFAQItem, updateFAQItem, deleteFAQItem } = useFAQ(true);
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();
  
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const defaultItem = {
    question: "",
    answer: "",
    order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultItem);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      handleAddNew();
    }
  }, [triggerModal]);

  const handleSave = async () => {
    try {
      if (editingItem && editingItem.id) {
        await updateFAQItem(editingItem.id, formData);
        showSuccess(ToastMessages.faq.itemUpdated.title, ToastMessages.faq.itemUpdated.message);
        setEditingItem(null);
        setShowModal(false);
      } else {
        await addFAQItem(formData);
        showSuccess(ToastMessages.faq.itemAdded.title, ToastMessages.faq.itemAdded.message);
        setShowModal(false);
      }
      setFormData({ ...defaultItem });
    } catch (err) {
      showError(ToastMessages.faq.error.title, ToastMessages.faq.error.message);
    }
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData((prev: any) => ({
      question: item.question,
      answer: item.answer,
      order: item.order,
      is_active: item.is_active,
    }));
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData((prev: any) => defaultItem);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await confirm(
        {
          title: "Delete FAQ Item",
          message: "Are you sure you want to delete this FAQ item? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true
        },
        async () => {
        await deleteFAQItem(id);
        showSuccess(ToastMessages.faq.itemDeleted.title, ToastMessages.faq.itemDeleted.message);
        }
      );
      } catch (err) {
        showError(ToastMessages.faq.error.title, ToastMessages.faq.error.message);
    }
  };

  const handleToggleActive = async (item: FAQItem) => {
    try {
      await updateFAQItem(item.id, { is_active: !item.is_active });
      showSuccess(
        item.is_active ? "FAQ Item Disabled" : "FAQ Item Enabled", 
        item.is_active 
          ? "FAQ item has been disabled and is no longer visible to customers." 
          : "FAQ item has been enabled and is now visible to customers."
      );
    } catch (err) {
      showError(ToastMessages.faq.error.title, ToastMessages.faq.error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQ items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* FAQ Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {faqItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.question}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Order: {item.order}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Content Preview */}
            <div className="p-6">
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Answer Preview
                </h5>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {item.answer}
                  </p>
                  {item.answer.length > 150 && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      +{item.answer.length - 150} more characters
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.question.length} chars
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.answer.length} chars
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    item.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  {item.is_active ? 'Disable' : 'Enable'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium dark:bg-red-900/30 dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {faqItems.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No FAQ items yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first FAQ item to help customers find answers to common questions.
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First FAQ
          </button>
        </div>
      )}

      {/* Modal */}
      <FAQModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setFormData(defaultItem);
        }}
        onSubmit={handleSave}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
} 