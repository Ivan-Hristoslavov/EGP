"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useAreas } from "@/hooks/useAreas";
import { useServices } from "@/hooks/useServices";
import { GalleryItem } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { getSupportedFormatsText, processImageFile, getImageDimensions, compressImage } from "@/lib/image-utils";
import Pagination from "@/components/Pagination";

export function AdminGalleryManager({ 
  triggerModal
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
  const { areas, loading: areasLoading } = useAreas();
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
  
  // Individual image compression settings
  const [beforeImageSettings, setBeforeImageSettings] = useState({
    quality: 0.85,
    originalFile: null as File | null,
    compressedFile: null as File | null,
    originalSize: 0,
    compressedSize: 0,
    originalDimensions: { width: 0, height: 0 },
    compressedDimensions: { width: 0, height: 0 }
  });
  
  const [afterImageSettings, setAfterImageSettings] = useState({
    quality: 0.85,
    originalFile: null as File | null,
    compressedFile: null as File | null,
    originalSize: 0,
    compressedSize: 0,
    originalDimensions: { width: 0, height: 0 },
    compressedDimensions: { width: 0, height: 0 }
  });

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

      // Get original dimensions
      const dimensions = await getImageDimensions(file);
      
      // Set original file data
      if (type === "before") {
        setBeforeImageSettings(prev => ({
          ...prev,
          originalFile: file,
          originalSize: file.size,
          originalDimensions: dimensions,
          compressedFile: file, // Start with original
          compressedSize: file.size,
          compressedDimensions: dimensions
        }));
        
        // Revoke previous object URL if it exists
        if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(beforeImagePreview);
        }
        setBeforeImage(file);
        setBeforeImagePreview(URL.createObjectURL(file));
      } else {
        setAfterImageSettings(prev => ({
          ...prev,
          originalFile: file,
          originalSize: file.size,
          originalDimensions: dimensions,
          compressedFile: file, // Start with original
          compressedSize: file.size,
          compressedDimensions: dimensions
        }));
        
        // Revoke previous object URL if it exists
        if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(afterImagePreview);
        }
        setAfterImage(file);
        setAfterImagePreview(URL.createObjectURL(file));
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

  const handleQualityChange = async (quality: number, type: "before" | "after") => {
    const settings = type === "before" ? beforeImageSettings : afterImageSettings;
    if (!settings.originalFile) return;

    try {
      // Compress the original file with new quality
      const compressedFile = await compressImage(settings.originalFile, 1920, 1080, quality);
      const dimensions = await getImageDimensions(compressedFile);

      if (type === "before") {
        setBeforeImageSettings(prev => ({
          ...prev,
          quality,
          compressedFile,
          compressedSize: compressedFile.size,
          compressedDimensions: dimensions
        }));
        
        // Update preview
        if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(beforeImagePreview);
        }
        setBeforeImage(compressedFile);
        setBeforeImagePreview(URL.createObjectURL(compressedFile));
      } else {
        setAfterImageSettings(prev => ({
          ...prev,
          quality,
          compressedFile,
          compressedSize: compressedFile.size,
          compressedDimensions: dimensions
        }));
        
        // Update preview
        if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(afterImagePreview);
        }
        setAfterImage(compressedFile);
        setAfterImagePreview(URL.createObjectURL(compressedFile));
      }
    } catch (error) {
      console.error('Error compressing image:', error);
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
      setBeforeImageSettings({
        quality: 0.85,
        originalFile: null,
        compressedFile: null,
        originalSize: 0,
        compressedSize: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 }
      });
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
      setAfterImageSettings({
        quality: 0.85,
        originalFile: null,
        compressedFile: null,
        originalSize: 0,
        compressedSize: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 }
      });
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
    try {
      // Validate required images for new items
      if (!editingItem && (!beforeImage || !afterImage)) {
        showError(
          "Validation Error",
          "Both before and after images are required"
        );
        return;
      }

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
      
      // Reset image settings
      setBeforeImageSettings({
        quality: 0.85,
        originalFile: null,
        compressedFile: null,
        originalSize: 0,
        compressedSize: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 }
      });
      setAfterImageSettings({
        quality: 0.85,
        originalFile: null,
        compressedFile: null,
        originalSize: 0,
        compressedSize: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 }
      });
    } catch (err) {
      console.error('Save error:', err);
      showError(
        ToastMessages.gallery.error.title,
        err instanceof Error ? err.message : ToastMessages.gallery.error.message
      );
    }
  };

  const handleAdd = () => {
    // Clear editing state
    setEditingItem(null);
    
    // Reset form data to defaults
    setFormData({ ...defaultItem });
    
    // Clear all image states
    setBeforeImage(null);
    setAfterImage(null);
    setBeforeImagePreview("");
    setAfterImagePreview("");
    setImageErrors({});
    setUseCustomLocation(false);
    
    // Reset image settings
    setBeforeImageSettings({
      quality: 0.85,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 }
    });
    setAfterImageSettings({
      quality: 0.85,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 }
    });
    
    // Show the form
    setShowAddForm(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    // Check if location is in areas list or custom
    const isCustomLocation = !areas.some(area => area.name === item.location);
    setUseCustomLocation(isCustomLocation);
    
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Gallery
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your before & after transformations
            </p>
          </div>
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

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {editingItem ? "Edit Transformation" : "Add New Before & After"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {editingItem ? "Update transformation details and images" : "Create a new before & after transformation showcase"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Treatment Information */}
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Treatment Details
                    </h5>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Treatment Category *
                    </label>
                    <select
                      value={formData.category_id || ""}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          category_id: e.target.value || undefined,
                          service_id: undefined, // Reset service when category changes
                        }));
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                      disabled={servicesLoading}
                      required
                    >
                      <option value="">Select treatment area...</option>
                      {mainTabs.map(mainTab => (
                        categoriesByMainTab[mainTab.slug] && categoriesByMainTab[mainTab.slug].length > 0 && (
                          <optgroup key={mainTab.slug} label={mainTab.name}>
                            {categoriesByMainTab[mainTab.slug].map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </optgroup>
                        )
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Choose the treatment area (Face, Body, Lips, etc.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specific Treatment *
                    </label>
                    <select
                      value={formData.service_id || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          service_id: e.target.value || undefined,
                        }))
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                      disabled={servicesLoading || !formData.category_id}
                      required
                    >
                      <option value="">Select specific treatment...</option>
                      {filteredServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category_id ? (
                      <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                        Please select a treatment category first
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Select the specific treatment performed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Treatment Date
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
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Date when the treatment was performed
                    </p>
                  </div>

                </div>

                {/* Right Column - Description & Media */}
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Transformation Details
                    </h5>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transformation Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                      placeholder="e.g., Natural Lip Enhancement Results"
                      required
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      A brief title describing the transformation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                      placeholder="Describe the treatment results, client experience, or any notable details about this transformation..."
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Optional: Add details about the treatment and results
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Treatment Area / Notes
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
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                      placeholder="e.g., Upper Lip, Cheek Enhancement, Jawline Definition"
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Optional: Specify the exact treatment area or add notes
                    </p>
                  </div>


                  <div className="flex items-center p-3 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                      className="mr-3 w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_featured"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Feature this transformation
                    </label>
                  </div>
                </div>

                {/* Right Column - Image Uploads */}
                <div className="space-y-4">
                  {/* Before Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Before Image *{" "}
                      {editingItem && "(leave empty to keep current)"}
                    </label>

                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              Before image
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {getSupportedFormatsText()}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], "before");
                                // Clear the input value to allow selecting the same file again
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Error Message */}
                      {imageErrors.before && (
                        <p className="text-red-500 text-xs">
                          {imageErrors.before}
                        </p>
                      )}

                      {/* Preview */}
                      {beforeImagePreview && (
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={beforeImagePreview}
                              alt="Before preview"
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => clearImage("before")}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Quality Slider */}
                          {beforeImageSettings.originalFile && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Image Quality
                                </h4>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                  {Math.round(beforeImageSettings.quality * 100)}%
                                </span>
                              </div>
                              
                              {/* Quality Slider */}
                              <div className="mb-3">
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={beforeImageSettings.quality}
                                  onChange={(e) => handleQualityChange(parseFloat(e.target.value), "before")}
                                  className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                                  style={{
                                    background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                                  }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Low Quality</span>
                                  <span>High Quality</span>
                                </div>
                              </div>
                              
                              {/* Compression Stats */}
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <div className="text-gray-600 dark:text-gray-400">Original</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {beforeImageSettings.originalDimensions.width}×{beforeImageSettings.originalDimensions.height}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {(beforeImageSettings.originalSize / 1024 / 1024).toFixed(2)}MB
                                  </div>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <div className="text-gray-600 dark:text-gray-400">Compressed</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {beforeImageSettings.compressedDimensions.width}×{beforeImageSettings.compressedDimensions.height}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {(beforeImageSettings.compressedSize / 1024 / 1024).toFixed(2)}MB
                                  </div>
                                </div>
                              </div>
                              
                              {/* Savings */}
                              <div className="mt-2 text-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Space saved: </span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {((beforeImageSettings.originalSize - beforeImageSettings.compressedSize) / beforeImageSettings.originalSize * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      After Image *{" "}
                      {editingItem && "(leave empty to keep current)"}
                    </label>

                    <div className="space-y-3">
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              After image
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {getSupportedFormatsText()}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], "after");
                                // Clear the input value to allow selecting the same file again
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Error Message */}
                      {imageErrors.after && (
                        <p className="text-red-500 text-xs">
                          {imageErrors.after}
                        </p>
                      )}

                      {/* Preview */}
                      {afterImagePreview && (
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={afterImagePreview}
                              alt="After preview"
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => clearImage("after")}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Quality Slider */}
                          {afterImageSettings.originalFile && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                                  Image Quality
                                </h4>
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                  {Math.round(afterImageSettings.quality * 100)}%
                                </span>
                              </div>
                              
                              {/* Quality Slider */}
                              <div className="mb-3">
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={afterImageSettings.quality}
                                  onChange={(e) => handleQualityChange(parseFloat(e.target.value), "after")}
                                  className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                                  style={{
                                    background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                                  }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Low Quality</span>
                                  <span>High Quality</span>
                                </div>
                              </div>
                              
                              {/* Compression Stats */}
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <div className="text-gray-600 dark:text-gray-400">Original</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {afterImageSettings.originalDimensions.width}×{afterImageSettings.originalDimensions.height}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {(afterImageSettings.originalSize / 1024 / 1024).toFixed(2)}MB
                                  </div>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <div className="text-gray-600 dark:text-gray-400">Compressed</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {afterImageSettings.compressedDimensions.width}×{afterImageSettings.compressedDimensions.height}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {(afterImageSettings.compressedSize / 1024 / 1024).toFixed(2)}MB
                                  </div>
                                </div>
                              </div>
                              
                              {/* Savings */}
                              <div className="mt-2 text-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Space saved: </span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {((afterImageSettings.originalSize - afterImageSettings.compressedSize) / afterImageSettings.originalSize * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project, challenges, and results..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setFormData({ ...defaultItem });
                    setBeforeImage(null);
                    setAfterImage(null);
                    
                    // Revoke object URLs before clearing
                    if (beforeImagePreview && beforeImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(beforeImagePreview);
                    }
                    if (afterImagePreview && afterImagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(afterImagePreview);
                    }
                    
                    setBeforeImagePreview("");
                    setUseCustomLocation(false);
                    setAfterImagePreview("");
                    setImageErrors({});
                    
                    // Reset image settings
                    setBeforeImageSettings({
                      quality: 0.85,
                      originalFile: null,
                      compressedFile: null,
                      originalSize: 0,
                      compressedSize: 0,
                      originalDimensions: { width: 0, height: 0 },
                      compressedDimensions: { width: 0, height: 0 }
                    });
                    setAfterImageSettings({
                      quality: 0.85,
                      originalFile: null,
                      compressedFile: null,
                      originalSize: 0,
                      compressedSize: 0,
                      originalDimensions: { width: 0, height: 0 },
                      compressedDimensions: { width: 0, height: 0 }
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
      </>

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
}
