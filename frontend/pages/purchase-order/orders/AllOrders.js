"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiDownload,
  FiChevronDown, FiChevronUp, FiX, FiCheck, FiAlertCircle
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { TableSkeleton } from "@/components/skeleton";
import { motion } from "framer-motion";

export default function AllPurchaseOrders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, orders, sortBy, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/purchase/orders');
      // const data = await response.json();
      // setOrders(data);
      
      // Simulated data
      setTimeout(() => {
        const mockOrders = [
          {
            id: 1,
            po_number: "PO-20230915-001",
            vendor_id: 1,
            vendor_name: "ABC Suppliers Ltd.",
            project_id: 2,
            project_name: "Office Automation Project",
            order_date: "2023-09-15",
            expected_delivery_date: "2023-09-30",
            status: "delivered",
            total_amount: 85000,
            items: [
              {
                id: 1,
                item_name: "Desktop Computer",
                description: "Core i7, 16GB RAM, 512GB SSD",
                quantity: 5,
                unit: "Nos",
                unit_price: 12000,
                total_price: 60000
              },
              {
                id: 2,
                item_name: "Office Chair",
                description: "Ergonomic with lumbar support",
                quantity: 10,
                unit: "Nos",
                unit_price: 2500,
                total_price: 25000
              }
            ]
          },
          {
            id: 2,
            po_number: "PO-20230910-002",
            vendor_id: 2,
            vendor_name: "XYZ Industrial Equipment",
            project_id: 1,
            project_name: "Smart Irrigation System - Phase 1",
            order_date: "2023-09-10",
            expected_delivery_date: "2023-09-25",
            status: "sent",
            total_amount: 65000,
            items: [
              {
                id: 3,
                item_name: "Water Pump",
                description: "1HP, 220V AC",
                quantity: 2,
                unit: "Nos",
                unit_price: 15000,
                total_price: 30000
              },
              {
                id: 4,
                item_name: "PVC Pipes",
                description: "2 inch diameter, 10ft length",
                quantity: 50,
                unit: "Nos",
                unit_price: 500,
                total_price: 25000
              },
              {
                id: 5,
                item_name: "Soil Moisture Sensors",
                description: "Waterproof, 3V DC",
                quantity: 20,
                unit: "Nos",
                unit_price: 500,
                total_price: 10000
              }
            ]
          },
          {
            id: 3,
            po_number: "PO-20230905-003",
            vendor_id: 3,
            vendor_name: "Global Tech Solutions",
            project_id: 3,
            project_name: "Residential Water Management",
            order_date: "2023-09-05",
            expected_delivery_date: "2023-09-20",
            status: "delivered",
            total_amount: 45000,
            items: [
              {
                id: 6,
                item_name: "Water Flow Meter",
                description: "Digital display, 1 inch connection",
                quantity: 15,
                unit: "Nos",
                unit_price: 3000,
                total_price: 45000
              }
            ]
          },
          {
            id: 4,
            po_number: "PO-20230901-004",
            vendor_id: 4,
            vendor_name: "Metro Office Supplies",
            project_id: 2,
            project_name: "Office Automation Project",
            order_date: "2023-09-01",
            expected_delivery_date: "2023-09-15",
            status: "sent",
            total_amount: 35000,
            items: [
              {
                id: 7,
                item_name: "Printer",
                description: "Color LaserJet, Network enabled",
                quantity: 2,
                unit: "Nos",
                unit_price: 12500,
                total_price: 25000
              },
              {
                id: 8,
                item_name: "Toner Cartridge",
                description: "Black, 5000 pages yield",
                quantity: 5,
                unit: "Nos",
                unit_price: 2000,
                total_price: 10000
              }
            ]
          },
          {
            id: 5,
            po_number: "PO-20230825-005",
            vendor_id: 5,
            vendor_name: "Eastern Hardware Co.",
            project_id: 1,
            project_name: "Smart Irrigation System - Phase 1",
            order_date: "2023-08-25",
            expected_delivery_date: "2023-09-10",
            status: "draft",
            total_amount: 15000,
            items: [
              {
                id: 9,
                item_name: "Control Panel Box",
                description: "Weatherproof, IP65 rated",
                quantity: 3,
                unit: "Nos",
                unit_price: 5000,
                total_price: 15000
              }
            ]
          }
        ];
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(order => order.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.order_date) - new Date(b.order_date);
          break;
        case "amount":
          comparison = a.total_amount - b.total_amount;
          break;
        case "po_number":
          comparison = a.po_number.localeCompare(b.po_number);
          break;
        case "vendor":
          comparison = a.vendor_name.localeCompare(b.vendor_name);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-300";
      case "sent":
        return "bg-blue-500/20 text-blue-300";
      case "delivered":
        return "bg-green-500/20 text-green-300";
      case "cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleDeleteConfirm = (orderId) => {
    setConfirmDelete(orderId);
  };

  const handleDelete = async (orderId) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/purchase/orders/${orderId}`, {
      //   method: 'DELETE'
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update state
      setOrders(orders.filter(order => order.id !== orderId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
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
              {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
            </button>

            {/* Create New Button */}
            <button
              onClick={() => router.push("/purchase-order/orders/new")}
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Order Date</option>
                <option value="po_number">PO Number</option>
                <option value="vendor">Vendor</option>
                <option value="amount">Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
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
                      <h3 className="text-xl font-semibold">{order.po_number}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Vendor: {order.vendor_name} | Project: {order.project_name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Ordered: {order.order_date} | Expected: {order.expected_delivery_date}
                    </p>
                  </div>
                  <div className="flex items-center mt-3 md:mt-0">
                    <p className="text-xl font-semibold mr-4">₹{order.total_amount.toLocaleString()}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/purchase/orders/${order.id}`);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/purchase/orders/${order.id}/edit`);
                        }}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                        title="Edit Order"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={(e) => {
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

                {/* Order Items */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-700 p-4">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-700/50 text-left">
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Item</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Description</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Qty</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Unit</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Unit Price</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {order.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-700/30">
                              <td className="px-4 py-3">{item.item_name}</td>
                              <td className="px-4 py-3 text-gray-400">{item.description}</td>
                              <td className="px-4 py-3 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">{item.unit}</td>
                              <td className="px-4 py-3 text-right">₹{item.unit_price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">₹{item.total_price.toFixed(2)}</td>
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
              <h3 className="text-xl font-medium text-gray-300 mb-2">No orders found</h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? "Try a different search term or clear the search filter." 
                  : "No orders have been created yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}