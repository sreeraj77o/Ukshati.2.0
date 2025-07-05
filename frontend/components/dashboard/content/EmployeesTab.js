import { useState } from "react";
import { FaUserPlus, FaTimes, FaUser } from "react-icons/fa";
import { EmployeeModal } from "../ui";
import { useEmployees } from "../../../hooks";

/**
 * Employees tab content component
 * @param {Object} props - Component props
 * @param {boolean} props.showSuccessMessage - Success message state
 * @param {Function} props.onShowSuccess - Success message handler
 */
const EmployeesTab = ({ 
  showSuccessMessage, 
  onShowSuccess 
}) => {
  const {
    employees,
    loading,
    error,
    expandedEmployee,
    fetchEmployees,
    addEmployee,
    deleteEmployee,
    toggleEmployeeDetails,
    setError
  } = useEmployees();

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await addEmployee(formData);
      onShowSuccess();
      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Employee Management</h2>
          <button
            onClick={() => setShowEmployeeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center text-sm"
          >
            <FaUserPlus className="mr-2" />
            Add Employee
          </button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
            <div className="flex items-center">
              <FaTimes className="text-green-400 mr-2" />
              <span className="text-green-400 text-sm">Employee added successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-red-400 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <FaUser className="mx-auto text-4xl text-gray-600 mb-4" />
              <p className="text-gray-400">No employees found</p>
              <button
                onClick={fetchEmployees}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="font-medium text-white">{employee.name?.[0] || 'U'}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{employee.name}</h3>
                      <p className="text-sm text-gray-400">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleEmployeeDetails(employee.id)}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      {expandedEmployee === employee.id ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => deleteEmployee(employee.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {expandedEmployee === employee.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p className="text-white">{employee.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <p className="text-white">{employee.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleAddEmployee}
        formData={formData}
        setFormData={setFormData}
        loading={formSubmitting}
      />
    </>
  );
};

export default EmployeesTab;
