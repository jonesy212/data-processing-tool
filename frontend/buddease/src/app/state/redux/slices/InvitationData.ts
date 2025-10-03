import { Member } from "@/app/components/models/teams/TeamMembers";

// InvitationData.tsx
interface InvitationData {
  recipientEmail: string;
  senderName: string;
  eventId: string;
  message?: string;
  invitee: Member;
}

export default InvitationData;