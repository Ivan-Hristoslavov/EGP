"use client";
import { useState, useEffect } from "react";
import NextImage from "next/image";
import { useToast } from "@/components/Toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import { Upload, X, Edit2, Trash2, Star, Award, FileText, ChevronDown, Plus, AlertCircle } from "lucide-react";

interface PressItem {
  id: string;
  type: 'award' | 'press_feature';
  title: string;
  organisation?: string | null;
  publication?: string | null;
  year?: string | null;
  date?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function AdminPressManager() {
  const { showSuccess, showError } = useToast();
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'award' as 'award' | 'press_feature',
    title: '',
    organisation: '',
    publication: '',
    year: '',
    date: '',
    description: '',
    image_url: '',
    is_featured: false,
    display_order: 0
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, scale: 1 });
  const [cropContainerRef, setCropContainerRef] = useState<HTMLDivElement | null>(null);
  
  // Tab and pagination state
  const [activeTab, setActiveTab] = useState<'awards' | 'press'>('awards');
  const [awardsPage, setAwardsPage] = useState(1);
  const [pressPage, setPressPage] = useState(1);
  const itemsPerPage = 6;

  const loadPressItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/press');
      const data = await response.json();
      if (response.ok) {
        setPressItems(data.pressItems || []);
      } else {
        setError(data.error || 'Failed to load press items');
      }
    } catch (err) {
      setError('Failed to load press items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPressItems();
  }, []);

  const handleAddClick = () => {
    // Auto-calculate display_order (max + 1)
    const maxOrder = pressItems.length > 0 
      ? Math.max(...pressItems.map(item => item.display_order))
      : 0;
    
    setFormData({
      type: 'award',
      title: '',
      organisation: '',
      publication: '',
      year: '',
      date: '',
      description: '',
      image_url: '',
      is_featured: false,
      display_order: maxOrder + 1
    });
    setShowAddModal(true);
  };

  const handleEditClick = (item: PressItem) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      organisation: item.organisation || '',
      publication: item.publication || '',
      year: item.year || '',
      date: item.date || '',
      description: item.description || '',
      image_url: item.image_url || '',
      is_featured: item.is_featured,
      display_order: item.display_order
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (item: PressItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleImageUpload = async (file: File) => {
    // Create preview URL for cropping
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImageToCrop(imageUrl);
      setShowImageCropper(true);
      setCropData({ x: 0, y: 0, scale: 1 });
    };
    reader.readAsDataURL(file);
  };

  const handleEditImage = (imageUrl: string) => {
    // Open cropper with existing image
    setImageToCrop(imageUrl);
    setShowImageCropper(true);
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !cropContainerRef) return;

    setUploadingImage(true);
    try {
      let imageUrl = imageToCrop;
      
      // If it's a URL (not a data URL), fetch and convert to blob first
      if (!imageToCrop.startsWith('data:')) {
        const response = await fetch(imageToCrop);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // Create image to get dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Get container dimensions
      const containerWidth = cropContainerRef.offsetWidth;
      const containerHeight = cropContainerRef.offsetHeight;
      
      // Calculate how the image is displayed with backgroundSize percentage
      // When backgroundSize is scale * 100%, the image maintains aspect ratio
      // and is scaled by that percentage
      const imageAspectRatio = img.width / img.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      // Calculate displayed dimensions (scaled image)
      let displayedWidth: number;
      let displayedHeight: number;
      
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider - height fits container, width extends beyond
        displayedHeight = containerHeight * cropData.scale;
        displayedWidth = displayedHeight * imageAspectRatio;
      } else {
        // Image is taller - width fits container, height extends beyond
        displayedWidth = containerWidth * cropData.scale;
        displayedHeight = displayedWidth / imageAspectRatio;
      }
      
      // Calculate the scale factor from original to displayed
      const scaleFactorX = displayedWidth / img.width;
      const scaleFactorY = displayedHeight / img.height;
      
      // Calculate what part of the displayed image is visible in the container
      // backgroundPosition: x px y px means the image is offset by (x, y) from default position
      // Default position would center the image, but we're using pixel values
      // Negative values shift left/up, positive shift right/down
      
      // The visible area in displayed image coordinates
      // Container shows from (0,0) to (containerWidth, containerHeight)
      // Displayed image is positioned at offset (cropData.x, cropData.y)
      const visibleStartX = Math.max(0, -cropData.x);
      const visibleStartY = Math.max(0, -cropData.y);
      const visibleEndX = Math.min(displayedWidth, containerWidth - cropData.x);
      const visibleEndY = Math.min(displayedHeight, containerHeight - cropData.y);
      
      const visibleWidth = visibleEndX - visibleStartX;
      const visibleHeight = visibleEndY - visibleStartY;
      
      // Convert from displayed coordinates back to original image coordinates
      const sourceX = visibleStartX / scaleFactorX;
      const sourceY = visibleStartY / scaleFactorY;
      const sourceWidth = visibleWidth / scaleFactorX;
      const sourceHeight = visibleHeight / scaleFactorY;
      
      // Clamp to image bounds to ensure we don't go outside
      const finalSourceX = Math.max(0, Math.min(Math.round(sourceX), img.width));
      const finalSourceY = Math.max(0, Math.min(Math.round(sourceY), img.height));
      const finalSourceWidth = Math.min(Math.round(sourceWidth), img.width - finalSourceX);
      const finalSourceHeight = Math.min(Math.round(sourceHeight), img.height - finalSourceY);
      
      // Output canvas - maintain container aspect ratio, scale down to max 1200px width
      const maxOutputWidth = 1200;
      const maxOutputHeight = 800;
      const outputAspectRatio = containerWidth / containerHeight;
      
      let outputWidth = maxOutputWidth;
      let outputHeight = Math.round(outputWidth / outputAspectRatio);
      
      // Ensure height doesn't exceed max
      if (outputHeight > maxOutputHeight) {
        outputHeight = maxOutputHeight;
        outputWidth = Math.round(outputHeight * outputAspectRatio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw the cropped portion, scaled to output size
      ctx.drawImage(
        img,
        finalSourceX, finalSourceY, finalSourceWidth, finalSourceHeight,  // Source rectangle in original image
        0, 0, outputWidth, outputHeight  // Destination rectangle in canvas
      );

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showError('Crop Failed', 'Failed to process image');
          setUploadingImage(false);
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'cropped-image.jpg');
        
        const response = await fetch('/api/press/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setFormData(prev => ({ ...prev, image_url: data.url }));
          showSuccess('Image Uploaded', 'Image cropped and uploaded successfully');
          setShowImageCropper(false);
          setImageToCrop(null);
          setCropData({ x: 0, y: 0, scale: 1 });
        } else {
          showError('Upload Failed', data.error || 'Failed to upload image');
        }
        setUploadingImage(false);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      showError('Crop Failed', err instanceof Error ? err.message : 'Failed to crop image');
      setUploadingImage(false);
      console.error(err);
    }
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop(null);
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const handleSave = async () => {
    if (!formData.title) {
      showError('Validation Error', 'Title is required');
      return;
    }

    setProcessing(true);
    try {
      const url = showEditModal && selectedItem 
        ? `/api/press/${selectedItem.id}`
        : '/api/press';
      
      const method = showEditModal ? 'PUT' : 'POST';
      
      const payload: any = {
        type: formData.type,
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        display_order: formData.display_order
      };

      if (formData.type === 'award') {
        payload.organisation = formData.organisation || null;
        payload.year = formData.year || null;
      } else {
        payload.publication = formData.publication || null;
        payload.date = formData.date || null;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          showEditModal ? 'Press Item Updated' : 'Press Item Added',
          showEditModal ? 'The press item has been updated successfully.' : 'The press item has been added successfully.'
        );
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedItem(null);
        loadPressItems();
      } else {
        showError('Error', data.error || 'Failed to save press item');
      }
    } catch (err) {
      showError('Error', 'Failed to save press item');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/press/${selectedItem.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Press Item Deleted', 'The press item has been permanently deleted.');
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadPressItems();
      } else {
        showError('Error', data.error || 'Failed to delete press item');
      }
    } catch (err) {
      showError('Error', 'Failed to delete press item');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const awards = pressItems.filter(item => item.type === 'award');
  const pressFeatures = pressItems.filter(item => item.type === 'press_feature');
  
  // Pagination calculations
  const awardsTotalPages = Math.ceil(awards.length / itemsPerPage);
  const pressTotalPages = Math.ceil(pressFeatures.length / itemsPerPage);
  const paginatedAwards = awards.slice((awardsPage - 1) * itemsPerPage, awardsPage * itemsPerPage);
  const paginatedPress = pressFeatures.slice((pressPage - 1) * itemsPerPage, pressPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-default-500">Loading press items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20">
        <CardBody className="p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-danger-500 mr-2" />
            <span className="text-danger-700 dark:text-danger-300">{error}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-default-500">
            Manage awards and press features displayed on your press page
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-5 h-5" />}
          onPress={handleAddClick}
        >
          Add Press Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-divider">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{awards.length}</p>
                <p className="text-sm text-default-500">Awards</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-divider">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pressFeatures.length}</p>
                <p className="text-sm text-default-500">Press Features</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-divider">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                <Star className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {pressItems.filter(item => item.is_featured).length}
                </p>
                <p className="text-sm text-default-500">Featured</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      {pressItems.length > 0 && (
        <Card className="border border-divider">
          <CardBody className="p-0">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                const tab = key as 'awards' | 'press';
                setActiveTab(tab);
                if (tab === 'awards') setAwardsPage(1);
                else setPressPage(1);
              }}
              aria-label="Press items tabs"
            >
              <Tab
                key="awards"
                title={
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Awards & Recognition</span>
                    <Chip size="sm" variant="flat">{awards.length}</Chip>
                  </div>
                }
              >
                <div className="p-6">
                  {awards.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-12 h-12 text-default-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No awards yet</h3>
                      <p className="text-default-500 mb-4">Add awards to showcase your achievements.</p>
                      <Button
                        color="primary"
                        startContent={<Plus className="w-5 h-5" />}
                        onPress={handleAddClick}
                      >
                        Add First Award
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedAwards.map((item) => (
                          <PressItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            isLarge={false}
                          />
                        ))}
                      </div>
                      {awardsTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => setAwardsPage(prev => Math.max(1, prev - 1))}
                            isDisabled={awardsPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-4 py-2 text-sm text-default-600">
                            Page {awardsPage} of {awardsTotalPages}
                          </span>
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => setAwardsPage(prev => Math.min(awardsTotalPages, prev + 1))}
                            isDisabled={awardsPage === awardsTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tab>
              <Tab
                key="press"
                title={
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Press Features</span>
                    <Chip size="sm" variant="flat">{pressFeatures.length}</Chip>
                  </div>
                }
              >
                <div className="p-6">
                  {pressFeatures.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-default-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No press features yet</h3>
                      <p className="text-default-500 mb-4">Add press features to showcase your media coverage.</p>
                      <Button
                        color="primary"
                        startContent={<Plus className="w-5 h-5" />}
                        onPress={handleAddClick}
                      >
                        Add First Press Feature
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedPress.map((item) => (
                          <PressItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            isLarge={false}
                          />
                        ))}
                      </div>
                      {pressTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => setPressPage(prev => Math.max(1, prev - 1))}
                            isDisabled={pressPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-4 py-2 text-sm text-default-600">
                            Page {pressPage} of {pressTotalPages}
                          </span>
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => setPressPage(prev => Math.min(pressTotalPages, prev + 1))}
                            isDisabled={pressPage === pressTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {pressItems.length === 0 && (
        <Card className="border border-divider">
          <CardBody className="p-12 text-center">
            <Award className="w-12 h-12 text-default-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No press items yet</h3>
            <p className="text-default-500 mb-4">Add awards and press features to showcase your achievements.</p>
            <Button
              color="primary"
              startContent={<Plus className="w-5 h-5" />}
              onPress={handleAddClick}
            >
              Add First Press Item
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {showEditModal ? 'Edit Press Item' : 'Add Press Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'award' | 'press_feature' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="award">Award</option>
                  <option value="press_feature">Press Feature</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter title"
                />
              </div>

              {/* Organisation (for awards) */}
              {formData.type === 'award' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organisation
                  </label>
                  <input
                    type="text"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Award organisation"
                  />
                </div>
              )}

              {/* Publication (for press features) */}
              {formData.type === 'press_feature' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publication
                  </label>
                  <input
                    type="text"
                    value={formData.publication}
                    onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Publication name"
                  />
                </div>
              )}

              {/* Year (for awards) */}
              {formData.type === 'award' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="2024"
                  />
                </div>
              )}

              {/* Date (for press features) */}
              {formData.type === 'press_feature' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter description"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate/Image
                </label>
                {formData.image_url ? (
                  <div className="relative w-full">
                    <div className="relative w-full" style={{ minHeight: '400px', maxHeight: '600px' }}>
                      <NextImage
                        src={formData.image_url}
                        alt="Press image"
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => {
                          // Crop/edit existing image
                          if (formData.image_url) {
                            handleEditImage(formData.image_url);
                          }
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg"
                        title="Crop/Edit image"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Re-upload new image
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleImageUpload(file);
                          };
                          input.click();
                        }}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg"
                        title="Upload new image"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Featured & Display Order */}
              <div className={`grid gap-4 ${showEditModal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
                {showEditModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={processing || !formData.title}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Saving...' : showEditModal ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Press Item"
          message={`Are you sure you want to permanently delete "${selectedItem.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          isLoading={processing}
        />
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Crop & Position Image
                </h3>
                <button
                  onClick={handleCropCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div 
                ref={setCropContainerRef}
                className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4" 
                style={{ height: '400px', width: '100%' }}
              >
                <div
                  className="absolute inset-0 cursor-move"
                  style={{
                    backgroundImage: `url(${imageToCrop})`,
                    backgroundSize: `${cropData.scale * 100}%`,
                    backgroundPosition: `${cropData.x}px ${cropData.y}px`,
                    backgroundRepeat: 'no-repeat'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const startMouseX = e.clientX;
                    const startMouseY = e.clientY;
                    const startImageX = cropData.x;
                    const startImageY = cropData.y;
                    
                    const onMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startMouseX;
                      const deltaY = e.clientY - startMouseY;
                      setCropData(prev => ({
                        ...prev,
                        x: startImageX + deltaX,
                        y: startImageY + deltaY
                      }));
                    };
                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                />
                <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zoom: {Math.round(cropData.scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={cropData.scale}
                    onChange={(e) => setCropData(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCropCancel}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropComplete}
                    disabled={uploadingImage}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Uploading...' : 'Apply Crop & Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PressItemCard({
  item,
  onEdit,
  onDelete,
  isLarge = false
}: {
  item: PressItem;
  onEdit: (item: PressItem) => void;
  onDelete: (item: PressItem) => void;
  isLarge?: boolean;
}) {
  // Smaller cards for admin panel - consistent size
  const height = 'h-[280px] sm:h-[320px]';
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  return (
    <div className={`${height} group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 dark:border-gray-600`}>
      {/* Image Background */}
      {item.image_url ? (
        <>
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              <NextImage
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-[1]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]" />
      )}

      {/* Featured Badge - Top Right */}
      {item.is_featured && (
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2 py-1 bg-yellow-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3" />
            Featured
          </span>
        </div>
      )}

      {/* Admin Action Buttons - Bottom Right, Show on Hover */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            {item.type === 'award' ? (
              <Award className="w-4 h-4 text-white/80" />
            ) : (
              <FileText className="w-4 h-4 text-white/80" />
            )}
            <span className="text-[10px] sm:text-xs text-white/70 uppercase font-semibold tracking-wide">
              {item.type === 'award' ? 'Award' : 'Press'}
            </span>
          </div>
          <h3 className="text-white font-bold text-lg sm:text-xl mb-2 leading-tight line-clamp-2">
            {item.title}
          </h3>
        </div>

        {/* Footer with Expandable Description */}
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-t border-white/20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.description) {
                setIsDescriptionExpanded(!isDescriptionExpanded);
              }
            }}
            className={`w-full ${item.description ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}
            disabled={!item.description}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col flex-1">
                <p className="text-white/90 font-semibold text-sm">
                  {item.type === 'award' 
                    ? item.organisation || 'Award Recognition'
                    : item.publication || 'Media Feature'}
                </p>
                <p className="text-white/70 text-xs">
                  {item.type === 'award' 
                    ? item.year || new Date(item.date || '').getFullYear() || ''
                    : item.date ? new Date(item.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : ''}
                </p>
              </div>
              {item.description && (
                <ChevronDown 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 transition-transform duration-300 flex-shrink-0 ${
                    isDescriptionExpanded ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
          </button>
          {item.description && (
            <div 
              className={`transition-all duration-300 ease-in-out description-scroll ${
                isDescriptionExpanded 
                  ? 'max-h-32 sm:max-h-40 opacity-100 mt-2 overflow-y-auto' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="text-white/95 text-xs sm:text-sm leading-relaxed pt-2 border-t border-white/10 pr-2 pb-2">
                {item.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


