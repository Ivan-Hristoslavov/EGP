"use client";

import { useState, useEffect, useMemo } from "react";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { DeleteCustomerModal } from "@/components/DeleteCustomerModal";
import Pagination from "@/components/Pagination";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { inputClassNames, formLayout } from "@/config/design-system";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Users, Plus, Eye, Edit, Trash2, Mail, Phone, MapPin, Table2, Grid3x3, Tag, Ticket, Send, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { Select, SelectItem } from "@heroui/select";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type DiscountCode = {
  id: string;
  code: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  used_at: string | null;
  is_active: boolean;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  marketing_emails?: boolean;
  discount_codes?: DiscountCode[];
  created_at: string;
  updated_at: string;
  bookings?: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    status: string;
    paymentStatus: string;
  }>;
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

// Empty customers array - will be populated from database
const DUMMY_CUSTOMERS: Customer[] = [];

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [discountCodeToDelete, setDiscountCodeToDelete] = useState<DiscountCode | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const isMdOrLarger = useMediaQuery();
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [formError, setFormError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Search and filters (search is client-side only, no API call)
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [hasDiscountCode, setHasDiscountCode] = useState<string>("all");

  // Filter customers locally by name, email, or phone (no API call)
  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term))
    );
  }, [customers, search]);

  // Load customers on component mount and when sort/filters change
  useEffect(() => {
    loadCustomers(1);
  }, [sort, hasDiscountCode]);

  // Keep selectedCustomer in sync with customers list after reload
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find((c) => c.id === selectedCustomer.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedCustomer)) {
        setSelectedCustomer(updated);
      }
    }
  }, [customers]);

  const loadCustomers = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (sort && sort !== "newest") params.set("sort", sort);
      if (hasDiscountCode && hasDiscountCode !== "all") params.set("has_discount_code", hasDiscountCode);
      const response = await fetch(`/api/customers?${params.toString()}`);

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();

        console.log("Loaded customers:", data);
        const fetchedCustomers = data.customers || [];
        
        // Transform API response to match Customer type (combine first_name + last_name into name)
        const transformedCustomers = fetchedCustomers.map((customer: any) => ({
          id: customer.id,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          postcode: customer.postcode || '',
          city: customer.city || '',
          notes: customer.notes || '',
          marketing_emails: customer.marketing_emails ?? false,
          discount_codes: customer.discount_codes || [],
          created_at: customer.created_at || '',
          updated_at: customer.updated_at || '',
        }));
        
        // Use dummy data if no real customers exist
        if (transformedCustomers.length === 0) {
          console.log("No customers found, using dummy data");
          setCustomers(DUMMY_CUSTOMERS);
          setTotalPages(1);
          setTotalCount(DUMMY_CUSTOMERS.length);
          setCurrentPage(1);
        } else {
          setCustomers(transformedCustomers);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.totalCount || 0);
          setCurrentPage(data.pagination?.page || 1);
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to load customers:", response.status, errorText);
        // Use dummy data on error
        console.log("API error, using dummy data");
        setCustomers(DUMMY_CUSTOMERS);
        setTotalPages(1);
        setTotalCount(DUMMY_CUSTOMERS.length);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      // Use dummy data on error
      console.log("Exception occurred, using dummy data");
      setCustomers(DUMMY_CUSTOMERS);
      setTotalPages(1);
      setTotalCount(DUMMY_CUSTOMERS.length);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    await loadCustomers(page);
  };


  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
  };

  const handleAddCustomer = async () => {
    setFormError("");

    try {
      if (
        !newCustomer.name ||
        !newCustomer.email ||
        !newCustomer.phone ||
        !newCustomer.address
      ) {
        setFormError("Please fill in all required fields.");
        return;
      }

      const customerData = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
      };

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        // Reload customers list
        await loadCustomers();

        // Reset form
        setShowAddModal(false);
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
        });
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setFormError("Failed to create customer");
    }
  };

  const handleEditCustomer = async (customerId: string, customerData: any) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        await loadCustomers();
        setShowEditModal(false);
        setEditingCustomer(null);
      } else {
        const error = await response.json();
        console.error("Failed to update customer:", error);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadCustomers();
        setShowDeleteModal(false);
        setCustomerToDelete(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  // --- Discount code helpers ---
  const [generatingCode, setGeneratingCode] = useState(false);

  const getDiscountStatus = (code: DiscountCode): { label: string; color: "success" | "warning" | "danger" | "default" } => {
    if (code.used_at) return { label: "Used", color: "success" };
    if (!code.is_active) return { label: "Inactive", color: "default" };
    if (new Date(code.valid_until) < new Date()) return { label: "Expired", color: "danger" };
    return { label: "Active", color: "warning" };
  };

  const getActiveDiscount = (customer: Customer): DiscountCode | null => {
    if (!customer.discount_codes || customer.discount_codes.length === 0) return null;
    // Return the most recent active, unused, non-expired code
    const now = new Date();
    const active = customer.discount_codes.find(
      (c) => c.is_active && !c.used_at && new Date(c.valid_until) > now
    );
    if (active) return active;
    // Else return the most recent code overall (they're ordered by created_at desc from API)
    return customer.discount_codes[0];
  };

  const handleGenerateDiscountCode = async (customerId: string, sendEmail: boolean = false) => {
    try {
      setGeneratingCode(true);
      const response = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          send_email: sendEmail,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate code");
      }

      // Reload customers to get updated discount codes
      await loadCustomers(currentPage);

      // If we have a selected customer, refresh their data
      if (selectedCustomer && selectedCustomer.id === customerId) {
        const updatedCustomer = customers.find((c) => c.id === customerId);
        if (updatedCustomer) setSelectedCustomer(updatedCustomer);
      }
    } catch (error) {
      console.error("Error generating discount code:", error);
      alert(error instanceof Error ? error.message : "Failed to generate discount code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleToggleDiscountCode = async (codeId: string, action: "activate" | "deactivate" | "mark_used" | "mark_unused") => {
    try {
      const body: Record<string, any> = {};
      if (action === "activate") body.is_active = true;
      if (action === "deactivate") body.is_active = false;
      if (action === "mark_used") body.mark_as_used = true;
      if (action === "mark_unused") body.mark_as_unused = true;

      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update discount code");
      }

      await loadCustomers(currentPage);
    } catch (error) {
      console.error("Error updating discount code:", error);
      alert(error instanceof Error ? error.message : "Failed to update discount code");
    }
  };

  const handleDeleteDiscountCode = async (codeId: string) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete discount code");
      }

      setDiscountCodeToDelete(null);
      await loadCustomers(currentPage);
    } catch (error) {
      console.error("Error deleting discount code:", error);
      alert(error instanceof Error ? error.message : "Failed to delete discount code");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* View Toggle - desktop only */}
          <div className="hidden md:flex bg-default-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "table" ? "solid" : "light"}
              color={viewMode === "table" ? "primary" : "default"}
              startContent={<Table2 className="w-4 h-4" />}
              onPress={() => handleViewModeChange("table")}
              className="min-w-0"
            >
                    Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "cards" ? "solid" : "light"}
              color={viewMode === "cards" ? "primary" : "default"}
              startContent={<Grid3x3 className="w-4 h-4" />}
              onPress={() => handleViewModeChange("cards")}
              className="min-w-0"
            >
                    Cards
            </Button>
                </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setShowAddModal(true)}
                >
                  Add Customer
          </Button>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
        <Card className="border border-divider">
          <CardBody className="p-12">
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="text-default-500 mt-4">Loading customers...</p>
            </div>
          </CardBody>
        </Card>
        ) : (
          <>
            {/* Combined: Total Customers + Search & filters (close to table) */}
            <Card className="border border-divider">
              <CardBody className="p-4">
                <div className="flex flex-row flex-wrap items-center gap-3">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold">{totalCount}</p>
                      <p className="text-sm text-default-500">Total Customers</p>
                    </div>
                  </div>
                  <div className="flex flex-1 min-w-0 items-center gap-2 flex-wrap">
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      startContent={<Search className="w-4 h-4 text-default-400" />}
                      isClearable
                      onClear={() => setSearch("")}
                      classNames={{ input: "text-sm" }}
                      size="sm"
                      className="w-full sm:min-w-[180px] sm:max-w-[280px]"
                    />
                    <Select
                      label="Sort"
                      placeholder="Sort by"
                      selectedKeys={sort ? [sort] : ["newest"]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string;
                        if (v) setSort(v);
                      }}
                      className="max-w-[140px] flex-shrink-0"
                      size="sm"
                      aria-label="Sort customers"
                    >
                      <SelectItem key="newest">Newest first</SelectItem>
                      <SelectItem key="oldest">Oldest first</SelectItem>
                      <SelectItem key="name_asc">Name A–Z</SelectItem>
                      <SelectItem key="name_desc">Name Z–A</SelectItem>
                    </Select>
                    <Select
                      label="Discount code"
                      placeholder="Filter"
                      selectedKeys={hasDiscountCode ? [hasDiscountCode] : ["all"]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string;
                        if (v) setHasDiscountCode(v);
                      }}
                      className="max-w-[160px] flex-shrink-0"
                      size="sm"
                      aria-label="Filter by discount code"
                    >
                      <SelectItem key="all">All customers</SelectItem>
                      <SelectItem key="yes">With discount code</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Empty state: no data from API */}
            {customers.length === 0 ? (
            <Card className="border border-divider">
              <CardBody className="p-12 text-center">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">No Customers Yet</h3>
                <p className="text-default-500 mb-6">
                  Add your first customer using the button above or try different filters.
                </p>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => setShowAddModal(true)}
                >
                  Add First Customer
                </Button>
              </CardBody>
            </Card>
            ) : filteredCustomers.length === 0 ? (
            <Card className="border border-divider">
              <CardBody className="p-8 text-center">
                <p className="text-default-500">No customers match your search. Try a different name, email, or phone.</p>
              </CardBody>
            </Card>
            ) : (
          <>
            {/* Table View - desktop only when table selected */}
            {isMdOrLarger && viewMode === "table" && (
            <Card className="border border-divider">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-default-100 border-b border-divider">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Customer
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            Discount
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-default-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.id} 
                          className="hover:bg-default-50 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-white font-bold">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success-500 rounded-full border-2 border-background"></div>
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">
                                  {customer.name}
                                </div>
                                {customer.notes && (
                                  <div className="text-xs text-default-500 mt-0.5 max-w-xs truncate">
                                    {customer.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-foreground truncate max-w-xs">
                              {customer.email}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-default-600">
                              {customer.phone}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-default-600 max-w-xs line-clamp-2">
                              {customer.address}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {(() => {
                              const dc = getActiveDiscount(customer);
                              if (!dc) return <span className="text-xs text-default-400">--</span>;
                              const st = getDiscountStatus(dc);
                              return (
                                <div className="flex flex-col gap-1">
                                  <code className="text-xs font-mono font-semibold text-foreground">{dc.code}</code>
                                  <Chip size="sm" variant="flat" color={st.color} className="w-fit">
                                    {st.label} &middot; {dc.discount_percentage}%
                                  </Chip>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => setSelectedCustomer(customer)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                isIconOnly
                                color="primary"
                                variant="light"
                                size="sm"
                                onPress={() => {
                                  setEditingCustomer(customer);
                                  setShowEditModal(true);
                                }}
                                title="Edit Customer"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                isIconOnly
                                color="danger"
                                variant="light"
                                size="sm"
                                onPress={() => handleDeleteClick(customer)}
                                title="Delete Customer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
            )}

            {/* Cards View - always on mobile, or when cards selected on desktop */}
            {(!isMdOrLarger || viewMode === "cards") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                <Card key={customer.id} isPressable className="border border-divider hover:shadow-lg transition-shadow">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                            <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-background"></div>
                            </div>
                        <div>
                          <h3 className="text-lg font-bold mb-1">
                                {customer.name}
                              </h3>
                          </div>
                        </div>
                      </div>
                    
                      {/* Contact Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-default-600">
                        <Mail className="w-4 h-4 mr-3 text-default-400" />
                          <span className="truncate font-medium">{customer.email}</span>
                        </div>
                      <div className="flex items-center text-sm text-default-600">
                        <Phone className="w-4 h-4 mr-3 text-default-400" />
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                      <div className="flex items-start text-sm text-default-600">
                        <MapPin className="w-4 h-4 mr-3 mt-0.5 text-default-400 flex-shrink-0" />
                          <span className="break-words">{customer.address}</span>
                        </div>
                      </div>

                      {/* Discount Code Badge */}
                      {(() => {
                        const dc = getActiveDiscount(customer);
                        if (!dc) return null;
                        const st = getDiscountStatus(dc);
                        return (
                          <div className="flex items-center gap-2 mb-3">
                            <Ticket className="w-3.5 h-3.5 text-default-400" />
                            <code className="text-xs font-mono font-semibold">{dc.code}</code>
                            <Chip size="sm" variant="flat" color={st.color}>{st.label}</Chip>
                          </div>
                        );
                      })()}

                      {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-divider">
                      <Button
                        variant="flat"
                        size="sm"
                        startContent={<Eye className="w-4 h-4" />}
                        onPress={() => setSelectedCustomer(customer)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        startContent={<Edit className="w-4 h-4" />}
                        onPress={() => {
                            setEditingCustomer(customer);
                            setShowEditModal(true);
                          }}
                        className="flex-1"
                      >
                          Edit
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => handleDeleteClick(customer)}
                          title="Delete Customer"
                        >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      </div>
                  </CardBody>
                </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={limit}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          </>
            )}
        </>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
          setNewCustomer({ name: "", email: "", phone: "", address: "" });
        }}
        size="2xl"
        scrollBehavior="inside"
        classNames={{ base: "max-w-[95vw] sm:max-w-2xl mx-2" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                <h3 className="text-lg sm:text-xl font-bold">Add Customer</h3>
              </ModalHeader>
              <ModalBody className={formLayout.modalBody}>
                <div className={formLayout.sectionGap}>
              {formError && (
                    <Chip color="danger" variant="flat" className="w-full justify-center">
                      {formError}
                    </Chip>
                  )}
                  <div className={formLayout.gridFields}>
                    <Input
                      label="Name"
                      placeholder="Enter customer name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      isRequired
                      isClearable
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={inputClassNames}
                    />
                    <Input
                      type="email"
                      label="Email"
                      placeholder="customer@email.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      isRequired
                      isClearable
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={inputClassNames}
                    />
                    <Input
                      type="tel"
                      label="Phone"
                      placeholder="07944 24 20 79"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      isRequired
                      isClearable
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={inputClassNames}
                    />
                    <div className={formLayout.fullWidth}>
                      <Input
                        label="Address"
                        placeholder="Enter customer address"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        isRequired
                        isClearable
                        variant="bordered"
                        labelPlacement="outside"
                        classNames={inputClassNames}
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 gap-2 flex-col-reverse sm:flex-row">
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddCustomer}
                >
                  Add Customer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleEditCustomer}
        customer={editingCustomer}
      />

      {/* View Customer Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[95vh] mx-2 sm:mx-4",
          wrapper: "items-start sm:items-center pt-4 sm:pt-0",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="shrink-0">
                <h3 className="text-xl font-bold">Customer Details</h3>
              </ModalHeader>
              <ModalBody className="overflow-y-auto max-h-[min(70vh,500px)] sm:max-h-[min(75vh,600px)]">
                {selectedCustomer && (
                  <div className="space-y-6">
                    {/* Customer Header */}
                    <Card className="border border-divider">
                      <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                                {selectedCustomer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-background"></div>
                </div>
                          <div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">{selectedCustomer.name}</h3>
                            <p className="text-sm text-default-500">
                              Customer since {new Date(selectedCustomer.created_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                    </p>
                </div>
              </div>
                      </CardBody>
                    </Card>

              {/* Contact Information */}
                    <Card className="border border-divider">
                      <CardHeader>
                        <h4 className="text-lg font-semibold">Contact Information</h4>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                            <label className="text-sm font-medium text-default-500 mb-1 block">Email</label>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-default-400" />
                              <p className="text-base">{selectedCustomer.email}</p>
                    </div>
                    </div>
                    <div>
                            <label className="text-sm font-medium text-default-500 mb-1 block">Phone</label>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-default-400" />
                              <p className="text-base">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-default-500 mb-1 block">Address</label>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-default-400 mt-1 flex-shrink-0" />
                              <p className="text-base break-words">{selectedCustomer.address}</p>
                    </div>
                    </div>
                  </div>
                      </CardBody>
                    </Card>

                    {/* Notes */}
                    {selectedCustomer.notes && (
                      <Card className="border border-divider">
                        <CardHeader>
                          <h4 className="text-lg font-semibold">Notes</h4>
                        </CardHeader>
                        <CardBody>
                          <p className="text-base text-default-700 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                        </CardBody>
                      </Card>
                    )}

                    {/* Discount Codes */}
                    <Card className="border border-divider">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-semibold">Discount Codes</h4>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<Tag className="w-3 h-3" />}
                            isLoading={generatingCode}
                            onPress={() => handleGenerateDiscountCode(selectedCustomer.id, false)}
                          >
                            Generate Code
                          </Button>
                          {selectedCustomer.email && (
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              startContent={<Send className="w-3 h-3" />}
                              isLoading={generatingCode}
                              onPress={() => handleGenerateDiscountCode(selectedCustomer.id, true)}
                            >
                              Generate & Email
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardBody>
                        {(!selectedCustomer.discount_codes || selectedCustomer.discount_codes.length === 0) ? (
                          <div className="text-center py-4 text-default-500">
                            <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No discount codes yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedCustomer.discount_codes.map((dc) => {
                              const st = getDiscountStatus(dc);
                              return (
                                <div
                                  key={dc.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-200"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm font-mono font-bold tracking-wider text-foreground">{dc.code}</code>
                                      <Chip size="sm" variant="flat" color={st.color}>{st.label}</Chip>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-500">
                                      <span>{dc.discount_percentage}% off</span>
                                      <span>Valid until {new Date(dc.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                      {dc.used_at && (
                                        <span className="text-success-600">Used {new Date(dc.used_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                    {!dc.used_at && dc.is_active ? (
                                      <>
                                        <Button
                                          isIconOnly
                                          size="sm"
                                          variant="light"
                                          color="success"
                                          title="Mark as Used"
                                          onPress={() => handleToggleDiscountCode(dc.id, "mark_used")}
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          isIconOnly
                                          size="sm"
                                          variant="light"
                                          color="warning"
                                          title="Deactivate"
                                          onPress={() => handleToggleDiscountCode(dc.id, "deactivate")}
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      </>
                                    ) : dc.used_at ? (
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        title="Mark as Unused"
                                        onPress={() => handleToggleDiscountCode(dc.id, "mark_unused")}
                                      >
                                        <Clock className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="success"
                                        title="Activate"
                                        onPress={() => handleToggleDiscountCode(dc.id, "activate")}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="danger"
                                      title="Delete Code"
                                      onPress={() => setDiscountCodeToDelete(dc)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardBody>
                    </Card>

                    {/* Additional Info */}
                    <Card className="border border-divider">
                      <CardHeader>
                        <h4 className="text-lg font-semibold">Additional Information</h4>
                      </CardHeader>
                      <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                            <label className="text-sm font-medium text-default-500 mb-1 block">Created</label>
                            <p className="text-base">
                              {new Date(selectedCustomer.created_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                        </div>
                          {selectedCustomer.updated_at && selectedCustomer.updated_at !== selectedCustomer.created_at && (
                            <div>
                              <label className="text-sm font-medium text-default-500 mb-1 block">Last Updated</label>
                              <p className="text-base">
                                {new Date(selectedCustomer.updated_at).toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                      </div>
                          )}
                  </div>
                      </CardBody>
                    </Card>
                </div>
              )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    setEditingCustomer(selectedCustomer);
                    setShowEditModal(true);
                  }}
                >
                  Edit Customer
                </Button>
              </ModalFooter>
            </>
      )}
        </ModalContent>
      </Modal>

      {/* Delete Discount Code Modal */}
      <Modal
        isOpen={!!discountCodeToDelete}
        onClose={() => setDiscountCodeToDelete(null)}
        size="md"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Delete discount code</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to delete the code <strong className="font-mono">{discountCodeToDelete?.code}</strong>? This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setDiscountCodeToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => discountCodeToDelete && handleDeleteDiscountCode(discountCodeToDelete.id)}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Customer Modal */}
      <DeleteCustomerModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteCustomer}
        customer={customerToDelete}
      />
    </div>
  );
}
