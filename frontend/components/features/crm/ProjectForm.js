import { useState } from "react";
import { Input, Select, Textarea, Button } from "../../ui";

/**
 * Reusable ProjectForm component for adding/editing projects
 * @param {Object} props - Component props
 * @param {Array} props.customers - Array of customer options
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text
 */
const ProjectForm = ({
  customers = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Save Project"
}) => {
  const [formData, setFormData] = useState({
    pname: "",
    cid: "",
    start_date: "",
    end_date: "",
    status: "Ongoing",
    description: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Ongoing", label: "Ongoing" },
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const customerOptions = customers.map(customer => ({
    value: customer.cid,
    label: customer.cname
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pname.trim()) {
      newErrors.pname = "Project name is required";
    }
    
    if (!formData.cid) {
      newErrors.cid = "Customer is required";
    }
    
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date";
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
          label="Project Name"
          value={formData.pname}
          onChange={(e) => handleChange("pname", e.target.value)}
          error={errors.pname}
          required
          placeholder="Enter project name"
        />

        <Select
          label="Customer"
          value={formData.cid}
          onChange={(e) => handleChange("cid", e.target.value)}
          options={customerOptions}
          error={errors.cid}
          required
          placeholder="Select customer"
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => handleChange("start_date", e.target.value)}
          error={errors.start_date}
          required
        />

        <Input
          label="End Date"
          type="date"
          value={formData.end_date}
          onChange={(e) => handleChange("end_date", e.target.value)}
          error={errors.end_date}
          helperText="Optional - leave blank if ongoing"
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
        placeholder="Enter project description (optional)"
        rows={4}
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

export default ProjectForm;
