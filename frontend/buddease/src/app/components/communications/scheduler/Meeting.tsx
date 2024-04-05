export interface Meeting {
  id: number;
  title: string;
  date: Date;
  duration: number;
  description: string;
  participants: string[]; // This can be an array of user IDs or names
  // Add any other properties relevant to a meeting
}
