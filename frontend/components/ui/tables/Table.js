import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

/**
 * Reusable Table component with sorting and pagination
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column objects {key, label, sortable, render}
 * @param {Array} props.data - Array of data objects
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.emptyState - Empty state component
 * @param {boolean} props.sortable - Enable sorting
 * @param {string} props.className - Additional CSS classes
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  sortable = true,
  className = ""
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((column, index) => (
                <th key={index} className="text-left py-3 px-4 text-gray-400 font-medium">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-gray-700/50">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="py-3 px-4">
                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        {emptyState || (
          <div className="text-gray-400">
            <p>No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`text-left py-3 px-4 text-gray-400 font-medium ${
                  column.sortable !== false && sortable ? 'cursor-pointer hover:text-white' : ''
                }`}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable !== false && sortable && (
                    <div className="flex flex-col">
                      <FiChevronUp 
                        size={12} 
                        className={`${
                          sortConfig.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-blue-400' 
                            : 'text-gray-600'
                        }`}
                      />
                      <FiChevronDown 
                        size={12} 
                        className={`${
                          sortConfig.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-blue-400' 
                            : 'text-gray-600'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="py-3 px-4 text-gray-300">
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
