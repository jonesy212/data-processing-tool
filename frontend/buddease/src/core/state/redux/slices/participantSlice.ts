// participantSlice.ts
// useParticipantSlice.ts
 
import type { Participant } from "@/core/pages/management/ParticipantManagementPage";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";



interface ParticipantState {
    participants: Participant[];
  }
  
  const initialState: ParticipantState = {
    participants: [],
  };

  
  export const useParticipantSlice = createSlice({
    name: "participants",
    initialState,
    reducers: {
      addParticipant: (state, action: PayloadAction<Participant>) => {
        state.participants.push(action.payload);
      },
      removeParticipant: (state, action: PayloadAction<string>) => {
        const index = state.participants.findIndex(p => p.id === action.payload);
        if (index !== -1) {
          state.participants.splice(index, 1);
        }
      },
      updateParticipant: (state, action: PayloadAction<Participant>) => {
        const index = state.participants.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.participants[index] = action.payload;
        }
      },
      // Add more reducers as needed
    },
  });
  