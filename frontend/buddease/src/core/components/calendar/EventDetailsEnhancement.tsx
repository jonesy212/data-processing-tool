// EventDetailsEnhancement.tsx
// Assuming EventDetails is already defined as interface EventDetails

import type { CalendarEventViewingDetailsProps, EventDetails } from '@/core/components/calendar/CalendarEventViewingDetails';
import CalendarEventViewingDetails from '@/core/components/calendar/CalendarEventViewingDetails';
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import type { CalendarManagerState } from '@/core/state/redux/slices/CalendarSlice';

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
  action: PayloadAction<EventDetails[]>
): CalendarManagerState => {
  const draftState = state as WritableDraft<CalendarManagerState>;
  
  // Map the array of EventDetails to an array of React function components
  const enhancedDetails = action.payload.map((detail) => {
    return ({ eventId }: CalendarEventViewingDetailsProps) => (
      <CalendarEventViewingDetails
        eventId={eventId}
        title={detail.title}
        description={detail.description}
        status={detail.status}
        date={detail.date}
        startTime={detail.startTime}
        endTime={detail.endTime}
      />
    );
  });

  draftState.enhancedDetails = enhancedDetails;
  return state;
};


export { improveEventDetails };
export type { EventDetailsEnhancement };

