import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { FilterActions } from '@/app/actions/FilterActions';
import { searchOptions } from '@/app/pages/searches/SearchOptions';
import { sortTasks } from '@/app/state/redux/slices/TaskSlice';

import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { NOTIFICATION_MESSAGES } from '@/app/features/support/NotificationMessages';
import { notify } from '@/utils/snapshotUtils';

/* ---------- Types ---------- */

type FilterMap = Record<
  string,
  {
    operation: string;
    value: string | number;
  }
>;

/* ---------- Hook ---------- */

const useSearchOptions = () => {
  const dispatch = useDispatch();

  /* ---------- Task filtering ---------- */

  const handleFilterTasks = useCallback(
    (
      filters: FilterMap,
      transform: string
    ): Promise<void> => {
      return new Promise((resolve) => {
        const { userId, query } = filters;

        dispatch(
          FilterActions.filterTasks({
            userId: userId?.value,
            query: query?.value,
            transform
          })
        );

        resolve();
      });
    },
    [dispatch]
  );

  /* ---------- Message search (placeholder, unchanged behavior) ---------- */

  const handleSearchMessages = useCallback(
    async (filters: FilterMap, transform: string) => {
      // Existing behavior preserved — implementation assumed elsewhere
      return Promise.resolve({ data: [] });
    },
    []
  );

  /* ---------- Submit handler ---------- */

  const handleSubmit = useCallback(
    async (
      filters: FilterMap,
      transform: string,
      type: 'tasks' | 'messages' = 'tasks'
    ) => {
      try {
        const response =
          type === 'tasks'
            ? await handleFilterTasks(filters, transform)
            : await handleSearchMessages(filters, transform);

        const successMessage =
          type === 'tasks'
            ? 'Tasks filtered successfully'
            : 'Messages searched successfully';

        notify({
          id: `${type}FilterSuccess${Date.now()}`,
          message: successMessage,
          data: {
            extra: {
              operation:
                type === 'tasks' ? 'filter_tasks' : 'search_messages',
              filterCount: Object.keys(filters || {}).length,
              transform
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'success'
        });

        return response;
      } catch (error: any) {
        const errorMessage =
          type === 'tasks'
            ? NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR
            : NOTIFICATION_MESSAGES.Search.SEARCH_ERROR;

        notify({
          id: `${type}FilterError${Date.now()}`,
          message: errorMessage,
          data: {
            originalError: error?.message,
            extra: {
              operation:
                type === 'tasks' ? 'filter_tasks' : 'search_messages',
              filterCount: Object.keys(filters || {}).length,
              transform,
              errorDetails: error
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });

        throw error;
      }
    },
    [handleFilterTasks, handleSearchMessages]
  );

  /* ---------- Sorting ---------- */

  const handleSortTasks = useCallback(
    (field: string, order: 'asc' | 'desc') => {
      dispatch(sortTasks({ field, order }));
    },
    [dispatch]
  );

  /* ---------- Public API ---------- */

  return {
    searchOptions,
    handleSubmit,
    handleFilterTasks,
    handleSortTasks
  };
};

export default useSearchOptions;
