// userSecurity.ts
import bcrypt from 'bcrypt';
import type { UserEntity } from '@/core/typings/entities/UserEntity';

export class UserSecurity {
  private static readonly SALT_ROUNDS = 12;
  
  /**
   * Hash a password (never store plain text passwords!)
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Sanitize user data for logging (remove sensitive info)
   */
  static sanitizeForLogging(user: Partial<UserEntity>): Record<string, any> {
    const { password, secret, ...sanitized } = user;
    return {
      ...sanitized,
      password: '[REDACTED]',
      secret: '[REDACTED]',
    };
  }
  
  /**
   * Validate user data before saving
   */
  static validateUserData(user: Partial<UserEntity>): string[] {
    const errors: string[] = [];
    
    if (user.password && user.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (user.email && !user.email.includes('@')) {
      errors.push('Invalid email format');
    }
    
    // Add more validation as needed
    
    return errors;
  }
}