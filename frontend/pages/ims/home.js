"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye, FaEdit, FaTrash, FaUserPlus, FaCheck, FaUsers, FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";
import BackButton from "@/components/BackButton";

export default function Home() {
  const router = useRouter();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.employees)) {
        throw new Error('Invalid employee data format');
      }

      setEmployees(data.employees);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      fetchEmployees();
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
    }
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");
        
        if (!storedUser || !storedRole) {
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || 'N/A'
        });
        setUserRole(storedRole.toLowerCase());
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/ims/login");
      }
    };
    loadUserData();
  }, [router]);

  const inventoryCards = [
    { 
      id: 1, 
      title: "Add Stock", 
      Icon: FaPlus, 
      colors: ["#1e40af", "#3b82f6", "#93c5fd", "#3b82f6", "#1e40af"],
      route: "/ims/stocks", 
      image: "https://www.pngmart.com/files/8/Inventory-PNG-HD.png" 
    },
    { 
      id: 2, 
      title: "View Stock", 
      Icon: FaEye, 
      colors: ["#065f46", "#10b981", "#6ee7b7", "#10b981", "#065f46"],
      route: "/ims/view-stock", 
      image: "https://png.pngtree.com/png-clipart/20230825/original/pngtree-inventory-control-vector-warehouse-industry-picture-image_8773876.png"
    },
    { 
      id: 3, 
      title: "Update Stock",
      Icon: FaEdit, 
      colors: ["#854d0e", "#ca8a04", "#fde047", "#ca8a04", "#854d0e"],
      route: "/ims/update-stock", 
      image: "https://cdni.iconscout.com/illustration/premium/thumb/inventory-management-6114065-5059489.png" 
    },
    { 
      id: 4, 
      title: "Inventory Spent", 
      Icon: FaTrash, 
      colors: ["#7f1d1d", "#dc2626", "#f87171", "#dc2626", "#7f1d1d"],
      route: "/ims/inventory-spent", 
      image: "https://www.deskera.com/blog/content/images/2021/06/InventoryManagement_Hero@3x.png" 
    }
  ];

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const newEmployee = await response.json();
      setEmployees(prev => [...prev, newEmployee]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover text-black">
      <StarryBackground/>
      <BackButton route="/dashboard"/>
      
      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-4xl font-bold mb-16 mt-8 text-center text-white">Inventory Management System</h1>
        <div className="w-full max-w-6xl px-4">
          <motion.div
            className="flex gap-4 h-[500px]"
            animate={{
              marginRight: isMenuOpen ? "16rem" : "0",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {inventoryCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                initial={{ flex: 0.7 }}
                animate={{ 
                  flex: activeCard === card.id ? 2 : 0.7,
                  scale: activeCard === card.id ? 1.03 : 1 
                }}
                onHoverStart={() => setActiveCard(card.id)}
                onHoverEnd={() => setActiveCard(null)}
                onClick={() => router.push(card.route)}
                transition={{ 
                  type: "spring", 
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, ${card.colors.join(', ')})`,
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <motion.div 
                  className="absolute inset-0 bg-black/20 transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  animate={{
                    opacity: activeCard === card.id ? 1 : 0
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-center whitespace-nowrap"
                    animate={{ 
                      fontSize: activeCard === card.id ? "2rem" : "1.5rem",
                      marginBottom: activeCard === card.id ? "1.5rem" : "1rem",
                      rotate: activeCard === card.id ? 0 : -90,
                      transformOrigin: "center"
                    }}
                  >
                    {card.title}
                  </motion.h2>
                  <motion.div
                    animate={{
                      opacity: activeCard === card.id ? 1 : 0
                    }}
                  >
                    <card.Icon className="text-4xl mb-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <footer className="w-full backdrop-blur-sm text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Inventory System</p>
      </footer>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-xl w-96"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                  {formSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}