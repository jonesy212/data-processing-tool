interface Video {
    id: string; // Unique identifier for the video
    title: string; // Title of the video
    description: string; // Description of the video
    url: string; // URL of the video
    thumbnailUrl: string; // URL of the video thumbnail
    duration: number; // Duration of the video in seconds
    uploadedBy: string; // Username or ID of the user who uploaded the video
    viewsCount: number; // Number of views the video has received
    likesCount: number; // Number of likes the video has received
    dislikesCount: number; // Number of dislikes the video has received
    commentsCount: number; // Number of comments the video has received
    tags: string[]; // Array of tags associated with the video
    uploadDate: Date; // Date when the video was uploaded
    category: string; // Category or genre of the video
    resolution: string; // Resolution of the video (e.g., "1080p", "720p")
    aspectRatio: string; // Aspect ratio of the video (e.g., "16:9", "4:3")
    language: string; // Language of the video
    subtitles: boolean; // Indicates if subtitles are available for the video
    closedCaptions: boolean; // Indicates if closed captions are available for the video
    license: string; // License type of the video (e.g., "Standard", "Creative Commons")
    isLive: boolean; // Indicates if the video is a live stream
    liveStatus?: string; // Status of the live stream (e.g., "live", "upcoming", "ended")
    scheduledStartTime?: Date; // Scheduled start time for a live stream
    scheduledEndTime?: Date; // Scheduled end time for a live stream
    channel: string; // Channel or user associated with the video
    channelId: string; // ID of the channel or user associated with the video
    playlistId?: string; // ID of the playlist containing the video (if applicable)
    isLicensedContent: boolean; // Indicates if the video is licensed content
    isFamilyFriendly: boolean; // Indicates if the video is family-friendly
    isEmbeddable: boolean; // Indicates if the video can be embedded on external sites
    isDownloadable: boolean; // Indicates if the video can be downloaded
    location?: string; // Location where the video was recorded or filmed
    latitude?: number; // Latitude coordinate of the video location
    longitude?: number; // Longitude coordinate of the video location
    country?: string; // Country where the video was recorded or filmed
    region?: string; // Region or state where the video was recorded or filmed
    city?: string; // City where the video was recorded or filmed
    recordedDate?: Date; // Date when the video was recorded or filmed
    recordedYear?: number; // Year when the video was recorded or filmed
    recordedMonth?: number; // Month when the video was recorded or filmed
    recordedDay?: number; // Day when the video was recorded or filmed
    recordedHour?: number; // Hour when the video was recorded or filmed
    recordedMinute?: number; // Minute when the video was recorded or filmed
    recordedSecond?: number; // Second when the video was recorded or filmed
    recordedTimeZone?: string; // Time zone of the video recording location
    recordedTimestamp?: number; // Unix timestamp of the video recording
    licenseUrl?: string; // URL to the license agreement for the video
    credits?: string[]; // Array of credits or attributions for the video
    customFields?: Record<string, any>; // Custom fields or additional metadata for the video
    videoData: any; // Additional video data
  }
  