"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ArrowLeft,
  Info,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";

import { typography, layout, textColors } from "@/config/typography";
import { useServices } from "@/hooks/useServices";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";
import { ServiceDetailsModal } from "@/components/ServiceDetailsModal";

const categories = [
  "All",
  "Face",
  "Anti-Wrinkle Injections",
  "Fillers",
  "Body",
];

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under £200", min: 0, max: 199 },
  { label: "£200 - £400", min: 200, max: 400 },
  { label: "£400 - £600", min: 400, max: 600 },
  { label: "Over £600", min: 600, max: Infinity },
];

const durationRanges = [
  { label: "All Durations", min: 0, max: Infinity },
  { label: "Under 45 min", min: 0, max: 44 },
  { label: "45 - 60 min", min: 45, max: 60 },
  { label: "60 - 90 min", min: 60, max: 90 },
  { label: "Over 90 min", min: 90, max: Infinity },
];

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const { services, isLoading: servicesLoading } = useServices();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [selectedDurationRange, setSelectedDurationRange] =
    useState("All Durations");
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const itemsPerPage = 12;

  // Create a lookup map from services for easy access
  const servicesDataMap = useMemo(() => {
    const map: Record<string, any> = {};

    services.forEach((service) => {
      const effectivePrice = service.discounted_price ?? service.price;

      map[service.slug] = {
        id: service.id,
        name: service.name,
        price: effectivePrice,
        originalPrice: service.discount_percentage ? service.price : null,
        discountPercentage: service.discount_percentage ?? null,
        category: service.category.name,
        duration: service.duration,
        description: service.description,
        details: service.details,
        benefits: service.benefits,
        preparation: service.preparation,
        aftercare: service.aftercare,
        requires_consultation: service.requires_consultation,
        downtime_days: service.downtime_days,
        results_duration_weeks: service.results_duration_weeks,
        is_featured: service.is_featured,
      };
    });

    return map;
  }, [services]);

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get("category");

    if (category && categories.includes(category)) {
      setSelectedCategory(category);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filter services based on selected criteria
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const serviceData = servicesDataMap[service.slug];

        if (!serviceData) return false;

        const matchesCategory =
          selectedCategory === "All" ||
          serviceData.category === selectedCategory;
        const selectedPriceRangeObj = priceRanges.find(
          (range) => range.label === selectedPriceRange,
        );
        const matchesPrice = selectedPriceRangeObj
          ? selectedPriceRangeObj.min <= serviceData.price &&
            selectedPriceRangeObj.max >= serviceData.price
          : true;
        const selectedDurationRangeObj = durationRanges.find(
          (range) => range.label === selectedDurationRange,
        );
        const matchesDuration = selectedDurationRangeObj
          ? selectedDurationRangeObj.min <= serviceData.duration &&
            selectedDurationRangeObj.max >= serviceData.duration
          : true;
        const hasDiscount =
          (service.discounted_price != null &&
            service.discounted_price < service.price) ||
          (service.discount_percentage != null &&
            service.discount_percentage > 0);
        const matchesDiscount = !showDiscountedOnly || hasDiscount;
        const matchesSearch =
          serviceData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (serviceData.description &&
            serviceData.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          serviceData.category.toLowerCase().includes(searchTerm.toLowerCase());

        return (
          matchesCategory &&
          matchesPrice &&
          matchesDuration &&
          matchesDiscount &&
          matchesSearch
        );
      })
      .map(
        (service) =>
          [service.slug, servicesDataMap[service.slug]] as [string, any],
      );
  }, [
    services,
    servicesDataMap,
    selectedCategory,
    selectedPriceRange,
    selectedDurationRange,
    showDiscountedOnly,
    searchTerm,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case "category":
        setSelectedCategory(value);
        break;
      case "price":
        setSelectedPriceRange(value);
        break;
      case "duration":
        setSelectedDurationRange(value);
        break;
      case "discount":
        setShowDiscountedOnly(value === "Discounted only");
        break;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Show loading state while services are being fetched
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 flex items-center justify-center py-8">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900">
      <div className={`${layout.containerWide} pt-20 sm:pt-24 pb-8 sm:pb-12`}>
        {/* Header - Back on left, Our Services centered */}
        <div className="relative flex items-center justify-between mb-3 sm:mb-4">
          <Link
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors flex-shrink-0 z-10"
            href="/"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1
            className={`absolute left-1/2 -translate-x-1/2 text-base sm:text-xl md:text-2xl font-bold ${textColors.heading} font-montserrat`}
          >
            Our Services
          </h1>
          <div aria-hidden className="w-14 sm:w-20" />
        </div>

        <div className="text-center mb-4 sm:mb-6">
          <p
            className={`${typography.lead} font-montserrat font-light max-w-2xl mx-auto text-sm sm:text-base`}
          >
            Discover our comprehensive range of aesthetic treatments designed to
            enhance your natural beauty
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-full lg:max-w-md">
              <Input
                isClearable
                placeholder="Search services..."
                size="lg"
                startContent={<Search className="w-5 h-5 text-default-400" />}
                type="text"
                value={searchTerm}
                variant="bordered"
                onClear={() => handleSearch("")}
                onValueChange={handleSearch}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              startContent={<Filter className="w-5 h-5" />}
              variant="bordered"
              onPress={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {/* Filter Options - responsive grid, ensure Select fits on mobile */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category Filter */}
                <Select
                  classNames={{ trigger: "min-h-10", value: "text-foreground" }}
                  label="Category"
                  selectedKeys={[selectedCategory]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    handleFilterChange("category", selected || "All");
                  }}
                >
                  {categories.map((category) => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
                </Select>

                {/* Price Filter */}
                <Select
                  classNames={{ trigger: "min-h-10", value: "text-foreground" }}
                  label="Price Range"
                  selectedKeys={[selectedPriceRange]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    handleFilterChange("price", selected || "All Prices");
                  }}
                >
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label}>{range.label}</SelectItem>
                  ))}
                </Select>

                {/* Duration Filter */}
                <Select
                  classNames={{ trigger: "min-h-10", value: "text-foreground" }}
                  label="Duration"
                  selectedKeys={[selectedDurationRange]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    handleFilterChange("duration", selected || "All Durations");
                  }}
                >
                  {durationRanges.map((range) => (
                    <SelectItem key={range.label}>{range.label}</SelectItem>
                  ))}
                </Select>

                {/* Discount Filter */}
                <Select
                  classNames={{ trigger: "min-h-10", value: "text-foreground" }}
                  label="Discount"
                  selectedKeys={[
                    showDiscountedOnly ? "Discounted only" : "All",
                  ]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    handleFilterChange("discount", selected || "All");
                  }}
                >
                  <SelectItem key="All">All</SelectItem>
                  <SelectItem key="Discounted only">On offer</SelectItem>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className={`${typography.small}`}>
            Showing {filteredServices.length} of {services.length} services
          </p>
          {(selectedCategory !== "All" ||
            selectedPriceRange !== "All Prices" ||
            selectedDurationRange !== "All Durations" ||
            showDiscountedOnly ||
            searchTerm) && (
            <Button
              className="text-egp-green dark:text-egp-green-light hover:text-egp-green-dark"
              size="sm"
              variant="light"
              onPress={() => {
                setSelectedCategory("All");
                setSelectedPriceRange("All Prices");
                setSelectedDurationRange("All Durations");
                setShowDiscountedOnly(false);
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Services Grid/List */}
        {paginatedServices.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button
              className="bg-egp-green hover:bg-egp-green-dark text-white"
              size="md"
              onPress={() => {
                setSelectedCategory("All");
                setSelectedPriceRange("All Prices");
                setSelectedDurationRange("All Durations");
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              Show All Services
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {paginatedServices.map(([serviceId, service]) => (
              <Card key={serviceId} className="h-full" shadow="sm">
                <CardHeader className="bg-egp-beige-lighter dark:bg-egp-green-dark px-2 sm:px-2.5 py-2 sm:py-2.5 border-b border-egp-beige-dark/60 dark:border-egp-green flex flex-col items-center text-center">
                  {/* Badges - Centered row */}
                  <div className="flex flex-wrap justify-center gap-1.5 mb-1.5">
                    <Chip
                      className="bg-egp-green text-white text-[8px] h-5"
                      size="sm"
                      variant="flat"
                    >
                      {service.category}
                    </Chip>
                    <Chip
                      className="bg-white/90 dark:bg-egp-green-dark/90 text-egp-green dark:text-white text-[8px] h-5"
                      size="sm"
                      startContent={<Clock className="w-2.5 h-2.5" />}
                      variant="flat"
                    >
                      {service.duration} min
                    </Chip>
                  </div>

                  {/* Service Name and Price - Centered */}
                  <div className="w-full">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-0.5">
                      {service.name}
                    </h3>
                    <div className="flex justify-center w-full">
                      <PriceWithDiscount
                        align="center"
                        discountPercentage={service.discountPercentage}
                        layout="stack"
                        originalPrice={service.originalPrice}
                        price={service.price}
                        size="sm"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardBody
                  className="p-2 sm:p-2.5 flex flex-col flex-1 cursor-pointer min-h-0 items-center text-center"
                  onClick={() => setSelectedService(serviceId)}
                >
                  {/* Description */}
                  {service.description && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1.5 leading-snug line-clamp-2 w-full">
                      {service.description}
                    </p>
                  )}

                  {/* Service Details - Centered */}
                  <div className="space-y-0.5 mb-1.5 text-[9px] text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    {service.requires_consultation && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-egp-green flex-shrink-0" />
                        <span>Consultation required</span>
                      </div>
                    )}
                    {service.downtime_days > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-2.5 h-2.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <span>Downtime: {service.downtime_days}d</span>
                      </div>
                    )}
                    {service.results_duration_weeks && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-2.5 h-2.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <span>Results: {service.results_duration_weeks}w</span>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div
                    className="flex gap-1 mt-auto pt-1 justify-center w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      className="flex-1 min-w-0 border-egp-green text-egp-green dark:text-white dark:border-egp-green text-xs h-8"
                      size="sm"
                      startContent={<Info className="w-2.5 h-2.5" />}
                      variant="bordered"
                      onPress={() => setSelectedService(serviceId)}
                    >
                      Details
                    </Button>
                    <Link
                      href={
                        service?.id
                          ? `/book?pendingServiceId=${service.id}`
                          : "/book"
                      }
                    >
                      <Button
                        className="flex-1 w-full min-w-0 bg-egp-green text-white text-xs h-8"
                        size="sm"
                        startContent={<Plus className="w-2.5 h-2.5" />}
                      >
                        Book
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              className="border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
              isDisabled={currentPage === 1}
              size="sm"
              variant="bordered"
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                className={
                  currentPage === page
                    ? "bg-egp-green text-white"
                    : "border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
                }
                size="sm"
                variant={currentPage === page ? "solid" : "bordered"}
                onPress={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              className="border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="bordered"
              onPress={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
            >
              Next
            </Button>
          </div>
        )}

        {/* Service Modal */}
        <ServiceDetailsModal
          showBookButton
          isOpen={!!selectedService}
          service={
            selectedService ? (servicesDataMap[selectedService] ?? null) : null
          }
          onClose={() => setSelectedService(null)}
        />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#464C45] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
