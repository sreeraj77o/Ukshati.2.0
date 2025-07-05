import { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layouts';
import { Button, Input, Select, Table, Modal, Alert } from '../../components/ui';
import { CustomerForm } from '../../components/features/crm';
import { useCustomers } from '../../hooks/crm';
import { usePagination, useDebounce } from '../../hooks/shared';
import { formatPhoneNumber, truncateText } from '../../utils/formatters';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';

export default function CustomersRefactored() {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  // Custom hooks
  const {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  } = useCustomers();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and search customers
  const filteredCustomers = searchCustomers(debouncedSearchTerm).filter(customer => {
    if (statusFilter === 'all') return true;
    return customer.status === statusFilter;
  });

  const {
    currentData: paginatedCustomers,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage
  } = usePagination(filteredCustomers, 10);

  // Event handlers
  const handleAddCustomer = async (customerData) => {
    try {
      await addCustomer(customerData);
      setShowAddModal(false);
      showAlert('Customer added successfully!', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditCustomer = async (customerData) => {
    try {
      await updateCustomer(selectedCustomer.cid, customerData);
      setShowEditModal(false);
      setSelectedCustomer(null);
      showAlert('Customer updated successfully!', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
        showAlert('Customer deleted successfully!', 'success');
      } catch (err) {
        showAlert(err.message, 'error');
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'cname',
      label: 'Name',
      render: (value) => (
        <div className="font-medium text-white">{value}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <div className="text-gray-300">{truncateText(value, 30)}</div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <div className="text-gray-300">{formatPhoneNumber(value)}</div>
      )
    },
    {
      key: 'city',
      label: 'City',
      render: (value) => (
        <div className="text-gray-300">{value || 'N/A'}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
          value === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
        }`}>
          {value || 'lead'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, customer) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(customer)}
            leftIcon={<FiEdit2 />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteCustomer(customer.cid)}
            leftIcon={<FiTrash2 />}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'lead', label: 'Lead' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const headerActions = (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        leftIcon={<FiDownload />}
      >
        Export
      </Button>
      <Button
        variant="outline"
        leftIcon={<FiUpload />}
      >
        Import
      </Button>
      <Button
        variant="primary"
        onClick={() => setShowAddModal(true)}
        leftIcon={<FiPlus />}
      >
        Add Customer
      </Button>
    </div>
  );

  if (error) {
    return (
      <PageLayout title="Customers" subtitle="Manage your customer database">
        <Alert type="error" message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Customers"
      subtitle="Manage your customer database"
      headerActions={headerActions}
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          dismissible
          onDismiss={() => setAlert(null)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <Table
          columns={columns}
          data={paginatedCustomers}
          loading={loading}
          emptyState={
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No customers found</p>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                leftIcon={<FiPlus />}
              >
                Add Your First Customer
              </Button>
            </div>
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
        size="lg"
      >
        <CustomerForm
          onSubmit={handleAddCustomer}
          onCancel={() => setShowAddModal(false)}
          submitText="Add Customer"
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCustomer(null);
        }}
        title="Edit Customer"
        size="lg"
      >
        {selectedCustomer && (
          <CustomerForm
            initialData={selectedCustomer}
            onSubmit={handleEditCustomer}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedCustomer(null);
            }}
            submitText="Update Customer"
          />
        )}
      </Modal>
    </PageLayout>
  );
}
