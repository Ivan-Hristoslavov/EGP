"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Tag, Clock, DollarSign, Eye, EyeOff, Settings, FolderPlus, Filter, Search } from "lucide-react";
// Removed dummy services import - will use database data

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  mainTab: 'book-now' | 'by-condition';
  category: string;
  duration: number;
  description: string;
  details: string;
  benefits: string[];
  preparation: string;
  aftercare: string;
  image?: string;
  featured: boolean;
  popular: boolean;
  slug: string;
  requiresConsultation?: boolean;
  downtimeDays?: number;
  resultsDurationWeeks?: number | null;
}

const defaultCategories: Category[] = [
  { id: "1", name: "face", description: "Facial treatments and procedures", color: "rose", icon: "face" },
  { id: "2", name: "lips", description: "Lip enhancement treatments", color: "pink", icon: "lips" },
  { id: "3", name: "skin", description: "Skin rejuvenation treatments", color: "purple", icon: "skin" },
  { id: "4", name: "body", description: "Body contouring and treatments", color: "emerald", icon: "body" },
  { id: "5", name: "hair", description: "Hair restoration treatments", color: "amber", icon: "hair" },
  { id: "6", name: "medical", description: "Advanced medical aesthetics", color: "blue", icon: "medical" },
];

// Add missing constants and functions

const getMainTabCategories = (mainTab: 'book-now' | 'by-condition') => {
  if (mainTab === 'book-now') {
    return ['face', 'lips', 'skin', 'body', 'hair', 'medical'];
  } else {
    return ['face', 'lips', 'skin', 'body', 'hair', 'medical'];
  }
};

const getCategoryLabel = (mainTab: 'book-now' | 'by-condition', category: string) => {
  const labels: { [key: string]: string } = {
    'face': 'Face',
    'lips': 'Lips',
    'skin': 'Skin',
    'body': 'Body',
    'hair': 'Hair',
    'medical': 'Medical'
  };
  return labels[category] || category;
};

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [mainTab, setMainTab] = useState<'book-now' | 'by-condition'>('book-now');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: "",
    price: 0,
    mainTab: "book-now",
    category: "face",
    duration: 30,
    description: "",
    details: "",
    benefits: [],
    preparation: "",
    aftercare: "",
    featured: false,
    popular: false,
    slug: ""
  });
  const [newCategory, setNewCategory] = useState<Partial<Category> | null>({
    name: "",
    description: "",
    color: "rose",
    icon: "face"
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newBenefit, setNewBenefit] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load services from database on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Simulate API call - replace with actual Supabase call
      const response = await fetch('/api/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        // Fallback to empty array
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  const saveServices = async (updatedServices: Service[]) => {
    setServices(updatedServices);
    // TODO: Implement API call to save services to database
    // await fetch('/api/services', { method: 'PUT', body: JSON.stringify(updatedServices) });
  };

  const saveCategories = async (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    // TODO: Implement API call to save categories to database
    // await fetch('/api/categories', { method: 'PUT', body: JSON.stringify(updatedCategories) });
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.category) return;

    try {
      const serviceData = {
        name: newService.name!,
        price: newService.price!,
        mainTab: newService.mainTab!,
        category: newService.category!,
        duration: newService.duration || 30,
        description: newService.description || "",
        details: newService.details || "",
        benefits: newService.benefits || [],
        preparation: newService.preparation || "",
        aftercare: newService.aftercare || "",
        featured: newService.featured || false,
        popular: newService.popular || false,
        slug: newService.slug || newService.name!.toLowerCase().replace(/\s+/g, '-'),
        requiresConsultation: newService.requiresConsultation || false,
        downtimeDays: newService.downtimeDays || 0,
        resultsDurationWeeks: newService.resultsDurationWeeks || null
      };

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        await loadServices(); // Reload services from database
        resetServiceForm();
      } else {
        console.error('Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService(service);
    setIsAdding(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        await loadServices(); // Reload services from database
        resetServiceForm();
      } else {
        console.error('Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadServices(); // Reload services from database
        } else {
          console.error('Failed to delete service');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory?.name) return;

    try {
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description || "",
        color: newCategory.color || "rose",
        icon: newCategory.icon || "face"
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        // Reload categories from database
        // await loadCategories();
        resetCategoryForm();
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory(category);
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        // Reload categories from database
        // await loadCategories();
        resetCategoryForm();
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Reload categories from database
          // await loadCategories();
        } else {
          console.error('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetServiceForm = () => {
    setNewService({
      name: "",
      price: 0,
      mainTab: "book-now",
      category: "face",
      duration: 30,
      description: "",
      details: "",
      benefits: [],
      preparation: "",
      aftercare: "",
      featured: false,
      popular: false,
      slug: ""
    });
    setEditingService(null);
    setIsAdding(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const resetCategoryForm = () => {
    setNewCategory({
      name: "",
      description: "",
      color: "rose",
      icon: "face"
    });
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setNewService(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), newBenefit.trim()]
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setNewService(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || []
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const colorClasses = {
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  };

  // Filter services by main tab
  const filteredServices = services.filter(service => service.mainTab === mainTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Services Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your aesthetic treatments, services, and categories
          </p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setMainTab("book-now")}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  mainTab === "book-now"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span>BOOK NOW</span>
              </button>
              <button
                onClick={() => setMainTab("by-condition")}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  mainTab === "by-condition"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span>BY CONDITION</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("services")}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "services"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Services</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "categories"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Categories</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-8">
          {activeTab === "services" && (
            <>
              {/* Stats */}
              <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredServices.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Services ({mainTab === 'book-now' ? 'Book Now' : 'By Condition'})</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      {getMainTabCategories(mainTab).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingService(null);
                    resetServiceForm();
                    setIsAdding(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Service
                </button>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {getMainTabCategories(mainTab).map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(mainTab, cat)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredServices
                  .filter(service => {
                    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        service.description.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = filterCategory === "all" || service.category === filterCategory;
                    return matchesSearch && matchesCategory;
                  })
                  .map((service) => (
                    <div key={service.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all border border-rose-100/50 dark:border-gray-700/50 overflow-hidden hover:border-rose-200/70 dark:hover:border-rose-500/30">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {service.name}
                            </h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses[service.category as keyof typeof colorClasses] || colorClasses.rose}`}>
                              {getCategoryLabel(mainTab, service.category)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="font-semibold text-2xl text-rose-600">£{service.price}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{service.duration} minutes</span>
                          </div>
                          {service.requiresConsultation && (
                            <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Consultation required
                            </div>
                          )}
                          {service.downtimeDays !== undefined && service.downtimeDays > 0 && (
                            <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {service.downtimeDays}d downtime
                            </div>
                          )}
                          {service.resultsDurationWeeks && (
                            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Lasts {service.resultsDurationWeeks}w
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {service.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                Featured
                              </span>
                            )}
                            {service.popular && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            {service.featured ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add/Edit Service Modal */}
              {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-rose-100/50 dark:border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {editingService ? "Edit Service" : "Add New Service"}
                        </h2>
                        <button
                          onClick={() => setIsAdding(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        editingService ? handleUpdateService() : handleAddService();
                      }} className="space-y-6">
                        {/* Main Tab Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Main Tab
                          </label>
                          <select
                            value={newService.mainTab || "book-now"}
                            onChange={(e) => setNewService(prev => ({ ...prev, mainTab: e.target.value as 'book-now' | 'by-condition' }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          >
                            <option value="book-now">BOOK NOW</option>
                            <option value="by-condition">BY CONDITION</option>
                          </select>
                        </div>

                        {/* Category Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Category
                          </label>
                          <select
                            value={newService.category || ""}
                            onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select Category</option>
                            {getMainTabCategories(newService.mainTab || "book-now").map(cat => (
                              <option key={cat} value={cat}>{getCategoryLabel(newService.mainTab || "book-now", cat)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Service Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Service Name
                          </label>
                          <input
                            type="text"
                            value={newService.name || ""}
                            onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            placeholder="Enter service name"
                            required
                          />
                        </div>

                        {/* Price and Duration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Price (£)
                            </label>
                            <input
                              type="number"
                              value={newService.price || ""}
                              onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                              placeholder="0.00"
                              step="0.01"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              value={newService.duration || ""}
                              onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                              placeholder="30"
                              required
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newService.description || ""}
                            onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            rows={3}
                            placeholder="Enter service description"
                            required
                          />
                        </div>

                        {/* Additional Options */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Downtime (days)
                            </label>
                            <input
                              type="number"
                              value={newService.downtimeDays || ""}
                              onChange={(e) => setNewService(prev => ({ ...prev, downtimeDays: parseInt(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Results Duration (weeks)
                            </label>
                            <input
                              type="number"
                              value={newService.resultsDurationWeeks || ""}
                              onChange={(e) => setNewService(prev => ({ ...prev, resultsDurationWeeks: parseInt(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                              placeholder="12"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newService.requiresConsultation || false}
                              onChange={(e) => setNewService(prev => ({ ...prev, requiresConsultation: e.target.checked }))}
                              className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Requires Consultation</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newService.featured || false}
                              onChange={(e) => setNewService(prev => ({ ...prev, featured: e.target.checked }))}
                              className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newService.popular || false}
                              onChange={(e) => setNewService(prev => ({ ...prev, popular: e.target.checked }))}
                              className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular</span>
                          </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                          >
                            {editingService ? "Update Service" : "Add Service"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "categories" && (
            <>
              {/* Add Category Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    resetCategoryForm();
                    setShowCategoryModal(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Category
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all border border-rose-100/50 dark:border-gray-700/50 overflow-hidden hover:border-rose-200/70 dark:hover:border-rose-500/30">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {category.name}
                          </h3>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses[category.color as keyof typeof colorClasses] || colorClasses.rose}`}>
                            {category.color}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Category Modal */}
              {showCategoryModal && newCategory && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-rose-100/50 dark:border-gray-700/50 max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {editingCategory ? "Edit Category" : "Add New Category"}
                        </h2>
                        <button
                          onClick={() => {
                            setShowCategoryModal(false);
                            setNewCategory(null);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        editingCategory ? handleUpdateCategory() : handleAddCategory();
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={newCategory.name || ""}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            placeholder="Enter category name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newCategory.description || ""}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                            rows={3}
                            placeholder="Enter category description"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Color
                          </label>
                          <select
                            value={newCategory.color || "rose"}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          >
                            <option value="rose">Rose</option>
                            <option value="purple">Purple</option>
                            <option value="pink">Pink</option>
                            <option value="emerald">Emerald</option>
                            <option value="amber">Amber</option>
                            <option value="blue">Blue</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                          >
                            {editingCategory ? "Update Category" : "Add Category"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCategoryModal(false);
                              setNewCategory(null);
                            }}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}