"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FiPlus, FiTrash2, FiCalendar, FiDollarSign, FiSave,
  FiX, FiAlertCircle, FiCheckCircle, FiUsers
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";
import generatePurchaseOrderPDF from "@/components/purchase/PurchaseOrderPDF";

export default function NewPurchaseOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    project_id: "",
    vendor_id: "",
    expected_delivery_date: "",
    shipping_address: "",
    payment_terms: "Net 30 days",
    notes: "",
    items: [{ item_name: "", description: "", quantity: "", unit: "pcs", unit_price: "" }],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          console.error("No authentication found, redirecting to login");
          router.push("/");
          return;
        }

        setLoading(true);
        const [projectRes, vendorsRes] = await Promise.all([
          fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/purchase/vendors', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!projectRes.ok || !vendorsRes.ok) {
          throw new Error(`Failed to fetch data: Projects (${projectRes.status}), Vendors (${vendorsRes.status})`);
        }

        const projectData = await projectRes.json();
        const vendorsData = await vendorsRes.json();

        // Normalize project data to ensure consistent keys (pid)
        const normalizedProjects = projectData.map(project => ({
          ...project,
          id: project.pid || project.id, // Ensure id is set to pid
          name: project.pname || project.name
        }));

        console.log("Normalized Projects:", normalizedProjects);
        console.log("Vendors:", vendorsData);

        setProjects(normalizedProjects);
        setVendors(vendorsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ form: "Failed to load projects or vendors. Please try again." });
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + (quantity * price);
    }, 0);

    const taxAmount = subtotal * 0.18; // Assuming 18% tax
    const totalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(taxAmount.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2))
    }));
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
    
    if (errors[`items.${index}.${name}`]) {
      setErrors(prev => ({ ...prev, [`items.${index}.${name}`]: null }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_name: "", description: "", quantity: "", unit: "pcs", unit_price: "" }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.project_id) newErrors.project_id = "Project is required";
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.expected_delivery_date) newErrors.expected_delivery_date = "Delivery date is required";

    formData.items.forEach((item, index) => {
      if (!item.item_name || item.item_name.trim() === '') {
        newErrors[`items.${index}.item_name`] = "Item name is required";
      }
      if (!item.quantity || item.quantity === '') {
        newErrors[`items.${index}.quantity`] = "Quantity is required";
      } else if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        newErrors[`items.${index}.quantity`] = "Quantity must be a positive number";
      }
      if (!item.unit_price || item.unit_price === '') {
        newErrors[`items.${index}.unit_price`] = "Unit price is required";
      } else if (isNaN(Number(item.unit_price)) || Number(item.unit_price) < 0) {
        newErrors[`items.${index}.unit_price`] = "Price must be a valid number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation errors:", errors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ form: "Authentication required. Please log in again." });
        setSubmitting(false);
        router.push("/");
        return;
      }

      console.log("Submitting purchase order:", formData);

      const response = await fetch('/api/purchase/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ form: "Session expired. Please log in again." });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
          setTimeout(() => router.push("/"), 2000);
          setSubmitting(false);
          return;
        }

        setErrors({ form: data.error || data.message || "Failed to create purchase order" });
        setSubmitting(false);
        return;
      }

      // Find vendor and project with fallback values
      const selectedVendor = vendors.find(v => v.id === parseInt(formData.vendor_id)) || {
        name: "Unknown Vendor",
        address: "N/A",
        contact_person: "N/A",
        phone: "N/A"
      };
      const selectedProject = projects.find(p => p.id === parseInt(formData.project_id) || p.pid === parseInt(formData.project_id)) || {
        name: "Unknown Project",
        pname: "Unknown Project"
      };

      // Prepare data for PDF
      const poData = {
        po_number: data.po_number || "PO-" + Date.now(),
        vendor_name: selectedVendor.name,
        project_name: selectedProject.name || selectedProject.pname,
        order_date: new Date().toISOString().split('T')[0],
        vendor_address: selectedVendor.address || "N/A",
        vendor_contact: selectedVendor.contact_person || selectedVendor.phone || "N/A",
        items: formData.items.map(item => ({
          item_name: item.item_name || "N/A",
          description: item.description || "",
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "pcs",
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.quantity) * Number(item.unit_price) || 0
        })),
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        total_amount: formData.total_amount,
        expected_delivery_date: formData.expected_delivery_date,
        shipping_address: formData.shipping_address || "N/A",
        payment_terms: formData.payment_terms,
        notes: formData.notes || ""
      };

      console.log("PO Data for PDF:", poData);

      // Generate PDF
      generatePurchaseOrderPDF(poData);

      console.log("Purchase order created successfully:", data.po_number);
      router.push("/purchase-order/home");

    } catch (error) {
      console.error("Error submitting purchase order:", error);
      setErrors({ form: "Network error: Failed to submit purchase order. Please check your connection and try again." });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/home" />
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">New Purchase Order</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/home" />
      <ScrollToTopButton />
      
      <div className="max-w-4xl mx-auto mt-2 border border-white p-4 rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">New Purchase Order</h1>
        
        {errors.form && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span>{errors.form}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
                  errors.project_id ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                disabled={submitting}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name || project.pname}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>
              )}
            </div>
            
            {/* Vendor Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
                  errors.vendor_id ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                disabled={submitting}
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendor_id && (
                <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expected Delivery Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expected_delivery_date"
                  value={formData.expected_delivery_date}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
                    errors.expected_delivery_date ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={submitting}
                />
              </div>
              {errors.expected_delivery_date && (
                <p className="text-red-500 text-sm mt-1">{errors.expected_delivery_date}</p>
              )}
            </div>
            
            {/* Payment Terms */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Payment Terms</label>
              <input
                type="text"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Net 30 days"
                disabled={submitting}
              />
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Shipping Address</label>
            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter delivery address..."
              disabled={submitting}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional information..."
              disabled={submitting}
            />
          </div>
          
          {/* Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                disabled={submitting}
              >
                <FiPlus />
                <span>Add Item</span>
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div 
                key={index} 
                className="p-4 bg-gray-800/50 rounded-lg space-y-4 border border-gray-700"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">Item #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-300"
                    disabled={formData.items.length === 1 || submitting}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ${
                        errors[`items.${index}.item_name`] ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      placeholder="e.g., Water Pump"
                      disabled={submitting}
                    />
                    {errors[`items.${index}.item_name`] && (
                      <p className="text-red-500 text-sm">{errors[`items.${index}.item_name`]}</p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1HP Submersible Pump"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quantity */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ${
                        errors[`items.${index}.quantity`] ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`} 
                      min="1"
                      disabled={submitting}
                    />
                    {errors[`items.${index}.quantity`] && (
                      <p className="text-red-500 text-sm">{errors[`items.${index}.quantity`]}</p>
                    )}
                  </div>
                  
                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Unit</label>
                    <input
                      type="text"
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Nos."
                      disabled={submitting}
                    />
                  </div>
                  
                  {/* Unit Price */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="unit_price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ${
                        errors[`items.${index}.unit_price`] ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      min="0"
                      step="0.01"
                      disabled={submitting}
                    />
                    {errors[`items.${index}.unit_price`] && (
                      <p className="text-red-500 text-sm">{errors[`items.${index}.unit_price`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{formData.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{formData.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-md font-semibold transition-all hover:from-blue-700 hover:to-blue-600"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Create Purchase Order"}
          </button>
        </form>
      </div>
    </div>
  );
}