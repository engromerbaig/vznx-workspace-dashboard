// components/Pagination.tsx
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
  onPrev,
  onNext,
  canPrev,
  canNext,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Previous Button - Caret Only */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
          canPrev
            ? 'text-primary hover:bg-primary/20'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === -1 ? (
              <span className="px-2 py-1 text-primary">
                <FaEllipsisH className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] h-10 px-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                  page === currentPage
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-primary/20 hover:text-gray-900'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button - Caret Only */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
          canNext
            ? 'text-primary hover:bg-primary/20'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}