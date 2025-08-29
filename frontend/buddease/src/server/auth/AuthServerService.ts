// AuthServerService.ts
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/server/JwtConfig";
import { generateToken } from "@/app/generators/generateTokens";

// AuthServerService.ts
import { DatabaseConfig, DatabaseService } from "@/app/configs/DatabaseConfig";
import { PostgresDatabaseService } from "../database/PostgresDatabaseService";
import AuthService from "./AuthService";

class AuthServerService extends AuthService {
  private databaseService: DatabaseService;

  constructor(databaseConfig: DatabaseConfig) {
    super();
    this.databaseService = new PostgresDatabaseService(databaseConfig);
  }

  // Server-specific implementations
  protected async saveAuthenticationProvidersInternal(providers: AuthenticationProvider[]): Promise<void> {
    try {
      await this.databaseService.insert(providers, 'authentication_providers');
    } catch (error) {
      console.error('Error saving authentication providers:', error);
      throw error;
    }
  }

  protected async getAuthenticationProvidersInternal(): Promise<AuthenticationProvider[]> {
    try {
      return await this.databaseService.findAll('authentication_providers');
    } catch (error) {
      console.error('Error retrieving authentication providers:', error);
      throw error;
    }
  }

  // Server-only methods

  async adminLogin(
    username: string,
    password: string
  ): Promise<{ accessToken: string }> {
    try {
      const response = await fetch("/api/auth/admin/login", { // Adjust the endpoint path accordingly
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        return { accessToken: data.accessToken };
      } else {
        throw new Error("Admin login failed");
      }
    } catch (error) {
      throw new Error("Admin login failed");
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
  
      // Ensure the payload contains the user ID and scopes
      if (typeof payload.sub !== 'string' || !Array.isArray(payload.scopes)) {
        throw new Error("Invalid refresh token payload");
      }
  
      // You may need to fetch user data and scopes from your database if not included in the token
      const user = { _id: payload.sub 


        
      }; // Replace with actual user retrieval logic
      const scopes = payload.scopes; // Replace with actual scopes if necessary
  
      // Generate a new access token
      const newPayload = {
        username: payload.username,
        roles: payload.roles,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        tier: payload.tier,
       
        token: payload.token,
        uploadQuota: payload.uploadQuota,
        avatarUrl: payload.avatarUrl,
        createdAt: payload.createdAt,
       
        updatedAt: payload.updatedAt,
        fullName: payload.fullName,
        bio: payload.bio,
        userType: payload.userType,
       
        hasQuota: payload.hasQuota,
        profilePicture: payload.profilePicture,
        processingTasks: payload.processingTasks,
        role:  payload.role,
        persona: payload.persona,
        friends: payload.friends,
        blockedUsers: payload.blockedUsers,
        settings: payload.settings,
       
        interests: payload.interests,
        followers: payload.followers,
        privacySettings: payload.privacySettings,
        notifications: payload.notifications,
       
        activityLog: payload.activityLog,
        socialLinks: payload.socialLinks,
        relationshipStatus: payload.relationshipStatus,
        hobbies: payload.hobbies,
       
        skills: payload.skills,
        achievements: payload.achievements,
        profileVisibility: payload.profileVisibility,
        profileAccessControl: payload.profileAccessControl,
       
        activityStatus: payload.activityStatus,
        isAuthorized: payload.isAuthorized,
        preferences: payload.preferences,
        storeId: payload.storeId,
       
        bannerUrl: payload.bannerUrl,
        currentMetadata: payload.currentMetadata,
        currentMeta: payload.currentMeta 
       
        // Add other claims as needed
      };
      
      const newAccessToken = generateToken(newPayload, scopes,{ expiresIn: '1h' });
  
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
  
}

export const databaseConfig: DatabaseConfig = {
  url: process.env.DB_URL!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.DB_PORT!, 10),
  authToken: process.env.AUTH_TOKEN, // Optional if needed
};

export default new AuthServerService();
