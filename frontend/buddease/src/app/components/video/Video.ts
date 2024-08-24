import { Data, DataDetails } from "../models/data/Data";
import { TagsRecord } from "../snapshots";
import { Tag } from "./../models/tracker/Tag";

interface VideoProperties {
  // Define essential video properties

  id?: string | number | undefined;
  title?: string;
  description?: string | null | undefined;
  videoLikes: number;
  videoViews: number;
  videoComments: number;
  videoThumbnail: string;
  videoUrl: string;
  videoTitle: string
  videoDescription: string;
  videoTags: string[];
  isCompleted: boolean,
  isUploading: boolean,
  isDownloading: boolean,
  isDeleting: boolean,
  thumbnail: string,
  isProcessing: boolean,
  isPrivate: boolean,
  isProcessingFailed: boolean,
  isProcessingStarted: boolean,
  isLive: boolean,
}

interface Video extends VideoProperties {
  // Define optional video properties with default values
  url: string;
  thumbnailUrl: string;
  duration: number;
  uploadedBy: string;
  viewsCount: number;
  likesCount: number;
  videoDislikes: number;
  dislikesCount: number;
  commentsCount: number;
  videoAuthor: string;
  videoDurationInSeconds: number;
  tags?: TagsRecord

  createdAt?: Date | undefined;
  updatedAt: Date | undefined;
  createdBy: string | undefined
  uploadedAt: Date | undefined;

  videoLikes: number,
  videoViews: number,
  videoComments: number,
  videoThumbnail: string,
  videoUrl: string,
  videoTitle: string,
  thumbnail: string,
  videoDescription: string,
  videoTags: string[],

  isDeleting: boolean,
  isCompleted: boolean,
  isUploading: boolean,
  isDownloading: boolean,
  isProcessing: boolean,
  uploadDate: Date;
  category: string;
  resolution: string;
  aspectRatio: string;
  language: string;
  subtitles: boolean | string[]; // Updated subtitles property
  closedCaptions: string[];
  license: string;
  isLive: boolean;
  isPrivate: boolean,
  isUnlisted: boolean,
  isProcessingCompleted: boolean,
  isProcessingFailed: boolean,
  isProcessingStarted: boolean,
  channel: string;
  channelId: string;
  isLicensedContent: boolean;
  isFamilyFriendly: boolean;
  isEmbeddable: boolean;
  isDownloadable: boolean;
  playlists: string[],
  videoSubtitles: string[]
}

interface VideoData extends DataDetails, Video {
  // Define properties specific to video data
  // For example:

  resolution: string;
  size: string; // Size of the video file in bytes
  aspectRatio: string;
  language: string;
  subtitles: string[] | boolean;
  codec: string;
  frameRate: number;
  duration: number; // Duration of the video in seconds
  campaignId: number; // ID of the associated campaign

  // Add more properties as needed
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
      videoData: {} as VideoData,
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
  }
}


const videoData: VideoData = {
  resolution: "",
  id: "",
  aspectRatio: "",
  language: "",
  subtitles: [],
  duration: 0,
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
};


export default BasicVideoGenerator;
export { videoData };
export type { VideoData };

