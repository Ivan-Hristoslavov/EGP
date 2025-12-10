"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Plus, Edit, Trash2, User, Mail, Phone, Award, Save, X, Upload, Image as ImageIcon, Search, Check, Power, Calendar } from "lucide-react";
import { useServices, Service } from "@/hooks/useServices";
import { 
  RangeCalendar, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Textarea, 
  Card, 
  CardBody,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Chip,
  Avatar
} from "@heroui/react";
import { today, getLocalTimeZone, CalendarDate, parseDate } from "@internationalized/date";

interface TeamMember {
  id: string;
  admin_profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  specializations: string;
  experience_years: string;
  certifications: string;
  image_url?: string | null;
  service_ids?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamManagerProps {
  className?: string;
}

export function TeamManager({ className = "" }: TeamManagerProps) {
  const { confirm, modalProps } = useConfirmation();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specializations: "",
    experience_years: "",
    certifications: "",
    image_url: "",
    service_ids: [] as string[],
    is_active: true
  });
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all"); // "all", "selected", "unselected"
  const { services, isLoading: servicesLoading } = useServices();

  // Get all unique categories for filter
  const allCategories = useMemo<string[]>(() => {
    if (!services || services.length === 0) return [];
    const categories = new Set(services.map(s => s.category.name));
    return Array.from(categories).sort();
  }, [services]);

  // Memoize filtered and grouped services
  const filteredAndGroupedServices = useMemo(() => {
    if (!services || services.length === 0) return {};

    // Filter services by search query
    let filtered = services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      service.category.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    );

    // Apply category filter
    if (selectedCategoryFilter !== "all") {
      filtered = filtered.filter(service => service.category.name === selectedCategoryFilter);
    }

    // Apply selected status filter
    if (selectedStatusFilter === "selected") {
      filtered = filtered.filter(service => formData.service_ids.includes(service.id));
    } else if (selectedStatusFilter === "unselected") {
      filtered = filtered.filter(service => !formData.service_ids.includes(service.id));
    }

    // Group services by category
    const grouped = filtered.reduce((acc, service) => {
      const categoryName = service.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    return grouped;
  }, [services, serviceSearchQuery, selectedCategoryFilter, selectedStatusFilter, formData.service_ids]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, scale: 1 });
  const [cropContainerRef, setCropContainerRef] = useState<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [selectedMemberForDayOff, setSelectedMemberForDayOff] = useState<TeamMember | null>(null);
  const [dayOffPeriods, setDayOffPeriods] = useState<Array<{ id: string; start_date: string; end_date: string; reason?: string }>>([]);
  const [dayOffForm, setDayOffForm] = useState({ start_date: "", end_date: "", reason: "" });
  const [dayOffDateRange, setDayOffDateRange] = useState<{ start: CalendarDate | null; end: CalendarDate | null } | null>(null);
  const [editingDayOff, setEditingDayOff] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  const roles = [
    "Aesthetic Practitioner",
    "Senior Aesthetic Practitioner", 
    "Clinical Director",
    "Nurse Practitioner",
    "Medical Aesthetician",
    "Consultant",
    "Therapist",
    "Support Staff"
  ];

  const specializations = [
    "Anti-wrinkle Treatments",
    "Dermal Fillers",
    "Lip Enhancement",
    "Profhilo Treatment",
    "Skin Consultation",
    "Fat Freezing",
    "Laser Hair Removal",
    "Chemical Peel",
    "Microneedling",
    "Hydrafacial",
    "Body Contouring",
    "Skin Rejuvenation"
  ];

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/team");
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team || []);
      } else {
        showError("Error", "Failed to load team members");
      }
    } catch (error) {
      showError("Error", "Error loading team members");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/team/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Image Upload Failed', error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditImage = (imageUrl: string) => {
    // Open cropper with existing image
    setImageToCrop(imageUrl);
    setShowImageCropper(true);
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !cropContainerRef) return;

    setIsUploadingImage(true);
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
      
      // Clamp to image bounds
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
        finalSourceX, finalSourceY, finalSourceWidth, finalSourceHeight,  // Source rectangle
        0, 0, outputWidth, outputHeight  // Destination rectangle
      );

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showError('Crop Failed', 'Failed to process image');
          setIsUploadingImage(false);
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'cropped-image.jpg');
        
        const response = await fetch('/api/admin/team/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setFormData(prev => ({ ...prev, image_url: data.url }));
          setImagePreview(data.url);
          setImageFile(null);
          showSuccess('Image Uploaded', 'Image cropped and uploaded successfully');
          setShowImageCropper(false);
          setImageToCrop(null);
          setCropData({ x: 0, y: 0, scale: 1 });
        } else {
          showError('Upload Failed', data.error || 'Failed to upload image');
        }
        setIsUploadingImage(false);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      showError('Crop Failed', err instanceof Error ? err.message : 'Failed to crop image');
      setIsUploadingImage(false);
      console.error(err);
    }
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop(null);
    setImageFile(null);
    setCropData({ x: 0, y: 0, scale: 1 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showError('Invalid File Type', 'Please select a JPEG, PNG, WebP, or GIF image.');
        return;
      }

      // Validate file size (10MB max)
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        showError('File Too Large', `Image must be smaller than ${maxSizeMB}MB.`);
        return;
      }

      setImageFile(file);
      setShouldDeleteImage(false);
      // Create preview URL for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImageToCrop(imageUrl);
        setShowImageCropper(true);
        setCropData({ x: 0, y: 0, scale: 1 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setShouldDeleteImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
    e.preventDefault();
      e.stopPropagation();
    }
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Use the image URL from formData (set by cropper) or keep existing if editing
      if (formData.image_url) {
        imageUrl = formData.image_url;
      } else if (editingMember && !shouldDeleteImage) {
        // Keep existing image if editing and not deleting
        imageUrl = editingMember.image_url || null;
      }

      const url = editingMember 
        ? `/api/admin/team/${editingMember.id}`
        : "/api/admin/team";
      
      const method = editingMember ? "PUT" : "POST";
      
      const submitData = {
        ...formData,
        image_url: shouldDeleteImage ? null : imageUrl,
        delete_image: shouldDeleteImage,
        service_ids: formData.service_ids || []
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showSuccess(
          "Success",
          showEditModal 
            ? "Team member updated successfully!" 
            : "Team member added successfully!"
        );
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingMember(null);
        setImageFile(null);
        setImagePreview(null);
        setShouldDeleteImage(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "",
          specializations: "",
          experience_years: "",
          certifications: "",
          image_url: "",
          service_ids: [],
          is_active: true
        });
        setServiceSearchQuery("");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        loadTeam();
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || "Failed to save team member");
      }
    } catch (error) {
      showError("Error", "Error saving team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "",
      specializations: member.specializations || "",
      experience_years: member.experience_years || "",
      certifications: member.certifications || "",
      image_url: member.image_url || "",
      service_ids: member.service_ids || [],
      is_active: member.is_active
    });
    setImageFile(null);
    setImagePreview(member.image_url || null);
    setShouldDeleteImage(false);
    setServiceSearchQuery("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    await confirm(
      {
        title: "Delete Team Member",
        message: "Are you sure you want to delete this team member? This action cannot be undone.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Success", "Team member deleted successfully!");
        loadTeam();
      } else {
        showError("Error", "Failed to delete team member");
      }
    } catch (error) {
      showError("Error", "Error deleting team member");
    }
      }
    );
  };

  const handleToggleActive = async (member: TeamMember) => {
    setTogglingActive(member.id);
    try {
      const response = await fetch(`/api/admin/team/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          phone: member.phone || "",
          role: member.role,
          specializations: member.specializations || "",
          experience_years: member.experience_years || "",
          certifications: member.certifications || "",
          image_url: member.image_url || null,
          service_ids: member.service_ids || [],
          is_active: !member.is_active
        }),
      });

      if (response.ok) {
        showSuccess("Success", `Team member ${!member.is_active ? "activated" : "deactivated"} successfully!`);
        loadTeam();
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || "Failed to update team member status");
      }
    } catch (error) {
      showError("Error", "Error updating team member status");
    } finally {
      setTogglingActive(null);
    }
  };

  const handleOpenDayOffModal = async (member: TeamMember) => {
    setSelectedMemberForDayOff(member);
    setDayOffForm({ start_date: "", end_date: "", reason: "" });
    setDayOffDateRange(null);
    setEditingDayOff(null);
    
    // Load existing day off periods for this member
    try {
      const response = await fetch(`/api/admin/team/${member.id}/day-off`);
      if (response.ok) {
        const data = await response.json();
        setDayOffPeriods(data.dayOffPeriods || []);
      }
    } catch (error) {
      console.error("Error loading day off periods:", error);
    }
    
    setShowDayOffModal(true);
  };

  const handleSaveDayOff = async () => {
    if (!selectedMemberForDayOff) return;
    
    if (!dayOffDateRange || !dayOffDateRange.start || !dayOffDateRange.end) {
      showError("Error", "Please select a date range");
      return;
    }

    // Convert CalendarDate to YYYY-MM-DD format
    const startDate = `${dayOffDateRange.start.year}-${String(dayOffDateRange.start.month).padStart(2, '0')}-${String(dayOffDateRange.start.day).padStart(2, '0')}`;
    const endDate = `${dayOffDateRange.end.year}-${String(dayOffDateRange.end.month).padStart(2, '0')}-${String(dayOffDateRange.end.day).padStart(2, '0')}`;

    try {
      const url = editingDayOff 
        ? `/api/admin/team/${selectedMemberForDayOff.id}/day-off/${editingDayOff}`
        : `/api/admin/team/${selectedMemberForDayOff.id}/day-off`;
      
      const response = await fetch(url, {
        method: editingDayOff ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          reason: dayOffForm.reason
        }),
      });

      if (response.ok) {
        showSuccess("Success", editingDayOff ? "Day off period updated!" : "Day off period added!");
        setDayOffForm({ start_date: "", end_date: "", reason: "" });
        setDayOffDateRange(null);
        setEditingDayOff(null);
        
        // Reload day off periods
        const reloadResponse = await fetch(`/api/admin/team/${selectedMemberForDayOff.id}/day-off`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setDayOffPeriods(data.dayOffPeriods || []);
        }
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || "Failed to save day off period");
      }
    } catch (error) {
      showError("Error", "Error saving day off period");
    }
  };

  const handleDeleteDayOff = async (dayOffId: string) => {
    if (!selectedMemberForDayOff) return;
    
    await confirm(
      {
        title: "Delete Day Off Period",
        message: "Are you sure you want to delete this day off period? This action cannot be undone.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
        try {
          const response = await fetch(`/api/admin/team/${selectedMemberForDayOff.id}/day-off/${dayOffId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            showSuccess("Success", "Day off period deleted!");
            setDayOffPeriods(dayOffPeriods.filter(p => p.id !== dayOffId));
          } else {
            showError("Error", "Failed to delete day off period");
          }
        } catch (error) {
          showError("Error", "Error deleting day off period");
        }
      }
    );
  };

  const handleEditDayOff = (period: { id: string; start_date: string; end_date: string; reason?: string }) => {
    setDayOffForm({
      start_date: period.start_date,
      end_date: period.end_date,
      reason: period.reason || ""
    });
    // Convert string dates to CalendarDate
    try {
      const startDate = parseDate(period.start_date);
      const endDate = parseDate(period.end_date);
      setDayOffDateRange({ start: startDate, end: endDate });
    } catch (error) {
      console.error("Error parsing dates:", error);
      setDayOffDateRange(null);
    }
    setEditingDayOff(period.id);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingMember(null);
    setImageFile(null);
    setImagePreview(null);
    setShouldDeleteImage(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      specializations: "",
      experience_years: "",
      certifications: "",
      image_url: "",
      service_ids: [],
      is_active: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="p-6">
        <div className="animate-pulse">
            <div className="h-6 bg-default-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
              <div className="h-4 bg-default-200 rounded"></div>
              <div className="h-4 bg-default-200 rounded w-5/6"></div>
              <div className="h-4 bg-default-200 rounded w-4/6"></div>
          </div>
        </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardBody className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
            Team Members
          </h3>
            <p className="text-default-500 text-sm">
            Manage your team members for booking assignments
          </p>
        </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => {
              setEditingMember(null);
              setFormData({
                name: "",
                email: "",
                phone: "",
                role: "",
                specializations: "",
                experience_years: "",
                certifications: "",
                image_url: "",
                service_ids: [],
                is_active: true
              });
              setImageFile(null);
              setImagePreview(null);
              setShouldDeleteImage(false);
              setShowAddModal(true);
            }}
          >
          Add Team Member
          </Button>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={handleCancel}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  {showEditModal ? "Edit Team Member" : "Add New Team Member"}
                </h3>
              </ModalHeader>
              <ModalBody>
                <form 
                  id="team-member-form" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }} 
                  className="space-y-6"
                >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                      isClearable
                    />

                    <Input
                  type="email"
                      label="Email Address"
                      placeholder="member@email.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      isRequired
                      isClearable
                    />

                    <Input
                  type="tel"
                      label="Phone Number"
                      placeholder="+44 7700 900123"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      isClearable
                    />

                    <Select
                      label="Role"
                      placeholder="Select a role"
                      selectedKeys={formData.role ? [formData.role] : []}
                      onSelectionChange={(keys) => {
                        const selectedRole = Array.from(keys)[0] as string;
                        setFormData({ ...formData, role: selectedRole || "" });
                      }}
                      isRequired
                    >
                  {roles.map((role) => (
                        <SelectItem key={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Specializations"
                      placeholder="Anti-wrinkle, Dermal Fillers, etc."
                      value={formData.specializations || ""}
                      onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                      isClearable
                    />

                    <Input
                      label="Years of Experience"
                      placeholder="5+ years"
                      value={formData.experience_years || ""}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      isClearable
                    />

                    <div className="md:col-span-2">
                      <Textarea
                        label="Certifications"
                        placeholder="List relevant certifications and qualifications..."
                        value={formData.certifications || ""}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        minRows={3}
                        classNames={{
                          input: "resize-none"
                        }}
                      />
              </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Profile Image
                </label>
                      <div className="space-y-3">
                        {(imagePreview || (editingMember && editingMember.image_url && !imageFile)) && (
                          <div className="relative inline-block group">
                            <img
                              src={imagePreview || editingMember?.image_url || ''}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border-2 border-divider"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => handleEditImage(imagePreview || editingMember?.image_url || '')}
                                title="Crop image"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={handleDeleteImage}
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="hidden"
                            id="team-image-upload"
                          />
                          <Button
                            as="label"
                            htmlFor="team-image-upload"
                            variant="flat"
                            startContent={<Upload className="w-4 h-4" />}
                            className="cursor-pointer"
                          >
                            {imagePreview || (editingMember && editingMember.image_url) ? 'Change Image' : 'Upload Image'}
                          </Button>
                          {isUploadingImage && (
                            <span className="text-sm text-default-500">Uploading...</span>
                          )}
                        </div>
                        <p className="text-xs text-default-400">
                          JPEG, PNG, WebP, or GIF. Max 10MB.
                        </p>
                      </div>
              </div>

                    {/* Services Selection - Compact View */}
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
              <div>
                            <label className="block text-sm font-medium mb-1">
                              Available Services *
                </label>
                            <p className="text-xs text-default-500">
                              Select which services this team member can perform
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            color="primary"
                            variant="bordered"
                            startContent={<Check className="w-4 h-4" />}
                            onPress={() => setShowServicesModal(true)}
                            className="flex-1"
                          >
                            {formData.service_ids.length > 0 
                              ? `${formData.service_ids.length} Service${formData.service_ids.length !== 1 ? 's' : ''} Selected`
                              : 'Select Services'
                            }
                          </Button>
                          {formData.service_ids.length > 0 && (
                            <Button
                              isIconOnly
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => setFormData(prev => ({ ...prev, service_ids: [] }))}
                              title="Clear all services"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {formData.service_ids.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.service_ids.slice(0, 5).map(serviceId => {
                              const service = services.find(s => s.id === serviceId);
                              if (!service) return null;
                              return (
                                <Chip
                                  key={serviceId}
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  onClose={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      service_ids: prev.service_ids.filter(id => id !== serviceId)
                                    }));
                                  }}
                                >
                                  {service.name}
                                </Chip>
                              );
                            })}
                            {formData.service_ids.length > 5 && (
                              <Chip size="sm" variant="flat" color="default">
                                +{formData.service_ids.length - 5} more
                              </Chip>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Checkbox
                    isSelected={formData.is_active}
                    onValueChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  >
                    Active team member
                  </Checkbox>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={handleCancel}
                  isDisabled={isSubmitting || isUploadingImage}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={() => {
                    handleSubmit();
                  }}
                  isLoading={isSubmitting || isUploadingImage}
                  isDisabled={isSubmitting || isUploadingImage}
                >
                  {showEditModal ? "Update" : "Add"} Team Member
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Services Selection Modal - Nested */}
      <Modal
        isOpen={showServicesModal}
        onClose={() => {
          setShowServicesModal(false);
          setServiceSearchQuery("");
          setSelectedCategoryFilter("all");
          setSelectedStatusFilter("all");
        }}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  Select Services
                </h3>
                <p className="text-sm text-default-500 font-normal">
                  Choose which services this team member can perform
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Search Bar and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Search services..."
                          value={serviceSearchQuery}
                          onChange={(e) => setServiceSearchQuery(e.target.value)}
                          startContent={<Search className="w-4 h-4 text-default-400" />}
                          isClearable
                          size="lg"
                          variant="bordered"
                          classNames={{
                            input: "text-sm",
                            inputWrapper: "h-12"
                          }}
                        />
                      </div>
                      <div className="w-full sm:w-64">
                        <Select
                          label="Filter by Category"
                          placeholder="All Categories"
                          selectedKeys={selectedCategoryFilter === "all" ? ["all"] : [selectedCategoryFilter]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            setSelectedCategoryFilter(selected || "all");
                          }}
                          size="lg"
                          variant="bordered"
                          classNames={{
                            trigger: "h-12",
                            value: "text-sm"
                          }}
                        >
                          <SelectItem key="all">
                            All Categories
                          </SelectItem>
                          {(allCategories.map((category) => (
                            <SelectItem key={category}>
                              {category}
                            </SelectItem>
                          )) as any)}
                        </Select>
                      </div>
                      <div className="w-full sm:w-64">
                        <Select
                          label="Filter by Status"
                          placeholder="All Services"
                          selectedKeys={[selectedStatusFilter]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            setSelectedStatusFilter(selected || "all");
                          }}
                          size="lg"
                          variant="bordered"
                          classNames={{
                            trigger: "h-12",
                            value: "text-sm"
                          }}
                        >
                          <SelectItem key="all">
                            All Services
                          </SelectItem>
                          <SelectItem key="selected">
                            Selected Only
                          </SelectItem>
                          <SelectItem key="unselected">
                            Unselected Only
                          </SelectItem>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Select All / Clear All */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-divider">
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color="primary">
                          {formData.service_ids.length} selected
                        </Chip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            const allServiceIds = Object.values(filteredAndGroupedServices).flat().map(s => s.id);
                            setFormData(prev => ({
                              ...prev,
                              service_ids: allServiceIds
                            }));
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          color="default"
                          variant="flat"
                          onPress={() => {
                            const allServiceIds = Object.values(filteredAndGroupedServices).flat().map(s => s.id);
                            setFormData(prev => ({
                              ...prev,
                              service_ids: prev.service_ids.filter(id => !allServiceIds.includes(id))
                            }));
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                  {/* Services List by Category */}
                  {servicesLoading ? (
                    <div className="text-sm text-default-500 py-8 text-center">Loading services...</div>
                  ) : services.length === 0 ? (
                    <div className="text-sm text-default-500 py-8 text-center">No services available</div>
                  ) : (
                    <div className="max-h-[65vh] overflow-y-auto border border-divider rounded-lg p-6 space-y-6 bg-default-50">
                      {Object.keys(filteredAndGroupedServices).length === 0 ? (
                        <div className="text-sm text-default-500 text-center py-8">
                          {serviceSearchQuery ? (
                            <>No services found matching &quot;{serviceSearchQuery}&quot;</>
                          ) : (
                            "No services available"
                          )}
                        </div>
                      ) : (
                        <>
                          {Object.keys(filteredAndGroupedServices)
                            .sort()
                            .map(categoryName => {
                              const categoryServices = filteredAndGroupedServices[categoryName];
                              const categoryServiceIds = categoryServices.map(s => s.id);
                              const allCategorySelected = categoryServiceIds.every(id => formData.service_ids.includes(id));
                              const someCategorySelected = categoryServiceIds.some(id => formData.service_ids.includes(id));
                              
                              return (
                                <div key={categoryName} className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-divider pb-2">
                                    <h5 className="text-base font-semibold">
                                      {categoryName}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        onPress={() => {
                                          setFormData(prev => {
                                            const newIds = [...prev.service_ids];
                                            categoryServiceIds.forEach(id => {
                                              if (!newIds.includes(id)) {
                                                newIds.push(id);
                                              }
                                            });
                                            return {
                                              ...prev,
                                              service_ids: newIds
                                            };
                                          });
                                        }}
                                        isDisabled={allCategorySelected}
                                      >
                                        Select All
                                      </Button>
                                      <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        onPress={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            service_ids: prev.service_ids.filter(id => !categoryServiceIds.includes(id))
                                          }));
                                        }}
                                        isDisabled={!someCategorySelected}
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {filteredAndGroupedServices[categoryName].map(service => {
                                      const isSelected = formData.service_ids.includes(service.id);
                                      return (
                                        <Card
                                          key={service.id}
                                          isPressable
                                          onPress={() => {
                                            setFormData(prev => {
                                              const isCurrentlySelected = prev.service_ids.includes(service.id);
                                              if (isCurrentlySelected) {
                                                return {
                                                  ...prev,
                                                  service_ids: prev.service_ids.filter(id => id !== service.id)
                                                };
                                              } else {
                                                return {
                                                  ...prev,
                                                  service_ids: [...prev.service_ids, service.id]
                                                };
                                              }
                                            });
                                          }}
                                          className={`cursor-pointer transition-all ${
                                            isSelected
                                              ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/20'
                                              : 'border-2 border-red-300 bg-red-50 dark:bg-red-950/20 hover:border-red-400'
                                          }`}
                                        >
                                          <CardBody className="p-4">
                                            <div className="flex items-center">
                                              <span className={`text-sm flex-1 font-medium ${
                                                isSelected
                                                  ? 'text-green-700 dark:text-green-300'
                                                  : 'text-red-700 dark:text-red-300'
                                              }`}>
                                                {service.name}
                                              </span>
                                            </div>
                                          </CardBody>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    setServiceSearchQuery("");
                    setSelectedCategoryFilter("all");
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    setServiceSearchQuery("");
                    setSelectedCategoryFilter("all");
                    onClose();
                  }}
                >
                  Done ({formData.service_ids.length} selected)
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

        {/* Team Cards Grid */}
        {team.length === 0 ? (
          <div className="text-center py-12 text-default-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No team members added yet.</p>
            <p className="text-sm">Click "Add Team Member" to get started.</p>
          </div>
        ) : (
        <>
          {/* Active Team Members */}
          {team.filter(m => m.is_active).length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Chip color="success" size="sm" variant="flat" />
                Active Team Members
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.filter(m => m.is_active).map((member) => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member} 
                    onToggleActive={handleToggleActive}
                    onOpenDayOff={handleOpenDayOffModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    togglingActive={togglingActive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Team Members */}
          {team.filter(m => !m.is_active).length > 0 && (
            <div className="mt-8 pt-8 border-t border-divider">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Chip color="default" size="sm" variant="flat" />
                Inactive Team Members
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.filter(m => !m.is_active).map((member) => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member} 
                    onToggleActive={handleToggleActive}
                    onOpenDayOff={handleOpenDayOffModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    togglingActive={togglingActive}
                  />
                ))}
              </div>
            </div>
          )}
        </>
        )}
        </CardBody>
      </Card>

      {/* Day Off Management Modal */}
      <Modal
        isOpen={showDayOffModal}
        onClose={() => {
          setShowDayOffModal(false);
          setSelectedMemberForDayOff(null);
          setDayOffPeriods([]);
          setDayOffForm({ start_date: "", end_date: "", reason: "" });
          setDayOffDateRange(null);
          setEditingDayOff(null);
        }}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  Day Off Management
                </h3>
                {selectedMemberForDayOff && (
                  <p className="text-sm text-default-500 font-normal">
                    {selectedMemberForDayOff.name}
                  </p>
                )}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Add/Edit Day Off Form */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">
                      {editingDayOff ? "Edit Day Off Period" : "Add Day Off Period"}
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Date Range
                </label>
                      <div className="flex justify-center bg-default-50 dark:bg-default-100 rounded-lg p-4">
                        <RangeCalendar
                          aria-label="Day off date range"
                          value={dayOffDateRange ? (dayOffDateRange.start && dayOffDateRange.end ? {
                            start: dayOffDateRange.start,
                            end: dayOffDateRange.end
                          } : undefined) : undefined}
                          onChange={(range) => {
                            if (range) {
                              setDayOffDateRange({ start: range.start, end: range.end });
                            } else {
                              setDayOffDateRange(null);
                            }
                          }}
                          minValue={today(getLocalTimeZone())}
                />
              </div>
            </div>

                    <div>
                      <Textarea
                        label="Reason (Optional)"
                        placeholder="e.g., Vacation, Personal leave..."
                        value={dayOffForm.reason}
                        onChange={(e) => setDayOffForm({ ...dayOffForm, reason: e.target.value })}
                        minRows={3}
                        classNames={{
                          input: "resize-none"
                        }}
                      />
                    </div>
                  </div>

                  {/* Existing Day Off Periods */}
                  {dayOffPeriods.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">
                        Existing Day Off Periods
                      </h4>
                      <div className="space-y-3">
                        {dayOffPeriods.map((period) => (
                          <Card key={period.id} isPressable={false}>
                            <CardBody className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-default-500 flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                      {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {period.reason && (
                                    <p className="text-sm text-default-500 mt-1">
                                      {period.reason}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    isIconOnly
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                    onPress={() => handleEditDayOff(period)}
                                    aria-label="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    isIconOnly
                                    variant="light"
                                    color="danger"
                                    size="sm"
                                    onPress={() => handleDeleteDayOff(period.id)}
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                >
                  Close
                </Button>
                {editingDayOff && (
                  <Button
                    variant="light"
                    onPress={() => {
                      setDayOffForm({ start_date: "", end_date: "", reason: "" });
                      setDayOffDateRange(null);
                      setEditingDayOff(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleSaveDayOff}
                >
                  {editingDayOff ? "Update" : "Add"} Day Off
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Image Cropper Modal */}
      {showImageCropper && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
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
                    disabled={isUploadingImage}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingImage ? 'Uploading...' : 'Apply Crop & Upload'}
              </button>
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal {...modalProps} />
          </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ 
  member, 
  onToggleActive, 
  onOpenDayOff, 
  onEdit, 
  onDelete, 
  togglingActive 
}: {
  member: TeamMember;
  onToggleActive: (member: TeamMember) => void;
  onOpenDayOff: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  togglingActive: string | null;
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Quick Toggle Active/Inactive Button - Left Side */}
      <Button
        isIconOnly
        size="sm"
        color={member.is_active ? "success" : "default"}
        variant="flat"
        className="absolute left-3 top-3 z-10"
        onPress={() => onToggleActive(member)}
        isDisabled={togglingActive === member.id}
        title={member.is_active ? "Click to deactivate" : "Click to activate"}
      >
        <Power className={`w-4 h-4 ${member.is_active ? "" : "opacity-75"}`} />
      </Button>

      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-secondary-50">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar
              name={member.name}
              size="lg"
              className="w-20 h-20 text-large"
            />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Chip
            color={member.is_active ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {member.is_active ? "Active" : "Inactive"}
          </Chip>
        </div>
      </div>

      {/* Content Section */}
      <CardBody className="p-5">
        <div className="mb-4">
          <h4 className="text-xl font-bold mb-1">
                      {member.name}
                    </h4>
          <div className="flex items-center gap-2 text-primary">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{member.role}</span>
          </div>
                  </div>
                  
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-default-500">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
            <div className="flex items-center gap-2 text-default-500">
              <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.experience_years && (
            <div className="flex items-center gap-2 text-default-500">
              <User className="w-4 h-4 flex-shrink-0" />
                        <span>{member.experience_years} experience</span>
                      </div>
                    )}
                  </div>

                  {member.specializations && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-default-400 uppercase mb-1">
              Specializations
            </p>
            <p className="text-sm text-default-700 line-clamp-2">
              {member.specializations}
                      </p>
                    </div>
                  )}

                  {member.certifications && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-default-400 uppercase mb-1">
              Certifications
            </p>
            <p className="text-sm text-default-700 line-clamp-3">
              {member.certifications}
                      </p>
                    </div>
                  )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-divider">
          <Button
            isIconOnly
            color="secondary"
            variant="flat"
            size="sm"
            onPress={() => onOpenDayOff(member)}
            title="Manage Day Off"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            startContent={<Edit className="w-4 h-4" />}
            onPress={() => onEdit(member)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            isIconOnly
            color="danger"
            variant="flat"
            size="sm"
            onPress={() => onDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
          </Button>
                </div>
      </CardBody>
    </Card>
  );
}

