"use client";

import React, { useState, useEffect } from "react";
import { usePricingCards } from "@/hooks/usePricingCards";
import { PricingCard, PricingCardTableRow, PricingCardNote } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";

// Modal Component
function PricingCardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCard, 
  formData, 
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingCard: PricingCard | null;
  formData: any;
  setFormData: (data: any) => void;
}) {
  if (!isOpen) return null;

  const defaultCard = {
    title: "",
    subtitle: "",
    table_headers: ["Day & Time", "Call-out Fee", "Labour Rate"],
    table_rows: [
      { "Day & Time": "Mon-Fri 08:00-18:00", "Call-out Fee": "£80", "Labour Rate": "£60-£80" }
    ] as PricingCardTableRow[],
    notes: [
      { icon: "✓", text: "Perfect for urgent repairs and smaller jobs", color: "green" }
    ] as PricingCardNote[],
    order: 0,
    is_enabled: true,
  };

  const addTableRow = () => {
    const newRow: Record<string, string> = {};
    formData.table_headers.forEach((header: string) => {
      newRow[header] = "";
    });
    setFormData((prev: any) => ({
      ...prev,
      table_rows: [...prev.table_rows, newRow]
    }));
  };

  const addTableHeader = () => {
    setFormData((prev: any) => ({
      ...prev,
      table_headers: [...prev.table_headers, `Column ${prev.table_headers.length + 1}`]
    }));
  };

  const updateTableHeader = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newHeaders = [...prev.table_headers];
      const oldHeader = newHeaders[index];
      newHeaders[index] = value;
      
      // Update all rows to use the new header name
      const newRows = prev.table_rows.map((row: any) => {
        const newRow = { ...row };
        if (oldHeader in newRow) {
          newRow[value] = newRow[oldHeader];
          delete newRow[oldHeader];
        }
        return newRow;
      });
      
      return {
        ...prev,
        table_headers: newHeaders,
        table_rows: newRows
      };
    });
  };

  const removeTableHeader = (index: number) => {
    setFormData((prev: any) => {
      const headerToRemove = prev.table_headers[index];
      const newHeaders = prev.table_headers.filter((_: any, i: number) => i !== index);
      
      // Remove the column from all rows
      const newRows = prev.table_rows.map((row: any) => {
        const newRow = { ...row };
        delete newRow[headerToRemove];
        return newRow;
      });
      
      return {
        ...prev,
        table_headers: newHeaders,
        table_rows: newRows
      };
    });
  };

  const updateTableRow = (index: number, field: keyof PricingCardTableRow, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      table_rows: prev.table_rows.map((row: any, i: number) => 
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const removeTableRow = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      table_rows: prev.table_rows.filter((_: any, i: number) => i !== index)
    }));
  };

  const addNote = () => {
    setFormData((prev: any) => ({
      ...prev,
      notes: [...prev.notes, { icon: "✓", text: "", color: "green" }]
    }));
  };

  const updateNote = (index: number, field: keyof PricingCardNote, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      notes: prev.notes.map((note: any, i: number) => 
        i === index ? { ...note, [field]: value } : note
      )
    }));
  };

  const removeNote = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      notes: prev.notes.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingCard ? "Edit Pricing Card" : "Add New Pricing Card"}
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
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Call-out & Hourly Labour Rates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Flexible hourly bookings"
              />
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, is_enabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable this pricing card (visible to customers)
                </span>
              </label>
            </div>
          </div>

          {/* Table Headers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Table Headers</h5>
              <button
                onClick={addTableHeader}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Add Column
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formData.table_headers.map((header: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateTableHeader(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formData.table_headers.length > 1 && (
                    <button
                      onClick={() => removeTableHeader(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Table Rows</h5>
              <button
                onClick={addTableRow}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                Add Row
              </button>
            </div>
            <div className="space-y-3">
              {formData.table_rows.map((row: any, index: number) => (
                <div key={index} className="grid gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" style={{gridTemplateColumns: `repeat(${formData.table_headers.length}, 1fr) auto`}}>
                  {formData.table_headers.map((header: string) => (
                    <input
                      key={header}
                      type="text"
                      value={row[header] || ""}
                      onChange={(e) => updateTableRow(index, header, e.target.value)}
                      placeholder={header}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ))}
                  <button
                    onClick={() => removeTableRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h5>
              <button
                onClick={addNote}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                Add Note
              </button>
            </div>
            <div className="space-y-3">
              {formData.notes.map((note: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={note.icon || ""}
                    onChange={(e) => updateNote(index, "icon", e.target.value)}
                    placeholder="Icon (e.g., ✓)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={note.text}
                    onChange={(e) => updateNote(index, "text", e.target.value)}
                    placeholder="Note text"
                    className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => removeNote(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
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
            {editingCard ? "Update Card" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPricingManager({ triggerModal }: { triggerModal?: boolean }) {
  const { pricingCards, loading, error, addPricingCard, updatePricingCard, deletePricingCard } = usePricingCards();
  const { showSuccess, showError } = useToast();
  
  const [editingCard, setEditingCard] = useState<PricingCard | null>(null);
  const [showModal, setShowModal] = useState(false);

  const defaultCard = {
    title: "",
    subtitle: "",
    table_headers: ["Day & Time", "Call-out Fee", "Labour Rate"],
    table_rows: [
      { "Day & Time": "Mon-Fri 08:00-18:00", "Call-out Fee": "£80", "Labour Rate": "£60-£80" }
    ] as PricingCardTableRow[],
    notes: [
      { icon: "✓", text: "Perfect for urgent repairs and smaller jobs", color: "green" }
    ] as PricingCardNote[],
    order: 0,
    is_enabled: true,
  };

  const [formData, setFormData] = useState(defaultCard);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      handleAddNew();
    }
  }, [triggerModal]);

  const handleSave = async () => {
    try {
      if (editingCard) {
        await updatePricingCard(editingCard.id, formData);
        showSuccess("Pricing Card Updated", "Your pricing card has been updated successfully.");
        setEditingCard(null);
        setShowModal(false);
      } else {
        await addPricingCard(formData);
        showSuccess("Pricing Card Added", "Your new pricing card has been added successfully.");
        setShowModal(false);
      }
      setFormData({ ...defaultCard });
    } catch (err) {
      showError("Error", "Failed to save pricing card. Please try again.");
    }
  };

  const handleEdit = (card: PricingCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      subtitle: card.subtitle || "",
      table_headers: card.table_headers,
      table_rows: card.table_rows,
      notes: card.notes,
      order: card.order,
      is_enabled: card.is_enabled,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setFormData({ ...defaultCard });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePricingCard(id);
      showSuccess("Pricing Card Deleted", "The pricing card has been deleted successfully.");
    } catch (err) {
      showError("Error", "Failed to delete pricing card. Please try again.");
    }
  };

  const handleToggleEnabled = async (card: PricingCard) => {
    try {
      await updatePricingCard(card.id, { is_enabled: !card.is_enabled });
      showSuccess(
        card.is_enabled ? "Pricing Card Disabled" : "Pricing Card Enabled", 
        card.is_enabled 
          ? "Pricing card has been disabled and is no longer visible to customers." 
          : "Pricing card has been enabled and is now visible to customers."
      );
    } catch (err) {
      showError("Error", "Failed to update pricing card status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pricing cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pricingCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {card.title}
                  </h4>
                  {card.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    card.is_enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {card.is_enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {card.table_rows.length} rows
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {card.notes.length} notes
                </div>
              </div>
            </div>

            {/* Card Content Preview */}
            <div className="p-6">
              {/* Table Preview */}
              {card.table_rows.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pricing Table
                  </h5>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {card.table_headers.join(" • ")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {card.table_rows.length} row{card.table_rows.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Preview */}
              {card.notes.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </h5>
                  <div className="space-y-1">
                    {card.notes.slice(0, 2).map((note, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">{note.icon}</span>
                        <span className="truncate">{note.text}</span>
                      </div>
                    ))}
                    {card.notes.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        +{card.notes.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggleEnabled(card)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    card.is_enabled
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  {card.is_enabled ? 'Disable' : 'Enable'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
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
      {pricingCards.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No pricing cards yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first pricing card to start displaying rates to customers.
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First Card
          </button>
        </div>
      )}

      {/* Modal */}
      <PricingCardModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCard(null);
          setFormData(defaultCard);
        }}
        onSubmit={handleSave}
        editingCard={editingCard}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
} 