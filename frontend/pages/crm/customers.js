'use client';
import { useEffect, useState } from "react";
import Papa from "papaparse";
import StarryBackground from "@/components/StarryBackground";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState("lead");
  const [editId, setEditId] = useState(null);
  const [editingRemarks, setEditingRemarks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data.customers);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      
      // Handle HTTP errors first
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }
  
      const data = await res.json();
      
      // Ensure data is in correct format
      if (!Array.isArray(data.customers)) {
        throw new Error("Invalid data format from API");
      }
  
      setCustomers(data.customers);
      setError(null);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error.message);
      setCustomers([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please enter both name and phone number.");
      return;
    }

    try {
      const url = editId ? `/api/customers?cid=${editId}` : "/api/customers";
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cname: name,
          cphone: phone,
          alternate_phone: altPhone,
          status: status,
          remark: remark
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      await fetchCustomers();
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setPhone("");
    setAltPhone("");
    setRemark("");
    setStatus("lead");
    setEditId(null);
  };

  // Handle editing a customer
  const handleEdit = (customer) => {
    setEditId(customer.cid);
    setName(customer.cname);
    setPhone(customer.cphone);
    setAltPhone(customer.alternate_phone || "");
    setRemark(customer.remark || "");
    setStatus(customer.status || "lead");
  };

  // Handle deleting a customer
  const handleDelete = async (cid) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
  
    try {
      const res = await fetch(`/api/customers?cid=${cid}`, { 
        method: "DELETE" 
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete customer");
      }
  
      await fetchCustomers();
      alert("Customer deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error);
      alert(error.message);
    }
  };

  // Handle status change
  const handleStatusChange = async (cid, newStatus) => {
    try {
      const response = await fetch(`/api/customers?cid=${cid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Status update failed');
      }

      setCustomers(prev => prev.map(customer => 
        customer.cid === cid ? { ...customer, status: newStatus } : customer
      ));
    } catch (error) {
      console.error("Status change error:", error);
      alert(error.message);
    }
  };

  // Handle remark change
  const handleRemarkChange = async (cid, newRemark) => {
    try {
      const res = await fetch(`/api/customers?cid=${cid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: newRemark }),
      });
  
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to update remark");
  
      setCustomers(prev => 
        prev.map(customer => 
          customer.cid === cid ? { ...customer, ...responseData } : customer
        )
      );
  
      setEditingRemarks(prev => ({ ...prev, [cid]: false }));
    } catch (error) {
      console.error("Remark error:", error);
      alert(error.message);
    }
  };
  
  // Handle CSV upload
  const handleCsvUpload = (e) => {
    setCsvFile(e.target.files[0]);
  };

  // Update handleCsvImport function
const handleCsvImport = async () => {
  if (!csvFile) {
    alert("Please upload a CSV file first.");
    return;
  }

  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const importResults = await Promise.all(
          results.data.map(async (row) => {
            // Validate and map CSV fields
            const customerData = {
              cname: row.name || row.cname || '',
              cphone: row.phone || row.cphone || '',
              alternate_phone: row.alternate_phone || row.alt_phone || null,
              status: row.status || 'lead',
              remark: row.remark || row.notes || null
            };

            // Validate required fields
            if (!customerData.cname || !customerData.cphone) {
              throw new Error(`Missing required fields in row: ${JSON.stringify(row)}`);
            }

            const res = await fetch("/api/customers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customerData),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "CSV import failed");
            }
            return res.json();
          })
        );

        await fetchCustomers();
        alert(`Successfully imported ${importResults.length} customers!`);
      } catch (error) {
        console.error("Import error:", error);
        alert(`Import failed: ${error.message}`);
      }
    },
    error: (error) => {
      console.error("CSV parsing error:", error);
      alert("Failed to process CSV file. Please check the format.");
    }
  });
};

  // Filter customers based on search term
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer) =>
        customer.cname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div>
    <BackButton route="/crm/home"/>
    <div className="container">
      <StarryBackground />
      <ScrollToTopButton/>
      <div className="content-wrapper">
        <header className="header">
          <h1 className="title">Customer Management</h1>
          <div className="header-actions">
            <div className="csv-upload">
              <label className="csv-upload-label">
                <input type="file" accept=".csv" onChange={handleCsvUpload} />
                <span className="upload-button">
                  📁 Import CSV
                </span>
              </label>
              <button onClick={handleCsvImport} className="import-button">
                 Process Import
              </button>
            </div>
          </div>
        </header>

        <div className="form-card">
          <h2 className="form-title">{editId ? "Edit Customer" : "Add New Customer"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label className="floating-label">Customer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>
              
              <div className="input-group">
                <label className="floating-label">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="input-group">
                <label className="floating-label">Alternate Phone</label>
                <input
                  type="text"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="input-group">
  <label className="floating-label">Status</label>
  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="glass-select text-black"
  >
    <option value="lead" style={{ color: 'black' }}>Lead</option>
    <option value="customer" style={{ color: 'black' }}>Customer</option>
  </select>
</div>


              <div className="input-group full-width">
                <label className="floating-label">Remarks</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <button type="submit" className="submit-button">
              {editId ? "🔄 Update Customer" : "Add Customer"}
            </button>
          </form>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-card">
  <div className="table-scroll">
    <table className="modern-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Alt. Phone</th>
          <th>Status</th>
          <th>Remarks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredCustomers.map((customer) => (
          <tr key={customer.cid}>
            <td>#{customer.cid}</td>
            <td>{customer.cname}</td>
            <td>{customer.cphone}</td>
            <td>{customer.alternate_phone || "-"}</td>
            <td>
              <span className="status-badge">
                {customer.status === 'customer' ? 'Customer' : 'Lead'}
              </span>
            </td>
            <td>
              {editingRemarks[customer.cid] !== undefined ? (
                <div className="remark-edit">
                  <input
                    type="text"
                    value={editingRemarks[customer.cid]}
                    onChange={(e) =>
                      setEditingRemarks((prev) => ({
                        ...prev,
                        [customer.cid]: e.target.value,
                      }))
                    }
                    className="remark-input"
                  />
                  <button
                    onClick={() =>
                      handleRemarkChange(customer.cid, editingRemarks[customer.cid])
                    }
                    className="save-button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  className="remark-cell"
                  onClick={() =>
                    setEditingRemarks((prev) => ({
                      ...prev,
                      [customer.cid]: customer.remark || "",
                    }))
                  }
                >
                  {customer.remark || "-"}
                </div>
              )}
            </td>
            <td>
              <div className="action-buttons">
                <button
                  onClick={() => handleEdit(customer)}
                  className="action-button edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer.cid)}
                  className="action-button delete-button"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </div>
      </div>
      <style jsx>{`
        .container {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          margin-left: 200px;
          margin-top: 50px;
        }

        .content-wrapper {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.75);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.125);
          padding: 2rem;
        }
        .import-button {
  padding: 10px 20px 10px 10px;
  background-color: #007bff; 
  color: white; 
  border: none; 
  border-radius: 5px; 
  font-size: 16px; 
  cursor: pointer; 
  transition: background-color 0.3s ease; 
  margin-top: 10px;
  margin-left: 350px
}

.import-button:hover {
  background-color: #0056b3; 
}
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 2.5rem;
          background: linear-gradient(45deg, #6ee7b7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .form-card {
          background: rgba(31, 41, 55, 0.7);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-title {
          color: #fff;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .glass-input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .glass-select {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          appearance: none;
        }

        .submit-button {
          background: linear-gradient(45deg, #3b82f6, #6366f1);
          color: white;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .submit-button:hover {
          transform: translateY(-2px);
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(31, 41, 55, 0.7);
          border-radius: 12px;
          overflow: hidden;
        }

        .modern-table th {
          background: linear-gradient(45deg, #3b82f6, #6366f1);
          color: white;
          padding: 1rem;
          text-align: left;
        }

        .modern-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #e5e7eb;
        }

        .modern-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-button {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .delete-button {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          margin-bottom: 1.5rem;
        }

        .csv-upload-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .csv-upload-label:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 1rem;
          }
          
          .header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}