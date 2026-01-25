// InvitationData.ts
import { Member } from '@/core/models/members/Member';

interface InvitationData {
  recipientEmail: string;
  senderName: string;
  eventId: string;
  message?: string;
  invitee: Member;
}

export default InvitationData;