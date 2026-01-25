// ComponentSlice.ts
/features/components/slices/componentSlice.ts
import { createSlice } from "@reduxjs/toolkit";


interface Item {
    id: string;
    name: string;
    error?: string | null;
}

interface ComponentState {
    items: Item[];
    loading: boolean;
    error: string | null;
}


const initialState: ComponentState = {
    items: [],
    loading: false,
    error: null,
};

export const componentSlice = createSlice({
    name: "components",
    initialState,
    reducers: {
        fetchComponentRequest(state) { state.loading = true; },
        fetchComponentSuccess(state, action) {
            state.items = action.payload;
            state.loading = false;
        },
        fetchComponentFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },

        // Generic CRUD — can extend
        updateComponent(state) { state.loading = true; },
        updateComponentSuccess(state, action) {
            state.loading = false;
            // replace updated item
            const updated = action.payload;
            state.items = state.items.map(i => i.id === updated.id ? updated : i);
        },
        updateComponentFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const ComponentActions = componentSlice.actions;
export default componentSlice.reducer;
