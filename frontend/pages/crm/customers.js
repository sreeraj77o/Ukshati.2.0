'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { TableSkeleton, FormSkeleton } from '@/components/skeleton';
import * as XLSX from 'xlsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState('lead');
  const [editId, setEditId] = useState(null);
  const [editingRemarks, setEditingRemarks] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
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
      const res = await fetch('/api/customers');

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      if (!Array.isArray(data.customers)) {
        throw new Error('Invalid data format from API');
      }

      setCustomers(data.customers);
      setError(null);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message);
      setCustomers([]);
    }
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter both name and phone number.');
      return;
    }

    try {
      const url = editId ? `/api/customers?cid=${editId}` : '/api/customers';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cname: name.trim(),
          cphone: phone.trim(),
          alternate_phone: altPhone.trim() || null,
          status: status,
          remark: remark.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      await fetchCustomers();
      resetForm();
      alert(
        editId
          ? 'Customer updated successfully!'
          : 'Customer added successfully!'
      );
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setPhone('');
    setAltPhone('');
    setRemark('');
    setStatus('lead');
    setEditId(null);
  };

  // Handle editing a customer
  const handleEdit = customer => {
    setEditId(customer.cid);
    setName(customer.cname);
    setPhone(customer.cphone);
    setAltPhone(customer.alternate_phone || '');
    setRemark(customer.remark || '');
    setStatus(customer.status || 'lead');
  };

  // Handle deleting a customer
  const handleDelete = async cid => {
    if (
      !window.confirm(
        'Are you sure you want to delete this customer and all related invoices?'
      )
    )
      return;

    try {
      const res = await fetch(`/api/customers?cid=${cid}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete customer');
      }

      await fetchCustomers();

      if (data.deletedInvoices > 0) {
        alert(
          `Customer deleted successfully. ${data.deletedInvoices} related invoice(s) were also deleted.`
        );
      } else {
        alert('Customer deleted successfully.');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      alert(error.message);
    }
  };

  // Handle status change
  const handleStatusChange = async (cid, newStatus) => {
    try {
      const response = await fetch(`/api/customers?cid=${cid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Status update failed');
      }

      setCustomers(prev =>
        prev.map(customer =>
          customer.cid === cid ? { ...customer, status: newStatus } : customer
        )
      );
    } catch (error) {
      console.error('Status change error:', error);
      alert(error.message);
    }
  };

  // Handle remark change
  const handleRemarkChange = async (cid, newRemark) => {
    try {
      const res = await fetch(`/api/customers?cid=${cid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark: newRemark }),
      });

      const responseData = await res.json();
      if (!res.ok)
        throw new Error(responseData.error || 'Failed to update remark');

      setCustomers(prev =>
        prev.map(customer =>
          customer.cid === cid ? { ...customer, ...responseData } : customer
        )
      );

      setEditingRemarks(prev => ({ ...prev, [cid]: false }));
    } catch (error) {
      console.error('Remark error:', error);
      alert(error.message);
    }
  };

  // Normalize column names for better compatibility
  const normalizeHeaders = data => {
    return data.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        if (normalizedKey.includes('name') || normalizedKey === 'cname') {
          normalizedRow.name = row[key];
        } else if (
          normalizedKey.includes('phone') &&
          !normalizedKey.includes('alt')
        ) {
          normalizedRow.phone = row[key];
        } else if (
          normalizedKey.includes('alt') ||
          normalizedKey.includes('alternate')
        ) {
          normalizedRow.alternate_phone = row[key];
        } else if (normalizedKey.includes('status')) {
          normalizedRow.status = row[key];
        } else if (
          normalizedKey.includes('remark') ||
          normalizedKey.includes('note')
        ) {
          normalizedRow.remark = row[key];
        } else {
          // Keep original key if no match found
          normalizedRow[key] = row[key];
        }
      });
      return normalizedRow;
    });
  };

  const processRows = async rows => {
    if (!rows || rows.length === 0) {
      alert('No data found in the file.');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const normalizedRows = normalizeHeaders(rows);

      for (let i = 0; i < normalizedRows.length; i++) {
        const row = normalizedRows[i];
        setImportProgress(
          `Processing row ${i + 1} of ${normalizedRows.length}...`
        );

        // Extract and clean data - only name and phone are required
        const cname = (row.name || row.cname || '').toString().trim();
        const cphone = (row.phone || row.cphone || '').toString().trim();
        const alternate_phone =
          (row.alternate_phone || '').toString().trim() || null;
        const status = (row.status || 'lead').toString().trim().toLowerCase();
        const remark = (row.remark || row.note || '').toString().trim() || null;

        // Validate required fields
        if (!cname || !cphone) {
          errorCount++;
          errors.push(
            `Row ${i + 1}: Missing required fields (name: "${cname}", phone: "${cphone}")`
          );
          continue;
        }

        // Validate status
        const validStatus = ['lead', 'customer'].includes(status)
          ? status
          : 'lead';

        const customerData = {
          cname,
          cphone,
          alternate_phone,
          status: validStatus,
          remark,
        };

        try {
          const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `API error for row ${i + 1}`);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Row ${i + 1} (${cname}): ${error.message}`);
        }
      }

      await fetchCustomers();

      // Show detailed results
      let message = `Import completed!\n`;
      message += `✅ Successfully imported: ${successCount} customers\n`;
      if (errorCount > 0) {
        message += `❌ Failed: ${errorCount} rows\n\n`;
        if (errors.length > 0) {
          message += `Errors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`;
          }
        }
      }

      alert(message);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      setImportProgress('');
      setCsvFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  // Handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidFile) {
      alert('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      e.target.value = '';
      return;
    }

    setCsvFile(file);
  };

  // Handle file import
  const handleFileImport = async () => {
    if (!csvFile) {
      alert('Please select a file first.');
      return;
    }

    const fileName = csvFile.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      // Handle CSV files
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target.result;
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            complete: results => {
              if (results.errors.length > 0) {
                console.warn('CSV parsing warnings:', results.errors);
              }
              processRows(results.data);
            },
            error: error => {
              console.error('CSV parsing error:', error);
              alert('Failed to parse CSV file. Please check the file format.');
            },
          });
        } catch (error) {
          console.error('File reading error:', error);
          alert('Failed to read the CSV file.');
        }
      };
      reader.onerror = () => alert('Failed to read the file.');
      reader.readAsText(csvFile, 'UTF-8');
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          if (workbook.SheetNames.length === 0) {
            throw new Error('No sheets found in the Excel file.');
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false, // This ensures dates and numbers are converted to strings
          });

          if (jsonData.length === 0) {
            throw new Error('No data found in the Excel sheet.');
          }

          await processRows(jsonData);
        } catch (error) {
          console.error('Excel processing error:', error);
          alert(`Failed to process Excel file: ${error.message}`);
        }
      };
      reader.onerror = () => alert('Failed to read the Excel file.');
      reader.readAsArrayBuffer(csvFile);
    }
  };

  // Handle CSV export
  const handleCsvExport = () => {
    if (!customers || customers.length === 0) {
      alert('No customers data to export.');
      return;
    }

    const exportData = customers.map(customer => ({
      id: customer.cid,
      name: customer.cname,
      phone: customer.cphone,
      alternate_phone: customer.alternate_phone || '',
      status: customer.status,
      remark: customer.remark || '',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `customers_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter customers based on search term
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(
        customer =>
          customer.cname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.cphone.includes(searchTerm)
      )
    : [];

  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/crm/home" />
      </div>
      <ScrollToTopButton />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-16">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-gray-400 mt-2">
              Manage all your customer interactions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={handleCsvExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!customers || customers.length === 0}
            >
              <span className="text-green-200">📤</span>
              <span>Export CSV</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={importing}
              />
              <span className="text-blue-400">📁</span>
              <span className="text-white">
                {csvFile
                  ? csvFile.name.substring(0, 20) +
                    (csvFile.name.length > 20 ? '...' : '')
                  : 'Import File'}
              </span>
            </label>

            <button
              onClick={handleFileImport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!csvFile || importing}
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Process Import</span>
              )}
            </button>
          </div>
        </header>

        {/* Import Progress */}
        {importing && importProgress && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-blue-300">{importProgress}</span>
            </div>
          </div>
        )}

        {/* File Format Help */}
        <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            📋 Import File Format
          </h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p>
              <strong>Required columns:</strong>{' '}
              <span className="text-green-400">name</span>,{' '}
              <span className="text-green-400">phone</span>
            </p>
            <p>
              <strong>Optional columns:</strong> alternate_phone, status
              (lead/customer), remark
            </p>
            <p>
              <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)
            </p>
            <p>
              <strong>Note:</strong> Column names are case-insensitive and
              flexible (e.g., &quot;Name&quot;, &quot;Customer Name&quot;,
              &quot;cname&quot; all work)
            </p>
          </div>
        </div>

        {/* Customer Form Card */}
        <div className="backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {editId ? 'Edit Customer' : 'Add New Customer'}
          </h2>

          {loading ? (
            <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Customer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    required
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    required
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Alternate Phone
                  </label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={e => setAltPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Remarks
                </label>
                <input
                  type="text"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Optional notes or remarks"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-white font-medium hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                  {editId ? 'Update Customer' : 'Add Customer'}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Search and Table Section */}
        <div className="backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell"
                  >
                    Alt. Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Remarks
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-0 py-0">
                      <TableSkeleton rows={5} columns={7} />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-red-400"
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      {searchTerm
                        ? 'No customers found matching your search'
                        : 'No customers found'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr
                      key={customer.cid}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                        {customer.cid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {customer.cname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {customer.cphone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                        {customer.alternate_phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            customer.status === 'customer'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-blue-900 text-blue-300'
                          }`}
                        >
                          {customer.status === 'customer' ? 'Customer' : 'Lead'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                        {editingRemarks[customer.cid] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingRemarks[customer.cid]}
                              onChange={e =>
                                setEditingRemarks(prev => ({
                                  ...prev,
                                  [customer.cid]: e.target.value,
                                }))
                              }
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-full"
                            />
                            <button
                              onClick={() =>
                                handleRemarkChange(
                                  customer.cid,
                                  editingRemarks[customer.cid]
                                )
                              }
                              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setEditingRemarks(prev => {
                                  const newState = { ...prev };
                                  delete newState[customer.cid];
                                  return newState;
                                })
                              }
                              className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() =>
                              setEditingRemarks(prev => ({
                                ...prev,
                                [customer.cid]: customer.remark || '',
                              }))
                            }
                            className="cursor-pointer hover:text-white transition-colors"
                            title="Click to edit"
                          >
                            {customer.remark || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit customer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer.cid)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete customer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredCustomers.length} of {customers.length} customers
              {searchTerm && (
                <span className="ml-2">
                  (filtered by &quot;{searchTerm}&quot;)
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    Clear
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
