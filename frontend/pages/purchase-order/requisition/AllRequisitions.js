"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiChevronDown,
  FiChevronUp, FiX, FiAlertCircle
} from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { TableSkeleton } from "@/components/skeleton";
import { motion } from "framer-motion";

export default function AllRequisitions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expandedReq, setExpandedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, requisitions, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        router.push("/");
        return;
      }

      const [reqRes, projectRes] = await Promise.all([
        fetch("/api/purchase/requisitions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!reqRes.ok || !projectRes.ok) {
        throw new Error("Failed to fetch requisitions or projects");
      }

      const requisitionsData = await reqRes.json();
      const projectData = await projectRes.json();
      const normalizedProjects = projectData.map((p) => ({
        id: p.pid || p.id,
        name: p.pname || p.name,
      }));

      const detailedRequisitions = await Promise.all(
        requisitionsData.map(async (req) => {
          const itemsRes = await fetch(`/api/purchase/requisitions?id=${req.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const items = itemsRes.ok ? (await itemsRes.json()).items : [];

          const project = normalizedProjects.find(
            (p) => p.id === req.project_id || p.pid === req.project_id
          ) || { name: "Unknown Project" };

          return {
            ...req,
            project_name: project.name,
            items: items.map((item) => ({
              ...item,
              quantity: Number(item.quantity),
            })),
          };
        })
      );

      setRequisitions(detailedRequisitions);
      setFilteredRequisitions(detailedRequisitions);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Error fetching requisitions.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requisitions];

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        (r.req_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.project_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let result = 0;
      if (sortBy === "date") {
        result = new Date(a.required_by) - new Date(b.required_by);
      } else if (sortBy === "req_number") {
        result = a.req_number.localeCompare(b.req_number);
      } else if (sortBy === "project") {
        result = a.project_name.localeCompare(b.project_name);
      }
      return sortOrder === "asc" ? result : -result;
    });

    setFilteredRequisitions(filtered);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/purchase/requisition-approval?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchData(); // Refresh data from backend after delete
      setConfirmDelete(null);
    } catch (err) {
      setError("Failed to delete requisition.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    const user = localStorage.getItem("user");
    const approvedBy = user ? JSON.parse(user).id : "Unknown";
    console.log("Approved by:", approvedBy);
    try {
      const res = await fetch(`/api/purchase/requisition-approval?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus, approved_by: approvedBy }),
      });
      console.log("Status update response:", res);
      if (!res.ok) throw new Error("Status update failed");
      await fetchData(); // Refresh requisitions after status change
    } catch (err) {
      console.error("Status update error:", err);
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full bg-gray-800 rounded-lg px-4 py-2 pl-10"
          />
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          {searchTerm && (
            <FiX
              className="absolute top-3 right-3 cursor-pointer text-gray-400"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="bg-gray-700 px-4 py-2 rounded-lg"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="inline-block mr-2" />
            Filters
          </button>
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onClick={() => router.push("/purchase-order/requisition/new")}
          >
            <FiPlus className="inline-block mr-2" />
            New Requisition
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 px-3 py-2 rounded"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 px-3 py-2 rounded"
          >
            <option value="date">Required By</option>
            <option value="req_number">Requisition Number</option>
            <option value="project">Project</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-700 px-3 py-2 rounded"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-800 p-4 rounded-lg text-white mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="bg-red-600 px-3 py-1 rounded">
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton columns={5} rows={3} />
      ) : filteredRequisitions.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">No requisitions found.</div>
      ) : (
        <div className="space-y-4">
          {filteredRequisitions.map((req) => (
            <div key={req.id} className="bg-gray-800 p-4 rounded-xl">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}
              >
                <div>
                  <h3 className="text-xl font-semibold">{req.req_number}</h3>
                  <p className="text-sm text-gray-400">
                    Project: {req.project_name} | Required By: {req.required_by}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
                <div className="flex items-center gap-2">
                  <button
                    className="text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/purchase-requisition/requisitions/${req.id}`);
                    }}
                  >
                    <FiEye />
                  </button>
                  <button
                    className="text-yellow-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/purchase-requisition/requisitions/${req.id}/edit`);
                    }}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(req.id);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                  {expandedReq === req.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {/* Delete Confirmation */}
              {confirmDelete === req.id && (
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1 bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="px-3 py-1 bg-red-600 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Items */}
              {expandedReq === req.id && req.items && req.items.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-700 text-white">
                        <th className="p-2">Item</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {req.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-600">
                          <td className="p-2">{item.item_name}</td>
                          <td className="p-2 text-gray-400">{item.description}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Approval/Reject buttons, only if status is pending */}
                  {req.status === "pending" && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusChange(req.id, "rejected")}
                        className="px-3 py-1 bg-gray-700 rounded"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, "approved")}
                        className="px-3 py-1 bg-green-600 rounded"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
