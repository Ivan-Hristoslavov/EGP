"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Star,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
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
import { useToast } from "@/components/Toast";
import Pagination from "@/components/Pagination";

const SERVICES_PAGE_SIZE = 6;

async function getResponseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
  } catch {
    /* ignore */
  }
  return fallback;
}

type Service = ReturnType<typeof useServices>["services"][0];
type ServiceCategory = Service["category"];
type MainTab = Service["main_tab"];

interface ExtendedServiceCategory extends ServiceCategory {
  main_tab: MainTab;
  description?: string;
}

type DiscountGroup = { id: string; name: string; discount_percentage: number; is_active: boolean };

export default function AdminServicesPage() {
  const { confirm, modalProps } = useConfirmation();
  const { showSuccess, showError } = useToast();

  // Main state
  const [activeView, setActiveView] = useState<"services" | "categories" | "discounts">("services");
  const [mainTab, setMainTab] = useState<"book-now" | "by-condition">("book-now");

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ExtendedServiceCategory[]>([]);
  const [mainTabs, setMainTabs] = useState<MainTab[]>([]);
  const [discountGroups, setDiscountGroups] = useState<DiscountGroup[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [servicesPage, setServicesPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExtendedServiceCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDiscountGroupModalOpen, setIsDiscountGroupModalOpen] = useState(false);
  const [editingDiscountGroup, setEditingDiscountGroup] = useState<DiscountGroup | null>(null);
  const [discountGroupForm, setDiscountGroupForm] = useState({
    name: "",
    discount_percentage: 50,
    is_active: true,
    selectedServiceIds: [] as string[],
  });
  const [discountGroupServiceSearch, setDiscountGroupServiceSearch] = useState("");
  const [discountGroupCategoryFilter, setDiscountGroupCategoryFilter] = useState("all");

  // Form state
  const defaultFormData = {
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
    discount_group_id: "" as string | null,
    requires_consultation: false,
    downtime_days: 0,
    results_duration_weeks: null as number | null,
    is_featured: false,
    image_url: null as string | null,
  };
  const [formData, setFormData] = useState({ ...defaultFormData });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  // Image/Benefit state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState("");

  // Data loading
  const loadServices = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        console.error("Error loading services: Response not ok", response.status);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/service-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error("Error loading categories: Response not ok", response.status);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const loadMainTabs = useCallback(async () => {
    try {
      const response = await fetch("/api/main-tabs");
      if (response.ok) {
        const data = await response.json();
        setMainTabs(data.mainTabs || []);
      }
    } catch (error) {
      console.error("Error loading main tabs:", error);
    }
  }, []);

  const loadDiscountGroups = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/discount-groups");
      if (response.ok) {
        const data = await response.json();
        setDiscountGroups(data.discountGroups ?? []);
      }
    } catch (error) {
      console.error("Error loading discount groups:", error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadServices(),
      loadCategories(),
      loadMainTabs(),
      loadDiscountGroups()
    ]);
    setIsLoading(false);
  }, [loadServices, loadCategories, loadMainTabs, loadDiscountGroups]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Reset category filter when mainTab changes
  useEffect(() => {
    setCategoryFilter("all");
  }, [mainTab]);

  // Service CRUD operations
  const handleAddService = async () => {
    if (!formData.name || !formData.category_id) {
      showError("Missing fields", "Please enter a service name and select a category.");
      return;
    }
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(`${formData.price}`) || 0,
        duration: parseInt(`${formData.duration}`) || 30,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        discount_group_id: formData.discount_group_id || null,
      };
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData)
      });
      if (response.ok) {
        await loadServices();
        resetServiceForm();
        setIsModalOpen(false);
        showSuccess("Service created", `"${formData.name}" has been added.`);
      } else {
        showError(
          "Could not create service",
          await getResponseErrorMessage(response, "Please try again."),
        );
      }
    } catch (error) {
      console.error("Error adding service:", error);
      showError(
        "Could not create service",
        error instanceof Error ? error.message : "Network error.",
      );
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    const svc = service as Service & { discount_group_id?: string | null };
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
      discount_group_id: svc.discount_group_id ?? "",
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
      const payload = {
        ...formData,
        price: parseFloat(`${formData.price}`) || 0,
        duration: parseInt(`${formData.duration}`) || 30,
        discount_group_id: formData.discount_group_id || null,
      };
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        await loadServices();
        resetServiceForm();
        setIsModalOpen(false);
        showSuccess("Service updated", `"${formData.name}" has been saved.`);
      } else {
        showError(
          "Update failed",
          await getResponseErrorMessage(response, "Could not save changes."),
        );
      }
    } catch (error) {
      console.error("Error updating service:", error);
      showError(
        "Update failed",
        error instanceof Error ? error.message : "Network error.",
      );
    }
  };

  const handleDeleteService = async (id: string) => {
    await confirm(
      {
        title: "Delete Service",
        message: "Are you sure you want to delete this service? This action cannot be undone.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
        try {
          const response = await fetch(`/api/services/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await loadServices();
            showSuccess("Service deleted", "The service has been removed.");
          } else {
            showError(
              "Delete failed",
              await getResponseErrorMessage(response, "Could not delete this service."),
            );
          }
        } catch (error) {
          console.error("Error deleting service:", error);
          showError(
            "Delete failed",
            error instanceof Error ? error.message : "Network error.",
          );
        }
      }
    );
  };

  const handleToggleFeatured = async (service: Service) => {
    // Optimistically update local state
    const newFeaturedStatus = !service.is_featured;
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, is_featured: newFeaturedStatus } : s
      )
    );
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          is_featured: newFeaturedStatus,
          category_id: service.category.id,
          benefits: Array.isArray(service.benefits) ? service.benefits : [],
        }),
      });
      if (response.ok) {
        showSuccess(
          newFeaturedStatus ? "Featured" : "Removed from featured",
          newFeaturedStatus
            ? `"${service.name}" is now highlighted on the site.`
            : `"${service.name}" is no longer featured.`,
        );
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_featured: service.is_featured } : s))
        );
        showError(
          "Could not update featured",
          await getResponseErrorMessage(response, "Please try again."),
        );
      }
    } catch (error) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_featured: service.is_featured } : s))
      );
      console.error("Error toggling featured status:", error);
      showError(
        "Could not update featured",
        error instanceof Error ? error.message : "Network error.",
      );
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
    await confirm(
      {
        title: "Delete Category",
        message: "Are you sure you want to delete this category? This action cannot be undone.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
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
      }
    );
  };

  // Form utilities
  const resetServiceForm = () => {
    setFormData({ ...defaultFormData });
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

  const openAddDiscountGroupModal = () => {
    setEditingDiscountGroup(null);
    setDiscountGroupForm({
      name: "",
      discount_percentage: 50,
      is_active: true,
      selectedServiceIds: [],
    });
    setDiscountGroupServiceSearch("");
    setDiscountGroupCategoryFilter("all");
    setIsDiscountGroupModalOpen(true);
  };

  const handleEditDiscountGroup = async (dg: DiscountGroup) => {
    setEditingDiscountGroup(dg);
    setDiscountGroupForm({
      name: dg.name,
      discount_percentage: dg.discount_percentage,
      is_active: dg.is_active,
      selectedServiceIds: [],
    });
    setDiscountGroupServiceSearch("");
    setDiscountGroupCategoryFilter("all");
    setIsDiscountGroupModalOpen(true);
    try {
      const res = await fetch(`/api/admin/discount-groups/${dg.id}/services`);
      if (res.ok) {
        const data = await res.json();
        setDiscountGroupForm((prev) => ({
          ...prev,
          selectedServiceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
        }));
      }
    } catch (e) {
      console.error("Error loading offer services:", e);
    }
  };

  const handleSaveDiscountGroup = async () => {
    if (!discountGroupForm.name.trim()) return;
    const { selectedServiceIds, ...groupPayload } = discountGroupForm;
    try {
      let groupId: string | null = null;
      if (editingDiscountGroup) {
        const res = await fetch(`/api/admin/discount-groups/${editingDiscountGroup.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupPayload),
        });
        const data = res.ok ? await res.json() : null;
        groupId = data?.discountGroup?.id ?? editingDiscountGroup.id;
        if (!res.ok) return;
      } else {
        const res = await fetch("/api/admin/discount-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupPayload),
        });
        const data = res.ok ? await res.json() : null;
        groupId = data?.discountGroup?.id ?? null;
        if (!res.ok || !groupId) return;
      }
      const servicesRes = await fetch(`/api/admin/discount-groups/${groupId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: selectedServiceIds }),
      });
      if (servicesRes.ok) {
        await loadDiscountGroups();
        await loadServices();
        setIsDiscountGroupModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving discount group:", error);
    }
  };

  const handleDeleteDiscountGroup = async (id: string) => {
    await confirm(
      {
        title: "Delete discount group",
        message: "Are you sure? Services in this group will keep the group link until you change them.",
        isDestructive: true,
        confirmText: "Delete",
      },
      async () => {
        try {
          const res = await fetch(`/api/admin/discount-groups/${id}`, { method: "DELETE" });
          if (res.ok) await loadDiscountGroups();
        } catch (error) {
          console.error("Error deleting discount group:", error);
        }
      }
    );
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
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services.filter((service) => {
      const serviceMainTabSlug = service.main_tab?.slug;
      const matchesMainTab = serviceMainTabSlug === mainTab;
      const matchesSearch =
        service.name.toLowerCase().includes(q) ||
        (service.description || "").toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "all" || service.category.id === categoryFilter;
      return matchesMainTab && matchesSearch && matchesCategory;
    });
  }, [services, mainTab, searchQuery, categoryFilter]);

  const totalServicePages = Math.max(
    1,
    Math.ceil(filteredServices.length / SERVICES_PAGE_SIZE),
  );

  const paginatedServices = useMemo(() => {
    const start = (servicesPage - 1) * SERVICES_PAGE_SIZE;
    return filteredServices.slice(start, start + SERVICES_PAGE_SIZE);
  }, [filteredServices, servicesPage]);

  useEffect(() => {
    setServicesPage(1);
  }, [mainTab, categoryFilter, searchQuery]);

  useEffect(() => {
    setServicesPage((p) => Math.min(p, totalServicePages));
  }, [filteredServices.length, totalServicePages]);

  const currentCategories = categories.filter((cat) => {
    const catMainTabSlug = cat.main_tab?.slug;
    return catMainTabSlug === mainTab;
  });

  // Debug logging
  useEffect(() => {
    if (mainTab === "by-condition") {
      // Disabled excessive logging unless needed
      // console.log("Debug:", {totalCategories: categories.length, currentCategories: currentCategories.length});
    }
  }, [mainTab, categories, services, currentCategories, filteredServices]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#464C45] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Site area + admin task — compact segmented controls with labels */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-default-500">
              Which part of the site
            </p>
            <p className="text-xs text-default-400 hidden sm:block">
              Filters services and categories shown to visitors (Book now vs Treatments by condition).
            </p>
            <div
              className="inline-flex w-full max-w-md rounded-lg border border-default-200 bg-default-100/40 p-0.5 dark:border-default-100 dark:bg-default-50/30"
              role="group"
              aria-label="Site section"
            >
              <button
                type="button"
                onClick={() => setMainTab("book-now")}
                className={`min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  mainTab === "book-now"
                    ? "bg-[#464C45] text-white shadow-sm"
                    : "text-default-600 hover:bg-default-100 dark:text-default-400 dark:hover:bg-default-100/10"
                }`}
              >
                Book now
              </button>
              <button
                type="button"
                onClick={() => setMainTab("by-condition")}
                className={`min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  mainTab === "by-condition"
                    ? "bg-[#464C45] text-white shadow-sm"
                    : "text-default-600 hover:bg-default-100 dark:text-default-400 dark:hover:bg-default-100/10"
                }`}
              >
                By condition
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-wide text-default-500">
              What you are editing
            </p>
            <div
              className="flex gap-1 rounded-lg border border-default-200 bg-content1 p-0.5 dark:border-default-100"
              role="tablist"
              aria-label="Admin section"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "services"}
                onClick={() => setActiveView("services")}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm ${
                  activeView === "services"
                    ? "bg-default-200 text-foreground shadow-sm dark:bg-default-100"
                    : "text-default-500 hover:bg-default-100/80 dark:hover:bg-default-100/10"
                }`}
              >
                <Package className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>Services</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "categories"}
                onClick={() => setActiveView("categories")}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm ${
                  activeView === "categories"
                    ? "bg-default-200 text-foreground shadow-sm dark:bg-default-100"
                    : "text-default-500 hover:bg-default-100/80 dark:hover:bg-default-100/10"
                }`}
              >
                <FolderTree className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "discounts"}
                onClick={() => setActiveView("discounts")}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm ${
                  activeView === "discounts"
                    ? "bg-default-200 text-foreground shadow-sm dark:bg-default-100"
                    : "text-default-500 hover:bg-default-100/80 dark:hover:bg-default-100/10"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Discounts</span>
                <span className="xs:hidden">Offers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Services View */}
        {activeView === "services" && (
          <div className="space-y-4">
            {/* Compact stats + search row */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex flex-wrap items-stretch gap-2">
                <div
                  className="flex min-w-[5.5rem] flex-col justify-center rounded-lg border border-default-200 bg-content1 px-2.5 py-1.5 dark:border-default-100"
                  title="Services matching filters below"
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide text-default-500">
                    In list
                  </span>
                  <span className="text-lg font-semibold tabular-nums leading-tight text-foreground">
                    {filteredServices.length}
                  </span>
                </div>
                <div className="flex min-w-[5.5rem] flex-col justify-center rounded-lg border border-default-200 bg-content1 px-2.5 py-1.5 dark:border-default-100">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-default-500">
                    Categories
                  </span>
                  <span className="text-lg font-semibold tabular-nums leading-tight text-foreground">
                    {currentCategories.length}
                  </span>
                </div>
                <div className="flex min-w-[5.5rem] flex-col justify-center rounded-lg border border-default-200 bg-content1 px-2.5 py-1.5 dark:border-default-100">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-default-500">
                    Featured
                  </span>
                  <span className="text-lg font-semibold tabular-nums leading-tight text-foreground">
                    {filteredServices.filter((s) => s.is_featured).length}
                  </span>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="min-w-0 flex-1 sm:max-w-xs lg:max-w-md">
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    variant="bordered"
                    size="sm"
                    startContent={<Search className="h-4 w-4 shrink-0 text-default-400" />}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "h-9 min-h-9",
                    }}
                  />
                </div>
                <Select
                  placeholder="All categories"
                  selectedKeys={categoryFilter === "all" ? [] : [categoryFilter]}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;
                    setCategoryFilter(key || "all");
                  }}
                  variant="bordered"
                  size="sm"
                  className="w-full sm:w-44"
                  classNames={{
                    trigger: "h-9 min-h-9",
                  }}
                >
                  <>
                    <SelectItem key="all">All categories</SelectItem>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </>
                </Select>
                <Button
                  onClick={openAddServiceModal}
                  className="h-9 min-h-9 min-w-9 shrink-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                  size="sm"
                  isIconOnly
                  aria-label="Add service"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Services Grid or Info */}
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
              <>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                {paginatedServices.map((service) => (
                  <Card
                    key={service.id}
                    className="hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700 flex flex-col min-w-0"
                  >
                    <CardBody className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
                      {/* Top Section */}
                      <div className="min-h-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base break-words">
                              {service.name}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <Chip size="sm" variant="flat" color="danger">
                                {service.category.name}
                              </Chip>
                              {service.is_featured && (
                                <Chip size="sm" color="warning" variant="flat">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Featured
                                </Chip>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-default-500 dark:text-default-400">
                            Short description
                          </p>
                          {service.description ? (
                            <div className="max-h-24 overflow-y-auto overscroll-contain rounded border border-default-200 bg-default-50/80 px-2 py-1.5 dark:border-default-100 dark:bg-zinc-900/80">
                              <p className="text-xs leading-snug text-slate-800 dark:text-zinc-100 whitespace-pre-wrap break-words">
                                {service.description}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs italic text-default-400">Missing information</p>
                          )}
                        </div>
                        {service.benefits && service.benefits.length > 0 ? (
                          <div>
                            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-default-500 dark:text-default-400">
                              Benefits
                            </p>
                            <div className="max-h-20 overflow-y-auto overscroll-contain rounded border border-rose-200/80 bg-rose-50/95 px-2 py-1.5 dark:border-rose-800/60 dark:bg-rose-950/50">
                              <ul className="list-inside list-disc space-y-0.5 text-[11px] leading-snug text-rose-950 dark:text-rose-50">
                                {service.benefits.map((benefit, idx) => (
                                  <li key={idx} className="break-words pl-0.5 marker:text-rose-500 dark:marker:text-rose-300">
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] italic text-default-400">Benefits not filled</p>
                        )}
                        {service.details ? (
                          <div>
                            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-default-500 dark:text-default-400">
                              Details
                            </p>
                            <div className="max-h-28 overflow-y-auto overscroll-contain rounded border border-blue-200/70 bg-blue-50 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900/95">
                              <p className="text-[11px] leading-snug text-slate-900 dark:text-zinc-50 whitespace-pre-wrap break-words">
                                {service.details}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] italic text-default-400">Details not filled</p>
                        )}
                      </div>
                      <div className="mt-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="mb-0.5 text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Price
                            </p>
                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                              £{service.price || 0}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="mb-0.5 text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Duration
                            </p>
                            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-700 dark:text-gray-200">
                              <span aria-hidden>⏱</span>
                              <span>{service.duration || 0} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Extra
                          </p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                            {service.requires_consultation ? (
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
                            ) : (
                              <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Consultation: Not specified
                              </p>
                            )}
                            {service.downtime_days > 0 ? (
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
                            ) : (
                              <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Downtime: Not specified
                              </p>
                            )}
                            {service.results_duration_weeks ? (
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
                            ) : (
                              <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Results duration: Not filled
                              </p>
                            )}
                            {!service.requires_consultation &&
                              service.downtime_days === 0 &&
                              !service.results_duration_weeks && (
                                <p className="text-gray-400 dark:text-gray-500 text-xs italic col-span-2">
                                  No additional information
                                </p>
                              )}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="mt-2 flex gap-1.5 border-t border-gray-200 pt-2 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant={service.is_featured ? "solid" : "flat"}
                            color={service.is_featured ? "warning" : "default"}
                            onPress={() => handleToggleFeatured(service)}
                            className="flex-1 flex items-center justify-center"
                            title={service.is_featured ? "Remove from featured" : "Make featured"}
                          >
                            <Star className={`w-4 h-4 ${service.is_featured ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => handleEditService(service)}
                            className="flex-1 flex items-center justify-center"
                            title="Edit service"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDeleteService(service.id)}
                            className="flex-1 flex items-center justify-center"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={servicesPage}
                totalPages={totalServicePages}
                totalCount={filteredServices.length}
                limit={SERVICES_PAGE_SIZE}
                onPageChange={async (page) => {
                  setServicesPage(page);
                }}
                className="mt-6"
              />
              </>
            )}
          </div>
        )}

        {/* Categories View */}
        {activeView === "categories" && (
          <div className="space-y-6">
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

        {/* Discounts View */}
        {activeView === "discounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Discount groups
              </h2>
              <Button
                onPress={openAddDiscountGroupModal}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                size="sm"
                startContent={<Plus className="w-4 h-4" />}
              >
                Add group
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assign a discount group to a service when editing it. Customers will see the discounted price and a badge.
            </p>
            {discountGroups.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No discount groups yet</p>
                <Button className="mt-4" onPress={openAddDiscountGroupModal} color="primary">
                  Create discount group
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discountGroups.map((dg) => (
                  <Card key={dg.id} className="border border-gray-200 dark:border-gray-700">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{dg.name}</h3>
                        <Chip size="sm" color="secondary">{dg.discount_percentage}% off</Chip>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {dg.is_active ? "Active" : "Inactive"}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => handleEditDiscountGroup(dg)}>
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="flat" color="danger" onPress={() => handleDeleteDiscountGroup(dg.id)}>
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

        {/* Service Modal */}
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
                      selectedKeys={formData.category_id ? [formData.category_id] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setFormData((prev) => ({ ...prev, category_id: key }));
                      }}
                      variant="bordered"
                      size="lg"
                      isRequired
                    >
                      <>
                        {currentCategories.map((cat) => (
                          <SelectItem key={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </>
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
                    <Select
                      label="Discount group (optional)"
                      placeholder="None"
                      selectedKeys={formData.discount_group_id ? [formData.discount_group_id] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setFormData((prev) => ({ ...prev, discount_group_id: key || "" }));
                      }}
                      variant="bordered"
                      size="lg"
                    >
                      <>
                        <SelectItem key="">None</SelectItem>
                        {discountGroups.filter((g) => g.is_active).map((g) => (
                          <SelectItem key={g.id}>
                            {g.name} ({g.discount_percentage}% off)
                          </SelectItem>
                        ))}
                      </>
                    </Select>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Input
                        label="Price (£)"
                        placeholder="0.00"
                        type="number"
                        value={formData.price?.toString() ?? ""}
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
                        value={formData.duration?.toString() ?? ""}
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
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Input
                        label="Downtime (days)"
                        placeholder="0"
                        type="number"
                        value={formData.downtime_days?.toString() ?? ""}
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
                        value={formData.results_duration_weeks?.toString() || ""}
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

        {/* Category Modal */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            resetCategoryForm();
          }}
          size="md"
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-gray-800",
            wrapper: "items-center",
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

        {/* Discount group modal */}
        <Modal
          isOpen={isDiscountGroupModalOpen}
          onClose={() => setIsDiscountGroupModalOpen(false)}
          size="lg"
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-gray-800",
            wrapper: "items-center",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingDiscountGroup ? "Edit discount group" : "Add discount group"}
                  </h2>
                </ModalHeader>
                <ModalBody className="py-6 space-y-4">
                  <Input
                    label="Group name"
                    placeholder="e.g. Winter promo"
                    value={discountGroupForm.name}
                    onValueChange={(v) => setDiscountGroupForm((prev) => ({ ...prev, name: v }))}
                    variant="bordered"
                    size="lg"
                  />
                  <Input
                    label="Discount (%)"
                    type="number"
                    min={1}
                    max={100}
                    value={discountGroupForm.discount_percentage.toString()}
                    onValueChange={(v) => setDiscountGroupForm((prev) => ({ ...prev, discount_percentage: parseInt(v) || 0 }))}
                    variant="bordered"
                    size="lg"
                  />
                  <Switch
                    isSelected={discountGroupForm.is_active}
                    onValueChange={(v) => setDiscountGroupForm((prev) => ({ ...prev, is_active: v }))}
                  >
                    Active (shown to customers)
                  </Switch>
                  <div>
                    <label className="block text-sm font-medium text-default-600 dark:text-default-400 mb-2">
                      Services that use this offer
                    </label>
                    <p className="text-xs text-default-500 mb-2">
                      Select which services get this discount. Customers will see the reduced price and a badge.
                    </p>
                    {discountGroupForm.selectedServiceIds.length > 0 && (
                      <div className="mb-3 p-3 rounded-lg bg-default-100 dark:bg-default-50 border border-default-200 dark:border-default-100">
                        <p className="text-xs font-medium text-default-600 dark:text-default-400 mb-2">
                          Selected for this offer ({discountGroupForm.selectedServiceIds.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {discountGroupForm.selectedServiceIds.map((id) => {
                            const svc = services.find((s) => s.id === id);
                            return (
                              <Chip
                                key={id}
                                size="sm"
                                variant="flat"
                                color="primary"
                                onClose={() =>
                                  setDiscountGroupForm((prev) => ({
                                    ...prev,
                                    selectedServiceIds: prev.selectedServiceIds.filter((sid) => sid !== id),
                                  }))
                                }
                              >
                                {svc?.name ?? id}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <Input
                        placeholder="Search services..."
                        value={discountGroupServiceSearch}
                        onValueChange={setDiscountGroupServiceSearch}
                        variant="bordered"
                        size="sm"
                        className="flex-1"
                        startContent={<Search className="w-4 h-4 text-default-400" />}
                      />
                      <Select
                        placeholder="Category"
                        selectedKeys={[discountGroupCategoryFilter]}
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0] as string;
                          setDiscountGroupCategoryFilter(key ?? "all");
                        }}
                        variant="bordered"
                        size="sm"
                        className="w-full sm:w-40"
                        aria-label="Filter by category"
                      >
                        <>
                          <SelectItem key="all">All categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </>
                      </Select>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-default-200 dark:border-default-100 p-3 space-y-2">
                      {services.length === 0 ? (
                        <p className="text-sm text-default-500">No services yet. Add services in the Services tab first.</p>
                      ) : (() => {
                          const q = discountGroupServiceSearch.trim().toLowerCase();
                          const catId = discountGroupCategoryFilter === "all" ? null : discountGroupCategoryFilter;
                          const filtered = services.filter((svc) => {
                            const matchSearch = !q || svc.name.toLowerCase().includes(q);
                            const matchCategory = !catId || svc.category?.id === catId;
                            return matchSearch && matchCategory;
                          });
                          return filtered.length === 0 ? (
                            <p className="text-sm text-default-500">No services match your search or filter.</p>
                          ) : (
                            filtered.map((svc) => (
                              <label
                                key={svc.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-default-100 dark:hover:bg-default-50 rounded px-2 py-1.5"
                              >
                                <input
                                  type="checkbox"
                                  checked={discountGroupForm.selectedServiceIds.includes(svc.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setDiscountGroupForm((prev) => ({
                                      ...prev,
                                      selectedServiceIds: checked
                                        ? [...prev.selectedServiceIds, svc.id]
                                        : prev.selectedServiceIds.filter((id) => id !== svc.id),
                                    }));
                                  }}
                                  className="rounded border-default-300 text-primary"
                                />
                                <span className="text-sm text-foreground truncate">{svc.name}</span>
                                <span className="text-xs text-default-400 shrink-0">£{svc.price}</span>
                              </label>
                            ))
                          );
                        })()}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button variant="light" onPress={onClose}>Cancel</Button>
                  <Button color="primary" onPress={handleSaveDiscountGroup}>
                    {editingDiscountGroup ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

      <ConfirmationModal {...modalProps} />
      </div>
    </div>
  );
}
