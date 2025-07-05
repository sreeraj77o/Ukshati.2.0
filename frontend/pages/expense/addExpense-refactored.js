import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FormLayout } from '../../components/layouts';
import { Alert } from '../../components/ui';
import { ExpenseForm } from '../../components/features/expense';
import { useProjects } from '../../hooks/crm';
import { useExpenses } from '../../hooks/expense';
import { authService } from '../../services/auth';

export default function AddExpenseRefactored() {
  const router = useRouter();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom hooks
  const { projects, loading: projectsLoading } = useProjects();
  const { addExpense, loading: submitting } = useExpenses();

  useEffect(() => {
    const checkAuth = async () => {
      await authService.initialize();
      
      if (!authService.isAuthenticated()) {
        router.push('/expense/login');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (expenseData) => {
    try {
      const user = authService.getCurrentUser();
      
      const expenseWithUser = {
        ...expenseData,
        employee_id: user.id,
        date: expenseData.date || new Date().toISOString().split('T')[0]
      };

      await addExpense(expenseWithUser);
      
      setAlert({
        type: 'success',
        message: 'Expense added successfully!'
      });

      // Redirect after success
      setTimeout(() => {
        router.push('/expense/home');
      }, 2000);
      
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to add expense'
      });
    }
  };

  const handleCancel = () => {
    router.push('/expense/home');
  };

  if (loading || projectsLoading) {
    return (
      <FormLayout
        title="Add Expense"
        subtitle="Record a new project expense"
        backRoute="/expense/home"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
          <div className="flex justify-end space-x-4">
            <div className="h-10 bg-gray-700 rounded w-20"></div>
            <div className="h-10 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="Add Expense"
      subtitle="Record a new project expense"
      backRoute="/expense/home"
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

      <ExpenseForm
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
        submitText="Add Expense"
      />
    </FormLayout>
  );
}
