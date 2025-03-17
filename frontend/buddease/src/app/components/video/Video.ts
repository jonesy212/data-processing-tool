
import { BaseData } from '@/app/components/models/data/Data';
import { Video } from "@/app/components/state/stores/VideoStore";
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { T, K } from '@/app/components/models/data/dataStoreMethods';

  interface VideoData<T extends BaseData<any>, K extends T = T> extends Video {
    currentMeta: any; // Or use a specific type
    currentMetadata: any; // Or use a specific type
    date: Date; // Assuming it's a date, update as needed
    video: T; // Assuming this represents the full video data
    label: Label
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
        label: {
          text: "",
          color: "",
         
        }
      },
    ],
  };


  export type { VideoData }
  