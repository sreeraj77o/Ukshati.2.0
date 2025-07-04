"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiPlus, FiTrash2, FiCalendar, FiSave, FiAlertCircle
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";

export default function EditPurchaseOrder() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [originalOrder, setOriginalOrder] = useState(null);
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
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ form: "Authentication required. Please log in again." });
        router.push("/");
        return;
      }

      // Fetch order details, projects, and vendors concurrently
      const [orderRes, projectsRes, vendorsRes] = await Promise.all([
        fetch(`/api/purchase/orders?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/purchase/vendors', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!orderRes.ok || !projectsRes.ok || !vendorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const orderData = await orderRes.json();
      const projectsData = await projectsRes.json();
      const vendorsData = await vendorsRes.json();

      // Normalize project data
      const normalizedProjects = projectsData.map(project => ({
        ...project,
        id: project.pid || project.id,
        name: project.pname || project.name
      }));

      setProjects(normalizedProjects);
      setVendors(vendorsData);
      setOriginalOrder(orderData.order);

      // Set form data from existing order
      setFormData({
        project_id: orderData.order.project_id || "",
        vendor_id: orderData.order.vendor_id || "",
        expected_delivery_date: orderData.order.expected_delivery_date || "",
        shipping_address: orderData.order.shipping_address || "",
        payment_terms: orderData.order.payment_terms || "Net 30 days",
        notes: orderData.order.notes || "",
        items: orderData.items.length > 0 ? orderData.items.map(item => ({
          item_name: item.item_name || "",
          description: item.description || "",
          quantity: item.quantity?.toString() || "",
          unit: item.unit || "pcs",
          unit_price: item.unit_price?.toString() || ""
        })) : [{ item_name: "", description: "", quantity: "", unit: "pcs", unit_price: "" }],
        subtotal: Number(orderData.order.subtotal) || 0,
        tax_amount: Number(orderData.order.tax_amount) || 0,
        total_amount: Number(orderData.order.total_amount) || 0
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      setErrors({ form: "Failed to load purchase order data. Please try again." });
    } finally {
      setLoading(false);
    }
  };

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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
    
    if (errors[`items.${index}.${field}`]) {
      setErrors(prev => ({ ...prev, [`items.${index}.${field}`]: null }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_name: "", description: "", quantity: "", unit: "pcs", unit_price: "" }]
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
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.expected_delivery_date) newErrors.expected_delivery_date = "Expected delivery date is required";

    formData.items.forEach((item, index) => {
      if (!item.item_name) newErrors[`items.${index}.item_name`] = "Item name is required";
      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`items.${index}.quantity`] = "Valid quantity is required";
      if (!item.unit_price || Number(item.unit_price) <= 0) newErrors[`items.${index}.unit_price`] = "Valid unit price is required";
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

      console.log("Updating purchase order:", formData);

      const response = await fetch(`/api/purchase/orders?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Purchase order updated successfully:", data.po_number);
      
      // Show success message and redirect
      alert("Purchase order updated successfully!");
      router.push("/purchase-order/orders/AllOrders");

    } catch (error) {
      console.error("Error updating purchase order:", error);
      setErrors({ form: "Network error: Failed to update purchase order. Please check your connection and try again." });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/orders/AllOrders" />
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Edit Purchase Order</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (!originalOrder) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/orders/AllOrders" />
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Purchase Order Not Found</h1>
          <p className="text-gray-400">The requested purchase order could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/orders/AllOrders" />
      <ScrollToTopButton />
      
      <div className="max-w-4xl mx-auto mt-2 border border-white p-4 rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Edit Purchase Order - {originalOrder.po_number}
        </h1>
        
        {errors.form && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project *
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.project_id ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-red-400 text-sm mt-1">{errors.project_id}</p>
              )}
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vendor *
              </label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vendor_id ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendor_id && (
                <p className="text-red-400 text-sm mt-1">{errors.vendor_id}</p>
              )}
            </div>
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FiCalendar className="inline mr-2" />
              Expected Delivery Date *
            </label>
            <input
              type="date"
              name="expected_delivery_date"
              value={formData.expected_delivery_date}
              onChange={handleChange}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expected_delivery_date ? 'border-red-500' : 'border-gray-600'
              }`}
              required
            />
            {errors.expected_delivery_date && (
              <p className="text-red-400 text-sm mt-1">{errors.expected_delivery_date}</p>
            )}
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shipping Address
            </label>
            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter shipping address..."
            />
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Terms
            </label>
            <input
              type="text"
              name="payment_terms"
              value={formData.payment_terms}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Net 30 days"
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Order Items</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Item Name */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`items.${index}.item_name`] ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Enter item name"
                        required
                      />
                      {errors[`items.${index}.item_name`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`items.${index}.item_name`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`items.${index}.quantity`] ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                      {errors[`items.${index}.quantity`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`items.${index}.quantity`]}</p>
                      )}
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="ltr">Liters</option>
                        <option value="mtr">Meters</option>
                        <option value="box">Box</option>
                        <option value="set">Set</option>
                      </select>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`items.${index}.unit_price`] ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                      {errors[`items.${index}.unit_price`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`items.${index}.unit_price`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Item description (optional)"
                    />
                  </div>

                  {/* Total and Remove Button */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-lg font-semibold">
                      Total: ₹{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}
                    </div>
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

          {/* Order Summary */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{formData.tax_amount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/purchase-order/orders/AllOrders")}
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
                  Update Purchase Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
