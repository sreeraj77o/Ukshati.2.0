"use client";
import React, { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import WalletEditModal from "./expense/WalletEditModal";
import { FiArrowUp } from "react-icons/fi";
import { useRouter } from "next/router";

export default function Wallet() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addAmounts, setAddAmounts] = useState({}); // To track added amounts per project
  const [userRole, setUserRole] = useState("");

  // Add state for editing amount_given using modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({ employee: null, amount: "" });

  const handleEditClick = (employee) => {
    setEditModalData({ employee, amount: employee.amount_given });
    setIsEditModalOpen(true);
  };

  // Add state for action messages
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState(""); // 'success' or 'error'

  // Update handleSaveEditModal to show a message
  const handleSaveEditModal = async ({ amount }) => {
    setUpdating(true);
    setError("");
    try {
      const response = await fetch("/api/employees/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: editModalData.employee.id, new_amount_given: parseFloat(amount) }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update amount given");
      }
      // Refresh employees data
      const resp = await fetch("/api/employees/wallet");
      if (!resp.ok) throw new Error("Failed to fetch employee wallet data");
      const data = await resp.json();
      setEmployees(data);
      setIsEditModalOpen(false);
      setEditModalData({ employee: null, amount: "" });
      setActionMessage("Amount given updated successfully!");
      setActionType("success");
    } catch (err) {
      setError(err.message);
      setActionMessage(err.message || "Failed to update amount given");
      setActionType("error");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "";
    setUserRole(storedRole);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userName = user.name || "";
    const userId = user.id || "";
    // Always fetch all employees' wallet data
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees/wallet");
        if (!response.ok) throw new Error("Failed to fetch employee wallet data");
        const data = await response.json();
        setEmployees(data);
        // Save userName and userId for filtering
        setCurrentUserName(userName);
        setCurrentUserId(userId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Add state for current user info
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Show all employees in the wallet table
  const filteredVisibleEmployees = userRole.toLowerCase() === "admin"
    ? employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : employees.filter(emp => parseInt(emp.id) === parseInt(currentUserId));

  // New handler to add or edit amount_given per employee per project
  const handleAddAmountPerProject = async (employee_id, project_id, amountToAdd) => {
    if (userRole.toLowerCase() !== "admin") {
      alert("Adding amount is only allowed for admin users.");
      return;
    }

    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch("/api/employees/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id,
          amount_given: parsedAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add amount given");
      }

      // Refresh employees data to reflect changes
      const fetchEmployees = async () => {
        try {
          const response = await fetch("/api/employees/wallet");
          if (!response.ok) throw new Error("Failed to fetch employee wallet data");
          const data = await response.json();
          setEmployees(data);
        } catch (err) {
          setError(err.message);
        }
      };
      await fetchEmployees();

      setAddAmounts((prev) => ({ ...prev, [`${employee_id}_${project_id}`]: "" })); // Clear input
      setActionMessage("Amount given added successfully!");
      setActionType("success");
    } catch (err) {
      setError(err.message);
      setActionMessage(err.message || "Failed to add amount given");
      setActionType("error");
    } finally {
      setUpdating(false);
    }
  };

  const [projects, setProjects] = React.useState([]);
  const [selectedEmployee, setSelectedEmployee] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState("");
  const [amountGivenInput, setAmountGivenInput] = React.useState("");
  const [descriptionInput, setDescriptionInput] = React.useState("");
  const [editingEntryId, setEditingEntryId] = React.useState(null);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/allProjects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProjects();
  }, []);

  // Update handleAddOrEditAmountGiven to show a message
  const handleAddOrEditAmountGiven = async () => {
    if (userRole.toLowerCase() !== "admin") {
      alert("Only admin users can add or edit amount given.");
      return;
    }
    if (!selectedEmployee || !amountGivenInput) {
      alert("Please select employee and enter amount.");
      return;
    }
    const amount = parseFloat(amountGivenInput);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }
    setUpdating(true);
    setError("");
    try {
      const body = {
        employee_id: selectedEmployee,
        amount_given: amount,
      };
      const response = await fetch("/api/employees/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add amount given");
      }
      // Refresh employees data
      const resp = await fetch("/api/employees/wallet");
      if (!resp.ok) throw new Error("Failed to fetch employee wallet data");
      const data = await resp.json();
      setEmployees(data);
      setSelectedEmployee("");
      setAmountGivenInput("");
      setActionMessage("Amount given added successfully!");
      setActionType("success");
    } catch (err) {
      setError(err.message);
      setActionMessage(err.message || "Failed to add amount given");
      setActionType("error");
    } finally {
      setUpdating(false);
    }
  };

  const downloadCSV = () => {
    const headers = ["Employee Name", "Amount Given", "Total Expense", "Balance"];
    const rows = filteredVisibleEmployees.map(({ name, amount_given, total_expense, balance }) => [
      name,
      amount_given,
      total_expense,
      balance,
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_wallet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading wallet details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg">Error: {error}</p>
      </div>
    </div>
  );

  // Remove all per-project, comments, and edit logic. Only show employee-level data.
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      <div style={{ position: "relative", zIndex: 99999 }}>
        <BackButton route="/expense/home" Icon={FiArrowUp} />
      </div>
      <ScrollToTopButton />

      <div className="relative z-10 flex justify-center items-start py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Employee Wallet
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Track your expenses, view balances, and manage your financial overview
            </p>
          </div>

          {/* Add Amount Given Form - Admin Only */}
          {userRole.toLowerCase() === "admin" && (
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Add Amount Given
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white appearance-none transition-all duration-300 hover:bg-white/15"
                >
                  <option value="" className="bg-gray-800">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-gray-800">
                      {emp.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={amountGivenInput}
                  onChange={(e) => setAmountGivenInput(e.target.value)}
                  className="p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/15"
                />
                <button
                  onClick={handleAddOrEditAmountGiven}
                  disabled={updating}
                  className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/30"
                >
                  {updating ? "Saving..." : "Add Amount"}
                </button>
              </div>
            </div>
          )}

          {/* Search Bar - Admin Only */}
          {userRole.toLowerCase() === "admin" && (
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl bg-white/10 border border-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/15"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Status Message */}
          {actionMessage && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center animate-fade-in mt-4">
              <p className="text-sm font-medium text-blue-400">{actionMessage}</p>
            </div>
          )}

          {/* Wallet Cards or Table */}
          {userRole.toLowerCase() === "admin" ? (
            // Admin: Show old table UI
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white/10 backdrop-blur-lg rounded-3xl shadow-md">
                <thead>
                  <tr className="bg-black/40 text-left sm:text-center">
                    <th className="p-4">Name</th>
                    <th>Amount Given</th>
                    <th>Total Expense</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisibleEmployees.length > 0 ? (
                    filteredVisibleEmployees.map(({ id, name, amount_given = 0, total_expense = 0, balance = 0, project_expenses = [] }) => (
                      <React.Fragment key={id}>
                        <tr className="hover:bg-white/10 transition-all text-center font-bold">
                          <td className="py-3 px-2">{name || "N/A"}</td>
                          <td className="px-2">
                            ₹{parseFloat(amount_given).toFixed(2)}
                            <button
                              onClick={() => handleEditClick({ id, name, amount_given })}
                              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-2">₹{parseFloat(total_expense).toFixed(2)}</td>
                          <td className="px-2">₹{parseFloat(balance).toFixed(2)}</td>
                        </tr>
                        {project_expenses.length > 0 && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <table className="w-full text-xs bg-black/30 rounded-xl mt-0">
                                <thead>
                                  <tr className="text-left">
                                    <th className="p-2 pl-6">Project Name</th>
                                    <th className="p-2">Amount Spent</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {project_expenses.map((proj) => (
                                    <tr key={proj.project_id}>
                                      <td className="p-2 pl-6">{proj.project_name}</td>
                                      <td className="p-2">₹{parseFloat(proj.total_expense).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-gray-400 py-5 text-center">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Employee: Show new card UI
            <div className="flex justify-center items-center min-h-[60vh] w-full">
              <div className="w-full max-w-sm">
                {filteredVisibleEmployees.length > 0 ? (
                  filteredVisibleEmployees.map(({ id, name, amount_given = 0, total_expense = 0, balance = 0, project_expenses = [] }) => (
                    <div key={id} className="group relative">
                      {/* Main Wallet Card */}
                      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-blue-500/20 hover:border-blue-400/30 hover:scale-105">
                        {/* Employee Name */}
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{name || "N/A"}</h3>
                          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
                        </div>
                        {/* Financial Summary */}
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-center p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                            <span className="text-green-400 font-medium">Amount Given</span>
                            <span className="text-green-400 font-bold text-xl">₹{parseFloat(amount_given).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <span className="text-red-400 font-medium">Total Expense</span>
                            <span className="text-red-400 font-bold text-xl">₹{parseFloat(total_expense).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <span className="text-blue-400 font-medium">Balance</span>
                            <span className={`font-bold text-xl ${balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>₹{parseFloat(balance).toFixed(2)}</span>
                          </div>
                        </div>
                        {/* Project Expenses */}
                        {project_expenses.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-300 mb-3 text-center">Project Breakdown</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {project_expenses.map((proj) => (
                                <div key={proj.project_id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                  <span className="text-sm text-gray-300 truncate">{proj.project_name}</span>
                                  <span className="text-sm font-semibold text-yellow-400">₹{parseFloat(proj.total_expense).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <p className="text-gray-400 text-xl">No wallet data found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-400 to-green-300 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <WalletEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={editModalData.employee}
        initialAmount={editModalData.amount}
        onSave={handleSaveEditModal}
      />
      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        /* Custom scrollbar for project expenses */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
