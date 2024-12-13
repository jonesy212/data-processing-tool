import { useState } from 'react';
import { AttendancePredictionResult } from "../models/data/CalendarEventAttendancePrediction";
import { Attendee } from "./Attendee";
import { BaseEvent } from '@/app/components/event/BaseEvent'
import { SharedSnapshotEvent } from "@/app/typings/eventTypes";
import { T, K } from "../models/data/dataStoreMethods";

interface EventAttendance extends BaseEvent, SharedSnapshotEvent<T, K<T>> {
  eventId: string;
  attendees: Attendee[]; // Attendee IDs or emails
  attendanceProbability: Record<string, number>; // Attendee ID/email -> predicted attendance probability
  eventType: "attendance"
}

interface AttendancePrediction {
  currentEvent: EventAttendance | null;
  eventAttendance: EventAttendance[];
  predictAttendance: () => AttendancePredictionResult[];
  setCurrentEvent: (event: EventAttendance | null) => void;
  setEventAttendance: (events: EventAttendance[]) => void;
}

const useAttendancePrediction = (): AttendancePrediction => {
  const [eventAttendance, setEventAttendanceState] = useState<EventAttendance[]>([]);
  const [currentEvent, setCurrentEventState] = useState<EventAttendance | null>(null); // Renamed from 'event'

  const setCurrentEvent = (event: EventAttendance | null) => {
    setCurrentEventState(event);
  };

  const setEventAttendance = (events: EventAttendance[]) => {
    setEventAttendanceState(events);
  };

  const predictAttendance = (): AttendancePredictionResult[] => {
    const predictionResults: AttendancePredictionResult[] = [];

    eventAttendance.forEach(event => {
      const predictedAttendance: Record<string, boolean> = {};

      // Simulate prediction by assigning a random attendance status to each attendee
      event.attendees.forEach((attendee) => {
        if (attendee.id) {
          predictedAttendance[attendee.id] = Math.random() > 0.5; // Randomly assign true/false
        }
      });

      predictionResults.push({
        eventId: event.eventId,
        attendancePrediction: predictedAttendance,
      });
    });

    return predictionResults;
  };

  return {
    currentEvent,
    eventAttendance,
    predictAttendance,
    setCurrentEvent,
    setEventAttendance,
  };
};

export default useAttendancePrediction;
export type { AttendancePrediction, EventAttendance };
