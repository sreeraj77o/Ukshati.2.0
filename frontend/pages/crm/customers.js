/**
 * CRM Customers Page - Well Structured
 * Clean, organized customer management with reusable components
 * Maintains existing UI style and functionality
 */

'use client';
import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiUpload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";

// Import reusable components
import { Card, Table, Button, Modal, SearchInput } from '../../src/components/ui';
import { CustomerForm, ImportExport } from '../../src/components/crm';
import { useCustomers } from '../../src/hooks/useCRM';

export default function Customers() {
  // Custom hook for customer data management
  const {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    remark: "",
    status: "lead"
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.cname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cphone.includes(searchTerm)
  );

  // Table columns configuration
  const columns = [
    { key: 'cname', label: 'Name', sortable: true },
    { key: 'cphone', label: 'Phone', sortable: true },
    { key: 'alternate_phone', label: 'Alt Phone', sortable: false, render: (value) => value || '-' },
    { key: 'status', label: 'Status', sortable: true, render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'customer' ? 'bg-green-600/20 text-green-400' :
        value === 'prospect' ? 'bg-blue-600/20 text-blue-400' :
        value === 'lead' ? 'bg-yellow-600/20 text-yellow-400' :
        'bg-gray-600/20 text-gray-400'
      }`}>
        {value}
      </span>
    )},
    { key: 'remark', label: 'Remarks', sortable: false, render: (value) => value || '-' },
  ];

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      altPhone: "",
      remark: "",
      status: "lead"
    });
    setSelectedCustomer(null);
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    setFormSubmitting(true);
    try {
      let result;
      if (selectedCustomer) {
        result = await updateCustomer(selectedCustomer.cid, data);
      } else {
        result = await addCustomer(data);
      }

      if (result.success) {
        showNotification('success', selectedCustomer ? 'Customer updated successfully!' : 'Customer added successfully!');
        resetForm();
        setShowAddModal(false);
        setShowEditModal(false);
      } else {
        showNotification('error', result.error || 'Failed to save customer');
      }
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle editing a customer
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.cname,
      phone: customer.cphone,
      altPhone: customer.alternate_phone || "",
      remark: customer.remark || "",
      status: customer.status || "lead"
    });
    setShowEditModal(true);
  };

  // Handle deleting a customer
  const handleDelete = async (customer) => {
    if (!window.confirm("Are you sure you want to delete this customer and all related data?")) return;

    try {
      const result = await deleteCustomer(customer.cid);
      if (result.success) {
        showNotification('success', 'Customer deleted successfully!');
      } else {
        showNotification('error', result.error || 'Failed to delete customer');
      }
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  // Handle import
  const handleImport = (importedData) => {
    // Process imported data and add customers
    const processedData = importedData.map(row => ({
      name: row.name || row.cname || '',
      phone: row.phone || row.cphone || '',
      altPhone: row.altPhone || row.alternate_phone || '',
      status: row.status || 'lead',
      remark: row.remark || ''
    }));

    // Add each customer
    processedData.forEach(async (customerData) => {
      if (customerData.name && customerData.phone) {
        await addCustomer(customerData);
      }
    });

    showNotification('success', `Imported ${processedData.length} customers successfully!`);
    setShowImportModal(false);
  };

  // Table actions
  const tableActions = (customer) => (
    <div className="flex space-x-2">
      <Button
        size="small"
        variant="secondary"
        icon={<FiEdit />}
        onClick={() => handleEdit(customer)}
      >
        Edit
      </Button>
      <Button
        size="small"
        variant="danger"
        icon={<FiTrash2 />}
        onClick={() => handleDelete(customer)}
      >
        Delete
      </Button>
    </div>
  );
  // Template for import
  const importTemplate = {
    name: 'John Doe',
    phone: '1234567890',
    altPhone: '0987654321',
    status: 'lead',
    remark: 'Sample remark'
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <div className="bg-black shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 py-4 sm:h-16">
            <div className="hidden sm:flex">
              <BackButton route="/crm/home" />
            </div>
            <div className="flex items-center justify-between sm:justify-start">
              <h1 className="ml-2 sm:ml-4 text-xl font-bold text-indigo-400">Customer Management</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                icon={<FiUpload />}
                variant="secondary"
                onClick={() => setShowImportModal(true)}
              >
                Import
              </Button>
              <Button
                icon={<FiPlus />}
                onClick={() => setShowAddModal(true)}
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
              className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="text-sm text-gray-400">
            Total: {filteredCustomers.length} customers
          </div>
        </div>

        {/* Customers Table */}
        <Card title="Customers">
          <Table
            columns={columns}
            data={filteredCustomers}
            loading={loading}
            emptyMessage="No customers found"
            actions={tableActions}
          />
        </Card>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Customer"
        size="large"
      >
        <CustomerForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
          loading={formSubmitting}
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Customer"
        size="large"
      >
        <CustomerForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowEditModal(false);
            resetForm();
          }}
          isEditing={true}
          loading={formSubmitting}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Customers"
        size="large"
      >
        <ImportExport
          data={customers}
          onImport={handleImport}
          exportFilename="customers"
          importTemplate={[importTemplate]}
        />
      </Modal>

      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-3 rounded-lg shadow-lg max-w-xs z-50 ${
            notification.type === 'error' ? 'bg-red-900 text-red-100' :
            notification.type === 'success' ? 'bg-green-900 text-green-100' :
            'bg-indigo-900 text-indigo-100'
          }`}
        >
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </motion.div>
      )}

      <ScrollToTopButton />
    </div>
  );
}
