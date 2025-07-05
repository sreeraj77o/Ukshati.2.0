import { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layouts';
import { Button, Input, Select, Table, Modal, Alert } from '../../components/ui';
import { StockForm } from '../../components/features/inventory';
import { useInventory } from '../../hooks/inventory';
import { usePagination, useDebounce } from '../../hooks/shared';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INVENTORY_UNIT_LABELS, STOCK_STATUS } from '../../constants/features';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiAlertTriangle, FiUpload, FiDollarSign } from 'react-icons/fi';

export default function StocksRefactored() {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  // Custom hooks
  const {
    stocks,
    categories,
    loading,
    error,
    addStock,
    updateStock,
    deleteStock,
    searchStocks,
    getLowStockItems,
    getInventoryStats
  } = useInventory();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter stocks
  const filteredStocks = searchStocks(debouncedSearchTerm).filter(stock => {
    if (categoryFilter !== 'all' && stock.category_id !== categoryFilter) return false;
    
    if (statusFilter !== 'all') {
      const stockStatus = getStockStatus(stock);
      if (stockStatus !== statusFilter) return false;
    }
    
    return true;
  });

  const {
    currentData: paginatedStocks,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage
  } = usePagination(filteredStocks, 10);

  // Helper functions
  const getStockStatus = (stock) => {
    if (stock.quantity === 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (stock.quantity <= (stock.minimum_stock || 0)) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  // Event handlers
  const handleAddStock = async (stockData) => {
    try {
      await addStock(stockData);
      setShowAddModal(false);
      showAlert('Stock item added successfully!', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditStock = async (stockData) => {
    try {
      await updateStock(selectedStock.id, stockData);
      setShowEditModal(false);
      setSelectedStock(null);
      showAlert('Stock item updated successfully!', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        await deleteStock(stockId);
        showAlert('Stock item deleted successfully!', 'success');
      } catch (err) {
        showAlert(err.message, 'error');
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const openEditModal = (stock) => {
    setSelectedStock(stock);
    setShowEditModal(true);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'item_name',
      label: 'Item Name',
      render: (value, stock) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-gray-400">{getCategoryName(stock.category_id)}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value, stock) => (
        <div className="flex items-center space-x-2">
          <span className="text-white">{value}</span>
          <span className="text-gray-400 text-sm">{INVENTORY_UNIT_LABELS[stock.unit] || stock.unit}</span>
        </div>
      )
    },
    {
      key: 'price_per_unit',
      label: 'Price/Unit',
      render: (value) => (
        <span className="text-white">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'total_value',
      label: 'Total Value',
      render: (_, stock) => (
        <span className="text-white font-medium">
          {formatCurrency(stock.quantity * stock.price_per_unit)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, stock) => {
        const status = getStockStatus(stock);
        const statusColors = {
          [STOCK_STATUS.IN_STOCK]: 'bg-green-600/20 text-green-400',
          [STOCK_STATUS.LOW_STOCK]: 'bg-yellow-600/20 text-yellow-400',
          [STOCK_STATUS.OUT_OF_STOCK]: 'bg-red-600/20 text-red-400'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
            {status === STOCK_STATUS.IN_STOCK && 'In Stock'}
            {status === STOCK_STATUS.LOW_STOCK && 'Low Stock'}
            {status === STOCK_STATUS.OUT_OF_STOCK && 'Out of Stock'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, stock) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(stock)}
            leftIcon={<FiEdit2 />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteStock(stock.id)}
            leftIcon={<FiTrash2 />}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: STOCK_STATUS.IN_STOCK, label: 'In Stock' },
    { value: STOCK_STATUS.LOW_STOCK, label: 'Low Stock' },
    { value: STOCK_STATUS.OUT_OF_STOCK, label: 'Out of Stock' }
  ];

  const stats = getInventoryStats();
  const lowStockItems = getLowStockItems();

  const headerActions = (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        leftIcon={<FiUpload />}
      >
        Import CSV
      </Button>
      <Button
        variant="primary"
        onClick={() => setShowAddModal(true)}
        leftIcon={<FiPlus />}
      >
        Add Stock
      </Button>
    </div>
  );

  if (error) {
    return (
      <PageLayout title="Inventory Management" subtitle="Manage your stock items">
        <Alert type="error" message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Inventory Management"
      subtitle="Manage your stock items"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
            </div>
            <FiPackage className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
            </div>
            <FiDollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.lowStockItems}</p>
            </div>
            <FiAlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfStockItems}</p>
            </div>
            <FiAlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert
          type="warning"
          title="Low Stock Alert"
          message={`${lowStockItems.length} items are running low on stock. Please reorder soon.`}
          className="mb-6"
        />
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
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

      {/* Stock Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <Table
          columns={columns}
          data={paginatedStocks}
          loading={loading}
          emptyState={
            <div className="text-center py-8">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-400 mb-4">No stock items found</p>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                leftIcon={<FiPlus />}
              >
                Add Your First Stock Item
              </Button>
            </div>
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredStocks.length)} of {filteredStocks.length} items
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

      {/* Add Stock Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Stock Item"
        size="lg"
      >
        <StockForm
          categories={categories}
          onSubmit={handleAddStock}
          onCancel={() => setShowAddModal(false)}
          submitText="Add Stock"
        />
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStock(null);
        }}
        title="Edit Stock Item"
        size="lg"
      >
        {selectedStock && (
          <StockForm
            categories={categories}
            initialData={selectedStock}
            onSubmit={handleEditStock}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedStock(null);
            }}
            submitText="Update Stock"
          />
        )}
      </Modal>
    </PageLayout>
  );
}
