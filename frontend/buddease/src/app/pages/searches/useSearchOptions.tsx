// useSearchOptions.tsx
// useSearchOptions.ts
import { FilterActions } from '@/app/actions/FilterActions';
import { searchOptions } from '@/app/pages/searches/SearchOptions';
import { sortTasks } from '@/app/state/redux/slices/TaskSlice';
import { useDispatch } from 'react-redux';

const useSearchOptions = () => {
  const dispatch = useDispatch();

  const handleFilterTasks = (
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
