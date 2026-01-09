// pagingSlice.tsx
import type { PagingState } from "@/core/pages/Paging";
import type { PromptPageProps } from "@/core/prompts/PromptPage";
import type { ApiManagerState } from "@/core/state/redux/slices/ApiSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from '@/core/state/redux/slices/RootSlice';

const initialState: PagingState = {
  currentPage: {} as PromptPageProps,
  pageSize: 10,
  totalItems: 0,
};

export const usePagingManagerSlice = createSlice({
  name: 'paging',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<PromptPageProps>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
  },
});

export const {
    setCurrentPage,
  setPageSize,
  setTotalItems
} = usePagingManagerSlice.actions;
    
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) =>
  state.apiManager.apiConfigs;

  
export default usePagingManagerSlice.reducer;

export type { PagingState };


// example usage
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage, setPageSize } from '@/core/state/redux/slices/pagingSlice';

//  Example usage in a component
const dispatch = useDispatch();
const { currentPage, pageSize, totalItems } = useSelector((state: RootState) => state.paging);

//  Dispatch actions to update paging state
dispatch(setCurrentPage(1));
dispatch(setPageSize(20));
