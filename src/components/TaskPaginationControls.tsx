// components/TaskPaginationControls.tsx
'use client';

import PrimaryButton from '@/components/PrimaryButton';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface TaskPaginationControlsProps {
  canPrevPage: boolean;
  canNextPage: boolean;
  prevPage: () => void;
  nextPage: () => void;
  currentPage: number;
  totalPages: number;
}

export default function TaskPaginationControls({
  canPrevPage,
  canNextPage,
  prevPage,
  nextPage,
  currentPage,
  totalPages,
}: TaskPaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
      {/* Page indicator */}
      <span className="text-center sm:text-left">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* PREVIOUS */}
        <PrimaryButton
          onClick={prevPage}
          disabled={!canPrevPage}
          bgColor={canPrevPage ? 'bg-primary hover:bg-primary/90' : 'bg-gray-100'}
          textColor={canPrevPage ? 'text-white' : 'text-gray-400'}
          className={`
            flex items-center gap-1.5 text-xs font-medium transition-all duration-200
            ${!canPrevPage ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FaChevronLeft className="text-xs" />
          <span className="hidden sm:inline">Previous</span>
        </PrimaryButton>

        {/* NEXT */}
        <PrimaryButton
          onClick={nextPage}
          disabled={!canNextPage}
          bgColor={canNextPage ? 'bg-primary hover:bg-primary/90' : 'bg-gray-100'}
          textColor={canNextPage ? 'text-white' : 'text-gray-400'}
          className={`
            flex items-center gap-1.5 text-xs font-medium transition-all duration-200
            ${!canNextPage ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <FaChevronRight className="text-xs" />
        </PrimaryButton>
      </div>
    </div>
  );
}