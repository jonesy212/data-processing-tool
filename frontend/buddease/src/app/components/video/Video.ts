import { VideoData } from '@/app/components/video/Video';


interface VideoData<T extends BaseData<any>, K extends T = T> extends Video {
    currentMeta: any; // Or use a specific type
    currentMetadata: any; // Or use a specific type
    date: Date; // Assuming it's a date, update as needed
    video: T; // Assuming this represents the full video data
  }
  
  const videos: Record<string, VideoData<T, K>[]> = {
    someCategory: [
      {
        id: '1',
        title: 'Video 1',
        description: 'A test video',
        content: 'Video content',
        watchLater: false,
        tags: ['test', 'example'],
        isActive: true,
        url: 'http://example.com',
        currentMeta: {}, // Dummy meta data
        currentMetadata: {}, // Dummy metadata
        date: new Date(),
        video: {} as T, // Assuming T has a structure, provide the correct data
      },
    ],
  };


  export { VideoData }
  