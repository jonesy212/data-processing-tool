// UserFeedback.ts
interface UserFeedback {
  id: string;
  userId: string;
  message: string;
  date: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  issue: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
}

interface UserInquiry {
  id: string;
  userId: string;
  inquiry: string;
  response?: string;
  date: string;
}
