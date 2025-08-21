"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiPlus, FiTrash2, FiCalendar, FiSave, FiAlertCircle
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";

export default function EditRequisition() {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: "",
    required_by: "",
    notes: "",
    items: [{ item_name: "", description: "", quantity: "", unit: "" }]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let routeId = null;
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      routeId = parts[parts.length - 2]; // [id]/edit
      if (!isNaN(Number(routeId))) setId(routeId);
    }
  }, []);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ form: "Authentication required. Please log in again." });
        router.push("/");
        return;
      }
      const [reqRes, projectsRes] = await Promise.all([
        fetch(`/api/purchase/requisitions?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (!reqRes.ok || !projectsRes.ok) throw new Error('Failed to fetch data');
      const reqData = await reqRes.json();
      const projectsData = await projectsRes.json();
      const normalizedProjects = Array.isArray(projectsData)
        ? projectsData.map(project => ({
            id: project.pid || project.id,
            name: project.pname || project.name,
            ...project
          }))
        : [];
      setProjects(normalizedProjects);
      if (reqData.requisition) {
        setFormData({
          project_id: reqData.requisition.project_id || "",
          required_by: reqData.requisition.required_by || "",
          notes: reqData.requisition.notes || "",
          items: Array.isArray(reqData.items) && reqData.items.length > 0
            ? reqData.items.map(item => ({
                item_name: item.item_name || "",
                description: item.description || "",
                quantity: item.quantity?.toString() || "",
                unit: item.unit || ""
              }))
            : [{ item_name: "", description: "", quantity: "", unit: "" }]
        });
      }
    } catch (error) {
      setErrors({ form: "Failed to load requisition data. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
    if (errors[`items.${index}.${field}`]) setErrors(prev => ({ ...prev, [`items.${index}.${field}`]: null }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_name: "", description: "", quantity: "", unit: "" }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project_id) newErrors.project_id = "Project is required";
    if (!formData.required_by) newErrors.required_by = "Required date is required";
    formData.items.forEach((item, index) => {
      if (!item.item_name) newErrors[`items.${index}.item_name`] = "Item name is required";
      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`items.${index}.quantity`] = "Valid quantity is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
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
      const payload = {
        requisition_id: id,
        project_id: formData.project_id,
        required_by: formData.required_by,
        notes: formData.notes,
        items: formData.items.map(item => ({
          item_name: item.item_name,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit
        }))
      };
      const response = await fetch(`/api/purchase/requisitions?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      alert("Requisition updated successfully!");
      router.push("/purchase-order/requisition/AllRequisitions");
    } catch (error) {
        console.log(error);
      setErrors({ form: "Network error: Failed to update requisition. Please check your connection and try again." });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/requisition/AllRequisitions" />
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Edit Requisition</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/requisition/AllRequisitions" />
      <ScrollToTopButton />
      <div className="max-w-4xl mx-auto mt-2 border border-white p-4 rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Requisition</h1>
        {errors.form && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span>{errors.form}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project *</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.project_id ? 'border-red-500' : 'border-gray-600'}`}
                required
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-red-400 text-sm mt-1">{errors.project_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required By *</label>
              <input
                type="date"
                name="required_by"
                value={formData.required_by}
                onChange={handleChange}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.required_by ? 'border-red-500' : 'border-gray-600'}`}
                required
              />
              {errors.required_by && (
                <p className="text-red-400 text-sm mt-1">{errors.required_by}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Requisition Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <FiPlus className="mr-2" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                        className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`items.${index}.item_name`] ? 'border-red-500' : 'border-gray-600'}`}
                        placeholder="Enter item name"
                        required
                      />
                      {errors[`items.${index}.item_name`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`items.${index}.item_name`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                        className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`items.${index}.quantity`] ? 'border-red-500' : 'border-gray-600'}`}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                      {errors[`items.${index}.quantity`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`items.${index}.quantity`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={e => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., pcs, kg, ltr"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Item description (optional)"
                    />
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Remove Item"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/purchase-order/requisition/AllRequisitions")}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Update Requisition
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
