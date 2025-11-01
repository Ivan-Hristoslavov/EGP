"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  FolderTree,
  TrendingUp,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";

type Service = ReturnType<typeof useServices>["services"][0];
type ServiceCategory = Service["category"];
type MainTab = Service["main_tab"];

interface ExtendedServiceCategory extends ServiceCategory {
  main_tab: MainTab;
  description?: string;
}

export default function AdminServicesPage() {
  // Main state
  const [activeView, setActiveView] = useState<"services" | "categories">(
    "services"
  );
  const [mainTab, setMainTab] = useState<"book-now" | "by-condition">(
    "book-now"
  );

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ExtendedServiceCategory[]>([]);
  const [mainTabs, setMainTabs] = useState<MainTab[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ExtendedServiceCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    details: "",
    benefits: [] as string[],
    preparation: "",
    aftercare: "",
    price: 0,
    duration: 30,
    category_id: "",
    requires_consultation: false,
    downtime_days: 0,
    results_duration_weeks: null as number | null,
    is_featured: false,
    image_url: null as string | null,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState("");

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Reset category filter when mainTab changes
  useEffect(() => {
    setCategoryFilter("all");
  }, [mainTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([loadServices(), loadCategories(), loadMainTabs()]);
    setIsLoading(false);
  };

  const loadServices = async () => {
    try {
      // Use admin endpoint to get all services (including inactive)
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();
        const servicesData = data.services || [];
        console.log("Loaded services (admin):", servicesData.length, servicesData);
        setServices(servicesData);
      } else {
        console.error("Error loading services: Response not ok", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadCategories = async () => {
    try {
      // Use admin endpoint to get all categories (including inactive)
      const response = await fetch("/api/admin/service-categories");
      if (response.ok) {
        const data = await response.json();
        const categoriesData = data.categories || [];
        console.log("Loaded categories (admin):", categoriesData.length, categoriesData);
        setCategories(categoriesData);
      } else {
        console.error("Error loading categories: Response not ok", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadMainTabs = async () => {
    try {
      const response = await fetch("/api/main-tabs");
      if (response.ok) {
        const data = await response.json();
        setMainTabs(data.mainTabs || []);
      }
    } catch (error) {
      console.error("Error loading main tabs:", error);
    }
  };

  // Service CRUD operations
  const handleAddService = async () => {
    if (!formData.name || !formData.price || !formData.category_id) return;

    try {
      const serviceData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        await loadServices();
        resetServiceForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      details: service.details || "",
      benefits: Array.isArray(service.benefits) ? service.benefits : [],
      preparation: service.preparation || "",
      aftercare: service.aftercare || "",
      price: service.price,
      duration: service.duration,
      category_id: service.category.id,
      requires_consultation: service.requires_consultation,
      downtime_days: service.downtime_days,
      results_duration_weeks: service.results_duration_weeks,
      is_featured: service.is_featured,
      image_url: service.image_url,
    });
    setImagePreview(service.image_url);
    setIsModalOpen(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadServices();
        resetServiceForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadServices();
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // Category CRUD operations
  const handleAddCategory = async () => {
    if (!categoryFormData.name) return;

    try {
      const selectedMainTab = mainTabs.find((tab) => tab.slug === mainTab);
      if (!selectedMainTab) return;

      const categoryData = {
        main_tab_id: selectedMainTab.id,
        name: categoryFormData.name,
        slug:
          categoryFormData.slug ||
          categoryFormData.name.toLowerCase().replace(/\s+/g, "-"),
        description: categoryFormData.description || "",
        display_order: 0,
      };

      const response = await fetch("/api/service-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await loadCategories();
        resetCategoryForm();
        setIsCategoryModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = (category: ExtendedServiceCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
    });
    setIsCategoryModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(
        `/api/service-categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryFormData),
        }
      );

      if (response.ok) {
        await loadCategories();
        resetCategoryForm();
        setIsCategoryModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/service-categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Form utilities
  const resetServiceForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      details: "",
      benefits: [],
      preparation: "",
      aftercare: "",
      price: 0,
      duration: 30,
      category_id: "",
      requires_consultation: false,
      downtime_days: 0,
      results_duration_weeks: null,
      is_featured: false,
      image_url: null,
    });
    setEditingService(null);
    setImagePreview(null);
    setNewBenefit("");
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      slug: "",
    });
    setEditingCategory(null);
  };

  const openAddServiceModal = () => {
    resetServiceForm();
    setIsModalOpen(true);
  };

  const openAddCategoryModal = () => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  };

  // Benefits management
  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // Filter logic
  const filteredServices = services.filter((service) => {
    // Safely check main_tab
    const serviceMainTabSlug = service.main_tab?.slug;
    const matchesMainTab = serviceMainTabSlug === mainTab;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || service.category.id === categoryFilter;

    return matchesMainTab && matchesSearch && matchesCategory;
  });

  const currentCategories = categories.filter((cat) => {
    const catMainTabSlug = cat.main_tab?.slug;
    const matches = catMainTabSlug === mainTab;
    if (!matches && mainTab === "by-condition") {
      console.log("Category filtered out:", cat.name, "main_tab:", cat.main_tab);
    }
    return matches;
  });

  // Debug logging
  useEffect(() => {
    if (mainTab === "by-condition") {
      console.log("BY-CONDITION Debug:", {
        totalCategories: categories.length,
        currentCategories: currentCategories.length,
        currentCategoriesData: currentCategories,
        totalServices: services.length,
        filteredServices: filteredServices.length,
        mainTab
      });
    }
  }, [mainTab, categories, services, currentCategories, filteredServices]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Mobile-Optimized Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Services Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your aesthetic treatments and service categories
          </p>
        </div>

        {/* Mobile-Optimized Main Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => setMainTab("book-now")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              mainTab === "book-now"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            BOOK NOW
          </button>
          <button
            onClick={() => setMainTab("by-condition")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              mainTab === "by-condition"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            BY CONDITION
          </button>
        </div>

        {/* Mobile-Optimized View Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveView("services")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              activeView === "services"
                ? "bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border-2 border-rose-500 shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Services</span>
              <span className="xs:hidden">Services</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView("categories")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              activeView === "categories"
                ? "bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border-2 border-rose-500 shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Categories</span>
              <span className="xs:hidden">Category</span>
            </div>
          </button>
        </div>

        {/* Services View */}
        {activeView === "services" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6">
            {/* Mobile-Optimized Actions Bar */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  variant="bordered"
                  className="pl-10"
                  size="lg"
                />
              </div>

              {/* Filter and Add Button Row */}
              <div className="flex gap-2">
                <Select
                  placeholder="All Categories"
                  selectedKeys={
                    categoryFilter === "all" ? [] : [categoryFilter]
                  }
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;
                    setCategoryFilter(key || "all");
                  }}
                  variant="bordered"
                  size="lg"
                  className="flex-1"
                >
                  <>
                    <SelectItem key="all">All Categories</SelectItem>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </>
                </Select>
                <Button
                  onClick={openAddServiceModal}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white min-w-[48px]"
                  size="lg"
                  isIconOnly
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile-Optimized Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-none">
                <CardBody className="p-3 sm:p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Total
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                    {filteredServices.length}
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-none">
                <CardBody className="p-3 sm:p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Categories
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {currentCategories.length}
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-none">
                <CardBody className="p-3 sm:p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Featured
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {filteredServices.filter((s) => s.is_featured).length}
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Mobile-Optimized Services Grid */}
            {currentCategories.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No categories found for "{mainTab.toUpperCase()}"
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please create categories first before adding services.
                </p>
                <Button
                  onClick={() => setActiveView("categories")}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                >
                  Go to Categories
                </Button>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No services found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Try adjusting your filters or add a new service
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700"
                  >
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                            {service.name}
                          </h3>
                          <Chip size="sm" variant="flat" color="danger">
                            {service.category.name}
                          </Chip>
                        </div>
                        {service.is_featured && (
                          <Chip
                            size="sm"
                            color="warning"
                            variant="flat"
                            className="ml-2"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          </Chip>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Main Info */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-rose-600 font-bold text-2xl">
                            £{service.price}
                          </span>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                            <span>⏱</span>
                            <span>{service.duration} min</span>
                          </div>
                        </div>

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {service.requires_consultation && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Consultation</span>
                            </div>
                          )}
                          {service.downtime_days > 0 && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{service.downtime_days}d downtime</span>
                            </div>
                          )}
                          {service.results_duration_weeks && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>
                                Lasts {service.results_duration_weeks}w
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Benefits Preview */}
                      {service.benefits && service.benefits.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {service.benefits
                              .slice(0, 3)
                              .map((benefit, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  className="text-xs"
                                >
                                  {benefit}
                                </Chip>
                              ))}
                            {service.benefits.length > 3 && (
                              <Chip
                                size="sm"
                                variant="flat"
                                className="text-xs"
                              >
                                +{service.benefits.length - 3}
                              </Chip>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Details Preview */}
                      {service.details && (
                        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            Details:
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                            {service.details}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleEditService(service)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          <span className="hidden xs:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => handleDeleteService(service.id)}
                          isIconOnly
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories View */}
        {activeView === "categories" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Categories
              </h2>
              <Button
                onClick={openAddCategoryModal}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                size="sm"
                isIconOnly
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {currentCategories.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No categories found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                  >
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 min-h-[60px]">
                        {category.description || "No description"}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleEditCategory(category)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          <span className="hidden xs:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => handleDeleteCategory(category.id)}
                          isIconOnly
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Service Modal - Mobile Optimized */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetServiceForm();
          }}
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-gray-800 max-h-[90vh]",
            wrapper: "items-center",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {editingService
                      ? "Update service details"
                      : "Create a new service"}
                  </p>
                </ModalHeader>
                <ModalBody className="py-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Category & Name */}
                    <Select
                      label="Category"
                      placeholder="Select category"
                      selectedKeys={
                        formData.category_id ? [formData.category_id] : []
                      }
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setFormData((prev) => ({ ...prev, category_id: key }));
                      }}
                      variant="bordered"
                      size="lg"
                      isRequired
                    >
                      {currentCategories.map((cat) => (
                        <SelectItem key={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Service Name"
                      placeholder="Enter service name"
                      value={formData.name}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, name: value }))
                      }
                      variant="bordered"
                      size="lg"
                      isRequired
                    />

                    {/* Price & Duration - Grid on mobile */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Input
                        label="Price (£)"
                        placeholder="0.00"
                        type="number"
                        value={formData.price.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseFloat(value) || 0,
                          }))
                        }
                        variant="bordered"
                        size="lg"
                        isRequired
                      />
                      <Input
                        label="Duration (min)"
                        placeholder="30"
                        type="number"
                        value={formData.duration.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            duration: parseInt(value) || 30,
                          }))
                        }
                        variant="bordered"
                        size="lg"
                        isRequired
                      />
                    </div>

                    {/* Description & Details */}
                    <Textarea
                      label="Description"
                      placeholder="Brief description"
                      value={formData.description}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, description: value }))
                      }
                      variant="bordered"
                      minRows={3}
                    />

                    <Textarea
                      label="Details"
                      placeholder="Detailed information"
                      value={formData.details}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, details: value }))
                      }
                      variant="bordered"
                      minRows={4}
                    />

                    {/* Benefits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Benefits
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Enter benefit"
                          value={newBenefit}
                          onValueChange={setNewBenefit}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addBenefit())
                          }
                          variant="bordered"
                          className="flex-1"
                          size="lg"
                        />
                        <Button
                          onClick={addBenefit}
                          size="lg"
                          color="danger"
                          isIconOnly
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      {formData.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.benefits.map((benefit, index) => (
                            <Chip
                              key={index}
                              onClose={() => removeBenefit(index)}
                              variant="flat"
                              color="danger"
                              size="lg"
                            >
                              {benefit}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Preparation & Aftercare */}
                    <Textarea
                      label="Preparation"
                      placeholder="Pre-treatment instructions"
                      value={formData.preparation}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, preparation: value }))
                      }
                      variant="bordered"
                      minRows={3}
                    />

                    <Textarea
                      label="Aftercare"
                      placeholder="Post-treatment instructions"
                      value={formData.aftercare}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, aftercare: value }))
                      }
                      variant="bordered"
                      minRows={3}
                    />

                    {/* Additional Options - Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Input
                        label="Downtime (days)"
                        placeholder="0"
                        type="number"
                        value={formData.downtime_days.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            downtime_days: parseInt(value) || 0,
                          }))
                        }
                        variant="bordered"
                        size="lg"
                      />
                      <Input
                        label="Results (weeks)"
                        placeholder="12"
                        type="number"
                        value={
                          formData.results_duration_weeks?.toString() || ""
                        }
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            results_duration_weeks: value
                              ? parseInt(value)
                              : null,
                          }))
                        }
                        variant="bordered"
                        size="lg"
                      />
                    </div>

                    {/* Switches - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <Switch
                        isSelected={formData.requires_consultation}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            requires_consultation: value,
                          }))
                        }
                      >
                        Requires Consultation
                      </Switch>
                      <Switch
                        isSelected={formData.is_featured}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_featured: value,
                          }))
                        }
                      >
                        Featured Service
                      </Switch>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button variant="light" onPress={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={
                      editingService ? handleUpdateService : handleAddService
                    }
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500"
                  >
                    {editingService ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Category Modal - Mobile Optimized */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            resetCategoryForm();
          }}
          size="full"
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-gray-800",
            wrapper: "items-end sm:items-center",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {editingCategory
                      ? "Update category details"
                      : "Create a new category"}
                  </p>
                </ModalHeader>
                <ModalBody className="py-6">
                  <div className="space-y-4">
                    <Input
                      label="Category Name"
                      placeholder="Enter category name"
                      value={categoryFormData.name}
                      onValueChange={(value) =>
                        setCategoryFormData((prev) => ({
                          ...prev,
                          name: value,
                        }))
                      }
                      variant="bordered"
                      size="lg"
                      isRequired
                    />
                    <Textarea
                      label="Description"
                      placeholder="Enter category description"
                      value={categoryFormData.description}
                      onValueChange={(value) =>
                        setCategoryFormData((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                      variant="bordered"
                      minRows={3}
                    />
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button variant="light" onPress={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    onPress={
                      editingCategory ? handleUpdateCategory : handleAddCategory
                    }
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
