import React, { useState, useEffect } from "react";

export default function ShareOrderModal({ open, onClose, order, onShare }) {
  const [method, setMethod] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (method === "email" && order && order.vendor_email) {
      setRecipient(order.vendor_email);
    } else if (method === "email") {
      setRecipient("");
    } else if (method !== "email") {
      setRecipient("");
    }
  }, [method, order]);

  useEffect(() => {
    if (!sending && toast) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToast("");
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sending, toast, onClose]);

  if (!open && !showToast) return null;

  const handleShare = async () => {
    setSending(true);
    setError("");
    try {
      await onShare(method, recipient, order);
      setToast("Purchase order sent successfully!");
    } catch (err) {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Share Purchase Order</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Share via</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
              >
                <option value="">Select method</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            {method && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {method === "email" ? "Recipient Email" : "Recipient WhatsApp Number"}
                </label>
                {method === "email" ? (
                  <div>
                    <input
                      type="email"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      className={`w-full rounded px-3 py-2 ${
                        order?.vendor_email
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gray-800 text-white"
                      }`}
                      placeholder={order?.vendor_email ? "Vendor email" : "Enter recipient email"}
                      readOnly={!!order?.vendor_email}
                    />
                    {!order?.vendor_email && (
                      <p className="text-yellow-400 text-xs mt-1">
                        No email found for this vendor. Please enter recipient email manually.
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2"
                    placeholder={"+91XXXXXXXXXX"}
                  />
                )}
              </div>
            )}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                disabled={sending || !method || !recipient}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
