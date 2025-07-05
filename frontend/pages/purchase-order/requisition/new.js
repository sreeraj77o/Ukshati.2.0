"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FiPlus, FiTrash2, FiCalendar, FiClipboard, FiSave,
  FiX, FiAlertCircle, FiCheckCircle
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";

export default function NewRequisition() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  // initial formData state
const [formData, setFormData] = useState({
    project_id: "",
    required_by: "",
    notes: "",
    items: [{ name: "", description: "", quantity: "", unit: "", estimated_price: "" }]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  fetchProjects();
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
    
    // Clear error
    if (errors[`items.${index}.${name}`]) {
      setErrors(prev => ({ ...prev, [`items.${index}.${name}`]: null }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", description: "", quantity: "", unit: "", estimated_price: "" }]
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
    if (!formData.required_by) newErrors.required_by = "Required date is required";
    
    formData.items.forEach((item, index) => {
      if (!item.name) newErrors[`items.${index}.name`] = "Item name is required";
      if (!item.quantity) newErrors[`items.${index}.quantity`] = "Quantity is required";
      if (item.quantity && isNaN(Number(item.quantity))) {
        newErrors[`items.${index}.quantity`] = "Quantity must be a number";
      }
      if (item.estimated_price && isNaN(Number(item.estimated_price))) {
        newErrors[`items.${index}.estimated_price`] = "Price must be a number";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
//  console.log("Items:", formData.items);
  const transformedItems = formData.items.map(item => ({
  name: item.name,
  description: item.description,
  quantity: Number(item.quantity),
  unit: item.unit,
  estimated_price: Number(item.estimated_price)
}));
console.log("Transformed Items:", transformedItems);
  // ✅ Gather form data correctly
  const payload = {
    project_id: formData.project_id,
    required_by: formData.required_by,
    notes: formData.notes,
    items: transformedItems
  };
    
  console.log("Payload:", payload);
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ form: "You are not logged in. Please login and try again." });
        setSubmitting(false);
        return;
      }
    console.log("Form Data:", payload);
      const res = await fetch('/api/purchase/requisitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload), // assuming payload is your form data
  });

  if (!res.ok) {
    setErrors({ form: `Server error: ${res.status}. Please try again later.` });
    const text = await res.text(); // fallback to raw text if not JSON
    console.error("❌ Server returned error HTML or non-JSON:", text);
    throw new Error(`Request failed with status ${res.status}`);
  }

  const data = await res.json();
  console.log("✅ Requisition submitted:", data);
      
      // Redirect to requisition list or detail page
      // router.push(`/purchase-order/requisition/detail/${data.id}`);
      router.push(`/purchase-order/home`);

    } catch (error) {
      console.error("🚨 Error submitting requisition:", error.message);
      setErrors(prev => ({ ...prev, form: error.message || "Failed to submit requisition. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase/home" />
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">New Purchase Requisition</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/home" />
      <ScrollToTopButton />
      
      <div className="max-w-4xl mx-auto mt-2  border border-white p-4 rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">New Purchase Requisition</h1>
        
        {errors.form && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span>{errors.form}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          {/* Required By Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Required By <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="required_by"
                value={formData.required_by}
                onChange={handleChange}
                className={`w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
                  errors.required_by ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                min={new Date().toISOString().split('T')[0]}
                disabled={submitting}
              />
            </div>
            {errors.required_by && (
              <p className="text-red-500 text-sm mt-1">{errors.required_by}</p>
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
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
                      name="name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 ${
                        errors[`items.${index}.name`] ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      placeholder="e.g., Water Pump"
                      disabled={submitting}
                    />
                    {errors[`items.${index}.name`] && (
                      <p className="text-red-500 text-sm">{errors[`items.${index}.name`]}</p>
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
                  
                  {/* Estimated Price */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Estimated Price</label>
                    <input
                      type="number"
                      name="estimated_price"
                      value={item.estimated_price}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-md font-semibold transition-all hover:from-blue-700 hover:to-blue-600"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Requisition"}
          </button>
        </form>
      </div>
    </div>
  );
}
