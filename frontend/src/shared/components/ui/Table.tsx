// ============================================
// FILE: frontend/src/shared/components/ui/Table.tsx
// Modern, consistent table component with enhanced features
// ============================================
import { ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  className?: string;
}

export function Table<T extends object>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
  striped = true,
  hoverable = true,
  stickyHeader = true,
  className,
}: TableProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={clsx('min-w-full divide-y divide-slate-200', className)}>
            <thead className={clsx('bg-slate-50', stickyHeader && 'sticky top-0 z-10')}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Type guard for data
  if (!Array.isArray(data)) {
    return (
      <div className="text-center py-12 text-red-500">
        <div className="font-medium">Format data tidak valid</div>
        <div className="text-sm mt-1">Diharapkan array, diterima {typeof data}</div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="text-4xl mb-2">📭</div>
        <div className="text-slate-600">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className={clsx('min-w-full divide-y divide-slate-200', className)}>
          <thead className={clsx('bg-slate-50', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-slate-100 transition-colors'
                  )}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={clsx(
            'bg-white divide-y divide-slate-200',
            striped && 'divide-y divide-slate-50'
          )}>
            {data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  hoverable && 'hover:bg-slate-50 transition-colors',
                  striped && index % 2 === 0 && 'bg-slate-50/50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={clsx(
                      'px-4 py-4 text-sm text-slate-900 whitespace-nowrap',
                      column.className
                    )}
                  >
                    {column.render ? column.render(item) : String(item[column.key as keyof typeof item] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}