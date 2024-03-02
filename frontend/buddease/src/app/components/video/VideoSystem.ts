import { VideoData } from "./Video";

interface VideoSystemFeature {
  name: string;
  description: string;
  technology: string[];
  video?: Video;
}

interface VideoSystemNode {
  name: string;
  description: string;
  children?: VideoSystemNode[];
  features?: VideoSystemFeature[];
}

interface Video {
  id: string; // Unique identifier for the video
  title: string; // Title of the video
  description: string; // Description of the video
  videoDislikes: number; // Number of dislikes for the video
  videoAuthor: string; // Author of the video
  videoDurationInSeconds: number
  playlists: string[]; // List of playlists that the video belongs to
  url: string;
  thumbnailUrl: string;
  duration: number;
  uploadedBy: string;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
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
  videoData: VideoData;
}

class VideoGenerator {
  static generateFeature(
    name: string,
    description: string,
    technology: string[],
    video?: Video
  ): VideoSystemFeature {
    return { name, description, technology, video };
  }

  static generateNode(
    name: string,
    description: string,
    children?: VideoSystemNode[],
    features?: VideoSystemFeature[]
  ): VideoSystemNode {
    return { name, description, children, features };
  }

  static generateVideo(id: string, title: string, description: string): Video {
    return {
      id,
      title,
      description,
      url: "", // Placeholder values for the missing properties
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
      videoDislikes: 0,
      videoAuthor: "videoAuthor",
      videoDurationInSeconds: 0,
      playlists: [],
    };
  }
}

// Usage example:
const videoCallingFeature = VideoGenerator.generateFeature(
  "Video Calling",
  "Real-time video communication between users",
  ["WebRTC", "Socket.IO"]
);

const videoSystemTree: VideoSystemNode = VideoGenerator.generateNode(
  "Video System",
  "Enhanced video system for project management",
  [
    VideoGenerator.generateNode(
      "Core Functionality",
      "Basic features required for video communication",
      undefined,
      [videoCallingFeature]
    ),
    // Add other nodes and features as needed
  ]
);

// Accessing features
if (
  videoSystemTree.children &&
  videoSystemTree.children.length > 0 &&
  videoSystemTree.children[0].features
) {
  console.log(videoSystemTree.children[0].features[0].name);
} else {
  console.log("Cannot access feature name: Video Calling");
}






// Necessary Properties for VideoGenerator
// Your VideoGenerator class already includes properties for generating videos. It covers essential properties such as id, title, description, url, etc. However, you might consider adding properties like author, genre, releaseDate, etc., depending on your application's requirements.

// Summary
// With the addition of VideoNode and VideoFeature interfaces, your system now has the capability to represent the hierarchical structure of video features. The VideoGenerator class can generate videos with default values for essential properties. You can further enhance the VideoGenerator to include additional properties based on your system's requirements.

// If you have any specific properties or features in mind that you'd like to add or discuss further, please let me know!