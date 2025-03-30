"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { FaBars, FaUser, FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import { useRouter } from "next/router";
import { 
  FaUsers, 
  FaBoxOpen, 
  FaMoneyBillWave, 
  FaFileInvoiceDollar, 
  FaFileContract, 
  FaChevronDown,
  FaSignOutAlt,
  FaChevronRight
} from "react-icons/fa";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";


const StarryBackground = dynamic(
  () => import("@/components/StarryBackground"),
  { ssr: false }
);
// Bubble Transition Component
const Bubbles = () => {
  return (
    <div id="bubbles">
      <div
        style={{ animationDuration: `1200ms`, background: "#8f44fd" }}
        className="bubbles__first"
      />
      <div
        style={{ animationDuration: `1200ms`, background: "#000000",filter: "blur(10px)" }}
        className="bubbles__second"
      />
    </div>
  );
};

const AccordionItem = ({ title, children, isOpen, onClick }) => (
  <div className="w-full">
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2 text-gray-100 bg-gray-700/50 rounded-lg"
    >
      <span className="text-sm font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronDown className="text-sm" />
      </motion.div>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-2 pb-4 text-sm text-gray-200">
        {children}
      </div>
    </motion.div>
  </div>
);

const EmployeeModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Add Employee</h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const features = [
    { 
      name: "CRM", 
      path: "/crm/home", 
      icon: <FaUsers className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-red-400 to-orange-600", 
      description: "Manage customer relationships.",
      imageDescription: "Customer Relationship Overview",
      stats: { main: "7,209", secondary: "75" },
      filedBy: "nithin.10__ and others",
      accordion: [
        { title: "Customer Management", content: "Track customer interactions and history." },
        { title: "Analytics", content: "View customer engagement metrics and insights." }
      ],
      image: "https://img.freepik.com/free-vector/flat-customer-support-illustration_23-2148899114.jpg"
    },
    { 
      name: "Inventory", 
      path: "/ims/home", 
      icon: <FaBoxOpen className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-green-400 to-teal-500", 
      description: "Track stock and supplies.",
      imageDescription: "Inventory Management System",
      stats: { main: "5,432", secondary: "89" },
      filedBy: "stock.manager__ and others",
      accordion: [
        { title: "Stock Levels", content: "Monitor real-time stock availability." },
        { title: "Supplies", content: "Manage and reorder supplies efficiently." }
      ],
      image: "https://img.freepik.com/premium-vector/warehouse-workers-check-inventory-levels-items-shelves-inventory-management-stock-control-vector-illustration_327176-1435.jpg"
    },
    { 
      name: "Expense", 
      path: "/expense/home", 
      icon: <FaMoneyBillWave className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-red-400 to-pink-500", 
      description: "Monitor business expenses.",
      imageDescription: "Expense Tracking Dashboard",
      stats: { main: "3,876", secondary: "42" },
      filedBy: "finance.team__ and others",
      accordion: [
        { title: "Expense Tracking", content: "Track all business expenses in one place." },
        { title: "Reports", content: "Generate detailed expense reports." }
      ],
      image: "https://www.itarian.com/assets-new/images/time-and-expense-tracking.png" 
    },
    { 
      name: "Billing", 
      path: "billing/billing", 
      icon: <FaFileInvoiceDollar className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-purple-400 to-indigo-500", 
      description: "Generate and manage invoices.",
      imageDescription: "Billing Management System",
      stats: { main: "9,123", secondary: "67" },
      filedBy: "billing.team__ and others",
      accordion: [
        { title: "Invoice Creation", content: "Create and customize invoices." },
        { title: "Payment Tracking", content: "Track payments and due dates." }
      ],
      image: "https://img.freepik.com/free-vector/invoice-concept-illustration_114360-2805.jpg"
    },
    { 
      name: "Quotation", 
      path: "/quotation/home", 
      icon: <FaFileContract className="text-5xl" />, 
      gradient: "bg-gradient-to-r from-orange-400 to-yellow-500", 
      description: "Create and send quotations.",
      imageDescription: "Quotation Management System",
      stats: { main: "4,567", secondary: "34" },
      filedBy: "sales.team__ and others",
      accordion: [
        { title: "Quotation Templates", content: "Use pre-built templates for quotations." },
        { title: "Client Management", content: "Manage client-specific quotations." }
      ],
      image: "https://png.pngtree.com/thumb_back/fh260/background/20221006/pngtree-money-concept-quotation-on-chalkboard-background-learn-investment-market-photo-image_22951928.jpg" 
    },
  ];

  const [flipped, setFlipped] = useState(Array(features.length).fill(false));
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  const router = useRouter();
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  const triggerBubbleTransition = (callback) => {
    const bubbles = document.getElementById("bubbles");
    bubbles?.classList.add("show");
    setTimeout(() => {
      callback();
      bubbles?.classList.remove("show");
      bubbles?.classList.add("hide");
    }, 1000);
    setTimeout(() => bubbles?.classList.remove("hide"), 2400);
  };
  
  const handleHelpClick = () => {
    const mailtoLink = `mailto:jaideepn3590@duck.com?subject=Help `;
    window.location.href = mailtoLink;
  };
  
  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

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

  const openAboutUs = () => triggerBubbleTransition(() => setIsAboutUsOpen(true));
  const closeAboutUs = () => triggerBubbleTransition(() => setIsAboutUsOpen(false));
  const openContactUs = () => triggerBubbleTransition(() => setIsContactUsOpen(true));
  const closeContactUs = () => triggerBubbleTransition(() => setIsContactUsOpen(false));

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-gray-900">
      <StarryBackground/>
      <Bubbles />

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar className="backdrop-blur-sm py-4 shadow-lg">
          <NavbarBrand>
            <Link href="/dashboard">
              <Image 
                src="/lg.png" 
                alt="Ukshati Logo" 
                width={180} 
                height={120} 
                className="cursor-pointer hover:opacity-80 transition-opacity pb-2"
              />
            </Link>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-6" justify="center">
            <NavbarItem>
              <button onClick={openAboutUs} className="text-blue-400 hover:text-blue-300 pb-2 transition-colors">About Us</button>
            </NavbarItem>
            <NavbarItem>
              <button onClick={handleHelpClick} className="text-blue-400 hover:text-blue-300 pb-2 transition-colors">Help</button>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent className="absolute left-1/2 transform -translate-x-1/2" justify="center">
            <NavbarItem>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FaUser className="text-lg" />
                <span>{userData?.name || 'User'}</span>
                <motion.span
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-sm" />
                </motion.span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3 text-white">
                        <FaUser className="text-2xl" />
                        <div>
                          <p className="text-sm font-medium">{userData?.name || 'Unknown User'}</p>
                          <p className="text-xs text-white">{userData?.email || 'No email'}</p>
                          <p className="text-xs text-white capitalize">{userRole || 'unknown'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-all"
                      >
                        <span>Logout</span>
                        <FaSignOutAlt />
                      </button>
                    </div>

                    {userRole === 'admin' && (
                      <div className="p-2 border-t border-gray-700">
                        <button
                          onClick={() => {
                            setShowEmployeeDetails(!showEmployeeDetails);
                            if (!showEmployeeDetails) fetchEmployees();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <span>Employee Management</span>
                          <motion.span
                            animate={{ rotate: showEmployeeDetails ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FaChevronDown />
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showEmployeeDetails && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-2 py-1">
                                <button
                                  onClick={() => setShowEmployeeModal(true)}
                                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-green-400 hover:bg-gray-700 rounded-lg transition-all mb-2"
                                >
                                  <span>Add Employee</span>
                                  <FaUserPlus />
                                </button>

                                {loadingEmployees && (
                                  <div className="flex items-center justify-center space-x-2 py-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="text-white text-xs">Loading employees...</span>
                                  </div>
                                )}

                                {error && (
                                  <div className="p-2 bg-red-800/50 rounded-lg mb-2">
                                    <p className="text-red-400 text-xs">Error: {error}</p>
                                  </div>
                                )}

                                {!loadingEmployees && employees.length === 0 && !error && (
                                  <div className="text-center py-2">
                                    <p className="text-gray-400 text-xs mb-1">No employees found</p>
                                    <button
                                      onClick={fetchEmployees}
                                      className="text-blue-400 hover:text-blue-300 text-xs"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                )}

                                {!loadingEmployees && employees.length > 0 && !error && (
                                  <div className="max-h-60 overflow-y-auto text-white">
                                    {employees.map((employee) => (
                                      <div 
                                        key={employee.id} 
                                        className="mb-2 border-b border-gray-700 last:border-0"
                                      >
                                        <button
                                          onClick={() => toggleEmployeeDetails(employee.id)}
                                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-700 rounded-lg transition-all"
                                        >
                                          <span className="truncate">{employee.name}</span>
                                          <motion.span
                                            animate={{ rotate: expandedEmployee === employee.id ? 180 : 0 }}
                                            className="text-gray-400 text-xs"
                                          >
                                            <FaChevronDown />
                                          </motion.span>
                                        </button>

                                        <AnimatePresence>
                                          {expandedEmployee === employee.id && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="bg-gray-700/50 rounded-lg px-3 py-2 ml-2"
                                            >
                                              <div className="text-xs space-y-1">
                                                <div className="flex items-center">
                                                  <span className="text-gray-300">Email: </span>
                                                  <span className="ml-1 truncate">{employee.email}</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <span className="text-gray-300">Phone: </span>
                                                  <span className="ml-1">{employee.phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <span className="text-gray-300">Role: </span>
                                                  <span className="ml-1 capitalize">{employee.role}</span>
                                                </div>
                                                <button
                                                  onClick={() => handleDeleteEmployee(employee.id)}
                                                  className="w-full mt-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-all"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </NavbarContent>
        </Navbar>
      </div>

      {/* About Us Content */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
          <div className="p-8 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-5xl font-bold mb-6 text-white">About Us</h2>
            <p className="text-xl text-white mb-4">
              At Ukshati Technologies Pvt Ltd, we have created a platform for automating plant watering. Our mission is to simplify watering while reducing water waste.
            </p>
            <p className="text-xl text-white mb-4">
              Our customizable solutions work for both large gardens and small balconies. We offer water tank-based systems for areas without direct water access, with optional aesthetic enclosures. Our waterproof models withstand various weather conditions, integrating with existing home water systems.
            </p>
            <button onClick={closeAboutUs} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 z-50 shadow-lg"
          >
            <FaCheck className="text-xl" />
            <span>Account created successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Modal */}
      <EmployeeModal 
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleAddEmployee}
        formData={formData}
        setFormData={setFormData}
        loading={formSubmitting}
      />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24">
        <div className="mb-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-8 w-full max-w-5xl px-4 perspective-1000 lg:h-[500px]">
          {features.map((feature, index) => (
            <Tilt
              key={index}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1500}
              glareEnable={true}
              glareMaxOpacity={0.3}
              glareColor="#ffffff"
              glarePosition="all"
              glareBorderRadius="1rem"
              scale={1.05}
              transitionSpeed={800}
              tiltReverse={true}
              trackOnWindow={true}
              gyroscope={true}
              className={`relative ${
                index === 1 ? 'lg:h-[500px]' : 'h-[180px] sm:h-[240px]'
              } ${
                index === 0 ? 'lg:col-start-1 lg:row-start-1' :
                index === 1 ? 'lg:col-start-2 lg:row-start-1 lg:row-span-2' :
                index === 2 ? 'lg:col-start-3 lg:row-start-1' :
                index === 3 ? 'lg:col-start-1 lg:row-start-2' :
                'lg:col-start-3 lg:row-start-2'
              }`}
            >
              <motion.div
                className="cursor-pointer w-full h-full"
                onClick={() => handleFlip(index)}
                onMouseLeave={() => setFlipped(prev => {
                  const newFlipped = [...prev];
                  newFlipped[index] = false;
                  return newFlipped;
                })}
                whileHover={{ 
                  y: index === 1 ? -20 : -10, 
                  scale: index === 1 ? 1.02 : 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Front Side */}
                <motion.div
                  className={`absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-2xl shadow-2xl ${feature.gradient} border-2 border-white/20`}
                  initial={false}
                  animate={{ rotateY: flipped[index] ? 180 : 0, scale: flipped[index] ? 0.95 : 1 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    {feature.icon}
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold mt-4 text-white drop-shadow-md">
                    {feature.name}
                  </h2>
                </motion.div>

                {/* Back Side */}
                <motion.div
                  className={`absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-2xl shadow-2xl ${feature.gradient} border-2 border-white/20`}
                  initial={false}
                  animate={{ rotateY: flipped[index] ? 0 : -180, scale: flipped[index] ? 1 : 0.95 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
                  style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                >
                  <div className={`w-full ${index === 1 ? 'h-64' : 'h-32'} mb-4 relative`}>
                    <Image
                      src={feature.image}
                      alt={feature.imageDescription}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <Link href={feature.path} className="w-full flex justify-center">
                    <motion.button 
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Access {feature.name}
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </Tilt>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer/>

      <style jsx global>{`
        /* Original Button Styles */
        .next-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .arrow-container {
          display: inline-block;
          overflow: hidden;
          width: 0;
          transition: all 0.3s ease;
        }

        .arrow-icon {
          transform: translateX(-10px);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .next-button:hover .arrow-container {
          width: 24px;
        }

        .next-button:hover .arrow-icon {
          transform: translateX(0);
          opacity: 1;
        }

        .next-button__line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.3);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .next-button:hover .next-button__line {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Updated Footer Styles */
        .example-1 {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
          border-radius: 30px;
          padding: 10px;
          height: 60px;
          width: 300px;
          margin: 0 auto;
        }

        .icon-content {
          margin: 0 10px;
          position: relative;
        }

        .tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #fff;
          color: #000;
          padding: 6px 10px;
          border-radius: 5px;
          opacity: 0;
          visibility: hidden;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .icon-content:hover .tooltip {
          opacity: 1;
          visibility: visible;
          top: -50px;
        }

        .link {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #fff;
          background-color: #000;
          transition: all 0.3s ease-in-out;
        }

        .link:hover {
          box-shadow: 3px 2px 45px 0px rgba(0,0,0,0.12);
        }

        .link[data-social="facebook"]:hover { color: #1877f2; }
        .link[data-social="instagram"]:hover { color: #e4405f; }
        .link[data-social="linkedin"]:hover { color: #0a66c2; }
        .link[data-social="twitter"]:hover { color: #1da1f2; }
      `}</style>
    </div>
  );
}
