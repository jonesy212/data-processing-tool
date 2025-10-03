import { PersonalizedInvitation } from "@/app/models/data/EventPriorityClassification";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";

// CalendarEventInvitationPersonalization.ts
interface CalendarEventInvitationPersonalization extends WritableDraft<PersonalizedInvitation> {
  eventId: string; // ID of the event
  personalizedInvitations: PersonalizedInvitation[]; // Array of personalized invitations
  // Add any additional properties or methods as needed
}


export type { CalendarEventInvitationPersonalization, PersonalizedInvitation };

