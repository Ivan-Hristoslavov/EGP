"use client";

import React, { useState, useEffect } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useGallerySections } from "@/hooks/useGallerySections";
import { useAreas } from "@/hooks/useAreas";
import { GalleryItem, GallerySection } from "@/types";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { getSupportedFormatsText, processImageFile, getImageDimensions, compressImage } from "@/lib/image-utils";
import Pagination from "@/components/Pagination";

export function AdminGalleryManager({ 
  triggerModal, 
  defaultTab = "items" 
}: { 
  triggerModal?: boolean;
  defaultTab?: "items" | "sections";
}) {
  const {
    galleryItems,
    loading,
    error,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useGallery();
  const {
    gallerySections,
    isLoading: sectionsLoading,
    error: sectionsError,
    addGallerySection,
    updateGallerySection,
    deleteGallerySection,
  } = useGallerySections();
  const { areas, loading: areasLoading } = useAreas();
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();

  const [activeTab, setActiveTab] = useState<"items" | "sections">(defaultTab);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingSection, setEditingSection] = useState<GallerySection | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerModal) {
      // Set the active tab based on the defaultTab prop
      setActiveTab(defaultTab);
      if (defaultTab === "items") {
        // Clear editing state and reset form
        setEditingItem(null);
        setEditingSection(null);
        setFormData({ ...defaultItem });
        setBeforeImage(null);
        setAfterImage(null);
        setBeforeImagePreview("");
        setAfterImagePreview("");
        setImageErrors({});
        setUseCustomLocation(false);
        setShowAddForm(true);
      } else {
        setShowAddSectionForm(true);
      }
    }
  }, [triggerModal, defaultTab]);

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
    section_id: undefined as string | undefined,
    order: 0,
    is_featured: false,
  };

  const defaultSection = {
    title: "",
    description: "",
    color: "#3B82F6",
    order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultItem);
  const [sectionFormData, setSectionFormData] = useState(defaultSection);

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
    setEditingSection(null);
    
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
      section_id: item.section_id,
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

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await updateGallerySection(Number(editingSection.id), sectionFormData);
        showSuccess(
          "Section updated successfully!",
          "The gallery section has been updated."
        );
        setEditingSection(null);
      } else {
        await addGallerySection(sectionFormData);
        showSuccess(
          "Section added successfully!",
          "A new gallery section has been created."
        );
        setShowAddSectionForm(false);
      }
      setSectionFormData({ ...defaultSection });
    } catch (err) {
      showError("Error", "Failed to save gallery section. Please try again.");
    }
  };

  const handleEditSection = (section: GallerySection) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || "",
      color: section.color,
      order: section.order,
      is_active: section.is_active,
    });
    setShowAddSectionForm(true);
  };

  const handleDeleteSection = async (id: number) => {
    try {
      await confirm(
        {
          title: "Delete Gallery Section",
          message:
            "Are you sure you want to delete this gallery section? All items in this section will be moved to 'No Section'.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true,
        },
        async () => {
          await deleteGallerySection(id);
          showSuccess(
            "Section deleted successfully!",
            "The gallery section has been removed."
          );
        }
      );
    } catch (err) {
      showError("Error", "Failed to delete gallery section. Please try again.");
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);
  const paginatedItems = galleryItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading || sectionsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "items"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Gallery Items
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "sections"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Sections
          </button>
        </div>

        {/* Add New Item Button */}
        {activeTab === "items" && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
        )}
      </div>

      {/* Gallery Items Tab */}
      {activeTab === "items" && (
        <>
          {/* Existing Gallery Items */}
          {/* Gallery Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 flex flex-col group overflow-hidden"
                style={{ minHeight: 280 }}
              >
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    className="p-2 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                    title="Edit"
                    onClick={() => handleEdit(item)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-110"
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate pr-12">
                  {item.title || <span className="italic text-gray-400">(No title)</span>}
                </h3>
                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                )}
                {/* Before/After Images (modern cards) */}
                <div className="flex gap-4 mb-4">
                  {/* Before Card */}
                  <div className="flex-1 group relative bg-gradient-to-br from-gray-100 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Before
                    </div>
                    {item.before_image_url ? (
                      <img
                        src={item.before_image_url}
                        alt="Before"
                        className="w-full h-32 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        style={{ minHeight: 96, background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ef 100%)' }}
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  {/* After Card */}
                  <div className="flex-1 group relative bg-gradient-to-br from-gray-100 via-white to-green-50 dark:from-gray-800 dark:via-gray-900 dark:to-green-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      After
                    </div>
                    {item.after_image_url ? (
                      <img
                        src={item.after_image_url}
                        alt="After"
                        className="w-full h-32 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        style={{ minHeight: 96, background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ef 100%)' }}
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Project Type & Location */}
                <div className="flex flex-wrap gap-2 mb-2">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bathroom Renovation in Clapham"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section
                    </label>
                    <select
                      value={formData.section_id || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          section_id: e.target.value || undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No specific section</option>
                      {gallerySections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Type
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bathroom, Kitchen, Leak Repair"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    
                    {/* Location Type Selection */}
                    <div className="mb-3">
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="locationType"
                            checked={!useCustomLocation}
                            onChange={() => {
                              setUseCustomLocation(false);
                              setFormData((prev) => ({ ...prev, location: "" }));
                            }}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Select from areas</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="locationType"
                            checked={useCustomLocation}
                            onChange={() => {
                              setUseCustomLocation(true);
                              setFormData((prev) => ({ ...prev, location: "" }));
                            }}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Custom location</span>
                        </label>
                      </div>
                    </div>

                    {/* Location Input */}
                    {!useCustomLocation ? (
                      <select
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={areasLoading}
                      >
                        <option value="">Select an area...</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.name}>
                            {area.name} ({area.postcode})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Custom location name"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completion Date
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_featured"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Featured Item
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
      )}

      {/* Gallery Sections Tab */}
      {activeTab === "sections" && (
        <>
          {/* Existing Gallery Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallerySections.map((section) => (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: section.color }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        Order: {section.order}
                      </span>
                      {!section.is_active && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSection(Number(section.id))}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Section Form */}
          {showAddSectionForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingSection
                  ? "Edit Gallery Section"
                  : "Add New Gallery Section"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.title}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bathroom Projects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={sectionFormData.color}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={sectionFormData.order}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="section_is_active"
                    checked={sectionFormData.is_active}
                    onChange={(e) =>
                      setSectionFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="section_is_active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={sectionFormData.description}
                  onChange={(e) =>
                    setSectionFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this gallery section..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSection}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSection ? "Update Section" : "Add Section"}
                </button>
                <button
                  onClick={() => {
                    setShowAddSectionForm(false);
                    setEditingSection(null);
                    setSectionFormData({ ...defaultSection });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
}
