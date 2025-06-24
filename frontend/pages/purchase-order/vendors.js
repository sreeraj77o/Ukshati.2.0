"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, 
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { TableSkeleton, FormSkeleton } from "@/components/skeleton";

export default function ManageVendors() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    payment_terms: "",
    status: "active"
  });
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  }, [searchTerm, vendors]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch('/api/purchase/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const vendorsData = await response.json();
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setFilteredVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      setFilteredVendors([]);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      payment_terms: "",
      status: "active"
    });
    setEditId(null);
    setShowModal(true);
  };

  useEffect(() => {
    if (editId !== null) {
      console.log("editId changed:", editId);
    }
  }, [editId]);

  const openEditModal = (vendor) => {
    setFormData({
      id: vendor.id,
      name: vendor.name || "",
      contact_person: vendor.contact_person || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      category: vendor.category || "",
      payment_terms: vendor.payment_terms || "",
      status: vendor.status || "active"
    });
    setEditId(vendor.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const url = editId ? `/api/purchase/vendors?id=${editId}` : '/api/purchase/vendors';
      const method = editId ? 'PUT' : 'POST';

      // Remove id from payload for PUT/POST
      const { id, ...payload } = formData;

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();

      // Instead of updating local state, re-fetch from backend:
      await fetchVendors();

      setNotification({
        type: "success",
        message: editId ? "Vendor updated successfully!" : "Vendor added successfully!"
      });

      closeModal();
    } catch (error) {
      console.error("Error saving vendor:", error);
      setNotification({
        type: "error",
        message: "Failed to save vendor. Please try again."
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDeleteVendor = (id) => {
    setConfirmDelete(id);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const deleteVendor = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await fetch(`/api/purchase/vendors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove vendor from state
      setVendors(prev => Array.isArray(prev) ? prev.filter(vendor => vendor.id !== id) : []);
      setNotification({
        type: "success",
        message: "Vendor deleted successfully!"
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      setNotification({
        type: "error",
        message: "Failed to delete vendor. Please try again."
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/purchase-order/home" />
      </div>
      <ScrollToTopButton />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between ${
          notification.type === "success" ? "bg-green-800/90" : "bg-red-800/90"
        }`}>
          <div className="flex items-center">
            {notification.type === "success" ? (
              <FiCheckCircle className="text-green-400 mr-2" />
            ) : (
              <FiAlertCircle className="text-red-400 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={dismissNotification} className="ml-4 text-gray-300 hover:text-white">
            <FiX />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-8">Vendor Management</h1>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={fetchVendors}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors ml-auto md:ml-0"
            >
              <FiPlus />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700">
          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email/Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => (
                      <tr 
                        key={vendor.id} 
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-gray-400">Since {vendor.created_at}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {vendor.contact_person}
                        </td>
                        <td className="px-6 py-4">
                          <div>{vendor.email}</div>
                          <div className="text-sm text-gray-400">{vendor.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {vendor.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            vendor.status === 'active' 
                              ? 'bg-green-900/50 text-green-400' 
                              : 'bg-red-900/50 text-red-400'
                          }`}>
                            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(vendor)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            <FiEdit2 className="inline" />
                          </button>
                          <button
                            onClick={() => confirmDeleteVendor(vendor.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FiTrash2 className="inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                        No vendors found. {searchTerm && "Try a different search term or"}{" "}
                        <button 
                          onClick={openAddModal}
                          className="text-blue-400 hover:underline"
                        >
                          add a new vendor
                        </button>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editId ? "Edit Vendor" : "Add New Vendor"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {formSubmitting ? (
              <FormSkeleton fields={8} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vendor Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Terms */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Payment Terms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div></div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-md font-semibold transition-all hover:from-blue-700 hover:to-blue-600"
                >
                  {editId ? "Update Vendor" : "Add Vendor"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
