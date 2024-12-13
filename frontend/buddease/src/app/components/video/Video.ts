import { UserData } from '@/app/components/users/User';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { CommonData } from '@/app/components/models/CommonData';
import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { TagsRecord } from "../snapshots";
import { VideoMetadata } from '@/app/configs/StructuredMetadata';
import { ExcludedFields } from '../routing/Fields';

interface BaseVideoProperties {
  id?: string | number | undefined;
  title?: string;
  description?: string | null | undefined;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadedBy?: string;
  viewsCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  uploadDate?: Date;
  videoAuthor?: string;
  videoDurationInSeconds?: number;
  videoLikes?: number;
  videoViews?: number;
  videoComments?: number;
  videoThumbnail?: string;
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoTags?: string[];
  category: symbol | string | Category | undefined,
  resolution?: string;
  aspectRatio?: string;
  language?: string;
  subtitles?: boolean | string[];
  closedCaptions?: string[];
  license?: string;
  isLive?: boolean;
  isProcessing?: boolean;
  isCompleted?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;
  isPrivate?: boolean;
  isUnlisted?: boolean;
  isProcessingCompleted?: boolean;
  isProcessingFailed?: boolean;
  isProcessingStarted?: boolean;
  channel?: string;
  channelId?: string;
  isLicensedContent?: boolean;
  isFamilyFriendly?: boolean;
  isEmbeddable?: boolean;
  isDownloadable?: boolean;
  playlists?: string[];
  videoSubtitles?: string[];
}




// Updated VideoCommonData Interface
interface VideoCommonData extends CommonData<UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>> {
  uploadedAt?: Date;
  url?: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  videoDislikes?: number;
  dislikesCount?: number; // Can be considered specific to video
  videoAuthor?: string;
  videoDurationInSeconds?: number;
  uploadDate?: Date;
  closedCaptions?: string[];
  license?: string;
  isLive?: boolean;
  isProcessingCompleted?: boolean;
  isProcessingFailed?: boolean;
  isProcessingStarted?: boolean;
  channel?: string;
  channelId?: string;
  playlists?: string[];
  videoSubtitles?: string[];
  isCompleted?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;
  thumbnail?: string;
  isProcessing?: boolean;
  // Add more video-specific properties as needed...
}



interface Video<
  T extends BaseData<any> = BaseData<any>,
  K extends T = T
>
  extends BaseVideoProperties {
  // Additional properties specific to `Video` if any
  tags?: TagsRecord<VideoData, VideoMetadata>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  thumbnail?: string;
  uploadedAt?: string
}


interface VideoData<
  T extends BaseData<any>,
  K extends  T = T,
  // Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>
  extends DataDetails<T, K>,
  VideoCommonData, BaseVideoProperties {
  // Additional properties specific to `VideoData`
  size?: string; // Size of the video file in bytes
  codec?: string;
  frameRate?: number;
  campaignId?: number;
  video: Video; // Reference to the `Video` object if needed
  // Other properties for metadata
  videoMetadata?: {
    resolution?: string;
    aspectRatio?: string;
    language?: string;
    subtitles?: boolean | string[];
    closedCaptions?: string[];
    license?: string;
    isLicensedContent?: boolean;
    isFamilyFriendly?: boolean;
    isEmbeddable?: boolean;
    isDownloadable?: boolean;
  };
}


class BasicVideoGenerator {
  static generateVideo(
    id: string,
    title: string,
    description: string | null = null
  ): Video {
    const defaultValues = {
      url: "",
      thumbnailUrl: "",
      duration: 0,
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      tags: [],
      uploadDate: new Date(),
      category: "",
      resolution: "",
      aspectRatio: "",
      language: "",
      subtitles: [],
      closedCaptions: [],
      license: "",
      isLive: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      videoData: {} as VideoData<BaseData, BaseData>,
    };

    const video: Video = {
      ...defaultValues,
      id,
      title,
      description: description || "",
      updatedAt: undefined,
      createdBy: undefined,
      uploadedAt: undefined,
      tags: {},
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 0,
      playlists: [],
      subtitles: [],
      videoLikes: 0,
      videoViews: 0,
      videoComments: 0,
      videoThumbnail: "",
      videoUrl: "",
      videoTitle: "",
      videoDescription: "",
      videoTags: [],
      videoSubtitles: [],
      isPrivate: false,
      isUnlisted: false,
      isProcessingCompleted: false,
      isProcessingFailed: false,
      isProcessingStarted: false,
      isCompleted: false,
      isUploading: false,
      isDownloading: false,
      isDeleting: false,
      thumbnail: "",
      isProcessing: false,
    };

    return video;
  }}


const video: VideoData<UserData, UserData> = {
  id: "video123",
  video: {}, 
  date: new Date(),
  label: {}, 
  resolution: "1080p",
  aspectRatio: "16:9",
  language: "English",
  subtitles: [],
  duration: 120,
  campaignId: 0,
  size: "",
  codec: "",
  frameRate: 0,
  createdBy: undefined,
  uploadedAt: undefined,
  updatedAt: undefined,
  url: "",
  thumbnailUrl: "",
  uploadedBy: "",
  viewsCount: 0,
  likesCount: 0,
  videoDislikes: 0,
  dislikesCount: 0,
  commentsCount: 0,
  videoAuthor: "",
  videoDurationInSeconds: 0,
  uploadDate: new Date(),
  category: "",
  closedCaptions: [],
  license: "",
  isLive: false,
  isPrivate: false,
  isUnlisted: false,
  isProcessingCompleted: false,
  isProcessingFailed: false,
  isProcessingStarted: false,
  channel: "",
  channelId: "",
  isLicensedContent: false,
  isFamilyFriendly: false,
  isEmbeddable: false,
  isDownloadable: false,
  playlists: [],
  videoSubtitles: [],
  videoLikes: 0,
  videoViews: 0,
  videoComments: 0,
  videoThumbnail: "",
  videoUrl: "",
  videoTitle: "",
  videoDescription: "",
  videoTags: [],
  isCompleted: false,
  isUploading: false,
  isDownloading: false,
  isDeleting: false,
  thumbnail: "",
  isProcessing: false,
   // You can also specify metadata related to the video
   videoMetadata: {
    resolution: "1080p",
    aspectRatio: "16:9",
    language: "English",
    subtitles: true,
    closedCaptions: ["caption1", "caption2"],
    license: "Standard",
    isLicensedContent: true,
    isFamilyFriendly: true,
    isEmbeddable: true,
    isDownloadable: true,
  }
};


export default BasicVideoGenerator;
export { videoData };

  export type { VideoData };
