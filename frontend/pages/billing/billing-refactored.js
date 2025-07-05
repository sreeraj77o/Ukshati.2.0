import { useState, useEffect, useRef } from 'react';
import { CenteredLayout } from '../../components/layouts';
import { Button, Alert, LoadingSpinner } from '../../components/ui';
import { BillHeader, ProjectSelector } from '../../components/features/billing';
import { useBilling } from '../../hooks/billing';
import { useProjects } from '../../hooks/crm';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiSave, FiFileText } from 'react-icons/fi';

export default function BillingRefactored() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [alert, setAlert] = useState(null);
  const [billGenerated, setBillGenerated] = useState(false);
  
  const expenseDetailsRef = useRef(null);
  const pdfButtonRef = useRef(null);

  // Custom hooks
  const { projects, getProjectById } = useProjects();
  const {
    loading,
    billData,
    generateBill,
    saveBill,
    calculateBillTotals,
    formatBillForPDF,
    clearBillData
  } = useBilling();

  // Handle project selection
  const handleProjectSelect = async (projectId) => {
    if (!projectId) {
      clearBillData();
      setSelectedProjectId('');
      setBillGenerated(false);
      return;
    }

    try {
      setSelectedProjectId(projectId);
      const data = await generateBill(projectId);
      setBillGenerated(true);
      
      // Scroll to expense details
      setTimeout(() => {
        if (expenseDetailsRef.current) {
          expenseDetailsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to generate bill'
      });
    }
  };

  // Handle bill save
  const handleSaveBill = async () => {
    if (!billData) return;

    try {
      await saveBill(billData);
      setAlert({
        type: 'success',
        message: 'Bill saved successfully!'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to save bill'
      });
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = () => {
    if (!billData) return;

    const project = getProjectById(selectedProjectId);
    const totals = calculateBillTotals(billData.expenses);
    const pdfData = formatBillForPDF(project, billData.expenses, totals);
    
    // Here you would integrate with your PDF generation library
    // For now, we'll just show a success message
    setAlert({
      type: 'success',
      message: 'PDF generation started! Check your downloads.'
    });
  };

  // Scroll to PDF button when bill is generated
  useEffect(() => {
    if (billGenerated && billData && pdfButtonRef.current) {
      setTimeout(() => {
        pdfButtonRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 500);
    }
  }, [billGenerated, billData]);

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const totals = billData ? calculateBillTotals(billData.expenses) : null;

  return (
    <CenteredLayout
      title="Billing Management"
      backRoute="/dashboard"
      maxWidth="max-w-6xl"
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          dismissible
          onDismiss={() => setAlert(null)}
          className="mb-6"
        />
      )}

      {/* Bill Header */}
      <BillHeader />

      {/* Project Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ProjectSelector
          onSelect={handleProjectSelect}
          selectedProjectId={selectedProjectId}
          loading={loading}
        />
      </motion.div>

      {/* Expense Details */}
      <AnimatePresence>
        {selectedProject && billData && (
          <motion.div
            ref={expenseDetailsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Project Information */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Project Name</p>
                  <p className="text-white font-medium">{selectedProject.pname}</p>
                </div>
                <div>
                  <p className="text-gray-400">Customer</p>
                  <p className="text-white font-medium">{selectedProject.cname}</p>
                </div>
                <div>
                  <p className="text-gray-400">Start Date</p>
                  <p className="text-white font-medium">{formatDate(selectedProject.start_date)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedProject.status === 'Completed' 
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {selectedProject.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Details */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Expense Details</h3>
              
              {billData.expenses.length === 0 ? (
                <div className="text-center py-8">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No expenses found for this project</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Expenses Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 text-gray-400">Date</th>
                          <th className="text-left py-3 text-gray-400">Description</th>
                          <th className="text-right py-3 text-gray-400">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billData.expenses.map((expense, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-3 text-gray-300">
                              {formatDate(expense.Date)}
                            </td>
                            <td className="py-3 text-gray-300">
                              {expense.Comments}
                            </td>
                            <td className="py-3 text-right text-white font-medium">
                              {formatCurrency(expense.Amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bill Summary */}
                  {totals && (
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-white">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Discount:</span>
                          <span className="text-red-400">-{formatCurrency(totals.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax (18%):</span>
                        <span className="text-white">{formatCurrency(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-green-400">{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {billData.expenses.length > 0 && (
              <motion.div
                ref={pdfButtonRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center space-x-4"
              >
                <Button
                  variant="outline"
                  onClick={handleSaveBill}
                  leftIcon={<FiSave />}
                  size="lg"
                >
                  Save Bill
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGeneratePDF}
                  leftIcon={<FiDownload />}
                  size="lg"
                >
                  Generate PDF
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && selectedProjectId && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-400">Generating bill...</span>
        </div>
      )}
    </CenteredLayout>
  );
}
