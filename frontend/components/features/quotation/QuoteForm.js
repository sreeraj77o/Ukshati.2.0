import { useState } from "react";
import { Input, Select, Textarea, Button } from "../../ui";

/**
 * Reusable QuoteForm component for creating/editing quotations
 * @param {Object} props - Component props
 * @param {Array} props.customers - Array of customer options
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text
 */
const QuoteForm = ({
  customers = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Create Quote"
}) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    quote_number: "",
    title: "",
    description: "",
    valid_until: "",
    status: "Draft",
    terms: "",
    notes: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Expired", label: "Expired" }
  ];

  const customerOptions = customers.map(customer => ({
    value: customer.cid,
    label: customer.cname
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Quote title is required";
    }
    
    if (!formData.valid_until) {
      newErrors.valid_until = "Valid until date is required";
    } else if (new Date(formData.valid_until) <= new Date()) {
      newErrors.valid_until = "Valid until date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Generate quote number if not provided
  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${year}${month}${day}-${random}`;
  };

  if (!formData.quote_number && !initialData.quote_number) {
    setFormData(prev => ({ ...prev, quote_number: generateQuoteNumber() }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Customer"
          value={formData.customer_id}
          onChange={(e) => handleChange("customer_id", e.target.value)}
          options={customerOptions}
          error={errors.customer_id}
          required
          placeholder="Select customer"
        />

        <Input
          label="Quote Number"
          value={formData.quote_number}
          onChange={(e) => handleChange("quote_number", e.target.value)}
          placeholder="Auto-generated"
          disabled
        />

        <Input
          label="Quote Title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          required
          placeholder="Enter quote title"
        />

        <Input
          label="Valid Until"
          type="date"
          value={formData.valid_until}
          onChange={(e) => handleChange("valid_until", e.target.value)}
          error={errors.valid_until}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={statusOptions}
          required
        />
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Enter quote description"
        rows={4}
      />

      <Textarea
        label="Terms & Conditions"
        value={formData.terms}
        onChange={(e) => handleChange("terms", e.target.value)}
        placeholder="Enter terms and conditions (optional)"
        rows={3}
      />

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Enter additional notes (optional)"
        rows={2}
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

export default QuoteForm;
