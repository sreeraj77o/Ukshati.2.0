import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiX, FiDollarSign, FiMessageSquare } from "react-icons/fi";

export default function WalletEditModal({ isOpen, onClose, employee, initialAmount, onSave }) {
  const [editedAmount, setEditedAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEditedAmount(initialAmount ? initialAmount.toString() : "");
    }
  }, [isOpen, initialAmount]);

  const handleSave = () => {
    if (!editedAmount || isNaN(parseFloat(editedAmount)) || parseFloat(editedAmount) < 0) {
      alert("Please enter a valid non-negative amount.");
      return;
    }
    onSave({ amount: parseFloat(editedAmount) });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-[9999] p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-[9999]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit Amount Given</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <FiX className="text-white text-xl" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 text-black">
            {/* Employee Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Employee
              </label>
              <input
                type="text"
                value={employee?.name || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiDollarSign className="text-purple-600" />
                Amount Given
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter amount given"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl shadow-sm transition-all hover:shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
