import AttendancePrediction, { EventAttendance } from "../../calendar/AttendancePrediction";
import { Attendee } from "../../calendar/Attendee";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent'; // Assuming Attendee is imported from CalendarEvent

// Define the interface for AttendancePredictionResult
interface AttendancePredictionResult {
  eventId: string;
  attendancePrediction: Record<string, boolean>; // Attendee ID/email -> predicted attendance (true/false)
}

class CalendarEventAttendancePrediction {
  constructor(private events: CalendarEvent[]) {}

  // Function to predict attendance for all events
  predictAttendance(): AttendancePredictionResult[] {
    const eventAttendance: EventAttendance[] = this.events.map((event) => ({
      eventId: event.id,
      attendees: event.attendees
        ? event.attendees.map((attendee) => ({
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            teamId: attendee.teamId,
            roleInTeam: attendee.roleInTeam,
          }))
        : [],
      attendanceProbability: {},
    }));

    const attendancePredictor = new AttendancePrediction(eventAttendance);
    const predictions = attendancePredictor.predictAttendance();

    return predictions.map((prediction: AttendancePredictionResult) => ({
      eventId: prediction.eventId,
      attendancePrediction: prediction.attendancePrediction,
    }));
  }
}

export type {
  AttendancePredictionResult
}