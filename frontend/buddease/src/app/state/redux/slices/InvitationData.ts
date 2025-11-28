// InvitationData.ts
import { Member } from '@/app/models/members/Member';

// InvitationData.tsx
interface InvitationData {
  recipientEmail: string;
  senderName: string;
  eventId: string;
  message?: string;
  invitee: Member;
}

export default InvitationData;