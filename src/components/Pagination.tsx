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
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={`flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
          canPrev
            ? 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FaChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === -1 ? (
              <span className="px-3 py-2 text-gray-500">
                <FaEllipsisH className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
          canNext
            ? 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Next
        <FaChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}