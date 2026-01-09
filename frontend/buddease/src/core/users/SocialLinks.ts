SocialLinks.ts
SocialLinks.tsx
// Define the social links interface
interface SocialLinks {
  website?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  devpost?: string | null;
  youtube?: string | null;
  medium?: string | null;
  twitch?: string | null;
  discord?: string | null;
  dribble?: string | null;
  behance?: string | null;
  tiktok?: string | null;
  telegram?: string | null;
  reddit?: string | null;
  quora?: string | null;
  stackoverflow?: string | null;
  gitlab?: string | null;
}

interface SocialAccount {
  id: string;
  provider: SocialProvider; // e.g., 'google', 'github', 'twitter', 'linkedin'
  providerId: string; // The unique ID from the social provider
  displayName?: string;
  email?: string;
  photoURL?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  isConnected: boolean;
  lastSynced?: Date;
  profileData?: Record<string, any>; // Additional provider-specific data
  createdAt: Date;
  updatedAt: Date;
}

type SocialProvider = 
  | 'google' 
  | 'github' 
  | 'x' 
  | 'linkedin' 
  | 'facebook' 
  | 'microsoft' 
  | 'slack' 
  | 'discord';

export type { SocialAccount, SocialLinks, SocialProvider };

