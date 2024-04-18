// Feedback.ts
export interface Feedback {
    audioUrl: string | undefined;
    videoUrl: string | undefined;
    userId: string;
    comment: string;
    rating: number;
    timestamp: Date;
    // Add more properties if needed
  }
  