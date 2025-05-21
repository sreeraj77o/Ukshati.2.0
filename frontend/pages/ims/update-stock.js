"use client";
import { useEffect, useState } from "react";
import StarryBackground from "@/components/StarryBackground";
import {
  FiArrowLeft,
  FiSearch,
  FiEdit,
  FiX,
  FiActivity,
  FiFilter,
  FiPlus,
  FiMinus,
  FiPackage,
  FiBox,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { AnimatePresence, motion } from "framer-motion";
import { TableSkeleton, FormSkeleton } from "@/components/skeleton";

// Custom Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-900 rounded-full px-2 sm:px-6 py-2 shadow-md w-full max-w-xs sm:max-w-md">
        <button
          className={`text-gray-400 px-1 sm:px-3 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        <div className="flex gap-2 sm:gap-6 mx-2 overflow-x-auto whitespace-nowrap">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
            <button
              key={num}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm sm:text-lg ${
                currentPage === num ? 'bg-cyan-600 text-white' : 'text-gray-300'
              }`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          className={`text-gray-400 px-1 sm:px-3 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

// Custom Modal Component
const UpdateStockModal = ({ stock, onClose, onUpdate, userRole }) => {
  const [formData, setFormData] = useState({
    quantity: "",
    price: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stock) {
      setLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => {
        setFormData({
          quantity: "",
          price: stock.price_pu || ""
        });
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stock]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (userRole?.toLowerCase() !== "admin") {
      alert("Admin access required to update stock");
      return;
    }
    setIsSubmitting(true);
    try {
      onUpdate({
        stockId: stock.stock_id,
        quantity: Number(formData.quantity),
        price: parseFloat(formData.price)
      });
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIncrement = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ((parseFloat(prev[field]) || 0) + 1).toString()
    }));
  };

  const handleDecrement = (field) => {
    const currentValue = parseFloat(formData[field]) || 0;
    if (currentValue > 0) {
      setFormData(prev => ({
        ...prev,
        [field]: (currentValue - 1).toString()
      }));
    }
  };

  if (!stock) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-400">Add Stock</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          {loading ? (
            <FormSkeleton fields={5} />
          ) : (
            <>
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">Product:</span>
                  <span className="text-white">{stock.item_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">Category:</span>
                  <span className="text-white">{stock.category_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">Current Quantity:</span>
                  <span className="text-white">{stock.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">Current Price:</span>
                  <span className="text-white">₹{stock.price_pu || "0.00"}</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-gray-300 mb-2">
                Quantity to Add
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecrement("quantity")}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiMinus />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement("quantity")}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiPlus />
                  </button>
                </div>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full pl-24 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                  min="1"
                  step="1"
                />
              </div>
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label htmlFor="price" className="block text-gray-300 mb-2">
                New Price per Unit (₹)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecrement("price")}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiMinus />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement("price")}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiPlus />
                  </button>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-24 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
                  min="0.01"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
              )}
            </div>
            <div className="pt-4 flex gap-3 flex-col sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Add Stock"}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function StockUpdate() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const [stocksRes, categoriesRes] = await Promise.all([
        fetch("/api/stocks", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }),
        fetch("/api/categories", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      ]);

      if (!stocksRes.ok) throw new Error("Failed to fetch stocks");
      if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

      const stocksData = await stocksRes.json();
      const categoriesData = await categoriesRes.json();

      // Simulate loading delay (remove in production if not needed)
      await new Promise(resolve => setTimeout(resolve, 300));

      setStocks(stocksData);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = stocks.filter((stock) => {
      const categoryMatch = selectedCategory === "all" || stock.category_name === selectedCategory;
      const searchMatch = stock.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.category_name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
    setFilteredStocks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [stocks, searchTerm, selectedCategory]);

  const handleUpdateStock = async (updateData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/updateStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Stock updated successfully!");
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const openModal = (stock) => {
    if (userRole?.toLowerCase() !== "admin") {
      alert("Admin access required to update stock");
      return;
    }
    setCurrentStock(stock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <header className="p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="hidden sm:flex">
              <BackButton route="/ims/home" />
            </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center w-full sm:w-auto justify-start">
            <h1 className="text-lg sm:text-2xl font-bold text-blue-400 text-center sm:text-left w-full sm:w-auto pl-4">
              Stock Management
            </h1>
          </div>
          <div className="flex-1 w-full sm:w-auto flex justify-end">
            <button
              onClick={() => router.push("/ims/view-stock")}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors text-sm sm:text-base pr-6"
            >
              <FiActivity className="text-xl" />
              <span className="hidden sm:flex">View Inventory</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            />
          </div>
          <div className="relative w-full md:w-64">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm sm:text-base"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_name}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock List */}
        <section className="rounded-xl bg-black border-2 border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <FiEdit className="text-blue-400" />
              Update Stock
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-800">
                <tr>
                  {["Product", "Category", "Qty", "Price", "Total", "Date", "Actions"].map((header, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs sm:text-sm font-semibold text-indigo-400 border-b border-gray-700 ${
                        header === "Product" ? "text-left" : "text-center"
                      }`}
                    >
                      <div className="inline-flex items-center gap-2">
                        <span className="whitespace-nowrap">{header}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <TableSkeleton rows={5} columns={7} />
                    </td>
                  </tr>
                ) : paginatedStocks.map((stock) => (
                  <tr
                    key={stock.stock_id}
                    className="hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white text-left">
                      <div className="flex items-center gap-3">
                        <FiPackage className="text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-none">
                          {stock.item_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 bg-indigo-900/30 text-indigo-400 rounded-full text-xs font-medium border border-indigo-400/20 inline-block">
                        {stock.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                        stock.quantity < 5 ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'
                      }`}>
                        {stock.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-center">
                      ₹{stock.price_pu || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white text-center">
                      ₹{(stock.price_pu * stock.quantity).toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 text-center">
                      {formatDateTime(stock.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openModal(stock)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          userRole?.toLowerCase() === "admin"
                            ? "bg-cyan-600 text-white hover:bg-indigo-500 hover:shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={userRole?.toLowerCase() !== "admin"}
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredStocks.length === 0 && !error && (
            <div className="p-8 text-center text-gray-400">
              No matching stock items found
            </div>
          )}

          {/* Pagination */}
          {filteredStocks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/50 rounded-xl border border-red-700">
            <div className="flex items-center gap-2 text-red-300">
              <FiX className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </main>

      {/* Update Stock Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md overflow-hidden shadow-2xl"
            >
              <UpdateStockModal
                stock={currentStock}
                onClose={closeModal}
                onUpdate={handleUpdateStock}
                userRole={userRole}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}