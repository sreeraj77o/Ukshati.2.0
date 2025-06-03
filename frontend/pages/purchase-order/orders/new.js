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
    items: [{ item_name: "", description: "", quantity: "", unit: "", unit_price: "" }],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
  const fetchData = async () => {
    try {
    //     // Simulated data
    //     setTimeout(() => {
    //       setProjects([
    //         { id: 1, name: "Smart Irrigation System - Phase 1" },
    //         { id: 2, name: "Office Automation Project" },
    //         { id: 3, name: "Residential Water Management" }
    //       ]);
          
    //       setVendors([
    //         { id: 1, name: "ABC Suppliers Ltd." },
    //         { id: 2, name: "XYZ Industrial Equipment" },
    //         { id: 3, name: "Global Tech Solutions" }
    //       ]);
          
    //       setLoading(false);
    //     }, 1000);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     setLoading(false);
    //   }
    // };
      setLoading(true);
      const [projectRes, vendorsRes] = await Promise.all([
        fetch('/api/project'),
        fetch('/api/purchase/vendors')
      ]);

      if (!projectRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const projectData = await projectRes.json();
      console.log(projectData);
      const vendorsData = await vendorsRes.json();

      setProjects(projectData);
      setVendors(vendorsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  fetchData();
}, []);

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
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
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
      items: [...prev.items, { item_name: "", description: "", quantity: "", unit: "", unit_price: "" }]
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
    
    if (!formData.pid) newErrors.pid = "Project is required";
    if (!formData.id) newErrors.id = "Vendor is required";
    if (!formData.expected_delivery_date) newErrors.expected_delivery_date = "Delivery date is required";
    
    formData.items.forEach((item, index) => {
      if (!item.item_name) newErrors[`items.${index}.item_name`] = "Item name is required";
      if (!item.quantity) newErrors[`items.${index}.quantity`] = "Quantity is required";
      if (item.quantity && isNaN(Number(item.quantity))) {
        newErrors[`items.${index}.quantity`] = "Quantity must be a number";
      }
      if (!item.unit_price) newErrors[`items.${index}.unit_price`] = "Unit price is required";
      if (item.unit_price && isNaN(Number(item.unit_price))) {
        newErrors[`items.${index}.unit_price`] = "Price must be a number";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Replace with actual API call
      const response = await fetch('/api/purchase/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to orders list
      router.push("/purchase/orders");
    } catch (error) {
      console.error("Error submitting purchase order:", error);
      setErrors(prev => ({ ...prev, form: "Failed to submit purchase order. Please try again." }));
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
                  <option key={project.pid} value={project.pid}>
                    {project.pname}
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
                value={formData.id}
                onChange={handleChange}
                className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
                  errors.id ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
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
              {errors.id && (
                <p className="text-red-500 text-sm mt-1">{errors.id}</p>
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
                <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
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
