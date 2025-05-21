import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";

export default function ProjectTable({ projects = [], showStatus = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!Array.isArray(projects)) {
      console.error("Invalid Projects Data:", projects);
      setFilteredProjects([]);
      setAllProjects([]);
      return;
    }

    const uniqueProjects = [...new Set(projects.map((proj) => proj.pname))];
    setAllProjects(uniqueProjects);
    setFilteredProjects(projects);
  }, [projects]);

  // Handle search filter
  useEffect(() => {
    const filtered = searchQuery
      ? projects.filter((proj) =>
          proj.pname.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : projects;
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const totalSum = filteredProjects.reduce(
    (acc, proj) => acc + (parseFloat(proj.Amount) || 0),
    0
  );
  const downloadCSV = () => {
    const csvContent = [
      ["Project", "Client", "Start Date", "End Date", "Amount", "Comments"],
      ...filteredProjects.map((proj) => [
        proj.pname,
        proj.cname,
        proj.start_date,
        proj.end_date,
        proj.Amount || "0",

        proj.Comments || "N/A",
      ]),
      ["", "", "", "Total", totalSum.toFixed(2), "", ""],
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "project_details.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPDF = () => {
    if (filteredProjects.length === 0) {
      alert("No projects to download");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Project Details</title></head><body>"
    );
    printWindow.document.write("<h3>Project Details</h3>");
    printWindow.document.write(
      "<table border='1' style='width:100%; text-align:center; border-collapse: collapse;'>"
    );
    printWindow.document.write(
      "<tr><th>Project Name</th><th>Client Name</th><th>Start Date</th><th>End Date</th><th>Amount</th><th>Comments</th></tr>"
    );

    filteredProjects.forEach((proj) => {
      printWindow.document.write(`
        <tr>
          <td>${proj.pname || "N/A"}</td>
          <td>${proj.cname || "N/A"}</td>
          <td>${proj.start_date || "N/A"}</td>
          <td>${proj.end_date || "N/A"}</td>
          <td>₹${proj.Amount || "0"}</td>

          <td>${proj.Comments || "N/A"}</td>
        </tr>
      `);
    });

    printWindow.document.write(
      `<tr><td colspan='4' style='text-align:right; font-weight:bold;'>Total:</td><td>₹${totalSum.toFixed(
        2
      )}</td><td></td><td></td></tr>`
    );

    printWindow.document.write("</table></body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <BackButton route="/expense/home" />
      <div className="min-h-screen flex justify-center items-center relative bg-black">
        <ScrollToTopButton />
        {/* Card Container */}
        <div className="glass-card w-[98vw] max-w-none p-10 rounded-3xl text-center space-y-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold text-white">
              Project Details
            </h1>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by Project Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/20 text-white p-2 rounded-lg focus:outline-none"
            />
          </div>

          {/* Table */}
          <div>
            <table className="w-[95vw] max-w-none text-white text-sm bg-white/10 backdrop-blur-lg rounded-3xl shadow-md overflow-hidden">
              <thead>
                <tr className="bg-black/40">
                  <th className="p-4">Project</th>
                  <th>Client</th>
                  {showStatus && <th>Status</th>}
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((proj, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/10 transition-all"
                    >
                      <td className="py-3">{proj.pname || "N/A"}</td>
                      <td>{proj.cname || "N/A"}</td>
                      {showStatus && <td>{proj.status || "N/A"}</td>}
                      <td>{proj.start_date || "N/A"}</td>
                      <td>{proj.end_date || "N/A"}</td>
                      <td className="text-center">₹{proj.Amount || "0"}</td>
                      <td className="text-center">{proj.Comments || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-gray-400 py-5">
                      No Projects Found!
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-black/40 font-semibold">
                  <td
                    colSpan={showStatus ? 6 : 5}
                    className="text-right font-semibold py-3"
                  >
                    Total:
                  </td>
                  <td>₹{totalSum.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Buttons for CSV and PDF */}
          <div className="mt-8 flex justify-end gap-6">
            <button
              onClick={downloadCSV}
              className="bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 px-6 rounded-lg"
            >
              Download CSV
            </button>
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-green-400 to-green-300 text-white py-2 px-6 rounded-lg"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
