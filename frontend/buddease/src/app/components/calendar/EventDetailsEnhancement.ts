// Assuming EventDetails is already defined as interface EventDetails

import { WritableDraft } from "../state/redux/ReducerGenerator";
import { EventDetails } from "./CalendarEventViewingDetails";
import { CalendarManagerState } from "./CalendarSlice";

// EventDetailsEnhancement.ts
interface EventDetailsEnhancement extends EventDetails {
  // Add additional properties specific to EventDetailsEnhancement if needed
  enhancementType: string;
  // Add more properties as needed
}

// Define the action payload type
type PayloadAction<T> = {
  payload: T;
};

// Define the action handler
const improveEventDetails = (
  state: CalendarManagerState,
  action: PayloadAction<EventDetailsEnhancement[]>
): CalendarManagerState => {
  const draftState = state as WritableDraft<CalendarManagerState>;
  draftState.enhancedDetails = action.payload;
  return state;
};

export { improveEventDetails };
export type { EventDetailsEnhancement };

