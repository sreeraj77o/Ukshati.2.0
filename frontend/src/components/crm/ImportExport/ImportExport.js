/**
 * Import/Export Component
 * Reusable component for CSV/Excel import and export functionality
 */

import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button, Card } from '../../ui';
import { FaUpload, FaDownload, FaFileExcel, FaFileCsv } from 'react-icons/fa';

const ImportExport = ({
  data = [],
  onImport,
  exportFilename = 'export',
  importTemplate = [],
  className = ''
}) => {
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  // Handle CSV file import
  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportProgress('Reading file...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportProgress('Processing data...');
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          alert('Error parsing CSV file. Please check the format.');
          setImporting(false);
          setImportProgress('');
          return;
        }

        onImport(results.data);
        setImporting(false);
        setImportProgress('');
        event.target.value = ''; // Reset file input
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error reading CSV file.');
        setImporting(false);
        setImportProgress('');
      }
    });
  };

  // Handle Excel file import
  const handleExcelImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportProgress('Reading Excel file...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setImportProgress('Processing data...');
        onImport(jsonData);
        setImporting(false);
        setImportProgress('');
        event.target.value = ''; // Reset file input
      } catch (error) {
        console.error('Excel parsing error:', error);
        alert('Error reading Excel file.');
        setImporting(false);
        setImportProgress('');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFilename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${exportFilename}.xlsx`);
  };

  // Download template
  const downloadTemplate = () => {
    if (importTemplate.length === 0) {
      alert('No template available');
      return;
    }

    const csv = Papa.unparse([importTemplate]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFilename}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card title="Import/Export Data" className={className}>
      <div className="space-y-6">
        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Import Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Import CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                disabled={importing}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Import Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                disabled={importing}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-500 file:cursor-pointer"
              />
            </div>
          </div>

          {importing && (
            <div className="mt-4 p-3 bg-blue-600/20 text-blue-300 rounded-lg text-sm">
              {importProgress}
            </div>
          )}

          {importTemplate.length > 0 && (
            <div className="mt-4">
              <Button
                variant="secondary"
                size="small"
                onClick={downloadTemplate}
                icon={<FaDownload />}
              >
                Download Template
              </Button>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Export Data</h3>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={exportToCSV}
              disabled={data.length === 0}
              icon={<FaFileCsv />}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={exportToExcel}
              disabled={data.length === 0}
              icon={<FaFileExcel />}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImportExport;
