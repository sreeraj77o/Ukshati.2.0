/**
 * Employee Management Component
 * Handles employee listing, adding, and management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaTrash, FaCheck } from 'react-icons/fa';
import Button from '../../ui/Button/Button';
import Card from '../../ui/Card/Card';
import EmployeeModal from '../EmployeeModal/EmployeeModal';

const EmployeeManagement = ({ userRole }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "",
          password: ""
        });
        setShowSuccessMessage(true);
        fetchEmployees();

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        alert(data.error || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: employeeId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  if (userRole !== 'Admin') {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-400">
          You don't have permission to manage employees.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center"
          >
            <FaCheck className="text-green-500 mr-2" />
            <span>Employee added successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employee Management</h2>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2"
        >
          <FaUserPlus />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Employee List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-800">
                    <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4">{employee.email}</td>
                    <td className="py-3 px-4">{employee.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        employee.role === 'Admin' 
                          ? 'bg-red-500/20 text-red-400'
                          : employee.role === 'Manager'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="flex items-center space-x-1"
                      >
                        <FaTrash className="text-xs" />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        loading={formSubmitting}
      />
    </div>
  );
};

export default EmployeeManagement;
