/**
 * Table Component
 * Reusable table with sorting, pagination, and actions
 */

import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { LoadingSpinner } from '../index';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  sortColumn = null,
  sortDirection = 'asc',
  onSort = () => {},
  actions = null,
  emptyMessage = "No data available",
  className = ''
}) => {
  const tableClasses = [
    'w-full',
    'bg-gray-800',
    'rounded-lg',
    'overflow-hidden',
    'shadow-lg',
    className
  ].join(' ');

  const getSortIcon = (columnKey) => {
    if (!sortable || sortColumn !== columnKey) {
      return <FaSort className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="text-blue-400" />
      : <FaSortDown className="text-blue-400" />;
  };

  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  if (loading) {
    return (
      <div className={tableClasses}>
        <div className="p-8 text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-400 mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={tableClasses}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-600' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <span className="ml-1">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-8 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-700/50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? (
                        column.render(row[column.key], row, index)
                      ) : (
                        <span className="text-gray-200">
                          {row[column.key] || '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(row, index)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
