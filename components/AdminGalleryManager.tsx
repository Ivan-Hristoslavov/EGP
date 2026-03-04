"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useServices } from "@/hooks/useServices";
import { GalleryItem } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { getSupportedFormatsText, processImageFile } from "@/lib/image-utils";
import Pagination from "@/components/Pagination";

export function AdminGalleryManager({
  triggerModal,
}: {
  triggerModal?: boolean;
}) {
  const {
    galleryItems,
    loading,
    error,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useGallery();
  const { services, isLoading: servicesLoading } = useServices();
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();

  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      // Clear editing state and reset form
      setEditingItem(null);
      setFormData({ ...defaultItem });
      setBeforeImage(null);
      setAfterImage(null);
      setBeforeImagePreview("");
      setAfterImagePreview("");
      setImageErrors({});
      setFieldErrors({});
      setUseCustomLocation(false);
      setShowAddForm(true);
    }
  }, [triggerModal]);

  // Image file states
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  
  // Location selection state
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>("");
  const [afterImagePreview, setAfterImagePreview] = useState<string>("");
  const [imageErrors, setImageErrors] = useState<{
    before?: string;
    after?: string;
  }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    title?: boolean;
    category_id?: boolean;
    service_id?: boolean;
    completion_date?: boolean;
    before?: boolean;
    after?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSliderPosition, setPreviewSliderPosition] = useState(50);

  const defaultItem = {
    title: "",
    description: "",
    before_image_url: "",
    after_image_url: "",
    project_type: "",
    location: "",
    completion_date: "",
    service_id: undefined as string | undefined,
    category_id: undefined as string | undefined,
    order: 0,
    is_featured: false,
  };

  const [formData, setFormData] = useState(defaultItem);

  // Group categories by main tab
  const categoriesByMainTab = useMemo(() => {
    const grouped: Record<string, Array<{ id: string; name: string; slug: string }>> = {};
    services.forEach(service => {
      const mainTabSlug = service.main_tab.slug;
      const categoryId = service.category.id;
      if (!grouped[mainTabSlug]) {
        grouped[mainTabSlug] = [];
      }
      const exists = grouped[mainTabSlug].some(cat => cat.id === categoryId);
      if (!exists) {
        grouped[mainTabSlug].push({
          id: service.category.id,
          name: service.category.name,
          slug: service.category.slug
        });
      }
    });
    return grouped;
  }, [services]);

  // Get services filtered by selected category
  const filteredServices = useMemo(() => {
    if (!formData.category_id) return services;
    return services.filter(service => service.category.id === formData.category_id);
  }, [services, formData.category_id]);

  // Get main tabs list
  const mainTabs = useMemo(() => {
    const tabs = new Map<string, { id: string; name: string; slug: string }>();
    services.forEach(service => {
      if (!tabs.has(service.main_tab.slug)) {
        tabs.set(service.main_tab.slug, {
          id: service.main_tab.id,
          name: service.main_tab.name,
          slug: service.main_tab.slug
        });
      }
    });
    return Array.from(tabs.values());
  }, [services]);

  const handleImageUpload = async (file: File, type: "before" | "after") => {
    try {
      // Validate the file first
      const validation = await processImageFile(file, 10, false); // Don't compress yet
      
      // Clear error and set file
      setImageErrors((prev) => ({ ...prev, [type]: undefined }));
      setFieldErrors((prev) => ({ ...prev, [type]: false }));

      // Use processed file (HEIC converted to JPEG in browser when possible)
      const fileToUse = validation.file;
      if (type === "before") {
        if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(beforeImagePreview);
        }
        setBeforeImage(fileToUse);
        setBeforeImagePreview(URL.createObjectURL(fileToUse));
      } else {
        if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(afterImagePreview);
        }
        setAfterImage(fileToUse);
        setAfterImagePreview(URL.createObjectURL(fileToUse));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process image";
      setImageErrors((prev) => ({
        ...prev,
        [type]: errorMessage,
      }));
      
      // Show toast error for better user feedback
      showError(
        "Image Upload Error",
        `Failed to process ${type} image: ${errorMessage}`
      );
    }
  };


  const clearImage = (type: "before" | "after") => {
    if (type === "before") {
      // Revoke the object URL to free memory
      if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(beforeImagePreview);
      }
      setBeforeImage(null);
      setBeforeImagePreview("");
      if (editingItem) {
        setFormData((prev) => ({ ...prev, before_image_url: "" }));
      }
    } else {
      // Revoke the object URL to free memory
      if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(afterImagePreview);
      }
      setAfterImage(null);
      setAfterImagePreview("");
      if (editingItem) {
        setFormData((prev) => ({ ...prev, after_image_url: "" }));
      }
    }
  };

  const uploadImages = async (): Promise<{
    beforeUrl: string;
    afterUrl: string;
  }> => {
    const formDataUpload = new FormData();

    if (beforeImage) {
      formDataUpload.append("beforeImage", beforeImage);
    }
    if (afterImage) {
      formDataUpload.append("afterImage", afterImage);
    }

    // If editing and no new images, keep existing URLs
    if (!beforeImage && !afterImage && editingItem) {
      return {
        beforeUrl: formData.before_image_url,
        afterUrl: formData.after_image_url,
      };
    }

    const response = await fetch("/api/gallery/upload-images", {
      method: "POST",
      body: formDataUpload,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    return {
      beforeUrl: result.beforeUrl || formData.before_image_url,
      afterUrl: result.afterUrl || formData.after_image_url,
    };
  };

  const handleSave = async () => {
    // Validate required fields and set red borders
    const errors: typeof fieldErrors = {};
    if (!formData.title?.trim()) errors.title = true;
    if (!formData.category_id) errors.category_id = true;
    if (!formData.service_id) errors.service_id = true;
    if (!formData.completion_date) errors.completion_date = true;
    if (!editingItem) {
      if (!beforeImage && !formData.before_image_url) errors.before = true;
      if (!afterImage && !formData.after_image_url) errors.after = true;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showError(
        "Validation Error",
        "Please fill in all required fields (marked in red) and upload both before and after images for new items."
      );
      return;
    }

    // Prevent double submit
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Upload images first (only if new images are provided)
      let beforeUrl = formData.before_image_url;
      let afterUrl = formData.after_image_url;

      if (beforeImage || afterImage) {
        try {
          const uploadResult = await uploadImages();
          beforeUrl = uploadResult.beforeUrl || beforeUrl;
          afterUrl = uploadResult.afterUrl || afterUrl;
        } catch (uploadError) {
          showError(
            "Upload Error",
            uploadError instanceof Error ? uploadError.message : "Failed to upload images. Please try again."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const itemData = {
        ...formData,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
      };
      
      console.log('Saving gallery item:', itemData);
      
      if (editingItem) {
        await updateGalleryItem(editingItem.id, itemData);
        showSuccess(
          ToastMessages.gallery.itemUpdated.title,
          ToastMessages.gallery.itemUpdated.message
        );
        setEditingItem(null);
        setShowAddForm(false);
      } else {
        await addGalleryItem({
          ...itemData,
          is_active: true,
        });
        showSuccess(
          ToastMessages.gallery.itemAdded.title,
          ToastMessages.gallery.itemAdded.message
        );
        setShowAddForm(false);
      }
      // Reset form and images
      setFormData({ ...defaultItem });
      setBeforeImage(null);
      setAfterImage(null);
      setUseCustomLocation(false);
      
      // Revoke object URLs before clearing
      if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(beforeImagePreview);
      }
      if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(afterImagePreview);
      }
      
      setBeforeImagePreview("");
      setAfterImagePreview("");
      setImageErrors({});
      setFieldErrors({});
    } catch (err) {
      console.error('Save error:', err);
      showError(
        ToastMessages.gallery.error.title,
        err instanceof Error ? err.message : ToastMessages.gallery.error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = () => {
    // Clear editing state
    setEditingItem(null);
    
    // Reset form data to defaults
    setFormData({ ...defaultItem });
    
    // Clear all image states and validation errors
    setBeforeImage(null);
    setAfterImage(null);
    setBeforeImagePreview("");
    setAfterImagePreview("");
    setImageErrors({});
    setFieldErrors({});
    setUseCustomLocation(false);
    
    // Show the form
    setShowAddForm(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFieldErrors({});
    // Location is free text (areas feature not used)
    setUseCustomLocation(!!item.location);
    
    setFormData({
      title: item.title,
      description: item.description || "",
      before_image_url: item.before_image_url || item.image_url || "",
      after_image_url: item.after_image_url || item.image_url || "",
      project_type: item.project_type || "",
      location: item.location || "",
      completion_date: item.completion_date || "",
      service_id: item.service_id,
      category_id: item.category_id,
      order: item.order,
      is_featured: item.is_featured || false,
    });

    // Set existing image previews
    setBeforeImagePreview(item.before_image_url || item.image_url || "");
    setAfterImagePreview(item.after_image_url || item.image_url || "");
    setBeforeImage(null);
    setAfterImage(null);
    setImageErrors({});

    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await confirm(
        {
          title: "Delete Gallery Item",
          message:
            "Are you sure you want to delete this gallery item? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true,
        },
        async () => {
          await deleteGalleryItem(id);
          showSuccess(
            ToastMessages.gallery.itemDeleted.title,
            ToastMessages.gallery.itemDeleted.message
          );
        }
      );
    } catch (err) {
      showError(
        ToastMessages.gallery.error.title,
        ToastMessages.gallery.error.message
      );
    }
  };


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);
  const paginatedItems = galleryItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6">
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transformation
          </button>
        </div>
      </div>

      {/* Gallery Items */}
      <>
          {/* Existing Gallery Items */}
          {/* Gallery Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 flex flex-col group overflow-hidden hover:border-rose-300 dark:hover:border-rose-700"
              >
                {/* Floating Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
                    title="Edit"
                    onClick={() => handleEdit(item)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
                    title="Delete"
                    onClick={async () => {
                      await confirm(
                        {
                          title: "Delete Gallery Item",
                          message: `Are you sure you want to delete "${item.title || 'this gallery item'}"? This action cannot be undone and will permanently remove the before/after images.`,
                          confirmText: "Delete",
                          cancelText: "Cancel",
                          isDestructive: true
                        },
                        async () => {
                          await deleteGalleryItem(item.id);
                        }
                      );
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 truncate pr-16">
                  {item.title || <span className="italic text-gray-400">(No title)</span>}
                </h3>
                
                {/* Before/After Images */}
                <div className="flex gap-3 mb-4">
                  {/* Before Card */}
                  <div className="flex-1 relative bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-red-200 dark:border-red-800 overflow-hidden group/image">
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Before
                    </div>
                    {item.before_image_url ? (
                      <img
                        src={item.before_image_url}
                        alt="Before"
                        className="w-full h-36 object-cover group-hover/image:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center text-gray-400">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  {/* After Card */}
                  <div className="flex-1 relative bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-green-800 overflow-hidden group/image">
                    <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      After
                    </div>
                    {item.after_image_url ? (
                      <img
                        src={item.after_image_url}
                        alt="After"
                        className="w-full h-36 object-cover group-hover/image:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center text-gray-400">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                )}
                {/* Service & Category Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.category && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 text-rose-700 dark:text-rose-300 border border-rose-300/50 dark:border-rose-700/50 rounded-full text-xs font-semibold">
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {item.category.name}
                    </span>
                  )}
                  {item.service && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-700/50 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      {item.service.name}
                    </span>
                  )}
                  {item.project_type && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
                      {item.project_type}
                    </span>
                  )}
                  {item.location && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 0011.314-11.314l-4.243-4.243a4 4 0 00-5.657 5.657l4.243 4.243z" /></svg>
                      {item.location}
                    </span>
                  )}
                </div>
                {/* Completion Date */}
                {item.completion_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                    {new Date(item.completion_date).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={galleryItems.length}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
            className="mt-8"
          />

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-white/60 dark:border-white/10">
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 border-b border-rose-100/60 dark:border-gray-800 sticky top-0 bg-gradient-to-r from-rose-50/90 via-white/90 to-purple-50/90 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-gray-950/95 z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 text-xs font-semibold uppercase tracking-wide">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Before & After creator
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {editingItem ? "Edit transformation" : "Add new Before & After"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                      {editingItem
                        ? "Refine the story, treatment details, and visuals for this transformation."
                        : "Capture the treatment, date, and beautiful results with a clear before & after comparison."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      setFormData({ ...defaultItem });
                      setBeforeImage(null);
                      setAfterImage(null);
                      setFieldErrors({});
                      if (beforeImagePreview && beforeImagePreview.startsWith("blob:")) {
                        URL.revokeObjectURL(beforeImagePreview);
                      }
                      if (afterImagePreview && afterImagePreview.startsWith("blob:")) {
                        URL.revokeObjectURL(afterImagePreview);
                      }
                      setBeforeImagePreview("");
                      setUseCustomLocation(false);
                      setAfterImagePreview("");
                      setImageErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-7 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Column 1 – Treatment details */}
                    <div className="lg:col-span-1 space-y-4 rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 p-4 md:p-5 shadow-sm">
                      <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200 text-[11px]">
                            1
                          </span>
                          Treatment details
                        </h5>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Treatment Category *
                          </label>
                          <select
                            value={formData.category_id || ""}
                            onChange={(e) => {
                              setFieldErrors((prev) => ({ ...prev, category_id: false }));
                              setFormData((prev) => ({
                                ...prev,
                                category_id: e.target.value || undefined,
                                service_id: undefined,
                              }));
                            }}
                            className={`w-full px-3 py-2.5 text-sm border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 transition-all ${
                              fieldErrors.category_id
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-rose-500"
                            }`}
                            disabled={servicesLoading || isSubmitting}
                            required
                          >
                            <option value="">Select treatment area...</option>
                            {mainTabs.map((mainTab) => (
                              <optgroup key={mainTab.slug} label={mainTab.name}>
                                {categoriesByMainTab[mainTab.slug]?.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Face, body, lips and more.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Specific Treatment *
                          </label>
                          <select
                            value={formData.service_id || ""}
                            onChange={(e) => {
                              setFieldErrors((prev) => ({ ...prev, service_id: false }));
                              setFormData((prev) => ({
                                ...prev,
                                service_id: e.target.value || undefined,
                              }));
                            }}
                            className={`w-full px-3 py-2.5 text-sm border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 transition-all ${
                              fieldErrors.service_id
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-rose-500"
                            }`}
                            disabled={servicesLoading || !formData.category_id || isSubmitting}
                            required
                          >
                            <option value="">Select specific treatment...</option>
                            {filteredServices.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Choose the exact procedure you performed.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Treatment Date *
                          </label>
                          <input
                            type="date"
                            value={formData.completion_date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                completion_date: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2.5 text-sm border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 transition-all ${
                              fieldErrors.completion_date
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-rose-500"
                            }`}
                            required
                          />
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            When this transformation was completed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 – Story / Description */}
                    <div className="lg:col-span-1 space-y-4 rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 p-4 md:p-5 shadow-sm">
                      <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200 text-[11px]">
                            2
                          </span>
                          Transformation story
                        </h5>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Transformation Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                              setFieldErrors((prev) => ({ ...prev, title: false }));
                              setFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }));
                            }}
                            className={`w-full px-3 py-2.5 text-sm border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 transition-all ${
                              fieldErrors.title
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-rose-500"
                            }`}
                            placeholder="Natural lip enhancement, subtle mid‑face lift..."
                            disabled={isSubmitting}
                            required
                          />
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Short, clear headline for the gallery.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Description
                          </label>
                          <textarea
                            value={formData.description || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            rows={4}
                            className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                            placeholder="Add context about concerns, approach and outcome. Avoid identifiable personal details."
                          />
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Optional narrative for patients browsing results.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Treatment area / notes
                          </label>
                          <input
                            type="text"
                            value={formData.project_type}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                project_type: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                            placeholder="Upper lip, cheeks, jawline..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 3 – Images & preview */}
                    <div className="lg:col-span-1 space-y-4 rounded-2xl bg-white/90 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 md:p-5 shadow-sm">
                      <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200 text-[11px]">
                              3
                            </span>
                            Before & After images
                          </h5>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          JPG / PNG / WEBP · up to 10MB
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Before Image */}
                        <div className={fieldErrors.before ? "rounded-lg ring-2 ring-red-500 p-1" : ""}>
                          <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Before image <span className="text-red-500">*</span>{" "}
                            {editingItem && (
                              <span className="text-[10px] text-gray-500">(leave empty to keep)</span>
                            )}
                          </p>
                          <div className="space-y-2">
                            {!(beforeImagePreview || formData.before_image_url) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e: any) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, "before");
                                  };
                                  input.click();
                                }}
                                disabled={isSubmitting}
                                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/70 flex flex-col items-center justify-center text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="mb-1 text-lg">⬆️</span>
                                <span className="font-semibold">Upload before</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                  {getSupportedFormatsText()}
                                </span>
                              </button>
                            )}
                            {imageErrors.before && (
                              <p className="text-[11px] text-red-500">{imageErrors.before}</p>
                            )}
                            {(beforeImagePreview || formData.before_image_url) && (
                              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                  src={beforeImagePreview || formData.before_image_url}
                                  alt="Before preview"
                                  className="w-full h-28 object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-500 text-white">
                                  Before
                                </span>
                                <button
                                  type="button"
                                  onClick={() => clearImage("before")}
                                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 hover:bg-black/90 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* After Image */}
                        <div className={fieldErrors.after ? "rounded-lg ring-2 ring-red-500 p-1" : ""}>
                          <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                            After image <span className="text-red-500">*</span>{" "}
                            {editingItem && (
                              <span className="text-[10px] text-gray-500">(leave empty to keep)</span>
                            )}
                          </p>
                          <div className="space-y-2">
                            {!(afterImagePreview || formData.after_image_url) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e: any) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, "after");
                                  };
                                  input.click();
                                }}
                                disabled={isSubmitting}
                                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/70 flex flex-col items-center justify-center text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="mb-1 text-lg">⬆️</span>
                                <span className="font-semibold">Upload after</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                  {getSupportedFormatsText()}
                                </span>
                              </button>
                            )}
                            {imageErrors.after && (
                              <p className="text-[11px] text-red-500">{imageErrors.after}</p>
                            )}
                            {(afterImagePreview || formData.after_image_url) && (
                              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                  src={afterImagePreview || formData.after_image_url}
                                  alt="After preview"
                                  className="w-full h-28 object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-500 text-white">
                                  After
                                </span>
                                <button
                                  type="button"
                                  onClick={() => clearImage("after")}
                                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 hover:bg-black/90 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Side‑by‑side preview with slider */}
                      {(beforeImagePreview || formData.before_image_url) &&
                        (afterImagePreview || formData.after_image_url) && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-center text-[11px] text-gray-600 dark:text-gray-400">
                              <span>Live comparison preview</span>
                            </div>
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gray-900">
                              <img
                                src={afterImagePreview || formData.after_image_url}
                                alt="After preview"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ clipPath: `inset(0 ${100 - previewSliderPosition}% 0 0)` }}
                              >
                                <img
                                  src={beforeImagePreview || formData.before_image_url}
                                  alt="Before preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg"
                                style={{ left: `${previewSliderPosition}%`, transform: "translateX(-50%)" }}
                              />
                              <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-500 text-white">
                                Before
                              </span>
                              <span className="absolute top-2 right-2 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-500 text-white">
                                After
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={previewSliderPosition}
                              onChange={(e) => setPreviewSliderPosition(Number(e.target.value))}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200/70 dark:border-gray-800 sticky bottom-0 bg-gradient-to-r from-rose-50/95 via-white/95 to-purple-50/95 dark:from-gray-900/98 dark:via-gray-900/98 dark:to-gray-950/98 backdrop-blur-sm">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer order-last sm:order-first">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_featured: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 shrink-0"
                      />
                      <span>Feature this transformation</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        setFormData({ ...defaultItem });
                        setBeforeImage(null);
                        setAfterImage(null);
                        setFieldErrors({});
                        if (beforeImagePreview && beforeImagePreview.startsWith("blob:")) {
                          URL.revokeObjectURL(beforeImagePreview);
                        }
                        if (afterImagePreview && afterImagePreview.startsWith("blob:")) {
                          URL.revokeObjectURL(afterImagePreview);
                        }
                        setBeforeImagePreview("");
                        setUseCustomLocation(false);
                        setAfterImagePreview("");
                        setImageErrors({});
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gray-200/90 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 justify-center shadow-md shadow-rose-500/30"
                    >
                      {isSubmitting ? "Saving…" : editingItem ? "Update item" : "Add item"}
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </>

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
}
