import { useState } from "react";
import { Input, Select, Textarea, Button } from "../../ui";

/**
 * Reusable ExpenseForm component for adding/editing expenses
 * @param {Object} props - Component props
 * @param {Array} props.projects - Array of project options
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text
 */
const ExpenseForm = ({
  projects = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Add Expense"
}) => {
  const [formData, setFormData] = useState({
    pid: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    comments: "",
    category: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: "Materials", label: "Materials" },
    { value: "Labor", label: "Labor" },
    { value: "Equipment", label: "Equipment" },
    { value: "Transportation", label: "Transportation" },
    { value: "Utilities", label: "Utilities" },
    { value: "Miscellaneous", label: "Miscellaneous" }
  ];

  const projectOptions = projects.map(project => ({
    value: project.pid,
    label: `${project.pname} - ${project.cname}`
  }));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pid) {
      newErrors.pid = "Project is required";
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.comments.trim()) {
      newErrors.comments = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
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
        <Select
          label="Project"
          value={formData.pid}
          onChange={(e) => handleChange("pid", e.target.value)}
          options={projectOptions}
          error={errors.pid}
          required
          placeholder="Select project"
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          required
          placeholder="Enter amount"
          leftIcon="₹"
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          options={categoryOptions}
          placeholder="Select category (optional)"
        />
      </div>

      <Textarea
        label="Description"
        value={formData.comments}
        onChange={(e) => handleChange("comments", e.target.value)}
        error={errors.comments}
        required
        placeholder="Enter expense description"
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

export default ExpenseForm;
