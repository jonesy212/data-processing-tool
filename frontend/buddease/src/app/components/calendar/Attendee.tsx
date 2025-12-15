// Attendee.tsx
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Team } from '@/app/components/teams/Team';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { transformProjectToUnifiedMetadata } from '@/app/config/MetaDataOptions';
import { projectMetadata, StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { getDefaultDocumentOptions } from '@/app/documents/DocumentOptions';
import { PriorityTypeEnum, StatusType } from '@/app/models/data/StatusType';
import { Member } from '@/app/models/members/Member';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { CalendarManagerState } from '@/app/state/redux/slices/CalendarSlice';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { CalendarAttachment, CalendarEntity, CalendarExcludedFields, CalendarIncludedFields, CalendarK, CalendarMeta } from "@/app/typings/entities/CalendarEntity";
import { VideoData } from '@/app/typings/videoTypes/Video';
import { useState } from 'react';
import useAttendancePrediction from './AttendancePrediction';

interface Attendee {
  id: string;
  name: string;
  email: string;
  teamId: Team["id"];
  roleInTeam: string;
}

interface BusyTime {
  start: string | Date;
  end: string | Date;
}


interface AttendeeBusyTimes {
  [attendeeEmail: string]: BusyTime[];
}


interface AttendeeAvailability {
  attendeeId: string;
  availability: string; // e.g., 'available', 'busy', etc.
  busyTimes: BusyTime[];
}


interface AttendeeAvailabilityPrediction {
  // Define the properties of AttendeeAvailabilityPrediction here
  // Example:
  prediction: string;
  confidence: number;
}

interface AttendeeAvailabilityPredictionConfidenceInterval {
  // Define the properties of AttendeeAvailabilityPredictionConfidenceInterval here
  // Example:
  lowerBound: number;
  upperBound: number;
}









interface AttendeeAvailabilityAnalysis {
  eventId: string;
  attendeeBusyTimes: AttendeeBusyTimes; 
  attendeeAvailability: AttendeeAvailability;
  confidenceScore: number;
  attendeeId: string | undefined;
  //todo implemment predictions
  // busyTimes: BusyTime[];
  // attendeeAvailabilityPrediction: AttendeeAvailabilityPrediction[];
  // attendeeAvailabilityPredictionConfidenceScore: number;
  // attendeeAvailabilityPredictionConfidenceInterval: AttendeeAvailabilityPredictionConfidenceInterval[];
  // attendeeAvailabilityPredictionConfidenceIntervalLower: number;
  // attendeeAvailabilityPredictionConfidenceIntervalUpper: number;
  // attendeeAvailabilityPredictionConfidenceIntervalLower95: number;
  // attendeeAvailabilityPredictionConfidenceIntervalUpper95: number;
}


interface ExtendedAttendeeAvailability extends AttendeeAvailabilityAnalysis {
  attendees: Attendee[];
  busyHours: BusyTime[];
  freeTimes: BusyTime[];
  suggestedAvailability: BusyTime[];
  suggestedTimeOff: BusyTime[];
  suggestedTimeOffDates: Date[];
  suggestedTimeOffRequests: BusyTime[];
  suggestedTimeOffRequestsDates: Date[];
  suggestedTimeOffRequestsTimes: BusyTime[];
  suggestedTimeOffRequestsDurations: number[];
  suggestedTimeOffRequestsStatuses: string[];
  suggestedTimeOffRequestsComments: string[];
  suggestedTimeOffRequestsRequestedDates: Date[];
}

const useAttendeeAvailabilityAnalysis = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): ExtendedAttendeeAvailability & { event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; analyze: () => void } => {
  const [analysis, setAnalysis] = useState<ExtendedAttendeeAvailability>({
    eventId: event.id,
    confidenceScore: 0,
    attendees: [],
    busyHours: [],
    freeTimes: [],
    attendeeId: "",
    suggestedAvailability: [],
    suggestedTimeOff: [],
    suggestedTimeOffDates: [],
    suggestedTimeOffRequests: [],
    suggestedTimeOffRequestsDates: [],
    suggestedTimeOffRequestsTimes: [],
    suggestedTimeOffRequestsDurations: [],
    suggestedTimeOffRequestsStatuses: [],
    suggestedTimeOffRequestsComments: [],
    suggestedTimeOffRequestsRequestedDates: [],
    attendeeBusyTimes: {}, 
    attendeeAvailability: {
      attendeeId: "",
      availability: "",
      busyTimes: [],
    },
    // attendeeAvailabilityPrediction: [],
    // attendeeAvailabilityPredictionConfidenceScore: 0,
    // attendeeAvailabilityPredictionConfidenceInterval: [],
    // attendeeAvailabilityPredictionConfidenceIntervalLower: 0,
    // attendeeAvailabilityPredictionConfidenceIntervalUpper: 0,
    // attendeeAvailabilityPredictionConfidenceIntervalLower95: 0,
    // attendeeAvailabilityPredictionConfidenceIntervalUpper95: 0,
  });

  const analyze = () => {
    const attendeeBusyTimes: AttendeeBusyTimes = {};

    // Simulated busy times for demonstration purposes
    const busyTimes: BusyTime[] = [
      {
        start: new Date("2024-05-08T09:00:00"),
        end: new Date("2024-05-08T10:30:00"),
      },
      {
        start: new Date("2024-05-08T14:00:00"),
        end: new Date("2024-05-08T15:30:00"),
      },
      // Add more busy times as needed
    ];

    event.attendees?.forEach((attendee: Attendee) => {
      attendeeBusyTimes[attendee.email] = busyTimes;
    });

    setAnalysis({
      ...analysis,
      attendeeBusyTimes,
    });
  };

  return {
    event,
    ...analysis,
    analyze,
  };
};

const event: CalendarEvent<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields> = {
  id: "1",
  title: "New Event",
  date: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  timestamp: new Date(),
  metadata: transformProjectToUnifiedMetadata<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>(projectMetadata), // Transform ProjectMetadata to StructuredMetadata
  rsvpStatus: "notResponded",
  host: {} as Member<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>,
  color: "",
  isImportant: false,
  teamMemberId: "0",
  status: StatusType.Pending,
  isCompleted: false,
  isActive: false,
  tags: {
    
  },
  priority: {} as PriorityTypeEnum.Medium,
  phase: null,
  participants: [],
  analysisType: {} as AnalysisTypeEnum,
  analysisResults: [],
  videoData: {} as VideoData<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>,
  content: "Event content",
  topics: [],
  highlights: [],
  files: [],
  options: getDefaultDocumentOptions(),
  attendees: [],
  location: "Event location",
  getData: () => Promise.resolve({}) as Promise<Snapshot<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>>,
  meta: {} as StructuredMetadata<alendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>
};

const calendarManagerState: CalendarManagerState = {
  attendeeAvailabilityAnalysis: {
    ...useAttendeeAvailabilityAnalysis(event),
    event, // Include the event property
  },
  entities: undefined,
  events: undefined,
  milestones: undefined,
  notifications: undefined,
  loading: false,
  filteredEvents: [],
  searchedEvents: [],
  sortedEvents: [],
  viewingEventDetails: null,
  sharedEvents: undefined,
  sharedEvent: undefined,
  pendingAction: null,
  isLoading: false,
  error: undefined,
  calendarEvent: undefined,
  calendarEventEditing: null,
  currentView: null,
  exportedEvents: undefined,
  externalCalendarsOverlays: [],
  chatRooms: undefined,
  chatRoom: undefined,
  user: null,
  suggestedLocation: null,
  suggestedDuration: null,
  suggestedTheme: null,
  suggestedAlternatives: [],
  eventImprovements: [],
  suggestedImprovements: [],
  suggestedCollaborators: [],
  suggestedEngagementStrategies: [],
  suggestedMarketingChannels: [],
  suggestEventPartnerships: [],
  suggestedPartnerships: [],
  suggestedTags: [],
  suggestedTimingOptimization: [],
  suggestedLocations: [],
  eventContentAnalysis: null,
  generatedPrompt: null,
  detectedSentiment: null,
  classifiedCategory: null,
  generatedSummary: null,
  enhancedDetails: null,
  contentValidationResults: null,
  impactAnalysis: null,
  budgetOptimization: null,
  teamCollaborationAnalysis: null,
  scheduleOptimization: null,
  optimizedEventSchedule: null,
  suggestedAgenda: [],
  eventConflictDetectionResult: null,
  eventPriorityClassification: null,
  eventFeedbackAnalysis: null,
  successPrediction: null,
  effectivenessEvaluation: null,
  eventTrendDetectionResult: null,
  eventRoiAnalysis: null,
  outcomeVariabilityPrediction: null,
  eventRiskAssessment: null,
  generatedEventContent: undefined,
  personalizedInvitations: [],
  engagementMetrics: [],
  impactPrediction: undefined,
  suggestedFollowUpActions: [],
  recommendedOptimizations: [],
  attendancePrediction: {
    ...useAttendancePrediction(),
    currentEvent: null, // Ensure currentEvent is initialized as null
  },};

export default calendarManagerState;

export { event };

    export type {
    Attendee, AttendeeAvailability, AttendeeAvailabilityAnalysis, AttendeeAvailabilityPrediction,
    AttendeeAvailabilityPredictionConfidenceInterval, BusyTime,
    ExtendedAttendeeAvailability
  };

