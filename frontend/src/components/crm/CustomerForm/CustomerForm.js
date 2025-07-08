/**
 * Customer Form Component
 * Reusable form for adding/editing customers
 */

import React from 'react';
import { Form, FormGroup, Label, Input, Select, Textarea, Button } from '../../ui';

const CustomerForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  className = ''
}) => {
  const statusOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' },
    { value: 'inactive', label: 'Inactive' }
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
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      alert("Please enter both name and phone number.");
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
              Customer Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange('name')}
              placeholder="Enter customer name"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone" required>
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleInputChange('phone')}
              placeholder="Enter phone number"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="altPhone">
              Alternate Phone
            </Label>
            <Input
              id="altPhone"
              name="altPhone"
              type="tel"
              value={formData.altPhone || ''}
              onChange={handleInputChange('altPhone')}
              placeholder="Enter alternate phone (optional)"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status" required>
              Status
            </Label>
            <Select
              id="status"
              name="status"
              value={formData.status || 'lead'}
              onChange={handleInputChange('status')}
              options={statusOptions}
              required
              disabled={loading}
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="remark">
            Remarks
          </Label>
          <Textarea
            id="remark"
            name="remark"
            value={formData.remark || ''}
            onChange={handleInputChange('remark')}
            placeholder="Enter any remarks or notes (optional)"
            rows={3}
            disabled={loading}
          />
        </FormGroup>

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
            {isEditing ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CustomerForm;
