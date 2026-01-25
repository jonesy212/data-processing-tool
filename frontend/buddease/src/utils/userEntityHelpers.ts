// userEntityHelpers.ts

import type { UserEntity, SecureUserEntity, PublicUserEntity, MinimalUserEntity } from '@/core/typings/entities/UserEntity'
import type { AppEntity } from '@/core/typings/entities/AppEntity'
import { UserSecurity } from '@/core/users/userSecurity'
import { useSecureUserId } from '@/core/hooks/useSecureUserId';
import { getUserData, getUsersData } from '@/core/api/UsersApi';

const { userId } = useSecureUserId();

export class UserEntityFactory {
    /**
     * Create a secure user entity without sensitive data
     */
static createSecureUserEntity(
    userData: Partial<UserEntity> & { 
      id: string; 
      name: string; 
      email: string; 
      role: string;
      appId: string;
      appName: string;
      version: string;
      environment: string;
      status: string;
    }
  ): SecureUserEntity {
    const now = new Date();
    
    const { password, secret, ...safeData } = userData;
    
    return {
      // Required properties (excluding password/secret)
      id: safeData.id,
      name: safeData.name,
      email: safeData.email,
      role: safeData.role,
      appId: safeData.appId,
      appName: safeData.appName,
      version: safeData.version,
      environment: safeData.environment,
      status: safeData.status,
      
      // Optional properties with defaults
      username: safeData.username || safeData.name.toLowerCase().replace(/\s+/g, ''),
      avatar: safeData.avatar || '',
      teams: safeData.teams || [],
      createdAt: safeData.createdAt || now,
      updatedAt: safeData.updatedAt || now,
      isActive: safeData.isActive ?? true,
      lastLogin: safeData.lastLogin,
      preferences: safeData.preferences || {},
    };
  }

    /**
     * Create a complete user entity (for internal use only)
     */
    static createCompleteUserEntity(
        userData: Partial<UserEntity> & { 
        id: string; 
        name: string; 
        email: string; 
        password: string; 
        role: string;
        } & Partial<AppEntity> // AppEntity properties are optional
    ): UserEntity {
        const now = new Date();
        
        return {
        // Optional AppEntity properties
        appId: userData.appId || 'default-app',
        appName: userData.appName || 'Default App',
        version: userData.version || '1.0.0',
        environment: userData.environment || 'development',
        status: userData.status || 'active',
        
        // UserEntity properties
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        avatar: userData.avatar || '',
        createdAt: userData.createdAt || now,
        updatedAt: userData.updatedAt || now,
        isActive: userData.isActive ?? true,
        lastLogin: userData.lastLogin,
        preferences: userData.preferences || {},
        secret: userData.secret,
        };
    }
    /**
     * Convert UserEntity to public version
     */
    static toPublicUserEntity(user: UserEntity | SecureUserEntity): PublicUserEntity {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isActive: user.isActive,
        };
    }
}



// Example of creating a complete user entity
const completeUserEntity = UserEntityFactory.createCompleteUserEntity({
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  password: await UserSecurity.hashPassword("secure-password"),
  role: "user",
  
  // AppEntity properties
  appId: "my-app-id",
  appName: "My Application",
  version: "1.0.0",
  environment: "production",
  status: "active",
  
  // Optional properties
  avatar: "https://example.com/avatar.jpg",
  preferences: { theme: "dark", notifications: true },
});

// Example of creating a secure user entity (for display)
const secureUserEntity = UserEntityFactory.createSecureUserEntity({
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  
  // AppEntity properties
  appId: "my-app-id",
  appName: "My Application",
  version: "1.0.0",
  environment: "production",
  status: "active",
  
  // Optional
  avatar: "https://example.com/avatar.jpg",
});

// Use in your EntityConverter example
const userEntity: UserEntity = { 
  id: userId || "default-id",
  name: "User Name",
  password: await UserSecurity.hashPassword("password"),
  role: "user",
  username: "user123",
  email: "user123@example.com", 
  teams: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  
  // AppEntity properties
  appId: 'your-app-id',
  appName: 'Your Application',
  version: '1.0.0',
  environment: 'development',
  status: 'active',
};