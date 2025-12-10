"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, AlertCircle, Image as ImageIcon, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Switch, Chip, Card, CardBody, Spinner } from "@heroui/react";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface AboutSection {
  id: string;
  section_type: string;
  heading?: string;
  content: string;
  bullet_points?: string[] | null;
  image_url?: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminAboutPage() {
  const { confirm, modalProps } = useConfirmation();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [newBullet, setNewBullet] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    section_type: "hero",
    heading: "",
    content: "",
    bullet_points: [] as string[],
    image_url: "",
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/about-content');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (file: File, qualityPercent: number) => {
    const quality = Math.min(Math.max(qualityPercent, 10), 100) / 100;

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return file;
      }

      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality)
      );

      if (!blob) {
        return file;
      }

      const normalizedName = file.name.replace(/\.[^/.]+$/, ".webp");
      return new File([blob], normalizedName, { type: "image/webp" });
    } catch (error) {
      console.error("Image compression failed, falling back to original file:", error);
      return file;
    }
  };

  const uploadImageIfNeeded = async () => {
    if (selectedImage) {
      const fileForUpload = await compressImage(selectedImage, compressionQuality);

      const payload = new FormData();
      payload.append("file", fileForUpload);
      if (formData.section_type) {
        payload.append("sectionType", formData.section_type);
      }

      const response = await fetch("/api/about-content/upload", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Image upload failed:", result.error);
        throw new Error(result.error || "Failed to upload image");
      }

      return result.url as string;
    }

    return formData.image_url || "";
  };

  const handleAddSection = async () => {
    try {
      setIsSavingSection(true);
      const imageUrl = await uploadImageIfNeeded();

      const response = await fetch("/api/about-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to add section");
      }

      await loadSections();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding section:", error);
      alert(error instanceof Error ? error.message : "Unable to add section.");
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleEditSection = (section: AboutSection) => {
    setEditingSection(section);
    setFormData({
      section_type: section.section_type,
      heading: section.heading || "",
      content: section.content,
      bullet_points: Array.isArray(section.bullet_points) ? section.bullet_points : [],
      image_url: section.image_url || "",
      order: section.order,
      is_active: section.is_active,
    });
    setImagePreview(section.image_url || null);
    setIsModalOpen(true);
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;

    try {
      setIsSavingSection(true);
      const imageUrl = await uploadImageIfNeeded();

      const response = await fetch(`/api/about-content/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update section");
      }

      await loadSections();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating section:", error);
      alert(error instanceof Error ? error.message : "Unable to update section.");
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    await confirm(
      {
        title: "Delete Section",
        message: "Are you sure you want to delete this section? This action cannot be undone.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
    try {
      const response = await fetch(`/api/about-content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSections();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
      }
    );
  };

  const resetForm = () => {
    setFormData({
      section_type: "hero",
      heading: "",
      content: "",
      bullet_points: [],
      image_url: "",
      order: 0,
      is_active: true,
    });
    setEditingSection(null);
    setNewBullet("");
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedImage(null);
    setCompressionQuality(80);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const addBullet = () => {
    if (newBullet.trim()) {
      setFormData(prev => ({
        ...prev,
        bullet_points: [...prev.bullet_points, newBullet.trim()]
      }));
      setNewBullet("");
    }
  };

  const removeBullet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bullet_points: prev.bullet_points.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedImage(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        {/* Add Button */}
        <div className="mb-6">
          <Button
            onClick={openAddModal}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Section
          </Button>
        </div>

        {/* Sections List */}
      <div>
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No sections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                const contentPreview = section.content.length > 150 
                  ? section.content.substring(0, 150) + '...' 
                  : section.content;
                
                return (
                  <Card key={section.id} className="hover:shadow-md transition-all">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Chip size="sm" variant="flat" color="danger">
                          {section.section_type}
                        </Chip>
                        {!section.is_active && (
                          <Chip size="sm" variant="flat" color="default">
                            Inactive
                          </Chip>
                        )}
                            <span className="text-xs text-default-500">#{section.order}</span>
                      </div>
                      {section.heading && (
                            <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2">
                          {section.heading}
                        </h3>
                      )}
                    </div>
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button
                            isIconOnly
                        size="sm"
                            variant="light"
                        onPress={() => handleEditSection(section)}
                      >
                            <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                            isIconOnly
                        size="sm"
                            variant="light"
                        color="danger"
                        onPress={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                      <div className="mb-3">
                        <p className="text-sm text-default-600 line-clamp-3">
                          {isExpanded ? section.content : contentPreview}
                        </p>
                        {section.content.length > 150 && (
                          <Button
                            size="sm"
                            variant="light"
                            className="mt-1 -ml-2"
                            onPress={() => {
                              const newExpanded = new Set(expandedSections);
                              if (isExpanded) {
                                newExpanded.delete(section.id);
                              } else {
                                newExpanded.add(section.id);
                              }
                              setExpandedSections(newExpanded);
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Show More
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                  {section.bullet_points && section.bullet_points.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {section.bullet_points.slice(0, 3).map((bullet, idx) => (
                              <Chip key={idx} size="sm" variant="flat" color="success" className="text-xs">
                                {bullet.length > 20 ? bullet.substring(0, 20) + '...' : bullet}
                          </Chip>
                        ))}
                            {section.bullet_points.length > 3 && (
                              <Chip size="sm" variant="flat" color="default" className="text-xs">
                                +{section.bullet_points.length - 3} more
                              </Chip>
                            )}
                      </div>
                    </div>
                  )}

                  {section.image_url && (
                        <div className="mb-3">
                      <img
                        src={section.image_url}
                        alt={section.heading || section.section_type}
                            className="w-full h-32 object-cover rounded-md border border-divider"
                      />
                    </div>
                  )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {editingSection ? "Edit Section" : "Add New Section"}
                  </h2>
                </ModalHeader>
                <ModalBody className="py-6">
                  <div className="space-y-6">
                    {/* Section Type */}
                    <Input
                      label="Section Type"
                      placeholder="hero, story, values, etc."
                      value={formData.section_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, section_type: value }))}
                      variant="bordered"
                      size="lg"
                      isRequired
                    />

                    {/* Heading */}
                    <Input
                      label="Heading"
                      placeholder="Section heading"
                      value={formData.heading}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, heading: value }))}
                      variant="bordered"
                      size="lg"
                    />

                    {/* Content */}
                    <Textarea
                      label="Content"
                      placeholder="Section content"
                      value={formData.content}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                      variant="bordered"
                      minRows={5}
                      isRequired
                    />

                    {/* Bullet Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bullet Points
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Enter bullet point"
                          value={newBullet}
                          onValueChange={setNewBullet}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBullet())}
                          variant="bordered"
                          className="flex-1"
                          size="lg"
                        />
                        <Button onClick={addBullet} size="lg" color="danger" isIconOnly>
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      {formData.bullet_points.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.bullet_points.map((bullet, index) => (
                            <Chip
                              key={index}
                              onClose={() => removeBullet(index)}
                              variant="flat"
                              color="success"
                              size="lg"
                            >
                              {bullet}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Team/Section Image
                      </label>
                      <div className="space-y-3">
                        {imagePreview && (
                          <div className="relative w-full h-48 border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/20 dark:hover:to-pink-900/20 transition-all hover:border-rose-400 dark:hover:border-rose-600 group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-rose-500 transition-colors" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-rose-600 dark:text-rose-400">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        {selectedImage && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              <span>Image quality</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{compressionQuality}%</span>
                            </div>
                            <input
                              type="range"
                              min={40}
                              max={100}
                              step={5}
                              value={compressionQuality}
                              onChange={(e) => setCompressionQuality(parseInt(e.target.value, 10))}
                              className="w-full accent-[#9d9585]"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Lower quality reduces file size before uploading.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order & Active */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Display Order"
                        placeholder="0"
                        type="number"
                        value={formData.order.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, order: parseInt(value) || 0 }))}
                        variant="bordered"
                        size="lg"
                      />
                      <div className="flex items-center justify-end">
                        <Switch
                          isSelected={formData.is_active}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                        >
                          Active
                        </Switch>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={editingSection ? handleUpdateSection : handleAddSection}
                    isLoading={isSavingSection}
                    className="bg-gradient-to-r from-rose-500 to-pink-500"
                  >
                    {editingSection ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

      <ConfirmationModal {...modalProps} />
    </div>
  );
}

