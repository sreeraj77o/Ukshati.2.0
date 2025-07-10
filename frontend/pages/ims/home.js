"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import { CardSkeleton, TableSkeleton, ChartSkeleton } from "../../src/components/skeleton";
import ScrollToTopButton from "@/components/scrollup";
import { IMSStats, IMSChart, IMSActions } from "../../src/components/ims";
import { useCachedStocks, useCachedCategories } from "../../src/hooks/useCache";

export default function Dashboard() {
  const router = useRouter();

  // Use cached hooks for better performance
  const { data: stocksData, loading: stocksLoading, error: stocksError, refresh: refreshStocks } = useCachedStocks();
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useCachedCategories();

  const [spentStock, setSpentStock] = useState(0);
  const [stats, setStats] = useState(null);

  // Derived state
  const stocks = stocksData?.data || [];
  const categories = categoriesData || [];
  const loading = stocksLoading || categoriesLoading;
  const error = stocksError || categoriesError;

  // Fetch spent stock data separately (not cached as frequently)
  const fetchSpentStock = async () => {
    try {
      const response = await fetch('/api/inventory_spent');
      if (response.ok) {
        const spentData = await response.json();
        setSpentStock(spentData.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch spent stock:', error);
    }
  };

  // Calculate stats when data changes
  useEffect(() => {
    if (stocks.length > 0 && categories.length > 0) {
      const totalItems = stocks.length;
      const totalCategories = categories.length;
      const lowStockItems = stocks.filter(item => item.quantity < 10).length;
      const totalValue = stocks.reduce((sum, item) => sum + (item.quantity * item.price_pu), 0);

      setStats({
        totalItems,
        totalCategories,
        lowStockItems,
        totalValue
      });
    }
  }, [stocks, categories]);

  // Fetch spent stock on mount
  useEffect(() => {
    fetchSpentStock();
  }, []);

  // Refresh function for manual refresh
  const fetchData = () => {
    refreshStocks();
    fetchSpentStock();
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <IMSStats stats={stats} spentStock={spentStock} />
        )}

        {/* Actions Grid */}
        <IMSActions onRefresh={fetchData} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Chart */}
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton height={300} />
            ) : (
              <IMSChart categories={categories} stocks={stocks} />
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Updates</h3>
            <div className="space-y-3">
              {loading ? (
                <TableSkeleton rows={4} columns={1} />
              ) : error ? (
                <p className="text-gray-400">Unable to load recent activity</p>
              ) : (
                [...stocks]
                  .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                  .slice(0, 5)
                  .map((item) => {
                    const categoryName = categories.find(c => c.category_id === item.category_id)?.category_name;
                    return (
                      <div key={item.stock_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{item.item_name}</p>
                          <p className="text-gray-400 text-sm">{categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{item.quantity}</p>
                          <p className="text-gray-400 text-sm">₹{item.price_pu}</p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}