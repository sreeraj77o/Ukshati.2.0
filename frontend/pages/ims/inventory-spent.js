"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiArrowLeft, FiActivity, FiSearch, FiMapPin, FiFilter, FiClock, FiCalendar, FiPackage, FiBookmark, FiDollarSign, FiCreditCard, FiFolder, FiUser } from "react-icons/fi";
import StarryBackground from "@/components/StarryBackground";
import BackButton from "@/components/BackButton";
import { TableSkeleton } from "@/components/skeleton";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const visiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);
  if (endPage - startPage + 1 < visiblePages) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }
  return (
    <div className="flex justify-center p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-900 rounded-full px-6 py-3 shadow-md">
        <button
          className={`text-gray-400 px-3 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        <div className="flex gap-2">
          {startPage > 1 && (
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg text-gray-300 hover:bg-gray-700"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
          )}
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map((num) => (
            <button
              key={num}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
                currentPage === num ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
          {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          {endPage < totalPages && (
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg text-gray-300 hover:bg-gray-700"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          )}
        </div>
        <button
          className={`text-gray-400 px-3 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

const SortIndicator = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return null;
  return (
    <span className="ml-1">
      {sortConfig.direction === "asc" ? "↑" : "↓"}
    </span>
  );
};

export default function InventorySpent() {
  const router = useRouter();
  const [spentStocks, setSpentStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "spent_at", direction: "desc" });
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    active: false
  });
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [spentRes, categoriesRes] = await Promise.all([
          fetch("/api/inventory_spent"),
          fetch("/api/categories")
        ]);
        if (!spentRes.ok) throw new Error("Failed to fetch spent items");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const [spentData, categoriesData] = await Promise.all([
          spentRes.json(),
          categoriesRes.json()
        ]);
        // Enhance spent items with formatted date
        const spentWithDetails = spentData.map(spent => ({
          ...spent,
          formatted_date: new Date(spent.spent_at).toLocaleString(),
          total_price: (spent.quantity_used * (spent.unit_price || 0)).toFixed(2)
        }));
        setSpentStocks(spentWithDetails);
        setCategories(categoriesData.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const handleDateFilterChange = (type, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [type]: value,
      active: !!value || (type === "endDate" ? prev.startDate : prev.endDate)
    }));
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateFilter({
      startDate: null,
      endDate: null,
      active: false
    });
    setCurrentPage(1);
  };

  const filteredStocks = [...spentStocks].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  }).filter((stock) => {
    // Category filter
    const categoryMatch =
      selectedCategory === "all" ||
      (selectedCategory === "uncategorized" && !stock.category_name) ||
      stock.category_name === selectedCategory;

    // Search filter
    const searchString = `${stock.item_name} ${stock.project_name} ${stock.employee_name} ${stock.location || ""} ${stock.category_name || ""} ${stock.formatted_date}`
      .toLowerCase();
    const searchMatch = searchString.includes(searchQuery.toLowerCase());

    // Date filter
    const stockDate = new Date(stock.spent_at);
    let dateMatch = true;
    if (dateFilter.active) {
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        dateMatch = dateMatch && stockDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && stockDate <= endDate;
      }
    }

    return categoryMatch && searchMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-gray-100 relative">
      <header className="p-4 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-8xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left Section - Back Button */}
          <div className="flex-shrink-0">
            <BackButton route="/ims/home" />
          </div>
          {/* Center Section - Heading */}
          <h1 className="text-lg sm:text-2xl font-bold text-blue-400 text-center truncate px-2">
            Spent Inventory History
          </h1>
          {/* Right Section - View Stocks Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => router.push("/ims/view-stock")}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors group"
            >
              {/* Mobile Icon Only */}
              <FiActivity className="text-xl md:hidden" />
              {/* Desktop Text + Icon */}
              <div className="hidden md:flex items-center gap-2">
                <FiActivity className="text-xl" />
                <span className="font-semibold">View Stocks</span>
              </div>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7.5xl mx-auto p-4 space-y-8">
        {/* Filters Section */}
        <section className="rounded-xl bg-black backdrop-blur-sm border-2 border-gray-700">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-white">Spent Stock Records</h2>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Date Filters */}
                <div className="grid grid-cols-2 gap-2 w-full sm:w-64">
                  <input
                    type="date"
                    value={dateFilter.startDate || ""}
                    onChange={(e) => handleDateFilterChange("startDate", e.target.value)}
                    className="p-2 text-sm rounded bg-gray-800 text-white"
                  />
                  <input
                    type="date"
                    value={dateFilter.endDate || ""}
                    onChange={(e) => handleDateFilterChange("endDate", e.target.value)}
                    className="p-2 text-sm rounded bg-gray-800 text-white"
                  />
                </div>
                {/* Search Input */}
                <div className="relative flex items-center w-full md:w-80">
                  <FiSearch className="absolute left-3 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Category Select */}
                <div className="relative flex items-center w-full md:w-64">
                  <FiFilter className="absolute left-3 text-blue-400" />
                  <select
                    className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="uncategorized">Uncategorized</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_name}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Table */}
            {loading ? (
  <div className="p-0">
    <TableSkeleton rows={5} columns={9} />
  </div>
) : error ? (
  <div className="p-6 text-center text-red-400 bg-red-900/20 rounded-lg">
    Error: {error}
  </div>
) : filteredStocks.length === 0 ? (
  <div className="p-6 text-center text-gray-400 bg-gray-700/20 rounded-lg">
    No matching records found
  </div>
) : (
  <div className="overflow-x-auto rounded-lg border border-gray-700">
    <table className="w-full">
      <thead className="bg-gray-850">
        <tr>
          {[
            { key: "item_name", label: "Product", icon: <FiPackage className="w-4 h-4" /> },
            { key: "category_name", label: "Category", icon: <FiBookmark className="w-4 h-4" /> },
            { key: "quantity_used", label: "Quantity", icon: <FiActivity className="w-4 h-4" /> },
            { key: "unit_price", label: "Unit Price", icon: <FiDollarSign className="w-4 h-4" /> },
            { key: "total_price", label: "Total Cost", icon: <FiCreditCard className="w-4 h-4" /> },
            { key: "location", label: "Location", icon: <FiMapPin className="w-4 h-4" /> },
            { key: "project_name", label: "Project", icon: <FiFolder className="w-4 h-4" /> },
            { key: "employee_name", label: "Recorded By", icon: <FiUser className="w-4 h-4" /> },
            { key: "spent_at", label: "Date", icon: <FiCalendar className="w-4 h-4" /> }
          ].map(({ key, label, icon }) => (
            <th
              key={key}
              onClick={() => requestSort(key)}
              className="px-6 py-4 text-left text-sm font-semibold text-indigo-400 cursor-pointer hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {icon}
                <span>{label}</span>
                <SortIndicator columnKey={key} sortConfig={sortConfig} />
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-700">
        {paginatedStocks.map((spent, index) => (
          <tr key={index} className="hover:bg-gray-850/30 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-100">{spent.item_name}</td>

            <td className="px-6 py-4">
              <span className="px-3 py-1.5 bg-indigo-900/30 text-indigo-400 rounded-full text-sm border border-indigo-400/20">
                {spent.category_name || "Uncategorized"}
              </span>
            </td>

            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                spent.quantity_used < 5 ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'
              }`}>
                {spent.quantity_used}
              </span>
            </td>

            <td className="px-6 py-4 text-gray-300">₹{spent.unit_price}</td>

            <td className="px-6 py-4 font-medium text-indigo-400">
              ₹{spent.total_price}
            </td>

            <td className="px-6 py-4 text-gray-400">
              {spent.location || (
                <span className="italic text-gray-500">Not specified</span>
              )}
            </td>

            <td className="px-6 py-4 max-w-[200px] truncate text-gray-300" title={spent.project_name}>
              {spent.project_name || "N/A"}
            </td>

            <td className="px-6 py-4 text-gray-300">{spent.employee_name || "Unknown"}</td>

            <td className="px-6 py-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <FiClock className="w-4 h-4" />
                <span>{formatDateTime(spent.spent_at)}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
          </div>
        </section>
        {/* Pagination */}
        {filteredStocks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}