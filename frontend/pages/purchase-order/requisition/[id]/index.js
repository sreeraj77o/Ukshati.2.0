"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiEdit, FiFileText, FiDollarSign, FiArrowLeft } from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { FormSkeleton } from "@/components/skeleton";

export default function ViewRequisition() {
  const router = useRouter();
  // Use Next.js dynamic route param if available, fallback to window.location
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requisition, setRequisition] = useState(null);
  const [items, setItems] = useState([]);
  const [project, setProject] = useState(null);
  const [requester, setRequester] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to get id from router (Next.js dynamic route)
    let routeId = null;
    if (typeof window !== "undefined") {
      // /purchase-order/requisition/[id]
      const parts = window.location.pathname.split("/");
      routeId = parts[parts.length - 1];
      if (!isNaN(Number(routeId))) setId(routeId);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchRequisitionData();
    }
  }, [id]);

  const fetchRequisitionData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please log in again.");
        router.push("/");
        return;
      }
      // Use correct API endpoint for requisition details
      const reqRes = await fetch(`/api/purchase/requisitions?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!reqRes.ok) throw new Error('Failed to fetch requisition data');
      const reqData = await reqRes.json();
      console.log(reqData);
      if (!reqData.requisition) {
        setError("Requisition data not found.");
        setLoading(false);
        return;
      }
      setRequisition(reqData.requisition);
      setItems(Array.isArray(reqData.items) ? reqData.items : []);
      // Fetch project and requester details
      const [projectsRes, usersRes] = await Promise.all([
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (projectsRes.ok && usersRes.ok) {
        let projectsData = await projectsRes.json();
        // Normalize project data for consistent access
        if (Array.isArray(projectsData)) {
          projectsData = projectsData.map(project => ({
            id: project.pid || project.id,
            name: project.pname || project.name,
            ...project
          }));
        } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
          projectsData = projectsData.projects.map(project => ({
            id: project.pid || project.id,
            name: project.pname || project.name,
            ...project
          }));
        } else {
          projectsData = [];
        }
        const usersData = await usersRes.json();
        // Find project and requester using correct keys
        const foundProject = projectsData.find(p => p.id === reqData.requisition.project_id || p.pid === reqData.requisition.project_id);
        setProject(foundProject);
        const foundRequester = usersData.find(u => u.id === reqData.requisition.requested_by || u.id === reqData.requisition.requester_id);
        setRequester(foundRequester);
      }
    } catch (error) {
      console.error("Error fetching requisition data:", error);
      setError("Failed to load requisition data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/requisition/AllRequisitions" />
        <div className="max-w-6xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Requisition Details</h1>
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <BackButton route="/purchase-order/requisition/AllRequisitions" />
        <div className="max-w-6xl mx-auto mt-16">
          <h1 className="text-3xl font-bold mb-8">Requisition Not Found</h1>
          <p className="text-gray-400">{error || "The requested requisition could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <BackButton route="/purchase-order/requisition/AllRequisitions" />
      <ScrollToTopButton />
      <div className="max-w-6xl mx-auto mt-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Requisition Details</h1>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-blue-400">{requisition.requisition_number}</span>
              <span className="px-3 py-1 text-sm rounded-full bg-gray-500/20 text-gray-300">
                {requisition.status ? requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1) : 'Unknown'}
              </span>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push(`/purchase-order/requisition/${id}/edit`)}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
          </div>
        </div>
        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiFileText className="mr-2" />
              Requisition Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Req Number:</span>
                <span className="font-medium">{requisition.requisition_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{requisition.req_date || requisition.created_at?.split('T')[0] || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Project:</span>
                <span>{project?.name || project?.pname || 'Unknown Project'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Requester:</span>
                <span>{requester?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>
          {/* Project Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiFileText className="mr-2" />
              Project Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Project Name:</span>
                <span className="font-medium">{project?.name || project?.pname || 'Unknown Project'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Project ID:</span>
                <span>{project?.id || project?.pid || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Items Table */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">Requisition Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase">Item</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase">Description</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Qty</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-300 uppercase text-right">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-400">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Summary */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2" />
            Requisition Summary
          </h3>
          <div className="max-w-md ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Items:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Notes:</span>
                <span>{requisition.notes || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
