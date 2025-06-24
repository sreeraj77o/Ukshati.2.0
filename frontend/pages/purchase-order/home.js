"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authenticate } from "@/lib/auth";
// import { connectToDB } from "@/lib/db";
import {
  FiShoppingBag, FiFileText, FiTruck, FiUsers, FiPlus,
  FiClipboard, FiBarChart2, FiSearch, FiFilter
} from "react-icons/fi";
import { FaFileCirclePlus, FaFileInvoice } from "react-icons/fa6";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import { CardSkeleton, TableSkeleton } from "@/components/skeleton";
import ScrollToTopButton from "@/components/scrollup";

export default function PurchaseDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPOs: 0,
    totalPRs: 0,
    activeVendors: 0,
    pendingDeliveries: 0,
    totalSpend: 0,
    activeVendors: 0
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrors({ form: "You are not logged in. Please login and try again." });
      setLoading(false);
      router.push('/login');
      return;
    }

    // Helper to fetch with auth and handle 401
    const fetchWithAuth = async (url) => {
      console.log("Fetching from: " + url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        setErrors({ form: "Session expired. Please login again." });
        router.push('/login');
        throw new Error("Unauthorized");
      }
      return response.json();
    };

    const fetchData = async () => {
      try {
        // Fetch vendors
        const vendorsData = await fetchWithAuth('/api/purchase/vendors');
        console.log("VEndors",vendorsData.length);

        // Fetch requisitions
        const requisitionsData = await fetchWithAuth('/api/purchase/requisitions');
        console.log("Requisitions",requisitionsData.length);

        // Fetch orders
        const ordersData = await fetchWithAuth('/api/purchase/orders');
        console.log("Orders",ordersData[0]);

        // Calculate stats
        const totalPRs = requisitionsData.length;
        console.log("Total PRs",totalPRs);
        const totalPOs = ordersData.length;
        console.log("Total POs",totalPOs);
        const pendingDeliveries = ordersData.filter(ordersData => ordersData.status === 'pending').length;
        console.log("Pending Deliveries",pendingDeliveries);
        const totalSpend = ordersData.reduce((sum, order) => sum + (order.amount || 3), 0);
        console.log("Total Spend",totalSpend);
        const activeVendors = vendorsData.length;
        console.log("Active Vendors",activeVendors);

        setStats({
          totalPOs,
          totalPRs,
          activeVendors,
          ordersData, 
          pendingDeliveries,
          totalSpend,
          activeVendors
        });
        console.log(stats.totalPOs);
        setLoading(false);
      } catch (error) {
        if (error.message !== "Unauthorized") {
          setErrors({ form: "Failed to load dashboard data." });
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [router]);

  const purchaseCards = [
    {
      id: 1,
      title: "Create Requisition",
      Icon: FaFileCirclePlus,
      description: "Request items for your project",
      gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
      route: "/purchase-order/requisition/new",
      stats: {
        main: "New",
        secondary: "PR"
      },
      filedBy: "Project Team"
    },
    {
      id: 2,
      title: "Create Purchase Order",
      Icon: FiShoppingBag,
      description: "Generate orders for vendors",
      gradient: "bg-gradient-to-r from-green-400/30 to-emerald-400/40",
      route: "/purchase-order/orders/new",
      stats: {
        main: "New",
        secondary: "PO"
      },
      filedBy: "Procurement Team"
    },
    {
      id: 3,
      title: "Manage Vendors",
      Icon: FiUsers,
      description: "Add and manage supplier information",
      gradient: "bg-gradient-to-r from-purple-400/30 to-violet-500/40",
      route: "/purchase-order/vendors",
      stats: {
        main: stats.activeVendors,
        secondary: "Vendors"
      },
      filedBy: "Procurement Team"
    },
    {
      id: 4,
      title: "Receive Goods",
      Icon: FiTruck,
      description: "Record received items and update inventory",
      gradient: "bg-gradient-to-r from-yellow-400/30 to-amber-500/40",
      route: "/purchase-order/receive",
      stats: {
        main: stats.pendingDeliveries,
        secondary: "Pending"
      },
      filedBy: "Warehouse Team"
    },
    {
      id: 5,
      title: "Purchase Reports",
      Icon: FiBarChart2,
      description: "View procurement analytics and reports",
      gradient: "bg-gradient-to-r from-red-400/30 to-rose-500/40",
      route: "/purchase-order/reports",
      stats: {
        main: "₹" + (stats.totalSpend/100000).toFixed(1) + "L",
        secondary: "Spend"
      },
      filedBy: "Finance Team"
    },
    {
      id:6,
      title:"View All Requisitions",
      Icon: FiFileText,
      description: "Browse and manage all purchase orders",
      gradient: "bg-gradient-to-r from-orange-400/30 to-orange-500/40",
      route: "/purchase-order/requisition/AllRequisitions",
      stats: {
        main: stats.totalPRs,
        secondary: "Requisitions"
      },
      filedBy: "Project Teams"
    },{
      id: 7,
      title: "View All Orders",
      Icon: FaFileInvoice,
      description: "Browse and manage all purchase orders",
      gradient: "bg-gradient-to-r from-cyan-400/30 to-teal-500/40",
      route: "/purchase-order/orders/AllOrders",
      stats: {
        main: stats.totalPOs,
        secondary: "Orders"
      },
      filedBy: "Procurement Teams"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/dashboard" />
      </div>
      <ScrollToTopButton />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 py-20">
        <h1 className="text-4xl font-bold mb-16 mt-8 text-center">Purchase Order Management</h1>

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
            purchaseCards.map((card) => (
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
                    <div className="text-sm text-white/70">{card.stats.secondary}</div>
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