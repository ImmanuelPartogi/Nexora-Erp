// ============================================
// FILE: frontend/src/shared/components/ui/DataTableWrapper.tsx
// Enhanced data table wrapper with search, filters, and pagination
// ============================================
import { ReactNode, useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Card } from './Card';
import clsx from 'clsx';

interface DataTableWrapperProps {
  children: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (search: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const DataTableWrapper = ({
  children,
  searchPlaceholder = "Cari...",
  onSearch,
  filters,
  actions,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  className,
}: DataTableWrapperProps) => {
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            {filters}
            {actions}
          </div>
        </div>
        
        {/* Filters Row */}
        {filters && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {filters}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {(totalCount !== undefined || totalPages > 1) && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Menampilkan {totalCount !== undefined ? `${totalCount} total` : 'Data'}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Sebelumnya
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};