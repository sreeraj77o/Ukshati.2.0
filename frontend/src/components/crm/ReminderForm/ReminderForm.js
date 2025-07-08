/**
 * Reminder Form Component
 * Reusable form for adding/editing reminders
 */

import React from 'react';
import { Form, FormGroup, Label, Input, Select, Textarea, Button } from '../../ui';

const ReminderForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  customers = [],
  loading = false,
  className = ''
}) => {
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
    if (!formData.message?.trim() || !formData.date || !formData.time || !formData.customerId) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit(formData);
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={className}>
      <Form onSubmit={handleSubmit}>
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
          <Label htmlFor="message" required>
            Reminder Message
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message || ''}
            onChange={handleInputChange('message')}
            placeholder="Enter reminder message"
            rows={3}
            required
            disabled={loading}
          />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup>
            <Label htmlFor="date" required>
              Reminder Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleInputChange('date')}
              min={today}
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="time" required>
              Reminder Time
            </Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={formData.time || ''}
              onChange={handleInputChange('time')}
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
            Add Reminder
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ReminderForm;
