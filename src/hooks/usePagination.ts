// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination({ totalItems, itemsPerPage = 10, initialPage = 1 }: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return { startIndex: start, endIndex: Math.min(start + itemsPerPage, totalItems) };
  }, [currentPage, itemsPerPage, totalItems]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToNext = () => goToPage(currentPage + 1);
  const goToPrev = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNext,
    goToPrev,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
