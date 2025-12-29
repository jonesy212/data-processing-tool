// Video.ts

import { Label } from '@/core/branding/BrandingSettings';
import { BaseDataEntity } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/core/documents/RelatedProps';
import { VideoAttachment, VideoEntity, VideoExcludedFields, VideoIncludedFields, VideoK, VideoMeta } from '@/core/typings/entities/VideoEntity';


export interface Video {
  id: string; 
  content: string;
  watchLater: boolean;
  tags: string[];
  isActive: boolean;
  url?: string;

  resolution?: string;
  duration?: number;
  uploadedBy?: string;
  thumbnailUrl?: string;
  currentMeta?: any;
  currentMetadata?: any;
  [key: string]: any;
}

interface VideoData<
  T extends BaseDataEntity,
  K extends T = T
> extends
  SharedTimestamps,
  SharedStatusFlags,
  SharedIdentifiers<T, K> {
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


// Now the videos record:
const videos: Record<
  string,
  Video[]
> = {
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
      currentMeta: {} as VideoMeta, // Fill with proper Meta if available
      currentMetadata: {} as UnifiedMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>, // Proper metadata
      date: new Date(),
      video: {} as VideoEntity, // Provide the actual data entity here
      label: {
        text: "Test Label",
        color: "#FF0000"
      }
    }
  ]
};

  export type { VideoData };
  