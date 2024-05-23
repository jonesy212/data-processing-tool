import { DataDetails } from "../models/data/Data";

interface VideoProperties {
  // Define essential video properties
  id: string;
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
  tags?: string[];
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
  playlists: [],
  videoSubtitles: string[]
}

interface VideoData extends DataDetails, Video {
  // Define properties specific to video data
  // For example:
  
  resolution: string;
  size:string; // Size of the video file in bytes
  aspectRatio: string;
  language: string;
  subtitles: string[];
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
      isProcessingStarted: false
    };

    return video;
  }
}

export default BasicVideoGenerator;
export type { VideoData };

