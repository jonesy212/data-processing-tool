import { User } from "../users/User";

class CalendarEventTimingOptimization {
  events: Record<string, ExtendedCalendarEvent[]>; // Store events as a dictionary with IDs as keys

  constructor(events: ExtendedCalendarEvent[]) {
    this.events = {};

    const eventsDictionary: Record<string, ExtendedCalendarEvent> = {};
    events.forEach((event: ExtendedCalendarEvent) => {
      eventsDictionary[event.id] = event;
    });
  }
  
  optimizeTiming(): void {
    // Retrieve events from the dictionary
    const eventsList = Object.values(this.events).flat(); // Flatten the array
  
    // Sort events by start time (or any other relevant criteria)
    const sortedEvents = eventsList.sort(
      (a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)
    );
  
    // Implement optimization algorithm
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];
  
      // Check for overlapping events or gaps and adjust timings if needed
      const currentEndTime = currentEvent.endTime?.getTime() || 0;
      const nextStartTime = nextEvent.startTime?.getTime() || 0;
  
      // If the current event ends after the next event starts, there's an overlap
      if (currentEndTime > nextStartTime) {
        // Calculate the duration of overlap
        const overlapDuration = currentEndTime - nextStartTime;
  
        // Adjust the timing of the next event to resolve the overlap
        nextEvent.startTime = new Date(nextStartTime + overlapDuration);
  
        // Optionally, you may want to update the end time of the current event
        currentEvent.endTime = new Date(currentEndTime - overlapDuration);
  
        // Notify about the adjustment or log any relevant information
        console.log(
          `Adjusted timings to resolve overlap between ${currentEvent.title} and ${nextEvent.title}`
        );
      } else {
        // Calculate the duration of the gap between events
        const gapDuration = nextStartTime - currentEndTime;
  
        // Optionally, you can adjust timings to fill the gap or take any other actions
        // For example, you could extend the end time of the current event to fill the gap
        if (currentEvent.endTime && nextEvent.startTime) {
          currentEvent.endTime = new Date(currentEndTime + gapDuration);
        }
  
        // Log information about the gap and the action taken
        console.log(
          `Adjusted end time of ${currentEvent.title} to fill the gap between events`
        );
      }
    }
  
    // Update event timing in the dictionary based on optimization results
    Object.values(this.events).forEach((eventArray) => {
      eventArray.forEach((event: ExtendedCalendarEvent) => {
        event.startTime = event.startTime ? new Date(event.startTime.getTime()) : new Date();
      });
    });
  
    // Notify success or any relevant information
    console.log("Timing optimization completed!");
  }
}

export class ExtendedCalendarEvent {
  forEach?(arg0: (newSingleUser: ExtendedCalendarEvent) => void) {
    arg0(this);
    }
  id: string;
  title: string;
  startTime?: Date;
  endTime?: Date;
  description: string;
  assignedTo?: User | null; 
  constructor(
    id: string,
    title: string,
    startTime: Date,
    endTime: Date,
    description: string
  ) {
    this.id = id;
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;
    this.description = description;
    this.assignedTo = null;
  }
}

// Example usage
const events = [
  new ExtendedCalendarEvent(
    "1",
    "Meeting",
    new Date("2024-04-08T08:00:00"),
    new Date("2024-04-08T09:00:00"),
    ""
  ),
  new ExtendedCalendarEvent(
    "2",
    "Presentation",
    new Date("2024-04-08T10:00:00"),
    new Date("2024-04-08T11:00:00"),
    ""
  ),
  // Add more events as needed
];

const optimization = new CalendarEventTimingOptimization(events);
optimization.optimizeTiming();
