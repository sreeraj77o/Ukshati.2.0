'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { TableSkeleton } from '@/components/skeleton';
import { motion } from 'framer-motion';
import { useUserSession } from '@/src/hooks/useDashboard';

export default function AllRequisitions() {
  const router = useRouter();
  const { userRole } = useUserSession();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expandedReq, setExpandedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        router.push('/');
        return;
      }

      const [reqRes, projectRes] = await Promise.all([
        fetch('/api/purchase/requisitions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!reqRes.ok || !projectRes.ok) {
        throw new Error('Failed to fetch requisitions or projects');
      }

      const requisitionsData = await reqRes.json();
      const projectData = await projectRes.json();
      const normalizedProjects = projectData.map(p => ({
        id: p.pid || p.id,
        name: p.pname || p.name,
      }));

      const detailedRequisitions = await Promise.all(
        requisitionsData.map(async req => {
          const itemsRes = await fetch(
            `/api/purchase/requisitions?id=${req.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const items = itemsRes.ok ? (await itemsRes.json()).items : [];

          const project = normalizedProjects.find(
            p => p.id === req.project_id || p.pid === req.project_id
          ) || { name: 'Unknown Project' };

          return {
            ...req,
            project_name: project.name,
            items: items.map(item => ({
              ...item,
              quantity: Number(item.quantity),
            })),
          };
        })
      );

      setRequisitions(detailedRequisitions);
      setFilteredRequisitions(detailedRequisitions);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching requisitions.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const applyFilters = useCallback(() => {
    let filtered = [...requisitions];

    if (searchTerm) {
      filtered = filtered.filter(
        r =>
          (r.req_number || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (r.project_name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let result = 0;
      if (sortBy === 'date') {
        result = new Date(a.required_by) - new Date(b.required_by);
      } else if (sortBy === 'req_number') {
        result = a.req_number.localeCompare(b.req_number);
      } else if (sortBy === 'project') {
        result = a.project_name.localeCompare(b.project_name);
      }
      return sortOrder === 'asc' ? result : -result;
    });

    setFilteredRequisitions(filtered);
  }, [requisitions, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleDelete = async id => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/purchase/requisition-approval?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchData(); // Refresh data from backend after delete
      setConfirmDelete(null);
    } catch (err) {
      setError('Failed to delete requisition.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    const user = localStorage.getItem('user');
    const approvedBy = user ? JSON.parse(user).id : 'Unknown';
    console.log('Approved by:', approvedBy);
    try {
      const res = await fetch(`/api/purchase/requisition-approval?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          approved_by: approvedBy,
        }),
      });
      console.log('Status update response:', res);
      if (!res.ok) throw new Error('Status update failed');
      await fetchData(); // Refresh requisitions after status change
    } catch (err) {
      console.error('Status update error:', err);
      setError(`Failed to ${newStatus} requisition.`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/purchase-order/home" />
      </div>
      <ScrollToTopButton />

      <h1 className="text-3xl font-bold mb-8">Purchase Requisitions</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search requisitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiFilter className="mr-2" />
            Filters
            {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
          </button>
          {/* Admin can create both PR and PO directly */}
          {userRole === "admin" && (
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => router.push("/purchase-order/requisition/new")}
            >
              <FiPlus className="mr-2" />
              New Requisition
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Required By</option>
              <option value="req_number">Requisition Number</option>
              <option value="project">Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-400 mr-3" />
              <div>
                <h3 className="text-red-400 font-medium">Error Loading Requisitions</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Requisitions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <TableSkeleton columns={5} rows={3} />
          </div>
        ) : filteredRequisitions.length > 0 ? (
          filteredRequisitions.map((req) => (
            <div
              key={req.id}
              className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-gray-700"
            >
              {/* Requisition Header */}
              <div
                className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold">{req.req_number}</h3>
                    <span
                      className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        req.status === "draft"
                          ? "bg-gray-600 text-white"
                          : req.status === "pending"
                          ? "bg-yellow-600 text-white"
                          : req.status === "submitted"
                          ? "bg-blue-600 text-white"
                          : req.status === "approved"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    Project: {req.project_name || "Unknown"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Required By: {req.required_by}
                  </p>
                </div>
                <div className="flex items-center mt-3 md:mt-0">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/purchase-order/requisition/${req.id}`);
                      }}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    {userRole === "admin" && req.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/purchase-requisition/requisitions/${req.id}/edit`);
                          }}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                          title="Edit Requisition"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(req.id);
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                          title="Delete Requisition"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                    {userRole === "admin" && req.status === "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/purchase-order/orders/new?requisition_id=${req.id}`);
                        }}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-full"
                        title="Create Purchase Order"
                      >
                        <div className="flex items-center gap-1 text-sm">
                          <FiPlus />
                          <span>Create PO</span>
                        </div>
                      </button>
                    )}
                  </div>
                  {expandedReq === req.id ? (
                    <FiChevronUp className="ml-2 text-gray-400" />
                  ) : (
                    <FiChevronDown className="ml-2 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Confirm Delete Dialog */}
              {confirmDelete === req.id && (
                <div className="bg-gray-900/80 border-t border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-red-400">Are you sure you want to delete {req.req_number}?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Requisition Items */}
              {expandedReq === req.id && (
                <div className="border-t border-gray-700 p-4">
                  <h4 className="font-medium mb-3">Requisition Items</h4>
                  {req.items && req.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-700/50 text-left">
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Item</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase">Description</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Qty</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase text-right">Unit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {req.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-700/30">
                              <td className="px-4 py-3">{item.item_name}</td>
                              <td className="px-4 py-3 text-gray-400">{item.description}</td>
                              <td className="px-4 py-3 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No items found for this requisition.</p>
                  )}

                  {/* Approval/Reject buttons, only if status is pending */}
                  {userRole === 'admin' && req.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusChange(req.id, "rejected")}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, "approved")}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Details - Fulfillment Types & Shortfall Items */}
              {expandedReq === req.id && (
                <div className="border-t border-gray-700 p-4">
                  {/* Fulfillment Type Badge */}
                  {req.status === "fulfilled-from-stock" && (
                    <span className="inline-block bg-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">Fulfilled from Stock</span>
                  )}
                  {req.status === "converted-to-po" && (
                    <span className="inline-block bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">Shortfall PO Created</span>
                  )}
                  {req.status === "partially-fulfilled" && (
                    <span className="inline-block bg-yellow-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">Partially Fulfilled (Stock + PO)</span>
                  )}
                  {/* Shortfall Items Table */}
                  {req.shortfall_items && req.shortfall_items.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-bold mb-1 text-blue-300">Shortfall Items</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-blue-900/50 text-left">
                              <th className="px-4 py-2 text-xs font-medium text-blue-200 uppercase">Item</th>
                              <th className="px-4 py-2 text-xs font-medium text-blue-200 uppercase">Description</th>
                              <th className="px-4 py-2 text-xs font-medium text-blue-200 uppercase text-right">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-700">
                            {req.shortfall_items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-blue-900/20">
                                <td className="px-4 py-2">{item.item_name}</td>
                                <td className="px-4 py-2 text-blue-200">{item.description}</td>
                                <td className="px-4 py-2 text-right">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
            <FiSearch className="mx-auto text-4xl text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No requisitions found</h3>
            <p className="text-gray-400">
              {searchTerm
                ? "Try a different search term or clear the search filter."
                : "No requisitions have been created yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
