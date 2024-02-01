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
  // Add other properties as needed
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
  videoData: Record<string, any>;
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
      videoData: {},
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
