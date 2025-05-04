import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const demoData = {
  customerDistribution: [
    { name: 'Customer', value: 1, color: '#4f46e5' },
    { name: 'Lead', value: 0, color: '#0ea5e9' },
    { name: 'Prospect', value: 0, color: '#8b5cf6' }
  ],
  remindersByPriority: [
    { priority: 'High', count: 3, color: '#ef4444' },
    { priority: 'Medium', count: 5, color: '#f59e0b' },
    { priority: 'Low', count: 4, color: '#3b82f6' }
  ]
};

const orderedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CRMDashboardVisualizations() {
  const [projectGrowth, setProjectGrowth] = useState({
    Completed: Array(12).fill(0),
    Ongoing: Array(12).fill(0),
    'On Hold': Array(12).fill(0)
  });

  const [customerData, setCustomerData] = useState(demoData.customerDistribution);
  const [reminderData, setReminderData] = useState(demoData.remindersByPriority);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await fetch('/api/tasks');
        const tasksData = await tasksResponse.json();

        const statusGroups = {
          Completed: Array(12).fill(0),
          Ongoing: Array(12).fill(0),
          'On Hold': Array(12).fill(0)
        };

        tasksData.forEach(task => {
          const date = new Date(task.start_date);
          const monthIndex = date.getMonth();
          const status = task.status?.trim() || 'On Hold';

          if (statusGroups[status]) {
            statusGroups[status][monthIndex] += 1;
          } else {
            statusGroups['On Hold'][monthIndex] += 1;
          }
        });

        setProjectGrowth(statusGroups);

        const customersResponse = await fetch('/api/customers');
        const customersData = await customersResponse.json();
        if (customersData.customers && customersData.customers.length > 0) {
          const statusCounts = {};
          customersData.customers.forEach(customer => {
            const status = customer.status?.toLowerCase() || "unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });

          const updatedCustomerData = [
            { name: 'Customer', value: statusCounts['customer'] || 0, color: '#4f46e5' },
            { name: 'Lead', value: statusCounts['lead'] || 0, color: '#0ea5e9' },
          ];
          setCustomerData(updatedCustomerData);
        }

        const remindersResponse = await fetch('/api/reminders');
        const remindersData = await remindersResponse.json();
        if (Array.isArray(remindersData)) {
          const priorityCounts = { High: 0, Medium: 0, Low: 0 };
          remindersData.forEach(reminder => {
            const priority = reminder.priority || "Low";
            priorityCounts[priority] += 1;
          });

          const updatedReminderData = [
            { priority: 'High', count: priorityCounts['High'], color: '#ef4444' },
            { priority: 'Medium', count: priorityCounts['Medium'], color: '#f59e0b' },
            { priority: 'Low', count: priorityCounts['Low'], color: '#3b82f6' }
          ];
          setReminderData(updatedReminderData);
        }

      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: orderedMonths,
    datasets: [
      {
        label: 'Completed',
        data: projectGrowth.Completed,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Ongoing',
        data: projectGrowth.Ongoing,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'On Hold',
        data: projectGrowth['On Hold'],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const pieChartData = {
    labels: customerData.map(item => item.name),
    datasets: [
      {
        data: customerData.map(item => item.value),
        backgroundColor: customerData.map(item => item.color),
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-black p-6 rounded-2xl shadow-lg w-full">
          <h3 className="text-xl font-semibold mb-4 text-center text-white">Project Growth</h3>
          <div className="relative h-64 sm:h-80 md:h-96">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: 'white' }
                  }
                },
                scales: {
                  x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-black p-6 rounded-2xl shadow-lg w-full">
          <h3 className="text-xl font-semibold mb-4 text-center text-white">Customer Distribution</h3>
          <div className="relative h-64 sm:h-80 md:h-96">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
