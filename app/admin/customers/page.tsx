"use client";

import { useState, useEffect } from "react";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { DeleteCustomerModal } from "@/components/DeleteCustomerModal";
import Pagination from "@/components/Pagination";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: "individual" | "company";
  company_name?: string;
  vat_number?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
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

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [addType, setAddType] = useState<"individual" | "company">(
    "individual"
  );
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
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    vat: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
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
        setCustomers(data.customers || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
        setCurrentPage(data.pagination?.page || 1);
      } else {
        const errorText = await response.text();

        console.error("Failed to load customers:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      let customerData;

      if (addType === "individual") {
        if (
          !newCustomer.name ||
          !newCustomer.email ||
          !newCustomer.phone ||
          !newCustomer.address
        ) {
          setFormError("Please fill in all required fields.");

          return;
        }
        customerData = {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          customer_type: "individual" as const,
        };
      } else {
        if (
          !newCustomer.companyName ||
          !newCustomer.companyEmail ||
          !newCustomer.companyPhone ||
          !newCustomer.companyAddress
        ) {
          setFormError("Please fill in all required fields.");

          return;
        }
        customerData = {
          name: newCustomer.companyName,
          email: newCustomer.companyEmail,
          phone: newCustomer.companyPhone,
          address: newCustomer.companyAddress,
          customer_type: "company" as const,
          company_name: newCustomer.companyName,
          vat_number: newCustomer.vat || null,
          contact_person: newCustomer.contactPerson || null,
          contact_email: newCustomer.contactEmail || null,
          contact_phone: newCustomer.contactPhone || null,
        };
      }

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
        setAddType("individual");
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
          companyName: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          vat: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Customers</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => handleViewModeChange("table")}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9" />
              </svg>
              Table
            </button>
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => handleViewModeChange("cards")}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              Cards
            </button>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-300"
            onClick={() => setShowAddModal(true)}
          >
            Add Customer
          </button>
        </div>
      </div>
      {/* Loading and Empty States */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center transition-colors duration-300">
          <div className="text-gray-500 dark:text-gray-400">Loading customers...</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center transition-colors duration-300">
          <div className="text-gray-500 dark:text-gray-400">
            No customers found. Add your first customer using the button above.
          </div>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto transition-colors duration-300">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {customer.name}
                        {customer.customer_type === "company" &&
                          customer.contact_person && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              Contact: {customer.contact_person}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                            customer.customer_type === "individual"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                              : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                          }`}
                        >
                          {customer.customer_type === "individual"
                            ? "Individual"
                            : "Company"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {customer.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                            onClick={() => setSelectedCustomer(customer)}
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors duration-300"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setShowEditModal(true);
                            }}
                            title="Edit Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-300"
                            onClick={() => handleDeleteClick(customer)}
                            title="Delete Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards View */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="group bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative"
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <span className="text-white font-semibold text-sm">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                              {customer.name}
                            </h3>
                            {customer.customer_type === "company" && customer.contact_person && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Contact: {customer.contact_person}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                          customer.customer_type === "individual"
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                        }`}
                      >
                        {customer.customer_type === "individual" ? "Individual" : "Company"}
                      </span>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="truncate font-medium">{customer.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="font-medium">{customer.phone}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="break-words">{customer.address}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 group-hover:scale-110"
                        onClick={() => setSelectedCustomer(customer)}
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors duration-300 group-hover:scale-110"
                        onClick={() => {
                          setEditingCustomer(customer);
                          setShowEditModal(true);
                        }}
                        title="Edit Customer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-300 group-hover:scale-110"
                        onClick={() => handleDeleteClick(customer)}
                        title="Delete Customer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] relative transition-colors duration-300">
            {/* Close button */}
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none transition-colors duration-300"
              type="button"
              onClick={() => setShowAddModal(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
            <form
              className="p-8 space-y-6 overflow-y-auto max-h-[70vh]"
              onSubmit={handleAddCustomer}
            >
              <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-light transition-colors duration-300">
                Add Customer
              </h2>
              <div className="flex space-x-2 mb-6">
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-300 ${addType === "individual" ? "bg-primary text-white border-primary shadow" : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                  type="button"
                  onClick={() => setAddType("individual")}
                >
                  Individual
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors duration-300 ${addType === "company" ? "bg-primary text-white border-primary shadow" : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                  type="button"
                  onClick={() => setAddType("company")}
                >
                  Company
                </button>
              </div>
              {formError && (
                <div className="text-red-600 dark:text-red-400 text-sm mb-2 transition-colors duration-300">{formError}</div>
              )}
              {addType === "individual" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Name<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Email<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Phone<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Address<span className="text-red-500 dark:text-red-400 transition-colors duration-300">*</span>
                    </label>
                    <input
                      required
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer((nc) => ({
                          ...nc,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    Company Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyName}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        type="email"
                        value={newCustomer.companyEmail}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Phone<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyPhone}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Address<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.companyAddress}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            companyAddress: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VAT Number
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.vat}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            vat: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    Contact Person (optional)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPerson}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactPerson: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        type="email"
                        value={newCustomer.contactEmail}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                        value={newCustomer.contactPhone}
                        onChange={(e) =>
                          setNewCustomer((nc) => ({
                            ...nc,
                            contactPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="mt-8 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow"
                  type="submit"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Customer Details</h2>
                <button
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Name:</span>{" "}
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{selectedCustomer.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Email:</span>{" "}
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Phone:</span>{" "}
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Address:</span>{" "}
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{selectedCustomer.address}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Bookings</h3>
                <ul className="space-y-1">
                  {selectedCustomer.bookings &&
                  selectedCustomer.bookings.length > 0 ? (
                    selectedCustomer.bookings.map((b) => (
                      <li key={b.id} className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {b.date}: {b.service} (£{b.amount}) -{" "}
                        <span className="capitalize">{b.status}</span> /{" "}
                        <span className="capitalize">{b.paymentStatus}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">No bookings found</li>
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Payments</h3>
                <ul className="space-y-1">
                  {selectedCustomer.payments &&
                  selectedCustomer.payments.length > 0 ? (
                    selectedCustomer.payments.map((p) => (
                      <li key={p.id} className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {p.date}: £{p.amount} -{" "}
                        <span className="capitalize">{p.status}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">No payments found</li>
                  )}
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleEditCustomer}
        customer={editingCustomer}
        isLoading={false}
      />

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
