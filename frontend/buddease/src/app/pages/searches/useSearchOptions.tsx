// useSearchOptions.tsx
// useSearchOptions.ts
import { FilterActions } from '@/app/actions/FilterActions';
import { searchOptions } from '@/app/pages/searches/SearchOptions';
import { sortTasks } from '@/app/state/redux/slices/TaskSlice';
import { useDispatch } from 'react-redux';

const useSearchOptions = () => {
  const dispatch = useDispatch();

  const handleFi  const handleSubmit = useCallback(async (type: 'tasks' | 'messages' = 'tasks') => {
    try {
      const response = type === 'tasks' 
        ? await handleFilterTasks(filters, transform)
        : await handleSearchMessages(filters, transform);

      const successMessage = type === 'tasks' 
        ? 'Tasks filtered successfully'
        : 'Messages searched successfully';
      
      notify({
        id: `${type}FilterSuccess${Date.now()}`,
        message: successMessage,
        data: {
          extra: {
            operation: type === 'tasks' ? 'filter_tasks' : 'search_messages',
            filterCount: filters?.length || 0,
            transform
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      console.log(`${successMessage}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error ${type === 'tasks' ? 'filtering tasks' : 'searching messages'}:`, error);
      
      const errorMessage = type === 'tasks'
        ? NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR
        : NOTIFICATION_MESSAGES.Search.SEARCH_ERROR;
      
      notify({
        id: `${type}FilterError${Date.now()}`,
        message: errorMessage,
        data: {
          originalError: error.message,
          extra: {
            operation: type === 'tasks' ? 'filter_tasks' : 'search_messages',
            filterCount: filters?.length || 0,
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
  }, [filters, transform, handleFilterTasks, handleSearchMessages, notify]);

lterTasks = (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      const { userId, query } = filters;
      const filtersObj = { userId, query };

      dispatch(
        FilterActions.filterTasks({
          userId: filtersObj.userId,
          query: filtersObj.query,
        })
      );

      resolve();
    });
  };

  const handleSortTasks = (field: string, order: "asc" | "desc") => {
    dispatch(sortTasks({ field, order }));
  };

  return {
    searchOptions,
    handleFilterTasks,
    handleSortTasks,
  };
};

export default useSearchOptions;
