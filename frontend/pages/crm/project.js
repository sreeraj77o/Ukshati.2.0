'use client';
import BackButton from "@/components/BackButton";
import { useEffect, useState } from "react";
import { TableSkeleton, FormSkeleton } from "@/components/skeleton";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(""); // End date is now optional
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();

      // Simulate data loading delay (remove in production if not needed)
      await new Promise(resolve => setTimeout(resolve, 300));

      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "TBD" || dateString === "null") return "TBD";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "TBD"; // Guard against invalid dates

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };


  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !customerId) {
      alert("Please fill all required fields.");
      return;
    }
    const isValidDate = (date) => {
      return date && !isNaN(new Date(date).getTime());
    };

    if (!isValidDate(startDate)) {
      alert("Start date is invalid or missing.");
      return;
    }

    const projectData = {
      pname: name,
      start_date: new Date(startDate).toISOString().split("T")[0],
      end_date: isValidDate(endDate)
        ? new Date(endDate).toISOString().split("T")[0]
        : "TBD", // Default to TBD if endDate is missing/invalid
      status,
      cid: customerId,
    };

    try {
      const url = editId ? `/api/tasks?pid=${editId}` : "/api/tasks";
      const method = editId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { pid: editId, ...projectData } : projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save project");
      }

      fetchProjects();
      resetForm();
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate(""); // Reset end date
    setStatus("");
    setCustomerId("");
    setEditId(null);
  };

  const handleEdit = (project) => {
    setEditId(project.pid);
    setName(project.pname);
    setStartDate(formatDate(project.start_date));
    setEndDate(project.end_date === "TBD" ? "" : formatDate(project.end_date)); // Handle "TBD" for editing
    setStatus(project.status);
    setCustomerId(project.cid);
  };

  const handleDelete = async (pid) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/tasks?pid=${pid}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error.message);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.pname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crm bg-black min-h-screen">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/crm/home" />
      </div>
      <div className="container">
        <div className="mt-16">
          <h1 className="page-title">Project Management</h1>
        </div>
        <div className="project-form">
          {loading ? (
            <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group ">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  /> {/* Removed required attribute */}
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.cid} value={customer.cid}>
                        {customer.cid} - {customer.cname}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="submit-button">
                  {editId ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="projects-table">
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.pid}>
                      <td>{project.pid}</td>
                      <td>{project.pname}</td>
                      <td>{formatDate(project.start_date)}</td>
                      <td>{formatDate(project.end_date)}</td>
                      <td>
                        <span className={`status-badge ${project.status.replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>{project.cname || "N/A"}</td>
                      <td className="actions">
                        <button
                          onClick={() => handleEdit(project)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.pid)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProjects.length === 0 && (
                <div className="no-results">No projects found</div>
              )}
            </>
          )}
        </div>
        <style jsx>{`
          .container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            min-height: 100vh;
            position: relative;
            color: #ffffff;
            z-index: 1;
          }
          .page-title {
            font-size: 2.5rem;
            text-align: center;
            margin-top: 1.5rem;
            margin-bottom: 2.5rem;
            background: linear-gradient(45deg, #00ffff, #0080ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          .project-form {
            background: rgba(0, 8, 29, 0.8);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
          }
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            align-items: center;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            color: white;
          }
          .input-group label {
            font-size: 0.9rem;
            color: #7d6fff;
            padding-left: 0.5rem;
          }
          .input-group input,
          .input-group select {
            padding: 0.8rem;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(43, 44, 44, 0.8);
            color: #00ffff;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          .input-group input:focus,
          .input-group select:focus {
            border-color: #00ffff;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
            outline: none;
          }
          .submit-button {
            background: linear-gradient(45deg, #00ffff, #0080ff);
            color: #001a33;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .submit-button:hover {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
          }
          .search-bar {
            margin-bottom: 1.5rem;
          }
          .search-bar input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(0, 20, 40, 0.8);
            color: #00ffff;
          }
          .projects-table {
            background: rgba(0, 8, 29, 0.8);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(0, 255, 255, 0.1);
          }
          th {
            background: rgba(0, 40, 80, 0.6);
            color: #00ffff;
          }
          .status-badge {
            padding: 0.3rem 0.6rem;
            border-radius: 15px;
            font-size: 0.8rem;
          }
          .status-badge.ongoing {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }
          .status-badge.completed {
            background: rgba(0, 255, 255, 0.2);
            color: #00ffff;
          }
          .actions {
            display: flex;
            gap: 0.5rem;
          }
          .edit-button,
          .delete-button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .edit-button {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid #ffc107;
            color: #ffc107;
          }
          .delete-button {
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid #dc3545;
            color: #dc3545;
          }
          .no-results {
            padding: 1rem;
            text-align: center;
            color: #888;
          }
          @media (max-width: 768px) {
            .form-grid {
              grid-template-columns: 1fr;
            }
            .actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}