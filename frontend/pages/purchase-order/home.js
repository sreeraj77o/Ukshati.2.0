'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authenticate } from '@/lib/auth';
// import { connectToDB } from "@/lib/db";
import {
  FiShoppingBag,
  FiFileText,
  FiTruck,
  FiUsers,
  FiPlus,
  FiClipboard,
  FiBarChart2,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { FaFileCirclePlus, FaFileInvoice, FaChevronDown, } from 'react-icons/fa6';
import { FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/components/BackButton';
import { CardSkeleton, TableSkeleton } from '@/components/skeleton';
import ScrollToTopButton from '@/components/scrollup';

export default function PurchaseDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({
    totalPOs: 0,
    totalPRs: 0,
    activeVendors: 0,
    pendingDeliveries: 0,
    totalSpend: 0,
  });
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onDropdownToggle = () => setIsDropdownOpen(!isDropdownOpen);
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.push("/");
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : {};

    if (!token) {
      setErrors({ form: 'You are not logged in. Please login and try again.' });
      setLoading(false);
      router.push('/login');
      return;
    }

    setUserData({
      name: parsedUser.name,
      email: parsedUser.email,
      phone: parsedUser.phone || 'N/A',
      role: parsedUser.role || 'N/A',
    });

    const fetchWithAuth = async (url) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        setErrors({ form: 'Session expired. Please login again.' });
        router.push('/login');
        throw new Error('Unauthorized');
      }
      return response.json();
    };

    const fetchData = async () => {
      try {
        const vendorsData = await fetchWithAuth('/api/purchase/vendors');
        const requisitionsData = await fetchWithAuth('/api/purchase/requisitions');
        const ordersData = await fetchWithAuth('/api/purchase/orders');

        const totalPRs = Array.isArray(requisitionsData) ? requisitionsData.length : 0;
        const totalPOs = Array.isArray(ordersData) ? ordersData.length : 0;
        const pendingDeliveries = Array.isArray(ordersData)
          ? ordersData.filter(order => order.status === 'pending').length
          : 0;
        const totalSpend = Array.isArray(ordersData)
          ? ordersData.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0)
          : 0;
        const activeVendors = Array.isArray(vendorsData) ? vendorsData.length : 0;

        setStats({
          totalPOs,
          totalPRs,
          activeVendors,
          ordersData,
          pendingDeliveries,
          totalSpend,
        });
        setLoading(false);
      } catch (error) {
        if (error.message !== 'Unauthorized') {
          setErrors({ form: 'Failed to load dashboard data.' });
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [router, stats.totalPOs]);

  const purchaseCards = [
    {
      id: 1,
      title: 'Create Requisition',
      Icon: FaFileCirclePlus,
      description: 'Request items for your project',
      gradient: 'bg-gradient-to-r from-blue-400/30 to-indigo-500/40',
      route: '/purchase-order/requisition/new',
      stats: {
        main: 'New',
        secondary: 'PR',
      },
      filedBy: 'Project Team',
    },
    {
      id: 2,
      title: 'Create Purchase Order',
      Icon: FiShoppingBag,
      description: 'Generate orders for vendors',
      gradient: 'bg-gradient-to-r from-green-400/30 to-emerald-400/40',
      route: '/purchase-order/orders/new',
      stats: {
        main: 'New',
        secondary: 'PO',
      },
      filedBy: 'Procurement Team',
    },
    {
      id: 3,
      title: 'Manage Vendors',
      Icon: FiUsers,
      description: 'Add and manage supplier information',
      gradient: 'bg-gradient-to-r from-purple-400/30 to-violet-500/40',
      route: '/purchase-order/vendors',
      stats: {
        main: stats.activeVendors,
        secondary: 'Vendors',
      },
      filedBy: 'Procurement Team',
    },
    {
      id: 4,
      title: 'Receive Goods',
      Icon: FiTruck,
      description: 'Record received items and update inventory',
      gradient: 'bg-gradient-to-r from-yellow-400/30 to-amber-500/40',
      route: '/purchase-order/receive',
      stats: {
        main: stats.pendingDeliveries,
        secondary: 'Pending',
      },
      filedBy: 'Warehouse Team',
    },
    {
      id: 5,
      title: 'Purchase Reports',
      Icon: FiBarChart2,
      description: 'View procurement analytics and reports',
      gradient: 'bg-gradient-to-r from-red-400/30 to-rose-500/40',
      route: '/purchase-order/reports',
      stats: {
        main: '₹' + (stats.totalSpend / 100000).toFixed(1) + 'L',
        secondary: 'Spend',
      },
      filedBy: 'Finance Team',
    },
    {
      id: 6,
      title: 'View All Requisitions',
      Icon: FiFileText,
      description: 'Browse and manage all purchase orders',
      gradient: 'bg-gradient-to-r from-orange-400/30 to-orange-500/40',
      route: '/purchase-order/requisition/AllRequisitions',
      stats: {
        main: stats.totalPRs,
        secondary: 'Requisitions',
      },
      filedBy: 'Project Teams',
    },
    {
      id: 7,
      title: 'View All Orders',
      Icon: FaFileInvoice,
      description: 'Browse and manage all purchase orders',
      gradient: 'bg-gradient-to-r from-cyan-400/30 to-teal-500/40',
      route: '/purchase-order/orders/AllOrders',
      stats: {
        main: stats.totalPOs,
        secondary: 'Orders',
      },
      filedBy: 'Procurement Teams',
    },
  ];

  // Role-based card filtering
  let filteredCards = purchaseCards;
  if (userData.role === "employee") {
    filteredCards = purchaseCards.filter(card =>
      ["Create Requisition", "View All Requisitions", "Receive Goods"].includes(card.title)
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header with Profile Section (Dashboard style) */}
      <header className="bg-black shadow-md border-b border-gray-700">
        <div className="px-6 py-4 flex items-center justify-end">
          <div className="relative">
            <button
              onClick={onDropdownToggle}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                <span className="font-medium">{userData?.name?.[0] || 'U'}</span>
              </div>
              <motion.span
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <FaChevronDown className="text-xs" />
              </motion.span>
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg border border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-cyan-400">{userData?.name}</p>
                    <p className="text-xs text-cyan-400 truncate">{userData?.email}</p>
                    <p className="text-xs text-cyan-400 mt-1">Role: {userData?.role}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/dashboard" />
      </div>
      <ScrollToTopButton />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 py-8">
        <h1 className="text-4xl font-bold mb-16 mt-2 text-center">
          Purchase Order Management
        </h1>

        {/* Quick Search */}
        {/* <div className="w-full max-w-md mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search PO number, vendor, or item..."
              className="w-full bg-gray-800 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div> */}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {loading ? (
            <CardSkeleton count={6} />
          ) : (
            filteredCards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`${card.gradient} rounded-xl p-6 cursor-pointer shadow-lg`}
                onClick={() => router.push(card.route)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                    <card.Icon className="text-white text-xl" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{card.stats.main}</div>
                    <div className="text-sm text-white/70">
                      {card.stats.secondary}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/80 mb-4">{card.description}</p>
                <div className="text-sm text-white/60">{card.filedBy}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
