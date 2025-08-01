'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { TableSkeleton } from '@/components/skeleton';
import { motion } from 'framer-motion';
import generatePurchaseOrderPDF from '@/components/purchase/PurchaseOrderPDF';

export default function AllPurchaseOrders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        router.push('/');
        return;
      }

      // Fetch orders, vendors, and projects concurrently
      const [ordersRes, vendorsRes, projectsRes] = await Promise.all([
        fetch('/api/purchase/orders', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/purchase/vendors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!ordersRes.ok || !vendorsRes.ok || !projectsRes.ok) {
        throw new Error(
          `Failed to fetch data: Orders (${ordersRes.status}), Vendors (${vendorsRes.status}), Projects (${projectsRes.status})`
        );
      }

      const ordersData = await ordersRes.json();
      const vendorsData = await vendorsRes.json();
      const projectData = await projectsRes.json();

      // Normalize project data
      const normalizedProjects = projectData.map(project => ({
        ...project,
        id: project.pid || project.id,
        name: project.pname || project.name,
      }));

      setVendors(vendorsData);
      setProjects(normalizedProjects);

      // Fetch items for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async order => {
          try {
            const itemsRes = await fetch(
              `/api/purchase/orders?id=${order.id}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            // Find vendor and project
            const vendor = vendorsData.find(v => v.id === order.vendor_id) || {
              name: 'Unknown Vendor',
              address: 'N/A',
              contact_person: 'N/A',
              phone: 'N/A',
            };
            const project = normalizedProjects.find(
              p => p.id === order.project_id || p.pid === order.project_id
            ) || {
              name: 'Unknown Project',
            };

            if (itemsRes.ok) {
              const orderDetails = await itemsRes.json();
              return {
                ...order,
                vendor_name: vendor.name,
                project_name: project.name,
                vendor_address: vendor.address,
                vendor_contact: vendor.contact_person || vendor.phone,
                items:
                  orderDetails.items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    total_price:
                      Number(item.quantity) * Number(item.unit_price),
                  })) || [],
              };
            } else {
              console.warn(`Failed to fetch items for order ${order.id}`);
              return {
                ...order,
                vendor_name: vendor.name,
                project_name: project.name,
                vendor_address: vendor.address,
                vendor_contact: vendor.contact_person || vendor.phone,
                items: [],
              };
            }
          } catch (error) {
            console.error(`Error fetching items for order ${order.id}:`, error);
            return {
              ...order,
              vendor_name: 'Unknown Vendor',
              project_name: 'Unknown Project',
              vendor_address: 'N/A',
              vendor_contact: 'N/A',
              items: [],
            };
          }
        })
      );

      console.log('Processed orders with details:', ordersWithDetails);
      setOrders(ordersWithDetails);
      setFilteredOrders(ordersWithDetails);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(
        error.message || 'Failed to load purchase orders. Please try again.'
      );
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const applyFilters = useCallback(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        order =>
          order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.order_date) - new Date(b.order_date);
          break;
        case 'amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'po_number':
          comparison = a.po_number?.localeCompare(b.po_number || '');
          break;
        case 'vendor':
          comparison = a.vendor_name?.localeCompare(b.vendor_name || '');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleOrderExpand = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = field => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <FiChevronUp className="ml-1" />
    ) : (
      <FiChevronDown className="ml-1" />
    );
  };

  const getStatusBadgeClass = status => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-300';
      case 'sent':
        return 'bg-blue-500/20 text-blue-300';
      case 'confirmed':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'processing':
        return 'bg-purple-500/20 text-purple-300';
      case 'partially_received':
        return 'bg-orange-500/20 text-orange-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'partially_received':
        return 'Partially Received';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
          : 'Unknown';
    }
  };

  const handleDeleteConfirm = orderId => {
    setConfirmDelete(orderId);
  };

  const handleDelete = async orderId => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        router.push('/');
        return;
      }

      const response = await fetch(`/api/purchase/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete order: ${response.status}`);
      }

      setOrders(orders.filter(order => order.id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDownloadPDF = order => {
    // Find vendor and project for additional details
    const vendor = vendors.find(v => v.id === order.vendor_id) || {
      name: order.vendor_name || 'Unknown Vendor',
      address: order.vendor_address || 'N/A',
      contact_person: order.vendor_contact || 'N/A',
      phone: order.vendor_contact || 'N/A',
    };
    const project = projects.find(
      p => p.id === order.project_id || p.pid === order.project_id
    ) || {
      name: order.project_name || 'Unknown Project',
    };

    const poData = {
      po_number: order.po_number || 'PO-' + order.id,
      vendor_name: vendor.name,
      project_name: project.name,
      order_date: order.order_date || new Date().toISOString().split('T')[0],
      vendor_address: vendor.address || 'N/A',
      vendor_contact: vendor.contact_person || vendor.phone || 'N/A',
      items: order.items.map(item => ({
        item_name: item.item_name || 'N/A',
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'pcs',
        unit_price: Number(item.unit_price) || 0,
        total_price: Number(item.quantity) * Number(item.unit_price) || 0,
      })),
      subtotal: Number(order.subtotal) || 0,
      tax_amount: Number(order.tax_amount) || 0,
      total_amount: Number(order.total_amount) || 0,
      expected_delivery_date: order.expected_delivery_date || '',
      shipping_address: order.shipping_address || 'N/A',
      payment_terms: order.payment_terms || 'Net 30 days',
      notes: order.notes || '',
    };

    console.log('PO Data for PDF:', poData);
    generatePurchaseOrderPDF(poData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/purchase-order/home" />
      </div>
      <ScrollToTopButton />

      {/* Main Content */}
      <div className="container mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-8">Purchase Orders</h1>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search orders..."
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

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiFilter className="mr-2" />
              Filters
              {showFilters ? (
                <FiChevronUp className="ml-2" />
              ) : (
                <FiChevronDown className="ml-2" />
              )}
            </button>

            {/* Create New Button */}
            <button
              onClick={() => router.push('/purchase-order/orders/new')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiPlus className="mr-2" />
              New Order
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="partially_received">Partially Received</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Order Date</option>
                <option value="po_number">PO Number</option>
                <option value="vendor">Vendor</option>
                <option value="amount">Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-400 mr-3" />
                <div>
                  <h3 className="text-red-400 font-medium">
                    Error Loading Orders
                  </h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700">
              <TableSkeleton columns={5} rows={3} />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700"
              >
                {/* Order Header */}
                <div
                  className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold">
                        {order.po_number}
                      </h3>
                      <span
                        className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Vendor: {order.vendor_name || 'Unknown'} | Project:{' '}
                      {order.project_name || 'Unknown'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Ordered: {order.order_date} | Expected:{' '}
                      {order.expected_delivery_date}
                    </p>
                  </div>
                  <div className="flex items-center mt-3 md:mt-0">
                    <p className="text-xl font-semibold mr-4">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/purchase-order/orders/${order.id}`);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push(
                            `/purchase-order/orders/${order.id}/edit`
                          );
                        }}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                        title="Edit Order"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDownloadPDF(order);
                        }}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-full"
                        title="Download PDF"
                      >
                        <FiDownload />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteConfirm(order.id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                        title="Delete Order"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {expandedOrder === order.id ? (
                      <FiChevronUp className="ml-2 text-gray-400" />
                    ) : (
                      <FiChevronDown className="ml-2 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Confirm Delete Dialog */}
                {confirmDelete === order.id && (
                  <div className="bg-gray-900/80 border-t border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-red-400">
                        Are you sure you want to delete {order.po_number}?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelDelete}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-700 p-4">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-700/50 text-left">
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">
                              Item
                            </th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">
                              Description
                            </th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">
                              Qty
                            </th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">
                              Unit
                            </th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">
                              Unit Price
                            </th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {order.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-700/30">
                              <td className="px-4 py-3">{item.item_name}</td>
                              <td className="px-4 py-3 text-gray-400">
                                {item.description}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {item.unit}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ₹{item.unit_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ₹{item.total_price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
              <FiSearch className="mx-auto text-4xl text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                No orders found
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? 'Try a different search term or clear the search filter.'
                  : 'No orders have been created yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
