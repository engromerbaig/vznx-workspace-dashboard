// hooks/useTaskPagination.ts
import { usePagination } from './usePagination';
import { useMemo } from 'react';
import { BaseTask } from '@/types/task';
export interface UseTaskPaginationProps {
  tasks: BaseTask[];
  pageSize?: number; // default 10
}

export const useTaskPagination = ({
  tasks,
  pageSize = 10,
}: UseTaskPaginationProps) => {
  const totalItems = tasks.length;

  const pagination = usePagination({
    totalItems,
    pageSize,
    initialPage: 1,
    maxVisiblePages: 5,
  });

  const paginatedTasks = useMemo(() => {
    const { startIndex, endIndex } = pagination;
    return tasks.slice(startIndex, endIndex + 1);
  }, [tasks, pagination.startIndex, pagination.endIndex]);

  return {
    ...pagination,
    paginatedTasks,
  };
};