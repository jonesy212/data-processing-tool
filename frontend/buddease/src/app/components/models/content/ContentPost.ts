interface ContentPost {
  id: string;
  title: string;
  content: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published';
  performance?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export type { ContentPost };
