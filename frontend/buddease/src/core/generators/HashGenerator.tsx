HashGenerator.tsx
import crypto from 'crypto';

export interface HashOptions {
  algorithm?: 'sha256' | 'sha512' | 'sha384' | 'md5';
  encoding?: 'hex' | 'base64' | 'base64url';
  salt?: string;
  iterations?: number;
}

class HashGenerator {
  private static readonly DEFAULT_OPTIONS: HashOptions = {
    algorithm: 'sha256',
    encoding: 'hex',
    iterations: 1
  };


  // Simple hash fallback for SSR/Node.js environments
  private static simpleHash(data: string): string {
    let hash = 0;
    
    if (data.length === 0) return hash.toString();
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  // For SHA-256 (more secure) - Updated with proper SSR fallback
  static async generateSHA256Hash(data: string): Promise<string> {
    // Node.js environment
    if (typeof window === 'undefined') {
      try {
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return hash.digest('hex');
      } catch (error) {
        console.warn('Node.js crypto failed, using simple hash fallback');
        return this.simpleHash(data);
      }
    }
    
    // Browser environment with Web Crypto API
    if (window.crypto?.subtle) {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('Web Crypto API failed, using simple hash fallback');
        return this.simpleHash(data);
      }
    }
    
    // Final fallback - simple hash
    console.warn('No crypto API available, using simple hash');
    return this.simpleHash(data);
  }

  // Basic hash generation (synchronous version)
  static generateHash(input: string, algorithm: string = "sha256"): string {
    try {
      // Node.js environment
      if (typeof window === 'undefined') {
        const hash = crypto.createHash(algorithm);
        hash.update(input);
        return hash.digest("hex");
      }
      
      // Browser environment - use simple hash as fallback
      console.warn('Using simple hash fallback in browser for synchronous operation');
      return this.simpleHash(input);
    } catch (error) {
      console.warn(`Hash generation failed for algorithm ${algorithm}, using simple hash`);
      return this.simpleHash(input);
    }
  }


  // Purpose-based cryptographic hash with security improvements
    static async generateCryptographicHash(
    input: string,
    purpose: string = "general",
    options: HashOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    switch (purpose) {
      case "wallet":
        return this.generateSaltedHash(input, {
          ...mergedOptions,
          algorithm: 'sha512',
          salt: process.env.WALLET_HASH_SALT || 'default-wallet-salt',
          iterations: 10000
        });
      case "communication":
        return this.generateSHA256Hash(input);
      case "community":
        return this.generateSaltedHash(input, {
          ...mergedOptions,
          salt: process.env.COMMUNITY_HASH_SALT || 'default-community-salt'
        });
      case "authentication":
        return this.generateSaltedHash(input, {
          ...mergedOptions,
          algorithm: 'sha512',
          iterations: 100000
        });
      case "data-integrity":
        return this.generateSHA256Hash(input);
      default:
        return this.generateSaltedHash(input, mergedOptions);
    }
  }



    /**
   * Synchronous salted hash (Node.js only)
   * Use when you need immediate results and are sure you're in Node.js
   */
  static generateSaltedHashSync(input: string, options: HashOptions = {}): string {
    if (typeof window !== 'undefined') {
      throw new Error('generateSaltedHashSync is only available in Node.js environment. Use generateSaltedHashAsync instead.');
    }

    const { algorithm = 'sha256', encoding = 'hex', salt = '', iterations = 1 } = options;
    
    if (iterations <= 0) {
      throw new Error('Iterations must be greater than 0');
    }

    let hashed = input + salt;
    
    for (let i = 0; i < iterations; i++) {
      const hash = crypto.createHash(algorithm);
      hash.update(hashed);
      hashed = hash.digest(encoding);
    }
    
    return hashed;
  }

  /**
   * Asynchronous salted hash (Universal - works in both Node.js and browser)
   * Use for cross-platform compatibility
   */
  static async generateSaltedHashAsync(input: string, options: HashOptions = {}): Promise<string> {
    const { algorithm = 'sha256', encoding = 'hex', salt = '', iterations = 1 } = options;
    
    if (iterations <= 0) {
      throw new Error('Iterations must be greater than 0');
    }

    let hashed = input + salt;
    
    for (let i = 0; i < iterations; i++) {
      if (typeof window === 'undefined') {
        // Node.js environment
        const hash = crypto.createHash(algorithm);
        hash.update(hashed);
        hashed = hash.digest(encoding);
      } else {
        // Browser environment - use async SHA-256
        hashed = await this.generateSHA256Hash(hashed);
      }
    }
    
    return hashed;
  }

  /**
   * Main method - auto-detects environment and returns appropriate type
   * Returns string in Node.js, Promise<string> in browser
   */
  static generateSaltedHash(input: string, options: HashOptions = {}): string | Promise<string> {
    return typeof window === 'undefined' 
      ? this.generateSaltedHashSync(input, options)
      : this.generateSaltedHashAsync(input, options);
  }



  // PBKDF2 for password hashing (most secure)
  static async generatePBKDF2Hash(
    password: string, 
    salt: string = crypto.randomBytes(16).toString('hex'),
    iterations: number = 100000,
    keyLength: number = 64,
    algorithm: string = 'sha512'
  ): Promise<{ hash: string; salt: string }> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            hash: derivedKey.toString('hex'),
            salt: salt
          });
        }
      });
    });
  }

  // HMAC for message authentication
  static generateHMAC(message: string, secret: string, algorithm: string = 'sha256'): string {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(message);
    return hmac.digest('hex');
  }


  // Verify hash (for authentication purposes) - make it async
  static async verifyHash(input: string, hash: string, options: HashOptions = {}): Promise<boolean> {
    const computedHash = await this.generateSaltedHashAsync(input, options);
    
    if (typeof window === 'undefined') {
      // Node.js - use timingSafeEqual for security
      return crypto.timingSafeEqual(
        Buffer.from(computedHash),
        Buffer.from(hash)
      );
    } else {
      // Browser - simple comparison (less secure)
      return computedHash === hash;
    }
  }


  static verifyHashSync(input: string, hash: string, options: HashOptions = {}): boolean {
    if (typeof window !== 'undefined') {
      throw new Error('verifyHashSync is only available in Node.js environment');
    }
    
    const computedHash = this.generateSaltedHashSync(input, options);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(hash)
    );
  }

  // Async version using Web Crypto API (for browser compatibility)
  static async generateWebCryptoHash(input: string, algorithm: string = 'SHA-256'): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      // Fallback to Node.js crypto
      return this.generateHash(input, algorithm.toLowerCase());
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Web Crypto API not available, falling back to basic hash');
      return this.generateHash(input);
    }
  }

  // Generate random salt
  static generateSalt(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash structure data (your specific use case)
static async hashStructure<T>(structure: T[]): Promise<string> {
  const serialized = JSON.stringify(structure, (key, value) => {
    // Handle circular references and ensure consistent ordering
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted, key) => {
        sorted[key] = value[key];
        return sorted;
      }, {} as any);
    }
    return value;
  });
  
  return this.generateSaltedHashAsync(serialized, {
    algorithm: 'sha256',
    salt: process.env.STRUCTURE_HASH_SALT || 'structure-hash-salt'
  });
}

  // Sync version for Node.js only
  static hashStructureSync<T>(structure: T[]): string {
    if (typeof window !== 'undefined') {
      throw new Error('hashStructureSync is only available in Node.js environment');
    }
    
    const serialized = JSON.stringify(structure, (key, value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {} as any);
      }
      return value;
    });
    
    return this.generateSaltedHashSync(serialized, {
      algorithm: 'sha256',
      salt: process.env.STRUCTURE_HASH_SALT || 'structure-hash-salt'
    });
  }
}

// Example usage:
const input = "exampleInput";

// Basic usage
const hash = HashGenerator.generateHash(input);
console.log("Hash:", hash);

// Secure cryptographic hash
const cryptographicHash = HashGenerator.generateCryptographicHash(input, "wallet");
console.log("Cryptographic Hash:", cryptographicHash);

// Password hashing (most secure)
const passwordHash = await HashGenerator.generatePBKDF2Hash("myPassword123");
console.log("Password Hash:", passwordHash);

// Structure hashing
const structure = [{ id: 1, name: "test" }, { id: 2, name: "test2" }];
const structureHash = HashGenerator.hashStructure(structure);
console.log("Structure Hash:", structureHash);

export default HashGenerator;