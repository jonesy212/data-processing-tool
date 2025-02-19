import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { BaseData } from '@/app/components/models/data/Data';
import { UserData } from '@/app/components/users/User';
import { StructuredMetadata, VideoMetadata } from '@/app/configs/StructuredMetadata';
// EducationalVideoMetadata.ts
interface EducationalVideoMetadata<
  T extends BaseData<any>, // Content-specific data
  K extends T = T,         // Default fallback to the same type
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends VideoMetadata<T, K, Meta> {
  courseId: string; // ID of the course this video belongs to
  instructor: string; // Name or ID of the instructor
  learningObjectives: string[]; // Specific objectives tied to the video
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced'; // Difficulty level
  relatedMaterials?: string[]; // Links to additional resources
}


const educationalVideo: EducationalVideoMetadata<UserData, UserData> = {
  id: "video123",
  title: "Introduction to TypeScript",
  url: "https://example.com/video123",
  duration: 3600,
  sizeInBytes: 500000000,
  format: "MP4",
  uploadDate: new Date(),
  uploader: "user456",
  categories: ["Programming", "TypeScript"],
  language: LanguageEnum.English,
  location: "Online",
  bitrate: 5000,
  frameRate: 30,
  views: 1000,
  likes: 150,
  resolution: "1920x1080",
  aspectRatio: "16:9",
  subtitles: ["English", "Spanish"],
  closedCaptions: [],
  license: "CC-BY",
  isLicensedContent: true,
  isFamilyFriendly: true,
  isEmbeddable: true,
  isDownloadable: true,
  codec: "H.264",
  colorSpace: "sRGB",
  audioCodec: "AAC",
  audioChannels: 2,
  audioSampleRate: 44100,
  chapters: ["Introduction", "Syntax Basics", "Advanced Features"],
  thumbnailUrl: "https://example.com/thumbnails/video123.jpg",
  metadataSource: "Internal",
  data: {
    // Custom data implementation for `BaseData`
    id: "data123",
    type: "video",
    name: "Intro to TypeScript Metadata",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["TypeScript", "Programming"],
    childIds: [],
    relatedData: []
  },
  courseId: "course789",
  instructor: "Dr. Jane Doe",
  learningObjectives: [
    "Understand the basics of TypeScript",
    "Learn about advanced features like generics",
    "Apply TypeScript in real-world projects",
  ],
  difficultyLevel: "Beginner",
  relatedMaterials: [
    "https://example.com/docs/typescript-intro",
    "https://example.com/videos/advanced-typescript",
  ],
  childIds: [],
  relatedData: []
};
  