"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiSearch, FiPackage, FiCheckCircle, FiAlertCircle, 
  FiX, FiChevronDown, FiChevronUp, FiCalendar, FiClipboard
} from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { TableSkeleton, FormSkeleton } from "@/components/skeleton";

export default function ReceiveGoods() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);
  const [receiptData, setReceiptData] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(pendingOrders);
    } else {
      const filtered = pendingOrders.filter(order => 
        order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, pendingOrders]);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/purchase/orders?status=pending');
      // const data = await response.json();
      // setPendingOrders(data);
      
      // Simulated data
      setTimeout(() => {
        const mockOrders = [
          {
            id: 1,
            po_number: "PO-20230815-001",
            vendor_id: 1,
            vendor_name: "ABC Suppliers Ltd.",
            project_id: 2,
            project_name: "Office Automation Project",
            order_date: "2023-08-15",
            expected_delivery_date: "2023-08-30",
            status: "sent",
            total_amount: 45000,
            items: [
              {
                id: 1,
                item_name: "Desktop Computer",
                description: "Core i7, 16GB RAM, 512GB SSD",
                quantity: 5,
                unit: "Nos",
                unit_price: 6000,
                received_quantity: 0
              },
              {
                id: 2,
                item_name: "Office Chair",
                description: "Ergonomic with lumbar support",
                quantity: 10,
                unit: "Nos",
                unit_price: 1500,
                received_quantity: 0
              }
            ]
          },
          {
            id: 2,
            po_number: "PO-20230820-002",
            vendor_id: 3,
            vendor_name: "Global Tech Solutions",
            project_id: 1,
            project_name: "Smart Irrigation System - Phase 1",
            order_date: "2023-08-20",
            expected_delivery_date: "2023-09-05",
            status: "partially_received",
            total_amount: 78500,
            items: [
              {
                id: 3,
                item_name: "Water Pump",
                description: "1HP Submersible Pump",
                quantity: 5,
                unit: "Nos",
                unit_price: 8500,
                received_quantity: 2
              },
              {
                id: 4,
                item_name: "Soil Moisture Sensor",
                description: "Waterproof soil moisture detection",
                quantity: 20,
                unit: "Nos",
                unit_price: 1200,
                received_quantity: 10
              },
              {
                id: 5,
                item_name: "Control Panel",
                description: "Smart irrigation controller",
                quantity: 3,
                unit: "Nos",
                unit_price: 7500,
                received_quantity: 0
              }
            ]
          },
          {
            id: 3,
            po_number: "PO-20230825-003",
            vendor_id: 2,
            vendor_name: "XYZ Industrial Equipment",
            project_id: 3,
            project_name: "Residential Water Management",
            order_date: "2023-08-25",
            expected_delivery_date: "2023-09-10",
            status: "sent",
            total_amount: 35000,
            items: [
              {
                id: 6,
                item_name: "Water Filter",
                description: "Whole house water filtration system",
                quantity: 2,
                unit: "Nos",
                unit_price: 12500,
                received_quantity: 0
              },
              {
                id: 7,
                item_name: "Pressure Tank",
                description: "20 gallon pressure tank",
                quantity: 2,
                unit: "Nos",
                unit_price: 5000,
                received_quantity: 0
              }
            ]
          }
        ];
        setPendingOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setLoading(false);
    }
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

  const openReceiveModal = (order) => {
    setSelectedOrder(order);
    
    // Initialize receipt items from order items
    const items = order.items.map(item => ({
      po_item_id: item.id,
      item_name: item.item_name,
      description: item.description,
      ordered_quantity: item.quantity,
      received_quantity: item.received_quantity,
      remaining_quantity: item.quantity - item.received_quantity,
      quantity_received: 0,
      quality_status: "accepted",
      notes: ""
    }));
    
    setReceiptItems(items);
    setShowReceiveModal(true);
  };

  const closeReceiveModal = () => {
    setShowReceiveModal(false);
    setSelectedOrder(null);
    setReceiptItems([]);
  };

  const handleReceiptDataChange = (e) => {
    const { name, value } = e.target;
    setReceiptData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptItemChange = (index, field, value) => {
    const newItems = [...receiptItems];
    
    if (field === "quantity_received") {
      // Validate quantity
      const numValue = Number(value);
      const maxAllowed = newItems[index].remaining_quantity;
      
      if (numValue > maxAllowed) {
        value = maxAllowed;
      } else if (numValue < 0) {
        value = 0;
      }
    }
    
    newItems[index][field] = value;
    setReceiptItems(newItems);
  };

  const validateReceiptForm = () => {
    // Check if at least one item has quantity > 0
    const hasItems = receiptItems.some(item => Number(item.quantity_received) > 0);
    
    if (!hasItems) {
      setNotification({
        type: "error",
        message: "At least one item must have quantity greater than zero"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    
    if (!validateReceiptForm()) return;
    
    setFormSubmitting(true);
    
    try {
      // Filter out items with zero quantity
      const itemsToReceive = receiptItems.filter(item => 
        Number(item.quantity_received) > 0
      );
      
      const receiptPayload = {
        po_id: selectedOrder.id,
        receipt_date: receiptData.receipt_date,
        notes: receiptData.notes,
        items: itemsToReceive
      };
      
      // Replace with actual API call
      // const response = await fetch('/api/purchase/receipt', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(receiptPayload)
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the local state to reflect changes
      const updatedOrders = pendingOrders.map(order => {
        if (order.id === selectedOrder.id) {
          // Update received quantities for items
          const updatedItems = order.items.map(item => {
            const receivedItem = itemsToReceive.find(ri => ri.po_item_id === item.id);
            if (receivedItem) {
              return {
                ...item,
                received_quantity: item.received_quantity + Number(receivedItem.quantity_received)
              };
            }
            return item;
          });
          
          // Check if all items are fully received
          const allReceived = updatedItems.every(item => 
            item.received_quantity >= item.quantity
          );
          
          // Update order status
          const newStatus = allReceived ? "fully_received" : "partially_received";
          
          return {
            ...order,
            status: newStatus,
            items: updatedItems
          };
        }
        return order;
      });
      
      setPendingOrders(updatedOrders);
      setNotification({
        type: "success",
        message: "Goods receipt created successfully!"
      });
      
      closeReceiveModal();
    } catch (error) {
      console.error("Error creating receipt:", error);
      setNotification({
        type: "error",
        message: "Failed to create receipt. Please try again."
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "sent":
        return "bg-blue-900/50 text-blue-400";
      case "partially_received":
        return "bg-yellow-900/50 text-yellow-400";
      case "fully_received":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-900/50 text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sent":
        return "Pending Receipt";
      case "partially_received":
        return "Partially Received";
      case "fully_received":
        return "Fully Received";
      default:
        return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
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
        <h1 className="text-3xl font-bold mb-8">Receive Goods</h1>

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
        </div>

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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReceiveModal(order);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center mr-3"
                    >
                      <FiPackage className="mr-2" />
                      Receive
                    </button>
                    {expandedOrder === order.id ? (
                      <FiChevronUp className="text-gray-400" />
                    ) : (
                      <FiChevronDown className="text-gray-400" />
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
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Ordered</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Received</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {order.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-700/30">
                              <td className="px-4 py-3">{item.item_name}</td>
                              <td className="px-4 py-3 text-gray-400">{item.description}</td>
                              <td className="px-4 py-3 text-right">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {item.received_quantity} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {item.quantity - item.received_quantity} {item.unit}
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
              <FiPackage className="mx-auto text-4xl text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No pending orders found</h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? "Try a different search term or clear the search filter." 
                  : "All orders have been fully received or no orders have been created yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Receive Goods Modal */}
      {showReceiveModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Receive Goods</h2>
              <button
                onClick={closeReceiveModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleReceiveSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receipt Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Receipt Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="receipt_date"
                      value={receiptData.receipt_date}
                      onChange={handleReceiptChange}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                      disabled={formSubmitting}
                    />
                    <FiCalendar className="absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                {/* Received By */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Received By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="received_by"
                    value={receiptData.received_by}
                    onChange={handleReceiptChange}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                  name="notes"
                  value={receiptData.notes}
                  onChange={handleReceiptChange}
                  rows={2}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formSubmitting}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50 text-left">
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Item</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Description</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Ordered</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Received</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Remaining</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Receive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {selectedOrder.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3">{item.item_name}</td>
                          <td className="px-4 py-3 text-gray-400">{item.description}</td>
                          <td className="px-4 py-3 text-right">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.received_quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.quantity - item.received_quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              name={`received_quantity_${item.id}`}
                              value={receiptItems[item.id] || 0}
                              onChange={handleReceiptItemChange}
                              className="w-20 bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min={0}
                              max={item.quantity - item.received_quantity}
                              disabled={formSubmitting}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeReceiveModal}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-700 disabled:cursor-not-allowed"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Receiving..." : "Receive"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}