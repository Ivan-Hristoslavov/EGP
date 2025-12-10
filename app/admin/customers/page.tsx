"use client";

import { useState, useEffect } from "react";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { DeleteCustomerModal } from "@/components/DeleteCustomerModal";
import Pagination from "@/components/Pagination";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Users, Plus, Eye, Edit, Trash2, Mail, Phone, MapPin, Table2, Grid3x3 } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("customers-view-mode") as "table" | "cards") || "table";
    }
    return "table";
  });
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

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log("Loading customers...");
      const response = await fetch(`/api/customers?page=${page}&limit=${limit}`);

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
    localStorage.setItem("customers-view-mode", mode);
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* View Toggle */}
          <div className="flex bg-default-100 rounded-lg p-1">
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

      {/* Stats */}
      <Card className="border border-divider">
        <CardBody className="p-4">
                <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-default-500">Total Customers</p>
            </div>
          </div>
        </CardBody>
      </Card>

        {/* Loading and Empty States */}
        {loading ? (
        <Card className="border border-divider">
          <CardBody className="p-12">
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="text-default-500 mt-4">Loading customers...</p>
            </div>
          </CardBody>
        </Card>
        ) : customers.length === 0 ? (
        <Card className="border border-divider">
          <CardBody className="p-12 text-center">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Customers Yet</h3>
            <p className="text-default-500 mb-6">
              Add your first customer using the button above.
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
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" && (
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
                        <th className="px-6 py-4 text-right text-xs font-semibold text-default-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {customers.map((customer) => (
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

            {/* Cards View */}
            {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Add Customer</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
              {formError && (
                    <Chip color="danger" variant="flat" className="w-full">
                      {formError}
                    </Chip>
                  )}
                  <Input
                    label="Name"
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    isRequired
                    isClearable
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="customer@email.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    isRequired
                    isClearable
                  />
                  <Input
                    type="tel"
                    label="Phone"
                    placeholder="+44 7700 900123"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    isRequired
                    isClearable
                  />
                  <Input
                    label="Address"
                    placeholder="Enter customer address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    isRequired
                    isClearable
                  />
                </div>
              </ModalBody>
              <ModalFooter>
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Customer Details</h3>
              </ModalHeader>
              <ModalBody>
                {selectedCustomer && (
                  <div className="space-y-6">
                    {/* Customer Header */}
                    <Card className="border border-divider">
                      <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-2xl">
                                {selectedCustomer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-1">{selectedCustomer.name}</h3>
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
