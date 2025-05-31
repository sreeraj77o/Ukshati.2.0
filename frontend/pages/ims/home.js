"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiBox, FiPackage, FiArrowUp, FiArrowDown, FiPlus, FiActivity,
  FiSettings, FiLogOut, FiAlertTriangle, FiRefreshCw, FiDollarSign
} from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import { CardSkeleton, TableSkeleton, ChartSkeleton } from "@/components/skeleton";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scroll } from "lucide-react";
import ScrollToTopButton from "@/components/scrollup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spentStock, setSpentStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stocksRes, categoriesRes, spentRes,stockCount] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/categories'),
        fetch('/api/inventory_spent'),
        fetch('/api/stocks?count=true')
      ]);

      if (!stocksRes.ok || !categoriesRes.ok || !spentRes.ok || !stockCount.ok) {
        throw new Error('Failed to fetch data');
      }

      const stocksData = await stocksRes.json();
      const categoriesData = await categoriesRes.json();
      const spentData = await spentRes.json();
      const stockCountData = await stockCount.json();

      if (categoriesData.success && categoriesData.categories) {
        setCategories(categoriesData.categories);
      } else {
        throw new Error('Invalid categories data format');
      }

      // Process stocks data
      const lowStockItems = stocksData.filter(item => item.quantity < 10);
      const totalStockValue = stocksData.reduce((sum, item) => sum + (item.quantity * item.price_pu), 0);

      setStats({
        totalItems: stockCountData.count,
        categories: categoriesData.categories.length,
        lowStock: lowStockItems.length,
        spentStock: spentData.length || 0,
        totalStockValue
      });

      setStocks(stocksData);
      setSpentStock(spentData.length || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickActions = [
    { id: 1, title: "Add New Stocks", icon: FiPlus, route: "/ims/stocks", color: "bg-green-500" },
    { id: 2, title: "Spend Stocks", icon: FiActivity, route: "/ims/view-stock", color: "bg-blue-500" },
    { id: 3, title: "Manage/Update Stocks", icon: FiPackage, route: "/ims/update-stock", color: "bg-purple-500" },
    { id: 4, title: "Inventory Report", icon: FiAlertTriangle, route: "/ims/inventory-spent", color: "bg-red-500" },
  ];

  const StatCard = ({ icon: Icon, title, value, trend, isLoading }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg min-h-[150px]"
    >
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-gray-400 text-sm">{title}</span>
              <h3 className="text-3xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${trend?.color || 'bg-gray-700'}`}>
              <Icon className="text-2xl text-white" />
            </div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center space-x-2">
              <trend.icon className={`text-sm ${trend.value > 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm ${trend.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  const categoryChartData = () => {
    if (loading || stocks.length === 0) return null;

    // Group stocks by category
    const stockGroups = stocks.reduce((acc, item) => {
      const category = item.category_name;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          low: 0
        };
      }
      acc[category].total += item.quantity;
      if (item.quantity < 10) {
        acc[category].low += item.quantity;
      }
      return acc;
    }, {});

    const labels = Object.keys(stockGroups);
    const totalData = Object.values(stockGroups).map(g => g.total);
    const lowData = Object.values(stockGroups).map(g => g.low);

    return {
      labels,
      datasets: [
        {
          label: 'Total Stock',
          data: totalData,
          backgroundColor: '#90FF90',
          borderWidth: 1,
        },
        {
          label: 'Low Stock (<10)',
          data: lowData,
          backgroundColor: '#FF0000',
          borderWidth: 1,
        }
      ],
    };
  };


  return (
    <div className="min-h-screen bg-black text-white">
      <BackButton route="/dashboard" />
      <ScrollToTopButton/>
      <div className="container mx-auto p-4 md:p-6 pt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Inventory Dashboard</h1>
            <p className="text-gray-400">Welcome back!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
              disabled={loading}
            >
              <FiRefreshCw className={`text-xl ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <FiSettings className="text-xl" />
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FiLogOut className="text-xl" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-800/50 rounded-xl">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FiBox}
            title="Total Items"
            value={stats?.totalItems}
            trend={{ icon: FiArrowUp, value: 12, label: 'vs last month', color: 'bg-blue-500' }}
            isLoading={loading}
          />
          <StatCard
            icon={FiPackage}
            title="Categories"
            value={stats?.categories}
            trend={{ icon: FiArrowUp, value: 3, label: 'new categories', color: 'bg-purple-500' }}
            isLoading={loading}
          />
          <StatCard
            icon={FiAlertTriangle}
            title="Low Stock"
            value={stats?.lowStock}
            trend={{ icon: FiArrowDown, value: 8, label: 'resolved', color: 'bg-red-500' }}
            isLoading={loading}
          />
          <StatCard
            icon={FiDollarSign}
            title="Spent Stock"
            value={stats?.spentStock}
            trend={{ icon: FiArrowUp, value: 5, label: 'this month', color: 'bg-green-500' }}
            isLoading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Chart */}
          <div className="lg:col-span-2 bg-black p-4 md:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold">Stock Distribution</h2>
            </div>
            {loading ? (
              <ChartSkeleton height={300} />
            ) : (
              <div className="w-full h-[300px]">
                <Bar
                  data={categoryChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#fff'
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#fff'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#fff'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-black p-4 md:p-6 rounded-xl">
            <h2 className="text-lg md:text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                // Skeleton for Quick Actions
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-700 p-3 md:p-4 rounded-lg flex items-center gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-gray-600"></div>
                    <div className="h-4 bg-gray-600 rounded w-32"></div>
                  </div>
                ))
              ) : (
                quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(action.route)}
                    className={`${action.color} p-3 md:p-4 rounded-lg flex items-center gap-3 transition-all`}
                  >
                    <action.icon className="text-xl md:text-2xl text-white" />
                    <span className="text-left text-sm md:text-base">{action.title}</span>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-900 p-4 md:p-6 rounded-xl">
          <h2 className="text-lg md:text-xl font-semibold mb-6">Recent Stock Updates</h2>
          <div className="space-y-3">
            {loading ? (
              <TableSkeleton rows={4} columns={1} />
            ) : error ? (
              <p className="text-gray-400">Unable to load recent activity</p>
            ) : (
              [...stocks]
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 4)
                .map((item) => {
                  const categoryName = categories.find(c => c.category_id === item.category_id)?.category_name;
                  return (
                    <div key={item.stock_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.quantity < 10 ? 'bg-red-500' : 'bg-blue-500'}`}>
                          <FiPlus className="text-xl" />
                        </div>
                        <div>
                          <p className="font-medium text-sm md:text-base">{item.item_name}</p>
                          <p className="text-xs md:text-sm text-gray-400">
                            {categoryName} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs md:text-sm text-gray-400">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}