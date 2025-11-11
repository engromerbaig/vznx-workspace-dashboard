// hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
  maxVisiblePages?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  visiblePages: number[];
  setPageSize: (size: number) => void;
}

export const usePagination = ({
  totalItems,
  pageSize,
  initialPage = 1,
  maxVisiblePages = 5
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / currentPageSize));

  // Calculate visible pages with ellipsis logic
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the start
    if (currentPage <= halfVisible) {
      endPage = maxVisiblePages;
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1;
    }

    // Always show first page, last page, and current page with neighbors
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize - 1, totalItems - 1);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const setPageSize = (size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return {
    currentPage,
    totalPages,
    pageSize: currentPageSize,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    goToPage,
    canNextPage: currentPage < totalPages,
    canPrevPage: currentPage > 1,
    visiblePages,
    setPageSize,
  };
};