interface VideoProperties {
  // Define essential video properties
  id: string;
  title: string;
  description: string;
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
  tags: string[];
  uploadDate: Date;
  category: string;
  resolution: string;
  aspectRatio: string;
  language: string;
  subtitles: boolean;
  closedCaptions: boolean;
  license: string;
  isLive: boolean;
  channel: string;
  channelId: string;
  isLicensedContent: boolean;
  isFamilyFriendly: boolean;
  isEmbeddable: boolean;
  isDownloadable: boolean;
  videoData: VideoData,
}

interface VideoData {
  // Define properties specific to video data
  // For example:
  resolution: string;
  aspectRatio: string;
  language: string;
  subtitles: boolean;
  duration: number; // Duration of the video in seconds
  campaignId: number; // ID of the associated campaign
 
  // Add more properties as needed
}

class BasicVideoGenerator {
  static generateVideo(id: string, title: string, description: string): Video {
      // Assign default values dynamically
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
          subtitles: false,
          closedCaptions: false,
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

      // Merge default values with provided properties
      const video: Video = {
        ...defaultValues, id, title, description,
        videoDislikes: 0,
        videoAuthor: "",
        videoDurationInSeconds: 0,
        playlists: [],
      };

      return video;
  }
}
