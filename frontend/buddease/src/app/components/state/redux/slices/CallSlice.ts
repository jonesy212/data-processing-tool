// CallSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllStatus } from "../../stores/DetailsListStore";
import { WritableDraft } from "../ReducerGenerator";
import updateCall from "./CollaborationSlice";
import  {Tag}  from "@/app/components/models/tracker/Tag";
import { PriorityTypeEnum } from "@/app/components/models/data/StatusType";

export interface Call {
  id: string;
  title: string;
  description: string;
  status: string;
  completed: boolean;
  property: string;
  position: {
    x: number;
    y: number;
  };
  priority: PriorityTypeEnum;
  dueDate: Date | null;
  tags: Tag[];
}

interface CallState {
  id: string;
  calls: Call[];
  loading: boolean;
  error: string | null;
  callTitle: string;
  callDescription: string;
  status: AllStatus;
  dueDate: Date | null;
  priority: PriorityTypeEnum;
  callStatus: AllStatus;
  entitiesLoaded: { [key: string]: Call };
  tags: Tag[];
}

interface ToggleCallPayload {
  callId: string;
}

const initialState: CallState = {
  id: "",
  calls: [],
  loading: false,
  error: null,
  callTitle: "",
  callDescription: "",
  status: "",
  dueDate: null,
  priority: PriorityTypeEnum.Low,
  callStatus: "",
  entitiesLoaded: {},
  tags: [],
};

export const filterCalls = async (
  state: WritableDraft<CallState>,
  action: PayloadAction<{
    userId: { operation: string; value: string | number };
    query: { operation: string; value: string | number };
  }>
): Promise<{
  userId: {
    operation: string;
    value: string | number;
  };
  query: { operation: string; value: string | number };
}> => {
  const { userId, query } = action.payload;

  switch (userId.value) {
    case "all":
      break;
    case "completed":
      state.calls = state.calls.filter((call) => call.completed);
      break;
    case "active":
      state.calls = state.calls.filter((call) => !call.completed);
      break;
    default:
      console.error("Invalid filter:", userId.value);
      break;
  }
  return Promise.resolve({ userId, query });
};

export const useCallManagerSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    createCall: (state, action: PayloadAction<WritableDraft<Call>>) => {
      state.calls.push(action.payload);
    },

    fetchCallsRequest(state) {
      state.loading = true;
      state.error = null;
    },

    fetchCallsSuccess(
      state,
      action: PayloadAction<{ calls: WritableDraft<Call>[] }>
    ) {
      state.loading = false;
      state.calls = action.payload.calls;
    },

    entitiesLoaded(
      state,
      action: PayloadAction<{ calls: WritableDraft<Call>[] }>
    ) {
      state.calls = action.payload.calls;
    },

    fetchCallsFailure(state, action: PayloadAction<{ error: string }>) {
      state.loading = false;
      state.error = action.payload.error;
    },

    addCall: (state, action: PayloadAction<WritableDraft<Call>>) => {
      state.calls.push(action.payload);
    },

    addCallSuccess(state, action: PayloadAction<{ call: WritableDraft<Call> }>) {
      state.calls.push(action.payload.call);
    },

    addCallFailure(state, action: PayloadAction<{ error: string }>) {
      state.error = action.payload.error;
    },

    removeCallSuccess(state, action: PayloadAction<string>) {
      state.calls = state.calls.filter((call) => call.id !== action.payload);
    },

    removeCallFailure(state, action: PayloadAction<{ error: string }>) {
      state.error = action.payload.error;
    },

    toggleCall(state, action: PayloadAction<ToggleCallPayload>) {
      const callId = action.payload.callId;
      const callIndex = state.calls.findIndex(
        (call) => call.id === callId.toString()
      );
      if (callIndex !== -1) {
        state.calls[callIndex].completed = !state.calls[callIndex].completed;
      }
    },

    updateCallTitle(
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) {
      const { id, title } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        state.calls[callIndex].title = title;
      }
    },

    updateCallDescription(
      state,
      action: PayloadAction<{ id: string; description: string }>
    ) {
      const { id, description } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        state.calls[callIndex].description = description;
      }
    },

    callStatus(state, action: PayloadAction<{ id: string; status: string }>) {
      const { id, status } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        state.calls[callIndex].status = status;
        const callToUpdate = state.calls[callIndex];
        if (callToUpdate) {
          switch (status) {
            case "some_status":
              callToUpdate.title = "Updated Title";
              callToUpdate.description = "Updated Description";
              break;
            default:
              break;
          }
        }
      }
    },

    updateCallStatus(
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) {
      const { id, status } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        state.calls[callIndex].status = status;
      }
    },

    resizeCall(state, action: PayloadAction<WritableDraft<Call>>) {
      const index = state.calls.findIndex(
        (call) => call.id === action.payload.id
      );
      if (index !== -1) {
        state.calls[index] = action.payload;
      }
    },

    dropCall(state, action: PayloadAction<WritableDraft<Call>>) {
      const index = state.calls.findIndex(
        (call) => call.id === action.payload.id
      );
      if (index !== -1) {
        state.calls[index] = action.payload;
      }
    },

    updateCallDetails(
      state,
      action: PayloadAction<{
        id: string;
        updates: {
          title?: string;
          description?: string;
        };
      }>
    ) {
      const { id, updates } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        if (updates.title) {
          state.calls[callIndex].title = updates.title;
        }
        if (updates.description) {
          state.calls[callIndex].description = updates.description;
        }
      }
    },

    updateCallPosition(
      state,
      action: PayloadAction<{
        id: string;
        newPosition: Partial<{ x: number; y: number }>;
      }>
    ) {
      const { id, newPosition } = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === id);
      if (callIndex !== -1) {
        state.calls[callIndex].position = {
          ...state.calls[callIndex].position,
          ...newPosition,
        };
      } else {
        console.log("Call not found");
      }
    },

    completeCall(state, action: PayloadAction<string>) {
      const callId = action.payload;
      const callIndex = state.calls.findIndex((call) => call.id === callId);
      if (callIndex !== -1) {
        state.calls[callIndex].completed = true;
      }
    },

    filterCalls(
      state,
      action: PayloadAction<{
        userId: { operation: string; value: string | number };
        query: { operation: string; value: string | number };
      }>
    ) {
      const { userId, query } = action.payload;

      switch (userId.value) {
        case "all":
          break;
        case "completed":
          state.calls = state.calls.filter((call) => call.completed);
          break;
        case "active":
          state.calls = state.calls.filter((call) => !call.completed);
          break;
        default:
          console.error("Invalid filter:", userId.value);
          break;
      }

      switch (query.operation) {
        case "equals":
          state.calls = state.calls.filter(
            (call) => call.property === query.value
          );
          break;
        default:
          console.error("Invalid query operation:", query.operation);
          break;
      }
    },
  },
});

export const { actions: callManagerActions, reducer: callManagerReducer } =
  useCallManagerSlice;
