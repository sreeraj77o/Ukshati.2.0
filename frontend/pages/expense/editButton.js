import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiX, FiCalendar, FiDollarSign,FiMessageSquare } from "react-icons/fi";

export default function EditButton({ project, fetchProjects }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [userRole, setUserRole] = useState(""); //changed
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("userEmail") || "";

    console.log("Fetching stored email:", storedEmail);
    setUserRole(storedRole);
    setLoggedInUserEmail(storedEmail);

    if (project) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const parts = date.split("-");
        return parts.length === 3
          ? `${parts[2]}-${parts[1]}-${parts[0]}`
          : date;
      };

      setEditedProject({
        projectName: project?.pname || "",
        clientName: project?.cname || "",
        startDate: formatDateForInput(project?.start_date),
        endDate: formatDateForInput(project?.end_date),
        amount: project?.total_amount || "",
        comments: project?.comments || "",
      });
    }
  }, [project]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole"); //changed

    console.log("Fetching stored email:", localStorage.getItem("userEmail"));
    setUserRole(localStorage.getItem("userRole") || "");

    setUserRole(storedRole);

    if (project) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const parts = date.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD //changes
      };

      setEditedProject({
        projectName: project.pname || "",
        clientName: project.cname || "",
        startDate: formatDateForInput(project.start_date),
        endDate: formatDateForInput(project.end_date),
        amount: project.total_amount || "",
        comments: project.comments || "",
      });
    }
  }, [project]);

  const handleEditClick = () => {
    if (localStorage.getItem("userRole").toLowerCase() !== "admin") {
      //changes
      alert("Editing is only allowed for admin users.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setEditedProject({
      ...editedProject,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // Reload values from localStorage
      const userRole = localStorage.getItem("userRole") || "";
      const loggedInUserEmail = localStorage.getItem("userEmail") || "";

      console.log("🔍 User Role:", userRole); // Debugging
      console.log("📧 Logged-in User Email:", loggedInUserEmail); // Debugging

      if (!loggedInUserEmail) {
        alert("User email not found. Please login again.");
        return;
      }

      if (!userRole) {
        alert("User role not found. Please login again.");
        return;
      }

      if (userRole.toLowerCase() !== "admin") {
        alert("Only admins can save changes.");
        return;
      }

      // Proceed with saving the project
      const response = await fetch("/api/updateProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loggedInUserEmail, // Ensure email is passed correctly
          projectName: editedProject.projectName,
          clientName: editedProject.clientName,
          startDate: editedProject.startDate,
          endDate: editedProject.endDate,
          amount: editedProject.amount,
          comments: editedProject.comments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update project");
      }

      alert(result.message || "Project updated successfully!");
      setIsModalOpen(false);

      if (fetchProjects) {
        fetchProjects(); // Refresh projects
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error updating project:", error);
      alert("Error updating project: " + error.message);
    }
  };

  return (
    <>
      <button
        onClick={handleEditClick}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
      >
        <FiEdit className="text-lg" />
        <span>Edit Project</span>
      </button>

      <AnimatePresence>
        {isModalOpen && editedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-9999 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-9999 "
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Edit Project Details</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FiX className="text-white text-xl" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6 text-black ">
                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiEdit className="text-purple-600" />
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={editedProject.projectName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiEdit className="text-purple-600" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={editedProject.clientName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter client name"
                  />
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiCalendar className="text-purple-600" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={editedProject.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiCalendar className="text-purple-600" />
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={editedProject.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiDollarSign className="text-purple-600" />
                    Project Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={editedProject.amount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter total amount"
                    />
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiMessageSquare className="text-purple-600" />
                    Additional Comments
                  </label>
                  <textarea
                    name="comments"
                    value={editedProject.comments}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
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
        )}
      </AnimatePresence>
    </>
  );
}