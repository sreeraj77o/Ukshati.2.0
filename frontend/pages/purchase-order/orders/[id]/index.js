"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FiEdit, FiDownload, FiEye, FiCalendar, FiUser, FiMapPin,
  FiFileText, FiDollarSign, FiPackage, FiArrowLeft, FiPrinter
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";
import generatePurchaseOrderPDF from "@/components/purchase/PurchaseOrderPDF";

export default function ViewPurchaseOrder() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please log in again.");
        router.push("/");
        return;
      }

      // Fetch order details
      const orderRes = await fetch(`/api/purchase/orders?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!orderRes.ok) {
        throw new Error('Failed to fetch order data');
      }

      const orderData = await orderRes.json();
      setOrder(orderData.order);
      setItems(orderData.items);

      // Fetch vendor and project details
      const [vendorsRes, projectsRes] = await Promise.all([
        fetch('/api/purchase/vendors', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (vendorsRes.ok && projectsRes.ok) {
        const vendorsData = await vendorsRes.json();
        const projectsData = await projectsRes.json();

        const foundVendor = vendorsData.find(v => v.id === orderData.order.vendor_id);
        const foundProject = projectsData.find(p => 
          p.id === orderData.order.project_id || p.pid === orderData.order.project_id
        );

        setVendor(foundVendor);
        setProject(foundProject);
      }

    } catch (error) {
      console.error("Error fetching order data:", error);
      setError("Failed to load purchase order data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-300";
      case "sent":
        return "bg-blue-500/20 text-blue-300";
      case "confirmed":
        return "bg-yellow-500/20 text-yellow-300";
      case "processing":
        return "bg-purple-500/20 text-purple-300";
      case "partially_received":
        return "bg-orange-500/20 text-orange-300";
      case "completed":
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
      case "confirmed":
        return "Confirmed";
      case "processing":
        return "Processing";
      case "partially_received":
        return "Partially Received";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown';
    }
  };

  const handleDownloadPDF = () => {
    if (!order || !items) return;

    const poData = {
      po_number: order.po_number || "PO-" + order.id,
      vendor_name: vendor?.name || "Unknown Vendor",
      project_name: project?.name || project?.pname || "Unknown Project",
      order_date: order.order_date || order.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      vendor_address: vendor?.address || "N/A",
      vendor_contact: vendor?.contact_person || vendor?.phone || "N/A",
      items: items.map(item => ({
        item_name: item.item_name || "N/A",
        description: item.description || "",
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "pcs",
        unit_price: Number(item.unit_price) || 0,
        total_price: Number(item.quantity) * Number(item.unit_price) || 0
      })),
      subtotal: Number(order.subtotal) || 0,
      tax_amount: Number(order.tax_amount) || 0,
      total_amount: Number(order.total_amount) || 0,
      expected_delivery_date: order.expected_delivery_date || "",
      shipping_address: order.shipping_address || "N/A",
      payment_terms: order.payment_terms || "Net 30 days",
      notes: order.notes || ""
    };

    generatePurchaseOrderPDF(poData);
  };

  const handleViewPDF = () => {
    setShowPDF(!showPDF);
    if (!showPDF) {
      // Generate PDF data for viewing
      handleDownloadPDF();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/orders/AllOrders" />
        <div className="max-w-6xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Purchase Order Details</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/orders/AllOrders" />
        <div className="max-w-6xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Purchase Order Not Found</h1>
          <p className="text-gray-400">{error || "The requested purchase order could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/orders/AllOrders" />
      <ScrollToTopButton />
      
      <div className="max-w-6xl mx-auto mt-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Purchase Order Details</h1>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-blue-400">{order.po_number}</span>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push(`/purchase-order/orders/${id}/edit`)}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiDownload className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={handleViewPDF}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiEye className="mr-2" />
              {showPDF ? 'Hide PDF' : 'View PDF'}
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        {showPDF && (
          <div className="mb-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">PDF Preview</h3>
              <button
                onClick={() => setShowPDF(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <FiFileText className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                PDF preview is not available in this view. Click "Download PDF" to generate and view the full PDF document.
              </p>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center mx-auto"
              >
                <FiDownload className="mr-2" />
                Generate PDF
              </button>
            </div>
          </div>
        )}

        {/* Order Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiFileText className="mr-2" />
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">PO Number:</span>
                <span className="font-medium">{order.po_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Date:</span>
                <span>{order.order_date || order.created_at?.split('T')[0] || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Delivery:</span>
                <span>{order.expected_delivery_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Terms:</span>
                <span>{order.payment_terms || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiUser className="mr-2" />
              Vendor Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor Name:</span>
                <span className="font-medium">{vendor?.name || 'Unknown Vendor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact Person:</span>
                <span>{vendor?.contact_person || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span>{vendor?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span>{vendor?.email || 'N/A'}</span>
              </div>
              {vendor?.address && (
                <div>
                  <span className="text-gray-400">Address:</span>
                  <p className="mt-1 text-sm">{vendor.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiPackage className="mr-2" />
              Project Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Project Name:</span>
                <span className="font-medium">{project?.name || project?.pname || 'Unknown Project'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Project ID:</span>
                <span>{project?.id || project?.pid || 'N/A'}</span>
              </div>
              {project?.cname && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Client:</span>
                  <span>{project.cname}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiMapPin className="mr-2" />
              Shipping Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Shipping Address:</span>
                <p className="mt-1 text-sm">{order.shipping_address || 'N/A'}</p>
              </div>
              {order.notes && (
                <div>
                  <span className="text-gray-400">Notes:</span>
                  <p className="mt-1 text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase">Item</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase">Description</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Qty</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Unit</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Unit Price</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-400">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{item.unit}</td>
                    <td className="px-4 py-3 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₹{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2" />
            Order Summary
          </h3>
          <div className="max-w-md ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax (18%):</span>
                <span>₹{Number(order.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-400">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
