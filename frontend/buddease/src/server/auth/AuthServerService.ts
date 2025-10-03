// AuthServerService.ts
import { generateToken } from "@/app/generators/generateTokens";
import { JWT_SECRET } from "@/server/JwtConfig";
import * as jwt from "jsonwebtoken";
import { DatabaseConfig, DatabaseService } from "@/config/DatabaseConfig";
import { AuthenticationProvider, BaseAuthService } from "./BaseAuthService";
import { DatabaseServiceFactory, DatabaseType } from "./DatabaseServiceFactory";
import { LoginResult } from '@/app/typings/authTypes'

// Define proper response types
interface LoginResult {
  success: boolean;
  accessToken?: string;
  user?: any;
  roles?: string[];
  permissions?: string[];
  error?: string;
  code?: string;
}

interface AdminLoginResult extends LoginResult {
  isAdmin?: boolean;
}

class AuthServerService extends BaseAuthService {
  private databaseService: DatabaseService;
  private databaseType: DatabaseType;

  constructor(databaseConfig: DatabaseConfig, databaseType: DatabaseType = DatabaseType.POSTGRES) {
    super();
    this.databaseType = databaseType;
    this.databaseService = DatabaseServiceFactory.createDatabaseService(databaseConfig, databaseType);
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

  // Enhanced login method with proper error handling
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      // Validate input
      if (!username || !password) {
        return {
          success: false,
          error: 'Missing credentials',
          code: 'MISSING_CREDENTIALS'
        };
      }

      // Find user in database ← USING databaseService HERE!
      const user = await this.databaseService.findOne('users', { username });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Check if account is locked
      if (user.isLocked) {
        return {
          success: false,
          error: 'Account temporarily locked',
          code: 'ACCOUNT_LOCKED'
        };
      }
      
      // Verify password (you'll need to implement proper password hashing)
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.incrementFailedAttempts(user.id);
        return {
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);

      // Generate token payload
      const tokenPayload = this.createTokenPayload(user);
      const scopes = user.permissions || ['user'];
      const accessToken = generateToken(tokenPayload, scopes, { expiresIn: '1h' });

      // Set access token in base class
      this.setAccessToken(accessToken);

      return {
        success: true,
        accessToken,
        user: this.sanitizeUser(user),
        roles: user.roles || ['user'],
        permissions: user.permissions || []
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed',
        code: 'LOGIN_FAILED'
      };
    }
  }

  // Enhanced admin login with role checking
  async adminLogin(username: string, password: string): Promise<AdminLoginResult> {
    try {
      // First perform regular login
      const loginResult = await this.login(username, password);
      
      if (!loginResult.success) {
        return loginResult;
      }

      // Check if user has admin role
      if (!loginResult.roles?.includes('admin')) {
        return {
          success: false,
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        };
      }

      // Generate admin-specific token with longer expiry
      const adminTokenPayload = {
        ...this.createTokenPayload(loginResult.user!),
        isAdmin: true,
        adminSince: new Date().toISOString()
      };
      
      const adminScopes = [...(loginResult.permissions || []), 'admin_access'];
      const adminAccessToken = generateToken(adminTokenPayload, adminScopes, { expiresIn: '8h' });

      this.setAccessToken(adminAccessToken);

      return {
        success: true,
        accessToken: adminAccessToken,
        user: loginResult.user,
        roles: loginResult.roles,
        permissions: loginResult.permissions,
        isAdmin: true
      };

    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: 'Admin login failed',
        code: 'ADMIN_LOGIN_FAILED'
      };
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
  
      // Fetch fresh user data from database
      const user = await this.databaseService.findOne('users', { _id: payload.sub });
      if (!user) {
        throw new Error("User not found");
      }
  
      const scopes = payload.scopes;

      // Generate a new access token with updated user data
      const newPayload = this.createTokenPayload(user);
      const newAccessToken = generateToken(newPayload, scopes, { expiresIn: '1h' });
  
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  // Helper methods
  private createTokenPayload(user: any): any {
    return {
      username: user.username,
      roles: user.roles || ['user'],
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tier: user.tier,
      token: user.token,
      uploadQuota: user.uploadQuota,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: user.fullName,
      bio: user.bio,
      userType: user.userType,
      hasQuota: user.hasQuota,
      profilePicture: user.profilePicture,
      processingTasks: user.processingTasks,
      role: user.role,
      persona: user.persona,
      friends: user.friends,
      blockedUsers: user.blockedUsers,
      settings: user.settings,
      interests: user.interests,
      followers: user.followers,
      privacySettings: user.privacySettings,
      notifications: user.notifications,
      activityLog: user.activityLog,
      socialLinks: user.socialLinks,
      relationshipStatus: user.relationshipStatus,
      hobbies: user.hobbies,
      skills: user.skills,
      achievements: user.achievements,
      profileVisibility: user.profileVisibility,
      profileAccessControl: user.profileAccessControl,
      activityStatus: user.activityStatus,
      isAuthorized: user.isAuthorized,
      preferences: user.preferences,
      storeId: user.storeId,
      bannerUrl: user.bannerUrl,
      currentMetadata: user.currentMetadata,
      currentMeta: user.currentMeta,
      sub: user._id || user.id // Standard JWT subject claim
    };
  }

  private sanitizeUser(user: any): any {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Implement proper password verification (bcrypt, etc.)
    // This is a placeholder - replace with actual hashing logic
    return plainPassword === hashedPassword; // Remove this in production!
  }

  private async incrementFailedAttempts(userId: string): Promise<void> {
    try {
      const user = await this.databaseService.findOne('users', { _id: userId });
      if (user) {
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const isLocked = failedAttempts >= 5; // Lock after 5 failed attempts
        
        await this.databaseService.update('users', { _id: userId }, {
          failedLoginAttempts: failedAttempts,
          isLocked,
          lockUntil: isLocked ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes
        });
      }
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
    }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.databaseService.update('users', { _id: userId }, {
        failedLoginAttempts: 0,
        isLocked: false,
        lockUntil: null
      });
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  // Additional server-only methods
  async validateUserPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    try {
      const user = await this.databaseService.findOne('users', { _id: userId });
      if (!user) return false;

      return requiredPermissions.every(permission => 
        user.permissions?.includes(permission)
      );
    } catch (error) {
      console.error('Error validating user permissions:', error);
      return false;
    }
  }

  async validateUserRoles(userId: string, requiredRoles: string[]): Promise<boolean> {
    try {
      const user = await this.databaseService.findOne('users', { _id: userId });
      if (!user) return false;

      return requiredRoles.every(role => 
        user.roles?.includes(role)
      );
    } catch (error) {
      console.error('Error validating user roles:', error);
      return false;
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
  authToken: process.env.AUTH_TOKEN,
};

// Factory functions
export const createAuthService = (dbType: DatabaseType = DatabaseType.POSTGRES) => 
  new AuthServerService(databaseConfig, dbType);

export const createPostgresAuthService = () => 
  new AuthServerService(databaseConfig, DatabaseType.POSTGRES);

export const createMysqlAuthService = () => 
  new AuthServerService(databaseConfig, DatabaseType.MYSQL);

// Default export
export default createPostgresAuthService;
export { AuthServerService, LoginResult };
