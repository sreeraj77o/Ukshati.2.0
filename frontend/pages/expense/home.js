"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Wallet, Briefcase, Pause, Check, Menu, Info, DollarSign } from 'lucide-react';
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { CardSkeleton } from "@/components/skeleton";

export default function Home() {
  const router = useRouter();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });
  // State for employee modal
  const [formSubmitting, setFormSubmitting] = useState(false);
  // State for card flipping
  const [flipped, setFlipped] = useState(Array(5).fill(false));
  // State for loading
  const [loading, setLoading] = useState(true);

  // Handle card flip
  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");

        if (!storedUser || !storedRole) {
          router.push("/expense/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.email) throw new Error("Invalid user data");

        // Simulate data loading delay (remove in production if not needed)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Set loading to false after authentication check
        setLoading(false);
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/expense/login");
      }
    };
    loadUserData();
  }, [router]);

  const expenseCards = [
    {
      title: "Add expense",
      description: "Create and manage expenses",
      icon: <Wallet size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-red-400/30 to-rose-400/40",
      value: "₹0",
      label: "today",
      team: "Filed by Finance team",
      route: "/expense/addExpense"
    },
    {
      title: "Ongoing",
      description: "Track ongoing expenses",
      icon: <Briefcase size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
      value: "5",
      label: "active",
      team: "Filed by Finance team",
      route: "/Ongoing"
    },
    {
      title: "On Hold",
      description: "Expenses awaiting approval",
      icon: <Pause size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-yellow-400/30 to-amber-500/40",
      value: "2",
      label: "pending",
      team: "Awaiting manager approval",
      route: "/On Hold"
    },
    {
      title: "Completed",
      description: "Settled expense reports",
      icon: <Check size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-green-400/30 to-emerald-400/40",
      value: "12",
      label: "this month",
      team: "Processed by Finance team",
      route: "/Completed"
    },
    {
      title: "All Projects",
      description: "View all expense projects",
      icon: <Menu size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-violet-400/30 to-purple-500/40",
      value: "19",
      label: "total",
      team: "Across all departments",
      route: "/all-projects"
    },
    {
      title: "Wallet",
      description: "Monitor all employee wallet balances",
      icon: <DollarSign size={24} className="text-white" />,
      gradient: "bg-gradient-to-r from-cyan-400/30 to-teal-500/40", // NEW COLOR
      value: "20",
      label: "total balance",
      team: "Across all Employees",
      route: "/wallet"
    },
  ];

  // Employee modal submit handler
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create employee");
      }

      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <BackButton route="/dashboard" />
      <ScrollToTopButton/>

      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-3xl font-medium text-white mb-10">
          Expense Management System
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {loading ? (
            <CardSkeleton count={6} />
          ) : (
            expenseCards.map((card, index) => (
              <Tilt key={index} tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer ${card.gradient}`}
                  onClick={() => router.push(card.route)}
                >
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                          {card.icon}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlip(index);
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                        >
                          {flipped[index] ? <Info size={20} className="text-white/80" /> : <Info size={20} className="text-white/80" />}
                        </button>
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-white">{card.title}</h3>
                      <p className="mt-1 text-gray-200">{card.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-gray-200">{card.label}</p>
                      </div>
                      <div className="text-xs text-gray-200">
                        {card.team}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            ))
          )}
        </div>
      </div>

      <footer className="w-full bg-black border-t border-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Expense System</p>
      </footer>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-xl w-96"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              Add New Employee
            </h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
