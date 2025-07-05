import { useState } from "react";
import { Input, Select, Textarea, Button } from "../../ui";

/**
 * Reusable StockForm component for adding/editing stock items
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of category options
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text
 */
const StockForm = ({
  categories = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Add Stock"
}) => {
  const [formData, setFormData] = useState({
    item_name: "",
    category_id: "",
    quantity: "",
    unit: "",
    price_per_unit: "",
    supplier: "",
    description: "",
    minimum_stock: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const unitOptions = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilograms" },
    { value: "ltr", label: "Liters" },
    { value: "mtr", label: "Meters" },
    { value: "box", label: "Boxes" },
    { value: "pack", label: "Packs" }
  ];

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = "Item name is required";
    }
    
    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) < 0) {
      newErrors.price_per_unit = "Valid price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Item Name"
          value={formData.item_name}
          onChange={(e) => handleChange("item_name", e.target.value)}
          error={errors.item_name}
          required
          placeholder="Enter item name"
        />

        <Select
          label="Category"
          value={formData.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
          options={categoryOptions}
          error={errors.category_id}
          required
          placeholder="Select category"
        />

        <Input
          label="Quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
          error={errors.quantity}
          required
          placeholder="Enter quantity"
        />

        <Select
          label="Unit"
          value={formData.unit}
          onChange={(e) => handleChange("unit", e.target.value)}
          options={unitOptions}
          error={errors.unit}
          required
          placeholder="Select unit"
        />

        <Input
          label="Price per Unit"
          type="number"
          step="0.01"
          min="0"
          value={formData.price_per_unit}
          onChange={(e) => handleChange("price_per_unit", e.target.value)}
          error={errors.price_per_unit}
          required
          placeholder="Enter price"
          leftIcon="₹"
        />

        <Input
          label="Minimum Stock Level"
          type="number"
          min="0"
          value={formData.minimum_stock}
          onChange={(e) => handleChange("minimum_stock", e.target.value)}
          placeholder="Enter minimum stock level"
          helperText="Alert when stock falls below this level"
        />

        <Input
          label="Supplier"
          value={formData.supplier}
          onChange={(e) => handleChange("supplier", e.target.value)}
          placeholder="Enter supplier name (optional)"
        />
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Enter item description (optional)"
        rows={3}
      />

      <div className="flex justify-end space-x-4 pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default StockForm;
