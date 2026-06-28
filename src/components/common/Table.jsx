import React from 'react';

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  className = '',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-[2rem] border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur-sm ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary/10 backdrop-blur-sm">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="pr-20 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white/90 divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors duration-200 hover:bg-primary/5">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-sm text-gray-900"
                >
                  {column.render ? column.render(row) : row[column.key]}
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