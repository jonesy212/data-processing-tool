// Feedback.ts
export interface Feedback {
  id: string;
    audioUrl: string | undefined;
    videoUrl: string | undefined;
    userId: string;
    comment: string;
    rating: number;
  timestamp: Date;
  resolved: boolean;

    // Add more properties if needed
  }
  