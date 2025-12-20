// SecureFieldManager.ts
import SecurityAudit from "@/app/server/security/SecurityAudit";
import { SecureMetadata, SecureField } from "@/app/server/security/SecureField";
import crypto from 'crypto';

class SecureFieldManager {
   #apiKey: string;
    #fields: Map<string, SecureField<any>> = new Map();
    #allowUserAccess: boolean = true;
    #encryptionKey: Buffer;
    #algorithm: string = 'aes-256-gcm';

    constructor(apiKey: string, encryptionKey: string) {
        this.#apiKey = apiKey;
        this.#encryptionKey = crypto.scryptSync(encryptionKey, 'salt', 32);
    }

    
  encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.#algorithm, this.#encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for GCM mode
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString('base64'); // FIXED: Removed extra bracket and parenthesis
  }

  decrypt(encryptedData: string): string {
    const data = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    
    const decipher = crypto.createDecipheriv(this.#algorithm, this.#encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }


  /**
   * Set the field as sensitive and apply necessary configurations.
   * @param isSensitive - Whether the field should be marked as sensitive.
   * @param allowUserAccess - Whether the user can access the field (default is true).
   * @param allowedRoles - The roles that can access this field (optional).
   * @param canView - Whether the field is viewable (default is true).
   */
    setSensitive(isSensitive: boolean, allowUserAccess = true, allowedRoles: string[] = [], canView = true): this {
        const field = SecureFieldManager.createField(this.#apiKey, isSensitive, allowUserAccess, allowedRoles, canView);
        this.#fields.set('apiKey', field);
        return this;
    }

    setUserAccess(allow: boolean): this {
        this.#allowUserAccess = allow;
        return this;
    }

  /**
   * Static method to create a SecureField.
   * @param value - The value to be wrapped.
   * @param isSensitive - Whether the field is sensitive.
   * @param allowUserAccess - Whether the field is accessible to the user.
   * @param allowedRoles - The roles that can access the field.
   * @param canView - Whether the field can be viewed.
   */

    static createField<T>(value: T, isSensitive: boolean, allowUserAccess = true, allowedRoles: string[] = [], canView: boolean = true): SecureField<T> {
      return { value, isSensitive, allowUserAccess, allowedRoles, canView };
    }


  /**
   * Sanitize sensitive fields in the state based on user role and permissions.
   * @param state - The state object to sanitize.
   * @param userRole - The role of the user accessing the state.
   * @param isAdmin - Whether the user has admin privileges.
   * @returns The sanitized state object.
   */
    static sanitizeState(state: any, userRole: string, isAdmin: boolean): any {
        return Object.keys(state).reduce<Record<string, any>>((sanitized, key) => {
            const field = state[key];
            if (field && field.isSensitive) {
                if (field.allowUserAccess || isAdmin || field.allowedRoles?.includes(userRole)) {
                    sanitized[key] = field.value;
                } else {
                    sanitized[key] = "REDACTED";
                }
            } else {
                sanitized[key] = field;
            }
            return sanitized;
        }, {});
    }


  /**
   * Sanitize a single secure field based on user role and permissions.
   * @param field - The secure field to sanitize.
   * @param userRole - The role of the user accessing the field.
   * @param isAdmin - Whether the user has admin privileges.
   * @returns Sanitized value or "REDACTED".
   */
  static sanitizeField<T>(field: SecureField<T>, userRole: string, isAdmin: boolean): T | "REDACTED" {
    if (isAdmin || field.allowUserAccess || field.allowedRoles?.includes(userRole)) {
      return field.value;
    }
    return "REDACTED";
  }


  /**
   * Sanitize all secure fields in the given SecureMetadata object.
   * @param metadata - The SecureMetadata object containing secure fields.
   * @param userRole - The role of the user accessing the fields.
   * @param isAdmin - Whether the user has admin privileges.
   * @returns Sanitized metadata object.
   */
  static sanitizeMetadata(metadata: SecureMetadata, userRole: string, isAdmin: boolean): Record<string, any> {
      return Object.keys(metadata).reduce<Record<string, any>>((sanitized, key) => {
          const field = metadata[key];
          sanitized[key] = this.sanitizeField(field, userRole, isAdmin);
          return sanitized;
      }, {});
  }

  /**
   * Create a SecureField and add it to the SecureMetadata.
   * @param metadata - The SecureMetadata object to add the field to.
   * @param key - The key under which the field should be added.
   * @param value - The value of the secure field.
   * @param isSensitive - Whether the field is sensitive.
   */
  static addField<T>(
      metadata: SecureMetadata,
      key: string,
      value: T,
      isSensitive: boolean,
      allowUserAccess = true,
      allowedRoles: string[] = [],
      canView: boolean = true
  ): void {
      metadata[key] = { value, isSensitive, allowUserAccess, allowedRoles, canView };
  }

  /**
   * Retrieve a secure field from metadata if the user has permission.
   * @param metadata - The SecureMetadata object.
   * @param key - The key of the field to retrieve.
   * @param userRole - The role of the user accessing the field.
   * @param isAdmin - Whether the user has admin privileges.
   * @returns The field value or "REDACTED".
   */
  static getField<T>(metadata: SecureMetadata, key: string, userRole: string, isAdmin: boolean): T | "REDACTED" {
      const field = metadata[key];
      return this.sanitizeField(field, userRole, isAdmin);
  }

}


export default SecureFieldManager;


// Example SecureMetadata object with sensitive fields
const secureMetadata: SecureMetadata = {
    id: {
        value: "12345", isSensitive: false,
        allowUserAccess: true,
        allowedRoles: [],
        canView: true
    },
    apiKey: {
        value: "secret-api-key", isSensitive: true,
        allowUserAccess: false,
        allowedRoles: ['admin'],
        canView: false
    },
    createdBy: {
        value: "admin", isSensitive: true,
        allowUserAccess: false,
        allowedRoles: ['admin'],
        canView: false
    },
};

// Add a new field to metadata
SecureFieldManager.addField(secureMetadata, "config", { retries: 3 }, true);

// Security Audit Instance
const audit = new SecurityAudit();
const findings = audit.conductAudit(secureMetadata);
audit.reviewFindings(findings);

// Sanitize metadata for a user with limited permissions
const sanitizedMetadata = SecureFieldManager.sanitizeMetadata(secureMetadata, "user", false);
console.log("Sanitized Metadata:", sanitizedMetadata);