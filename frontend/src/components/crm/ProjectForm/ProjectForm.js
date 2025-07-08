/**
 * Project Form Component
 * Reusable form for adding/editing projects
 */

import React from 'react';
import { Form, FormGroup, Label, Input, Select, Button } from '../../ui';

const ProjectForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  customers = [],
  isEditing = false,
  loading = false,
  className = ''
}) => {
  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
  ];

  const customerOptions = [
    { value: '', label: 'Select Customer' },
    ...customers.map(customer => ({
      value: customer.cid,
      label: customer.cname
    }))
  ];

  const handleInputChange = (field) => (e) => {
    onFormDataChange({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name?.trim() || !formData.startDate || !formData.customerId) {
      alert("Please fill all required fields.");
      return;
    }

    // Date validation
    const isValidDate = (date) => {
      return date && !isNaN(new Date(date).getTime());
    };

    if (!isValidDate(formData.startDate)) {
      alert("Start date is invalid or missing.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={className}>
      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup>
            <Label htmlFor="name" required>
              Project Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange('name')}
              placeholder="Enter project name"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="customerId" required>
              Customer
            </Label>
            <Select
              id="customerId"
              name="customerId"
              value={formData.customerId || ''}
              onChange={handleInputChange('customerId')}
              options={customerOptions}
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="startDate" required>
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={handleInputChange('startDate')}
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="endDate">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={handleInputChange('endDate')}
              disabled={loading}
            />
          </FormGroup>

          <FormGroup className="md:col-span-2">
            <Label htmlFor="status" required>
              Status
            </Label>
            <Select
              id="status"
              name="status"
              value={formData.status || ''}
              onChange={handleInputChange('status')}
              options={statusOptions}
              required
              disabled={loading}
            />
          </FormGroup>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEditing ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProjectForm;
