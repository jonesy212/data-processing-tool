// contentTypes.ts

enum ContentType {
    Text = 'text',
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    // Add more content types as needed
  }
  
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
  
  export default ContentType;