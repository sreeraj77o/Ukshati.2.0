'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import EditButton from './editButton';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { TableSkeleton } from '@/components/skeleton';

export default function ProjectDetails() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (start = '') => {
    setLoading(true);
    try {
      const url = start
        ? `/api/allProjects?start=${encodeURIComponent(formatDate(start))}`
        : '/api/allProjects';

      const response = await fetch(url);
      const data = await response.json();

      // Simulate data loading delay (remove in production if not needed)
      await new Promise(resolve => setTimeout(resolve, 300));

      const safeData = Array.isArray(data) ? data : [];
      setProjects(safeData);
      setFilteredProjects(safeData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearch = async () => {
    await fetchProjects(filterDate);
  };

  useEffect(() => {
    const filtered = projects.filter(proj =>
      proj.pname?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const totalAmount = filteredProjects.reduce(
    (acc, proj) => acc + (parseFloat(proj.Amount) || 0),
    0
  );

  // Download CSV
  const downloadCSV = () => {
    if (filteredProjects.length === 0) {
      alert('No projects to download.');
      return;
    }

    const csvContent = [
      [
        'Project',
        'Client',
        'Status',
        'Start Date',
        'End Date',
        'Amount',

        'Comments',
      ],
      ...filteredProjects.map(proj => [
        proj.pname,
        proj.cname,
        proj.status,
        proj.start_date,
        proj.end_date,
        proj.Amount || '0',

        proj.Comments || 'N/A',
      ]),
      ['', '', '', '', 'Total', totalAmount.toFixed(2), '', ''],
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_details.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download PDF
  const downloadPDF = () => {
    if (filteredProjects.length === 0) {
      alert('No projects to download.');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(
      '<html><head><title>Project Details</title></head><body>'
    );
    printWindow.document.write('<h3>Project Details</h3>');
    printWindow.document.write(
      "<table border='1' style='width:100%; text-align:center; border-collapse: collapse;'>"
    );

    printWindow.document.write(
      '<tr><th>Project Name</th><th>Client Name</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Amount</th><th>Comments</th></tr>'
    );

    filteredProjects.forEach(proj => {
      printWindow.document.write(`
        <tr>
          <td>${proj.pname || 'N/A'}</td>
          <td>${proj.cname || 'N/A'}</td>
          <td>${proj.status || 'N/A'}</td>
          <td>${proj.start_date || 'N/A'}</td>
          <td>${proj.end_date || 'N/A'}</td>
          <td>₹${proj.Amount || '0'}</td>

          <td>${proj.Comments || 'N/A'}</td>
        </tr>
      `);
    });

    printWindow.document.write(
      `<tr><td colspan='5' style='text-align:right; font-weight:bold;'>Total:</td><td>₹${totalAmount.toFixed(
        2
      )}</td><td colspan='2'></td></tr>`
    );

    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <BackButton route="/expense/home" />
      <div className="min-h-screen flex flex-col items-center relative bg-black space-y-8 p-10">
        <ScrollToTopButton />
        <h1 className="text-5xl font-extrabold text-white tracking-wide">
          Project Details
        </h1>

        {/* Filter Section */}
        <div className="flex gap-6 items-center mb-6">
          {/* Date Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-gray-900 text-white px-4 py-2 rounded-md pr-10"
            />
            <Search
              className="absolute right-3 text-gray-400 w-5 h-5 cursor-pointer hover:text-white"
              onClick={handleSearch}
            />
          </div>

          {/* Search by Project Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Project Name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-900 text-white px-4 py-2 rounded-md pr-10"
            />
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="w-full">
            <TableSkeleton rows={8} columns={8} />
          </div>
        ) : (
          <table className="w-full text-white text-sm bg-white/10 backdrop-blur-lg rounded-3xl shadow-md">
            <thead>
              <tr className="bg-black/40">
                <th className="p-4">Project Name</th>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th className="text-center">Amount</th>
                <th className="text-center">Comments</th>
                <th>Edit (Admin)</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj, index) => (
                  <tr key={index} className="hover:bg-white/10 transition-all">
                    <td className="py-4 text-center">{proj.pname || 'N/A'}</td>
                    <td className="text-center">{proj.cname || 'N/A'}</td>
                    <td className="text-center">{proj.status || 'N/A'}</td>
                    <td className="text-center">{proj.start_date || 'N/A'}</td>
                    <td className="text-center">{proj.end_date || 'N/A'}</td>

                    <td className="text-center">₹{proj.Amount || '0'}</td>
                    <td className="text-center">{proj.Comments || 'N/A'}</td>

                    <td className="text-center">
                      <EditButton project={proj} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-5 text-gray-400">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan="5" />
                <td className="text-center">
                  Total: ₹{totalAmount.toFixed(2)}
                </td>
                <td colSpan="2" />
              </tr>
            </tfoot>
          </table>
        )}

        {/*  Download Buttons */}
        <div className="flex gap-8 mt-8 text-white">
          <button
            onClick={downloadCSV}
            className="bg-blue-500 py-2 px-6 rounded-lg"
          >
            Download CSV
          </button>

          <button
            onClick={downloadPDF}
            className="bg-green-400 py-2 px-6 rounded-lg"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
