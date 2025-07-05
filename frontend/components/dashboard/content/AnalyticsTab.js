import { Bar, Line, Doughnut } from 'react-chartjs-2';

/**
 * Analytics tab content component with charts
 * @param {Object} props - Component props
 * @param {Object} props.dashboardData - Dashboard data
 */
const AnalyticsTab = ({ dashboardData }) => {
  // Revenue vs Expenses Bar Chart Data
  const revenueExpenseData = {
    labels: ['Revenue', 'Expenses'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [dashboardData.stats.revenue || 0, dashboardData.stats.expenses || 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: '#111827',
        borderWidth: 2,
      }
    ]
  };

  // Project Status Doughnut Chart Data
  const projectStatusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          dashboardData.stats.completedTasks || 0,
          dashboardData.stats.inProgressTasks || 0,
          dashboardData.stats.pendingTasks || 0
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
        borderColor: '#111827',
        borderWidth: 2,
      }
    ]
  };

  // Monthly Growth Line Chart Data (mock data for demonstration)
  const monthlyGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Customers',
        data: [12, 19, 15, 25, 22, dashboardData.customers || 0],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Projects',
        data: [8, 12, 10, 15, 18, dashboardData.stats.totalProjects || 0],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fff' },
        position: 'bottom'
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: '#374151' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fff' },
        position: 'bottom'
      }
    },
    cutout: '70%'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue vs Expenses Bar Chart */}
      <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Revenue vs Expenses</h2>
        <Bar data={revenueExpenseData} options={chartOptions} />
      </div>

      {/* Project Status Doughnut Chart */}
      <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Project Status Distribution</h2>
        <Doughnut data={projectStatusData} options={doughnutOptions} />
      </div>

      {/* Monthly Growth Line Chart */}
      <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700 lg:col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Growth Trends</h2>
        <Line data={monthlyGrowthData} options={chartOptions} />
      </div>

      {/* Customer Distribution Doughnut Chart */}
      <div className="bg-black rounded-xl p-12 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Customer Distribution</h2>
        <Doughnut
          data={{
            labels: ['Total Customers'],
            datasets: [
              {
                data: [dashboardData.customers, 100],
                backgroundColor: ['#10B981', '#374151'],
                borderColor: '#111827',
                borderWidth: 2,
              }
            ]
          }}
          options={doughnutOptions}
        />
      </div>
    </div>
  );
};

export default AnalyticsTab;
