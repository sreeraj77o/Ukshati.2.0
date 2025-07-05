import { useState } from "react";
import { Input, Select, Button } from "../../ui";

/**
 * Reusable CustomerForm component for adding/editing customers
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text
 */
const CustomerForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save Customer"
}) => {
  const [formData, setFormData] = useState({
    cname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cname.trim()) {
      newErrors.cname = "Customer name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Customer Name"
          value={formData.cname}
          onChange={(e) => handleChange("cname", e.target.value)}
          error={errors.cname}
          required
          placeholder="Enter customer name"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          required
          placeholder="Enter email address"
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          required
          placeholder="Enter phone number"
        />

        <Input
          label="GST Number"
          value={formData.gst}
          onChange={(e) => handleChange("gst", e.target.value)}
          placeholder="Enter GST number (optional)"
        />
      </div>

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
        placeholder="Enter full address"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="Enter city"
        />

        <Input
          label="State"
          value={formData.state}
          onChange={(e) => handleChange("state", e.target.value)}
          placeholder="Enter state"
        />

        <Input
          label="Pincode"
          value={formData.pincode}
          onChange={(e) => handleChange("pincode", e.target.value)}
          placeholder="Enter pincode"
        />
      </div>

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

export default CustomerForm;
