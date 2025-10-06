
import { Label } from '@/app/branding/BrandingSettings';
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';

interface VideoData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  SharedTimestamps,
  SharedStatusFlags,
  SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // explicitly redefine conflicting fields to match both
  id: string; // Video says string, overrides SharedIdentifiers
  isActive: boolean; // Video says boolean, overrides SharedStatusFlags

  // Core video metadata
  video: T; // the full BaseData video reference
  label: Label;
  campaignId?: number;
  date: Date;

  // Additional video properties
  resolution?: string;
  size?: string | number;
  aspectRatio?: string;
  language?: string;
  subtitles?: string[];
  duration?: number;
  codec?: string;
  frameRate?: number;
  thumbnailUrl?: string;
  uploadedBy?: string;

  // Interaction / statistics
  viewsCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;

  // Extended video info
  videoTitle?: string;
  videoDescription?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoTags?: string[];
  videoSubtitles?: string[];
  isLive?: boolean;
  isPrivate?: boolean;
  isUnlisted?: boolean;

  // Processing and content flags
  isProcessing?: boolean;
  isProcessingStarted?: boolean;
  isProcessingCompleted?: boolean;
  isProcessingFailed?: boolean;
  isCompleted?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;

  // Licensing / channel
  license?: string;
  channel?: string;
  channelId?: string;
  isLicensedContent?: boolean;
  isFamilyFriendly?: boolean;
  isEmbeddable?: boolean;
  isDownloadable?: boolean;
  playlists?: string[];

  // Flexible metadata
  currentMeta?: any;
  currentMetadata?: any;
  [key: string]: any;
}


  const videos: Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {
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


  export type { VideoData };
  