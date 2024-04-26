import { PagingState } from "@/app/pages/Paging";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ApiManagerState } from "./ApiSlice";
import { PromptPageProps } from "@/app/components/prompts/PromptPage";

const initialState: PagingState = {
  currentPage: {} as WritableDraft<PromptPageProps>,
  pageSize: 10,
  totalItems: 0,
};

export const usePagingManagerSlice = createSlice({
  name: 'paging',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<WritableDraft<PromptPageProps>>) => {
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

export type {PagingState}


// example usage
// import { useDispatch, useSelector } from 'react-redux';
// import { setCurrentPage, setPageSize } from './path/to/pagingSlice';
import { WritableDraft } from '@/app/components/state/redux/ReducerGenerator';

// // Example usage in a component
// const dispatch = useDispatch();
// const { currentPage, pageSize, totalItems } = useSelector((state: RootState) => state.paging);

// // Dispatch actions to update paging state
// dispatch(setCurrentPage(1));
// dispatch(setPageSize(20));
