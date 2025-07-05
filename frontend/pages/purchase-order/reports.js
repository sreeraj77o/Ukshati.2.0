import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiBarChart2, FiDownload, FiFilter, FiCalendar, 
  FiDollarSign, FiShoppingBag, FiTruck, FiUsers 
} from 'react-icons/fi';
import BackButton from '../../components/BackButton';
import ScrollToTopButton from "@/components/scrollup";
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PurchaseReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalSpend: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topVendors: [],
    monthlySpend: [],
    categorySpend: [],
    recentOrders: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1 of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/purchase/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      // const data = await response.json();
      // setReportData(data);
      
      // Simulated data
      setTimeout(() => {
        const mockData = {
          totalSpend: 2450000,
          totalOrders: 42,
          avgOrderValue: 58333,
          topVendors: [
            { id: 1, name: "ABC Suppliers Ltd.", spend: 850000, orders: 15 },
            { id: 2, name: "XYZ Industrial Equipment", spend: 650000, orders: 8 },
            { id: 3, name: "Global Tech Solutions", spend: 450000, orders: 7 },
            { id: 4, name: "Metro Office Supplies", spend: 350000, orders: 12 },
            { id: 5, name: "Eastern Hardware Co.", spend: 150000, orders: 5 }
          ],
          monthlySpend: [
            { month: "Jan", spend: 180000 },
            { month: "Feb", spend: 220000 },
            { month: "Mar", spend: 280000 },
            { month: "Apr", spend: 320000 },
            { month: "May", spend: 250000 },
            { month: "Jun", spend: 350000 },
            { month: "Jul", spend: 420000 },
            { month: "Aug", spend: 380000 },
            { month: "Sep", spend: 50000 }
          ],
          categorySpend: [
            { category: "Electronics", spend: 850000 },
            { category: "Office Supplies", spend: 450000 },
            { category: "Construction", spend: 650000 },
            { category: "Services", spend: 350000 },
            { category: "Miscellaneous", spend: 150000 }
          ],
          recentOrders: [
            { id: 1, po_number: "PO-20230915-001", vendor_name: "ABC Suppliers Ltd.", date: "2023-09-15", amount: 85000, status: "delivered" },
            { id: 2, po_number: "PO-20230910-002", vendor_name: "XYZ Industrial Equipment", date: "2023-09-10", amount: 65000, status: "sent" },
            { id: 3, po_number: "PO-20230905-003", vendor_name: "Global Tech Solutions", date: "2023-09-05", amount: 45000, status: "delivered" },
            { id: 4, po_number: "PO-20230901-004", vendor_name: "Metro Office Supplies", date: "2023-09-01", amount: 35000, status: "sent" },
            { id: 5, po_number: "PO-20230825-005", vendor_name: "Eastern Hardware Co.", date: "2023-08-25", amount: 15000, status: "delivered" }
          ]
        };
        setReportData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("Purchase Report", 105, 20, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`, 105, 30, { align: 'center' });
      
      // Add summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Summary", 14, 45);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Spend: ${formatCurrency(reportData.totalSpend)}`, 14, 55);
      doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 62);
      doc.text(`Average Order Value: ${formatCurrency(reportData.avgOrderValue)}`, 14, 69);
      
      // Add top vendors
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Top Vendors", 14, 85);
      
      const vendorData = reportData.topVendors.map(vendor => [
        vendor.name,
        `${formatCurrency(vendor.spend)}`,
        vendor.orders.toString()
      ]);
      
      autoTable(doc, {
        head: [['Vendor', 'Total Spend', 'Orders']],
        body: vendorData,
        startY: 90,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      // Add recent orders
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Recent Orders", 14, doc.lastAutoTable.finalY + 20);
      
      const orderData = reportData.recentOrders.map(order => [
        order.po_number,
        order.vendor_name,
        formatDate(order.date),
        `${formatCurrency(order.amount)}`,
        capitalizeFirstLetter(order.status)
      ]);
      
      autoTable(doc, {
        head: [['PO Number', 'Vendor', 'Date', 'Amount', 'Status']],
        body: orderData,
        startY: doc.lastAutoTable.finalY + 25,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      doc.save(`Purchase_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'sent':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/purchase-order/home" />
      </div>
      <ScrollToTopButton />

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Purchase Reports</h1>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="bg-transparent border-none text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="bg-transparent border-none text-sm"
              />
            </div>
            
            <button 
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <FiDownload className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-300">Total Spend</h3>
                  <FiDollarSign className="text-blue-400 text-xl" />
                </div>
                <p className="text-3xl font-bold mt-2">{(reportData.totalSpend/100000).toFixed(2)}L</p>
                <p className="text-sm text-gray-400 mt-1">{reportData.totalOrders} orders</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-r from-green-600/30 to-green-800/30 rounded-xl p-6 border border-green-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-300">Total Orders</h3>
                  <FiShoppingBag className="text-green-400 text-xl" />
                </div>
                <p className="text-3xl font-bold mt-2">{reportData.totalOrders}</p>
                <p className="text-sm text-gray-400 mt-1">Avg. {(reportData.avgOrderValue/1000).toFixed(1)}K per order</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gradient-to-r from-purple-600/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-300">Top Vendor</h3>
                  <FiUsers className="text-purple-400 text-xl" />
                </div>
                <p className="text-3xl font-bold mt-2">{reportData.topVendors[0]?.name || "N/A"}</p>
                <p className="text-sm text-gray-400 mt-1">{reportData.topVendors[0] ? (reportData.topVendors[0].spend/100000).toFixed(2) : 0}L total spend</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-gradient-to-r from-amber-600/30 to-amber-800/30 rounded-xl p-6 border border-amber-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-300">Recent Orders</h3>
                  <FiTruck className="text-amber-400 text-xl" />
                </div>
                <p className="text-3xl font-bold mt-2">{reportData.recentOrders.length}</p>
                <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
              </motion.div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'vendors'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Vendors
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'categories'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Orders
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Spend Chart (Placeholder) */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-medium mb-4">Monthly Spend</h3>
                    <div className="h-64 flex items-end space-x-2">
                      {reportData.monthlySpend.map((month, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 hover:bg-blue-400 transition-all rounded-t"
                            style={{ 
                              height: `${(month.spend / Math.max(...reportData.monthlySpend.map(m => m.spend))) * 180}px` 
                            }}
                          ></div>
                          <div className="text-xs text-gray-400">{month.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Category Spend Chart (Placeholder) */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-medium mb-4">Category Spend</h3>
                    <div className="h-64 flex items-end space-x-2">
                      {reportData.categorySpend.map((category, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-purple-500 hover:bg-purple-400 transition-all rounded-t"
                            style={{ 
                              height: `${(category.spend / Math.max(...reportData.categorySpend.map(c => c.spend))) * 180}px` 
                            }}
                          ></div>
                          <div className="text-xs text-gray-400">{category.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'vendors' && (
              <div>
                <h3 className="text-xl font-medium mb-4">Top Vendors</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Vendor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total Spend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Orders
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {reportData.topVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{vendor.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vendor.spend}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vendor.orders}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            {activeTab === 'categories' && (
              <div>
                <h3 className="text-xl font-medium mb-4">Top Categories</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Category Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total Spend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {reportData.categorySpend.map((category) => (
                        <tr key={category.category} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{category.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {category.spend}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-medium mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          PO Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Vendor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Order Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                      </thead>
                    <tbody className="divide-y divide-gray-700">
                      {reportData.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{order.po_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.vendor_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
          </>
        )}
      </div>
    </div>
  );
} 