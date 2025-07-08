import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiBell, FiCheckCircle } from "react-icons/fi";

export default function RequisitionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [requisition, setRequisition] = useState(null);
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const reqRes = await fetch(`/api/purchase/requisitions?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequisition(data.requisition);
        setItems(data.items);
      }
      // Fetch audit logs (simulate for now)
      setLogs([
        { action: "created", by: "Employee", at: "2025-07-01" },
        { action: "approved", by: "Admin", at: "2025-07-02" },
        { action: "fulfilled-from-stock", by: "Admin", at: "2025-07-03" },
      ]);
      // Fetch notifications for this requisition's user
      if (data?.requisition?.requested_by) {
        const notifRes = await fetch(`/api/notifications?user_id=${data.requisition.requested_by}`);
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!requisition) return <div className="p-8 text-red-400">Requisition not found.</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Requisition #{requisition.requisition_number}</h1>
      <div className="mb-4">Status: <span className="font-semibold">{requisition.status}</span></div>
      <div className="mb-4">Project: {requisition.project_name}</div>
      <div className="mb-4">Requested By: {requisition.requester_name}</div>
      <h2 className="text-xl font-semibold mt-6 mb-2">Items</h2>
      <table className="w-full mb-6">
        <thead><tr><th>Item</th><th>Qty</th><th>Unit</th></tr></thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}><td>{item.item_name}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold mt-6 mb-2">Audit Log</h2>
      <ul className="mb-6">
        {logs.map((log, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-300">
            <FiCheckCircle className="text-green-400" />
            {log.action} by {log.by} on {log.at}
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Notifications</h2>
      <ul>
        {notifications.map((n, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-400">
            <FiBell className="text-yellow-400" />
            {n.message} ({new Date(n.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
