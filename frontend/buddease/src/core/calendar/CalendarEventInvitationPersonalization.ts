CalendarEventInvitationPersonalization.ts
import type { PersonalizedInvitation } from "@/core/models/data/EventPriorityClassification";
import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";

interface CalendarEventInvitationPersonalization extends WritableDraft<PersonalizedInvitation> {
  eventId: string; // ID of the event
  personalizedInvitations: PersonalizedInvitation[]; // Array of personalized invitations
  // Add any additional properties or methods as needed
}


export type { CalendarEventInvitationPersonalization, PersonalizedInvitation };

