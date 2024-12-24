import SecurityAudit from '@/app/components/security/SecurityAudit';
import { SecureMetadata, SecureField } from "./SecureField";

class SecureFieldManager {
    #apiKey: string;
    #fields: Map<string, SecureField<any>> = new Map();
  
  /**
  * Wraps a value with sensitive field metadata.
  * @param value - The value to wrap.
  * @param isSensitive - Whether the field is sensitive.
  */
  static createField<T>(value: T, isSensitive: boolean, allowUserAccess = true, allowedRoles: string[] = [], canView: boolean = true): SecureField<T> {
    return { value, isSensitive, allowUserAccess, allowedRoles, canView };
  }


  constructor(apiKey: string) {
    this.#apiKey = apiKey
  }

  /**
   * Set the field as sensitive and apply necessary configurations.
   * @param isSensitive - Whether the field should be marked as sensitive.
   * @param allowUserAccess - Whether the user can access the field (default is true).
   * @param allowedRoles - The roles that can access this field (optional).
   * @param canView - Whether the field is viewable (default is true).
   */
  setSensitive(isSensitive: boolean, allowUserAccess = true, allowedRoles: string[] = [], canView = true): this {
    // Create the field with the sensitive metadata
    const field = SecureFieldManager.createField(this.#apiKey, isSensitive, allowUserAccess, allowedRoles, canView);
    
    // Store the field in the internal fields map (you can customize this for each field)
    this.#fields.set('apiKey', field);  // Example for apiKey field, use different key as needed

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
   * Sanitize sensitive fields in the state based on user role and permissions.
   * @param state - The state object to sanitize.
   * @param userRole - The role of the user accessing the state.
   * @param isAdmin - Whether the user has admin privileges.
   * @returns The sanitized state object.
   */
  sanitizeState(state: any, userRole: string, isAdmin: boolean): any {
      return Object.keys(state).reduce<Record<string, any>>((sanitized, key) => {
          const field = state[key];
          if (field && field.isSensitive) {
              if (
                  field.allowUserAccess ||
                  isAdmin ||
                  field.allowedRoles?.includes(userRole)
              ) {
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


export default SecureFieldManager


// Example SecureMetadata object with sensitive fields
const secureMetadata: SecureMetadata = {
    id: {
        value: "12345", isSensitive: false,
        canView: false
    },
    apiKey: {
        value: "secret-api-key", isSensitive: true,
        canView: false
    },
    createdBy: {
        value: "admin", isSensitive: true,
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
const sanitizedMetadata = audit.sanitizeMetadata(secureMetadata, "user", false);
console.log("Sanitized Metadata:", sanitizedMetadata);
