"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FiCheck, FiX, FiAlertCircle, FiEye, FiFilter, FiSearch
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { TableSkeleton } from "@/components/skeleton";

export default function ApproveRequisitions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [expandedRequisition, setExpandedRequisition] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  useEffect(() => {
    fetchRequisitions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, requisitions]);

  const fetchRequisitions = async () => {
    try {
      const response = await fetch('/api/purchase/requisitions');
      if (!response.ok) {
        throw new Error('Failed to fetch requisitions');
      }
      const data = await response.json();
      // Ensure data is an array
      setRequisitions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      setRequisitions([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Check if requisitions is an array before spreading
    let result = Array.isArray(requisitions) ? [...requisitions] : [];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(req => 
        req.requisition_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(req => req.status === filterStatus);
    }
    
    setFilteredRequisitions(result);
  };

  const toggleRequisitionExpand = (reqId) => {
    setExpandedRequisition(expandedRequisition === reqId ? null : reqId);
  };

  const handleApprove = async (id) => {
    await processRequisition(id, 'approved');
  };

  const handleReject = async (id) => {
    await processRequisition(id, 'rejected');
  };

  const processRequisition = async (id, status) => {
    setProcessingId(id);
    
    try {
      const response = await fetch('/api/purchase/requisition-approval', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          approval_notes: approvalNotes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process requisition');
      }
      
      // Update local state
      setRequisitions(requisitions.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      
      setNotification({
        type: 'success',
        message: `Requisition ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      });
      
      setApprovalNotes("");
      setExpandedRequisition(null);
    } catch (error) {
      console.error(`Error ${status} requisition:`, error);
      setNotification({
        type: 'error',
        message: `Failed to ${status} requisition. Please try again.`
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/home" />
      <ScrollToTopButton />
      
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-8">Approve Purchase Requisitions</h1>
        
        {notification && (
          <div className={`mb-6 p-4 ${notification.type === 'success' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border rounded-lg flex items-center`}>
            <FiAlertCircle className={notification.type === 'success' ? 'text-green-500' : 'text-red-500'} size={20} />
            <span className="ml-2">{notification.message}</span>
            <button 
              className="ml-auto text-gray-400 hover:text-white"
              onClick={() => setNotification(null)}
            >
              <FiX size={18} />
            </button>
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted to PO</option>
          </select>
        </div>
        
        {/* Requisitions List */}
        <div className="space-y-4">
          {loading ? (
            <TableSkeleton rows={3} columns={5} />
          ) : filteredRequisitions.length > 0 ? (
            filteredRequisitions.map(req => (
              <div 
                key={req.id} 
                className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700"
              >
                <div 
                  className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                  onClick={() => toggleRequisitionExpand(req.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold">{req.requisition_number}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Project: {req.project_name} | Requester: {req.requester_name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Required by: {new Date(req.required_by).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {expandedRequisition === req.id && (
                  <div className="p-4 border-t border-gray-700">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium mb-2">Items</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {req.items && req.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 whitespace-nowrap">{item.item_name}</td>
                                <td className="px-4 py-2">{item.description}</td>
                                <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                                <td className="px-4 py-2 text-right">
                                  {item.estimated_price ? `₹${item.estimated_price}` : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {req.notes && (
                      <div className="mb-4">
                        <h4 className="text-lg font-medium mb-2">Notes</h4>
                        <p className="text-gray-300">{req.notes}</p>
                      </div>
                    )}
                    
                    {req.status === 'pending' && (
                      <div className="mt-6">
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Approval Notes</label>
                          <textarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Add any notes regarding your decision..."
                          />
                        </div>
                        
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                          >
                            <FiCheck className="mr-2" />
                            {processingId === req.id ? 'Processing...' : 'Approve'}
                          </button>
                          
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                          >
                            <FiX className="mr-2" />
                            {processingId === req.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {req.status === 'approved' && (
                      <div className="mt-4">
                        <button
                          onClick={() => router.push(`/purchase-order/orders/new?requisition=${req.id}`)}
                          className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          Create Purchase Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center">
              <p className="text-gray-400">No requisitions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
