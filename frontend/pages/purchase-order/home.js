"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authenticate } from "@/lib/auth";
// import { connectToDB } from "@/lib/db";
import {
  FiShoppingBag, FiFileText, FiTruck, FiUsers, FiPlus,
  FiClipboard, FiBarChart2, FiSearch, FiFilter
} from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import { CardSkeleton, TableSkeleton } from "@/components/skeleton";
import ScrollToTopButton from "@/components/scrollup";

export default function PurchaseDashboard() {
  

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPOs: 0,
    pendingDeliveries: 0,
    totalSpend: 0,
    activeVendors: 0
  });
  
  useEffect(() => {
    // Simulate data loading
    const fetchData = async () => {
      try {
        // Replace with actual API call
        const response = await fetch('/api/purchase/orders');
        const data = await response.json();
        setStats(data);
        console.log(data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            totalPOs: 2,
            pendingDeliveries: 8,
            totalSpend: 1250000,
            activeVendors: 15
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const purchaseCards = [
    {
      id: 1,
      title: "Create Requisition",
      Icon: FiClipboard,
      description: "Request items for your project",
      gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
      route: "/purchase-order/requisition/new",
      stats: {
        main: "New",
        secondary: "Request"
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
      id: 6,
      title: "View All Orders",
      Icon: FiFileText,
      description: "Browse and manage all purchase orders",
      gradient: "bg-gradient-to-r from-cyan-400/30 to-teal-500/40",
      route: "/purchase-order/orders/AllOrders",
      stats: {
        main: stats.totalPOs,
        secondary: "Orders"
      },
      filedBy: "Procurement Teams"
    },
    {
      id:7,
      title:"View All Requisitions",
      Icon: FiFileText,
      description: "Browse and manage all purchase orders",
      gradient: "bg-gradient-to-r from-orange-400/30 to-orange-500/40",
      route: "/purchase-order/requisition/AllRequisitions",
      stats: {
        main: stats.totalPOs,
        secondary: "Requisitions"
      },
      filedBy: "Project Teams"
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
        <div className="w-full max-w-md mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search PO number, vendor, or item..."
              className="w-full bg-gray-800 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

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