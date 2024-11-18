import { MediaMetadata } from "@/app/configs/database/MetaDataOptions";
import { LanguageEnum } from "../communications/LanguageEnum";

interface MediaSession {
  metadata: MediaMetadata | null;
}





interface CustomMediaSession extends MediaSession {
  sessionId: string;
  status: string;
    // Override metadata to allow for 'undefined' as well
    metadata: MediaMetadata | null;
}

interface ClientInformation {
  userAgent: string; // The user agent string of the client's browser
  screenWidth: number; // Width of the client's screen
  screenHeight: number; // Height of the client's screen
  language: LanguageEnum;
  timezone: string; // The client's timezone
  mediaSession?: CustomMediaSession | undefined; // Optional media session information
  // Add other properties as needed
}

export type { ClientInformation, CustomMediaSession }