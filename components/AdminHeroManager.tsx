"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { getSupportedFormatsText, processImageFile, getImageDimensions, compressImage } from "@/lib/image-utils";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { 
  X, Upload, Save, Image as ImageIcon, Settings, Trash2, 
  Type, MousePointerClick, Phone, Zap, 
  AlertCircle, Loader2, CheckCircle2
} from "lucide-react";
import { IconPicker } from "./IconPicker";
import { siteConfig } from "@/config/site";

type HeroSection = {
  id?: string;
  image_1_url: string | null;
  image_2_url: string | null;
  image_3_url: string | null;
  image_1_position?: string;
  image_2_position?: string;
  image_3_position?: string;
  badge_text: string;
  badge_icon: string;
  main_headline: string;
  sub_headline: string;
  feature_1_text: string;
  feature_2_text: string;
  feature_3_text: string;
  button_1_text: string;
  button_1_icon: string;
  button_1_link: string;
  button_1_type: string;
  button_2_text: string;
  button_2_icon: string;
  button_2_link: string | null;
  button_2_type: string;
  contact_label: string;
  phone_number: string | null;
  image_resize_enabled: boolean;
  image_max_width: number;
  image_max_height: number;
  image_quality: number;
  is_active: boolean;
  animation_duration_ms: number;
};

const defaultHeroSection: Omit<HeroSection, 'id'> = {
  image_1_url: null,
  image_2_url: null,
  image_3_url: null,
  image_1_position: "object-center",
  image_2_position: "object-center",
  image_3_position: "object-center",
  badge_text: "Award-Winning Clinic",
  badge_icon: "star",
  main_headline: "Your Journey to Confidence",
  sub_headline: "Personalised treatments tailored to your unique goals",
  feature_1_text: "1000+ Treatments",
  feature_2_text: "100% Satisfaction",
  feature_3_text: "Professional Standards",
  button_1_text: "Book Treatment Now",
  button_1_icon: "calendar",
  button_1_link: "#contact",
  button_1_type: "internal",
  button_2_text: "WhatsApp Us",
  button_2_icon: "whatsapp",
  button_2_link: null,
  button_2_type: "external",
  contact_label: "Or call us now:",
  phone_number: null,
  image_resize_enabled: true,
  image_max_width: 1920,
  image_max_height: 1080,
  image_quality: 0.85,
  is_active: true,
  animation_duration_ms: 6000,
};

type ImageSettings = {
  quality: number;
  originalFile: File | null;
  compressedFile: File | null;
  originalSize: number;
  compressedSize: number;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
};

export function AdminHeroManager() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [formData, setFormData] = useState<Omit<HeroSection, 'id'>>(defaultHeroSection);

  // Image states for each of the 3 images
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [imageSettings, setImageSettings] = useState<ImageSettings[]>([
    {
      quality: 0.85,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
    },
    {
      quality: 0.85,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
    },
    {
      quality: 0.85,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
    },
  ]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    loadHeroSection();
  }, []);

  const loadHeroSection = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hero-section");
      const data = await response.json();

      if (data.heroSection) {
        setHeroSection(data.heroSection);
        setFormData({
          image_1_url: data.heroSection.image_1_url,
          image_2_url: data.heroSection.image_2_url,
          image_3_url: data.heroSection.image_3_url,
          image_1_position: data.heroSection.image_1_position || defaultHeroSection.image_1_position,
          image_2_position: data.heroSection.image_2_position || defaultHeroSection.image_2_position,
          image_3_position: data.heroSection.image_3_position || defaultHeroSection.image_3_position,
          badge_text: data.heroSection.badge_text || defaultHeroSection.badge_text,
          badge_icon: data.heroSection.badge_icon || defaultHeroSection.badge_icon,
          main_headline: data.heroSection.main_headline || defaultHeroSection.main_headline,
          sub_headline: data.heroSection.sub_headline || defaultHeroSection.sub_headline,
          feature_1_text: data.heroSection.feature_1_text || defaultHeroSection.feature_1_text,
          feature_2_text: data.heroSection.feature_2_text || defaultHeroSection.feature_2_text,
          feature_3_text: data.heroSection.feature_3_text || defaultHeroSection.feature_3_text,
          button_1_text: data.heroSection.button_1_text || defaultHeroSection.button_1_text,
          button_1_icon: data.heroSection.button_1_icon || defaultHeroSection.button_1_icon,
          button_1_link: data.heroSection.button_1_link || defaultHeroSection.button_1_link,
          button_1_type: data.heroSection.button_1_type || defaultHeroSection.button_1_type,
          button_2_text: data.heroSection.button_2_text || defaultHeroSection.button_2_text,
          button_2_icon: data.heroSection.button_2_icon || defaultHeroSection.button_2_icon,
          button_2_link: data.heroSection.button_2_link || defaultHeroSection.button_2_link,
          button_2_type: data.heroSection.button_2_type || defaultHeroSection.button_2_type,
          contact_label: data.heroSection.contact_label || defaultHeroSection.contact_label,
          phone_number: data.heroSection.phone_number || defaultHeroSection.phone_number,
          image_resize_enabled: data.heroSection.image_resize_enabled !== false,
          image_max_width: data.heroSection.image_max_width || defaultHeroSection.image_max_width,
          image_max_height: data.heroSection.image_max_height || defaultHeroSection.image_max_height,
          image_quality: data.heroSection.image_quality || defaultHeroSection.image_quality,
          is_active: data.heroSection.is_active !== false,
          animation_duration_ms: data.heroSection.animation_duration_ms || defaultHeroSection.animation_duration_ms,
        });

        // Set previews for existing images
        setImagePreviews([
          data.heroSection.image_1_url,
          data.heroSection.image_2_url,
          data.heroSection.image_3_url,
        ]);
      }
    } catch (error) {
      console.error("Error loading hero section:", error);
      showError("Error", "Failed to load hero section");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, index: number) => {
    try {
      // Validate the file first
      await processImageFile(file, 10, false); // Don't compress yet

      // Get original dimensions
      const dimensions = await getImageDimensions(file);

      // Update image settings
      const newSettings = [...imageSettings];
      newSettings[index] = {
        quality: formData.image_quality,
        originalFile: file,
        originalSize: file.size,
        originalDimensions: dimensions,
        compressedFile: file, // Start with original
        compressedSize: file.size,
        compressedDimensions: dimensions,
      };
      setImageSettings(newSettings);

      // Revoke previous object URL if it exists
      if (imagePreviews[index] && imagePreviews[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviews[index]!);
      }

      // Update file and preview
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process image";
      showError("Image Upload Error", `Failed to process image ${index + 1}: ${errorMessage}`);
    }
  };

  const handleQualityChange = async (quality: number, index: number) => {
    const settings = imageSettings[index];
    if (!settings.originalFile) return;

    try {
      // Compress the original file with new quality
      const compressedFile = await compressImage(
        settings.originalFile,
        formData.image_max_width,
        formData.image_max_height,
        quality
      );
      const dimensions = await getImageDimensions(compressedFile);

      const newSettings = [...imageSettings];
      newSettings[index] = {
        ...settings,
        quality,
        compressedFile,
        compressedSize: compressedFile.size,
        compressedDimensions: dimensions,
      };
      setImageSettings(newSettings);

      // Update preview
      if (imagePreviews[index] && imagePreviews[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviews[index]!);
      }
      const newFiles = [...imageFiles];
      newFiles[index] = compressedFile;
      setImageFiles(newFiles);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(compressedFile);
      setImagePreviews(newPreviews);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  const clearImage = (index: number) => {
    // Revoke the object URL to free memory
    if (imagePreviews[index] && imagePreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]!);
    }

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);

    const newSettings = [...imageSettings];
    newSettings[index] = {
      quality: formData.image_quality,
      originalFile: null,
      compressedFile: null,
      originalSize: 0,
      compressedSize: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
    };
    setImageSettings(newSettings);

    // Clear URL in form data
    const urlKey = `image_${index + 1}_url` as keyof typeof formData;
    setFormData((prev) => ({ ...prev, [urlKey]: null }));
  };

  const uploadImage = async (index: number): Promise<string | null> => {
    const file = imageFiles[index];
    if (!file) {
      // If no new file, return existing URL
      const urlKey = `image_${index + 1}_url` as keyof typeof formData;
      return formData[urlKey] as string | null;
    }

    setUploadingImages((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    try {
      const formDataUpload = new FormData();
      
      // Use compressed file if resize is enabled, otherwise use original
      const fileToUpload = formData.image_resize_enabled && imageSettings[index].compressedFile
        ? imageSettings[index].compressedFile
        : file;

      formDataUpload.append("file", fileToUpload);
      formDataUpload.append("imageIndex", (index + 1).toString());
      formDataUpload.append("resizeEnabled", formData.image_resize_enabled.toString());
      formDataUpload.append("maxWidth", formData.image_max_width.toString());
      formDataUpload.append("maxHeight", formData.image_max_height.toString());
      formDataUpload.append("quality", formData.image_quality.toString());

      const response = await fetch("/api/hero-section/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      showError("Upload Error", `Failed to upload image ${index + 1}: ${errorMessage}`);
      return null;
    } finally {
      setUploadingImages((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const handleSave = async () => {
    if (!formData.main_headline.trim()) {
      showError("Validation Error", "Main headline is required");
      return;
    }

    setSaving(true);
    try {
      // Upload all new images first
      const imageUrls = await Promise.all([
        uploadImage(0),
        uploadImage(1),
        uploadImage(2),
      ]);

      const payload = {
        ...(heroSection?.id && { id: heroSection.id }),
        image_1_url: imageUrls[0] || formData.image_1_url,
        image_2_url: imageUrls[1] || formData.image_2_url,
        image_3_url: imageUrls[2] || formData.image_3_url,
        image_1_position: formData.image_1_position || "object-center",
        image_2_position: formData.image_2_position || "object-center",
        image_3_position: formData.image_3_position || "object-center",
        badge_text: formData.badge_text,
        badge_icon: formData.badge_icon,
        main_headline: formData.main_headline,
        sub_headline: formData.sub_headline,
        feature_1_text: formData.feature_1_text,
        feature_2_text: formData.feature_2_text,
        feature_3_text: formData.feature_3_text,
        button_1_text: formData.button_1_text,
        button_1_icon: formData.button_1_icon,
        button_1_link: formData.button_1_link,
        button_1_type: formData.button_1_type,
        button_2_text: formData.button_2_text,
        button_2_icon: formData.button_2_icon,
        button_2_link: formData.button_2_link,
        button_2_type: formData.button_2_type,
        contact_label: formData.contact_label,
        phone_number: formData.phone_number,
        image_resize_enabled: formData.image_resize_enabled,
        image_max_width: formData.image_max_width,
        image_max_height: formData.image_max_height,
        image_quality: formData.image_quality,
        is_active: formData.is_active,
        animation_duration_ms: formData.animation_duration_ms,
      };

      // Always use PUT for upsert (ensures only one record exists)
      const url = "/api/hero-section";
      const method = "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          "Hero Section Saved",
          "The hero section has been saved successfully."
        );
        await loadHeroSection();
      } else {
        throw new Error(data.error || "Failed to save hero section");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save hero section";
      showError("Save Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-default-500">Loading hero section...</p>
      </div>
    );
  }

  const hasImages = imagePreviews.some(preview => preview !== null) || 
    formData.image_1_url || formData.image_2_url || formData.image_3_url;
  const imagesCount = [formData.image_1_url, formData.image_2_url, formData.image_3_url]
    .filter(url => url !== null).length;

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Stats Cards - compact for mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border border-divider bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardBody className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-primary truncate">{imagesCount}/3</p>
                <p className="text-[10px] sm:text-xs font-medium text-default-500 truncate">Images</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0 self-start">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            {imagesCount < 3 && (
              <p className="text-[10px] text-warning-600 dark:text-warning-400 mt-2 pt-2 border-t border-divider truncate">
                +{3 - imagesCount} needed
              </p>
            )}
          </CardBody>
        </Card>

        <Card className="border border-divider bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardBody className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-secondary truncate">{formData.animation_duration_ms / 1000}s</p>
                <p className="text-[10px] sm:text-xs font-medium text-default-500 truncate">Speed</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex-shrink-0 self-start">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardBody className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-lg sm:text-2xl font-bold truncate ${formData.image_resize_enabled ? "text-success" : "text-warning"}`}>
                  {formData.image_resize_enabled ? "On" : "Off"}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-default-500 truncate">Compress</p>
              </div>
              <div className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 self-start ${
                formData.image_resize_enabled 
                  ? "bg-success-100 dark:bg-success-900/30" 
                  : "bg-warning-100 dark:bg-warning-900/30"
              }`}>
                <Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  formData.image_resize_enabled ? "text-success-600 dark:text-success-400" : "text-warning-600 dark:text-warning-400"
                }`} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Images Section - compact header */}
      <Card className="border border-divider bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-purple-500/5 border-b border-divider">
          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
            <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Hero Images</h2>
              <p className="text-[10px] sm:text-xs text-default-500 mt-0.5 truncate">{getSupportedFormatsText()}</p>
            </div>
            <Chip size="sm" variant="flat" color="primary" className="flex-shrink-0">
              {imagesCount}/3
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-4">
                <div className="flex flex-col gap-1 mb-3 items-end">
                  <div className="flex items-center justify-between gap-2 w-full">
                    {/* Left side: index number badge + Image X */}
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/80 to-secondary-400/80 shadow-lg border border-primary-200 dark:border-secondary-900 font-extrabold text-white text-lg">
                        {index + 1}
                      </span>
                      <span className="text-base font-semibold text-white">
                        Image {index + 1}
                      </span>
                    </div>
                    {/* Right side: Uploaded chip */}
                    {imagePreviews[index] && (
                      <Chip
                        size="sm"
                        color="success"
                        variant="solid"
                        className="font-semibold px-2 py-0.5 ml-2 text-white"
                        startContent={<CheckCircle2 className="w-3 h-3 text-white" />}
                      >
                        Uploaded
                      </Chip>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  {imagePreviews[index] ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-divider shadow-lg hover:shadow-2xl transition-all duration-300">
                      <img
                        src={imagePreviews[index]!}
                        alt={`Hero image ${index + 1}`}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{
                          objectPosition: (() => {
                            const posKey = `image_${index + 1}_position` as keyof typeof formData;
                            const pos = (formData[posKey] as string) || "object-center";
                            const positionMap: { [key: string]: string } = {
                              "object-center": "center",
                              "object-top": "top",
                              "object-bottom": "bottom",
                              "object-left": "left",
                              "object-right": "right",
                              "object-left-top": "left top",
                              "object-left-bottom": "left bottom",
                              "object-right-top": "right top",
                              "object-right-bottom": "right bottom",
                            };
                            return positionMap[pos] || "center";
                          })(),
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
                        onPress={() => clearImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      
                      {/* Image Info Overlay */}
                      {imageSettings[index].originalFile && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 text-xs backdrop-blur-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {imageSettings[index].originalDimensions.width} × {imageSettings[index].originalDimensions.height}
                            </span>
                            <span className="font-semibold bg-white/20 px-2 py-1 rounded">
                              {(imageSettings[index].originalSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-divider rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-950/20 dark:hover:to-secondary-950/20 transition-all duration-300 hover:border-primary-400 hover:shadow-lg group">
                      <div className="p-5 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-sm font-semibold text-default-700 dark:text-default-300 mb-1">
                        Click to upload
                      </span>
                      <span className="text-xs text-default-500">
                        Image {index + 1}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, index);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Image Position Selector */}
                {imagePreviews[index] && (
                  <div className="mt-3">
                    <Select
                      label="Image Position"
                      placeholder="Select position"
                      selectedKeys={[formData[`image_${index + 1}_position` as keyof typeof formData] as string || "object-center"]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        setFormData((prev) => ({
                          ...prev,
                          [`image_${index + 1}_position`]: value,
                        }));
                      }}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "min-h-unit-10",
                      }}
                    >
                      <SelectItem key="object-center">
                        Center
                      </SelectItem>
                      <SelectItem key="object-top">
                        Top
                      </SelectItem>
                      <SelectItem key="object-bottom">
                        Bottom
                      </SelectItem>
                      <SelectItem key="object-left">
                        Left
                      </SelectItem>
                      <SelectItem key="object-right">
                        Right
                      </SelectItem>
                      <SelectItem key="object-left-top">
                        Top Left
                      </SelectItem>
                      <SelectItem key="object-left-bottom">
                        Bottom Left
                      </SelectItem>
                      <SelectItem key="object-right-top">
                        Top Right
                      </SelectItem>
                      <SelectItem key="object-right-bottom">
                        Bottom Right
                      </SelectItem>
                    </Select>
                  </div>
                )}

                {/* Image Settings (only show if image is uploaded and resize is enabled) */}
                {imageFiles[index] && formData.image_resize_enabled && imageSettings[index].originalFile && (
                  <Card className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-800/50 border border-divider shadow-md">
                    <CardBody className="p-4 space-y-4">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-divider">
                        <span className="text-default-600 dark:text-default-400 font-medium">Original Size</span>
                        <span className="font-bold text-default-700 dark:text-default-300">
                          {(imageSettings[index].originalSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {imageSettings[index].compressedSize > 0 && (
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-divider">
                          <span className="text-default-600 dark:text-default-400 font-medium">Compressed Size</span>
                          <span className="font-bold text-success-600 dark:text-success-400">
                            {(imageSettings[index].compressedSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-default-600 dark:text-default-400 font-medium">Quality</span>
                          <Chip size="sm" variant="flat" color="primary" className="font-bold">
                            {Math.round(imageSettings[index].quality * 100)}%
                          </Chip>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={imageSettings[index].quality}
                          onChange={(e) => handleQualityChange(parseFloat(e.target.value), index)}
                          className="w-full h-2 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-500 transition-colors"
                        />
                      </div>
                    </CardBody>
                  </Card>
                )}

                {uploadingImages[index] && (
                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Content Section */}
      <Card className="border border-divider shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-secondary-500/10 via-purple-500/10 to-pink-500/10 border-b border-divider pb-4">
          <div className="flex items-center gap-3 w-full">
            <div className="p-3 bg-gradient-to-br from-secondary-100 to-purple-100 dark:from-secondary-900/30 dark:to-purple-900/30 rounded-xl shadow-md">
              <Type className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Content & Messaging</h2>
              <p className="text-sm text-default-500 mt-1">Main headlines, badge, and feature text</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6 space-y-6">
          {/* Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Badge Text"
              placeholder="Award-Winning Clinic"
              value={formData.badge_text}
              onChange={(e) => setFormData((prev) => ({ ...prev, badge_text: e.target.value }))}
              variant="bordered"
            />
            <IconPicker
              label="Badge Icon"
              value={formData.badge_icon}
              onChange={(value) => setFormData((prev) => ({ ...prev, badge_icon: value }))}
              category="badge"
            />
          </div>

          {/* Headlines */}
          <Input
            label="Main Headline"
            placeholder="Your Journey to Confidence"
            value={formData.main_headline}
            onChange={(e) => setFormData((prev) => ({ ...prev, main_headline: e.target.value }))}
            variant="bordered"
            isRequired
            classNames={{
              input: "text-lg font-semibold"
            }}
          />

          <Textarea
            label="Sub Headline"
            placeholder="Personalised treatments tailored to your unique goals"
            value={formData.sub_headline}
            onChange={(e) => setFormData((prev) => ({ ...prev, sub_headline: e.target.value }))}
            variant="bordered"
            minRows={2}
          />

          {/* Features */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Features</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <Input
                  key={num}
                  label={`Feature ${num}`}
                  placeholder={`Feature ${num} text`}
                  value={formData[`feature_${num}_text` as keyof typeof formData] as string}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [`feature_${num}_text`]: e.target.value,
                    }))
                  }
                  variant="bordered"
                  startContent={
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                  }
                />
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Buttons Section */}
      <Card className="border border-divider shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-warning-500/10 via-orange-500/10 to-red-500/10 border-b border-divider pb-4">
          <div className="flex items-center gap-3 w-full">
            <div className="p-3 bg-gradient-to-br from-warning-100 to-orange-100 dark:from-warning-900/30 dark:to-orange-900/30 rounded-xl shadow-md">
              <MousePointerClick className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Call-to-Action Buttons</h2>
              <p className="text-sm text-default-500 mt-1">Configure your primary and secondary CTA buttons</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6 space-y-6">
          {[1, 2].map((num) => (
            <Card key={num} className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-800/50 border border-divider shadow-md">
              <CardHeader className="pb-3 border-b border-divider">
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat" color={num === 1 ? "primary" : "secondary"} className="font-bold">
                    Button {num} {num === 1 ? "(Primary)" : "(Secondary)"}
                  </Chip>
                  {formData[`button_${num}_type` as keyof typeof formData] === "external" && (
                    <Chip size="sm" variant="flat" color="warning" className="font-semibold">
                      External Link
                    </Chip>
                  )}
                </div>
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Button Text"
                    placeholder={`Button ${num} text`}
                    value={formData[`button_${num}_text` as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`button_${num}_text`]: e.target.value,
                      }))
                    }
                    variant="bordered"
                  />
                  <IconPicker
                    label={`Button ${num} Icon`}
                    value={formData[`button_${num}_icon` as keyof typeof formData] as string}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`button_${num}_icon`]: value,
                      }))
                    }
                    category="button"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Link URL"
                    placeholder="#contact or https://..."
                    value={(formData[`button_${num}_link` as keyof typeof formData] as string) || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`button_${num}_link`]: e.target.value || null,
                      }))
                    }
                    variant="bordered"
                  />
                  <Select
                    label="Link Type"
                    selectedKeys={[formData[`button_${num}_type` as keyof typeof formData] as string]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setFormData((prev) => ({
                        ...prev,
                        [`button_${num}_type`]: value,
                      }));
                    }}
                    variant="bordered"
                  >
                    <SelectItem key="internal">
                      Internal (Same Page)
                    </SelectItem>
                    <SelectItem key="external">
                      External (New Tab)
                    </SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>
          ))}
        </CardBody>
      </Card>

      {/* Contact Section */}
      <Card className="border border-divider shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-success-500/10 via-emerald-500/10 to-teal-500/10 border-b border-divider pb-4">
          <div className="flex items-center gap-3 w-full">
            <div className="p-3 bg-gradient-to-br from-success-100 to-emerald-100 dark:from-success-900/30 dark:to-emerald-900/30 rounded-xl shadow-md">
              <Phone className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
              <p className="text-sm text-default-500 mt-1">Display contact details in hero section</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Label"
              placeholder="Or call us now:"
              value={formData.contact_label}
              onChange={(e) => setFormData((prev) => ({ ...prev, contact_label: e.target.value }))}
              variant="bordered"
            />
            <Input
              label="Phone Number"
              placeholder={siteConfig.contact.phone}
              value={formData.phone_number || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value || null }))}
              variant="bordered"
              type="tel"
            />
          </div>
        </CardBody>
      </Card>

      {/* Settings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Settings */}
        <Card className="border border-divider shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-warning-500/10 via-amber-500/10 to-yellow-500/10 border-b border-divider pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="p-3 bg-gradient-to-br from-warning-100 to-amber-100 dark:from-warning-900/30 dark:to-amber-900/30 rounded-xl shadow-md">
                <Settings className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">Image Settings</h2>
                <p className="text-sm text-default-500 mt-1">Compression and quality optimization</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-default-50 dark:bg-default-100 rounded-lg border border-divider">
              <div className="flex-1">
                <label htmlFor="resizeEnabled" className="text-sm font-semibold text-foreground block mb-1">
                  Enable Image Compression
                </label>
                <p className="text-xs text-default-500">
                  {formData.image_resize_enabled 
                    ? "Images will be compressed for faster loading" 
                    : "Images will be uploaded at original quality"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="resizeEnabled"
                  checked={formData.image_resize_enabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_resize_enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-default-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-default-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-default-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {formData.image_resize_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Max Width (px)"
                  type="number"
                  value={formData.image_max_width.toString()}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_max_width: parseInt(e.target.value) || 1920 }))}
                  variant="bordered"
                />
                <Input
                  label="Max Height (px)"
                  type="number"
                  value={formData.image_max_height.toString()}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_max_height: parseInt(e.target.value) || 1080 }))}
                  variant="bordered"
                />
                <Input
                  label="Quality"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={formData.image_quality.toString()}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_quality: parseFloat(e.target.value) || 0.85 }))}
                  variant="bordered"
                  description="0.1 - 1.0"
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Animation Settings */}
        <Card className="border border-divider shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-secondary-500/10 via-purple-500/10 to-indigo-500/10 border-b border-divider pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="p-3 bg-gradient-to-br from-secondary-100 to-purple-100 dark:from-secondary-900/30 dark:to-purple-900/30 rounded-xl shadow-md">
                <Zap className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">Animation Settings</h2>
                <p className="text-sm text-default-500 mt-1">Image transition and display timing</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            <Input
              label="Animation Duration"
              type="number"
              value={formData.animation_duration_ms.toString()}
              onChange={(e) => setFormData((prev) => ({ ...prev, animation_duration_ms: parseInt(e.target.value) || 6000 }))}
              variant="bordered"
              min="1000"
              step="1000"
              endContent={
                <span className="text-default-400 text-sm">ms</span>
              }
              description="Time between image transitions"
            />

            <div className="flex items-center justify-between p-4 bg-default-50 dark:bg-default-100 rounded-lg border border-divider">
              <div className="flex-1">
                <label htmlFor="isActive" className="text-sm font-semibold text-foreground block mb-1">
                  Active Status
                </label>
                <p className="text-xs text-default-500">
                  {formData.is_active 
                    ? "This hero section is currently displayed" 
                    : "This hero section is hidden"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-default-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success-300 dark:peer-focus:ring-success-800 rounded-full peer dark:bg-default-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-default-600 peer-checked:bg-success-600"></div>
              </label>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Save Button */}
      <Card className="border border-divider shadow-xl bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-purple-500/5">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">Ready to save your changes?</h3>
              <p className="text-sm text-default-500">
                All changes will be applied to your hero section immediately after saving.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="light"
                onPress={() => loadHeroSection()}
                isDisabled={saving}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                size="lg"
                startContent={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                onPress={handleSave}
                isDisabled={saving || !formData.main_headline.trim()}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {saving ? "Saving..." : "Save Hero Section"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}


