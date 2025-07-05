import { useState } from 'react';
import { PageLayout } from '../components/layouts';
import { Button, Input, Select, Card, Modal, Alert, Table } from '../components/ui';
import { FiPlus, FiEdit, FiTrash2, FiSave } from 'react-icons/fi';

export default function TestComponents() {
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const handleButtonClick = (type) => {
    setAlert({
      type: 'success',
      message: `${type} button clicked successfully!`
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" leftIcon={<FiEdit />}>
            Edit
          </Button>
          <Button size="sm" variant="danger" leftIcon={<FiTrash2 />}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const headerActions = (
    <div className="flex space-x-4">
      <Button 
        variant="outline" 
        onClick={() => handleButtonClick('Outline')}
      >
        Outline Button
      </Button>
      <Button 
        variant="primary" 
        leftIcon={<FiPlus />}
        onClick={() => setShowModal(true)}
      >
        Open Modal
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Component Testing"
      subtitle="Testing all the new reusable components"
      headerActions={headerActions}
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          dismissible
          onDismiss={() => setAlert(null)}
        />
      )}

      {/* Button Testing */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-xl font-bold text-white">Button Components</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={() => handleButtonClick('Primary')}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => handleButtonClick('Secondary')}>
            Secondary
          </Button>
          <Button variant="success" onClick={() => handleButtonClick('Success')}>
            Success
          </Button>
          <Button variant="warning" onClick={() => handleButtonClick('Warning')}>
            Warning
          </Button>
          <Button variant="danger" onClick={() => handleButtonClick('Danger')}>
            Danger
          </Button>
          <Button variant="ghost" onClick={() => handleButtonClick('Ghost')}>
            Ghost
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm" variant="primary">Small</Button>
          <Button size="md" variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
          <Button size="xl" variant="primary">Extra Large</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="primary" leftIcon={<FiSave />}>
            With Left Icon
          </Button>
          <Button variant="primary" rightIcon={<FiPlus />}>
            With Right Icon
          </Button>
          <Button variant="primary" loading>
            Loading Button
          </Button>
          <Button variant="primary" disabled>
            Disabled Button
          </Button>
        </div>
      </Card>

      {/* Form Components Testing */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-xl font-bold text-white">Form Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Text Input"
            placeholder="Enter some text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="This is a helper text"
          />
          <Input
            label="Email Input"
            type="email"
            placeholder="Enter your email"
            required
          />
          <Input
            label="Password Input"
            type="password"
            placeholder="Enter your password"
          />
          <Select
            label="Select Input"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={selectOptions}
            placeholder="Choose an option"
          />
        </div>
      </Card>

      {/* Table Testing */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-xl font-bold text-white">Table Component</h3>
        <Table
          columns={columns}
          data={sampleData}
          loading={false}
        />
      </Card>

      {/* Modal Testing */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Test Modal"
        size="md"
        footer={
          <div className="flex justify-end space-x-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            This is a test modal to verify that our modal component is working correctly.
          </p>
          <Input
            label="Test Input in Modal"
            placeholder="Type something..."
          />
        </div>
      </Modal>
    </PageLayout>
  );
}
