import { Team } from "../models/teams/Team";
import { CalendarEvent } from "../state/stores/CalendarEvent";

// Attendee.tsx
interface Attendee {
  id: string;
    name: string;
  email: string;
  teamId: Team['id'];
  roleInTeam: string;
  }

  
interface BusyTime {
    start: Date;
    end: Date;
  }
  
  interface AttendeeAvailability {
    [attendeeEmail: string]: BusyTime[];
  }
  
  class AttendeeAvailabilityAnalysis {
    constructor(private event: CalendarEvent) {}
  
    // Function to analyze attendee availability
    analyze(): AttendeeAvailability {
      const attendeeAvailability: AttendeeAvailability = {};
  
      // Simulated busy times for demonstration purposes
      const busyTimes: BusyTime[] = [
        { start: new Date('2024-05-08T09:00:00'), end: new Date('2024-05-08T10:30:00') },
        { start: new Date('2024-05-08T14:00:00'), end: new Date('2024-05-08T15:30:00') },
        // Add more busy times as needed
      ];
  
      this.event.attendees?.forEach(attendee => {
        attendeeAvailability[attendee.email] = busyTimes;
      });
  
      return attendeeAvailability;
    }
  }

export default AttendeeAvailabilityAnalysis;
  export type {
  Attendee, AttendeeAvailability, BusyTime
};
