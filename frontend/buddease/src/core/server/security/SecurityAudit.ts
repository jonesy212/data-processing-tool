// SecurityAudit.ts
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { useSecurityAudit } from '@/core/hooks/useSecurityAudit';
import SecureFieldManager from "./SecureFieldManager";


class SecurityAudit<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  private config: { userRoles: string[]; adminRole: string };

  constructor(config = { userRoles: ["user", "manager"], adminRole: "admin" }) {
    this.config = config;
  }

  /**
   * Sanitize the provided metadata.
   */
  sanitizeMetadata(
    metadata: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    userRole: string,
    isAdmin: boolean
  ): Partial<Meta> {
    const { sanitizeMetadata } = useSecurityAudit();
    return sanitizeMetadata(metadata); // leverage external sanitize logic
  }

  /**
   * Conduct a security audit of the state and return findings.
   */
  conductAudit(state: Meta): string[] {
    const findings: string[] = [];
    if (state.metadataEntries) {
      Object.keys(state.metadataEntries).forEach((key) => {
        const entry = state.metadataEntries[key];
        if (entry && (entry as any).isSensitive) {
          findings.push(`Sensitive field detected: ${key}`);
        }
      });
    }
    return findings;
  }

  /**
   * Sanitize the metadata based on user role and admin privileges.
   */
  sanitizeState(
    state: Meta,
    userRole: string,
    isAdmin: boolean
  ): Meta {
    const sanitizedMetadata = { ...state };

    if (!isAdmin && state.metadataEntries) {
      Object.keys(state.metadataEntries).forEach((key) => {
        const metadataEntry = state.metadataEntries[key];

        // Mask or remove sensitive information for non-admin users
        if (userRole !== this.config.adminRole) {
          metadataEntry.description = "Access restricted";
          metadataEntry.keywords = [];
          metadataEntry.authors = [];
        }
      });
    }

    return sanitizedMetadata;
  }

  /**
   * Review and display audit findings.
   */
  reviewFindings(findings: string[]): void {
    if (findings.length === 0) {
      console.log("No sensitive data issues detected.");
    } else {
      console.log("Audit Findings:");
      findings.forEach((finding, idx) => console.log(`${idx + 1}. ${finding}`));
      console.log("Recommendations:");
      console.log("- Ensure sensitive fields are sanitized.");
      console.log("- Limit access based on roles.");
      console.log("- Regularly review security policies.");
    }
  }
}

export default SecurityAudit;




// Usage Example
// Here's how you can create and audit a state using both SecureFieldManager and SecurityAudit.

typescript
// Copy code


// Example state with sensitive fields
const state = {
  id: SecureFieldManager.createField("12345", false),
  apiKey: SecureFieldManager.createField("secret-api-key", true, false),
  createdBy: SecureFieldManager.createField("admin", true, true),
  config: SecureFieldManager.createField({ retries: 3 }, true),
  baseUrl: SecureFieldManager.createField("https://example.com", true),
};

// Security Audit Instance
const audit = new SecurityAudit();
const findings = audit.conductAudit(state);
audit.reviewFindings(findings);

// Sanitizing state for a user with limited permissions

// Sanitizing state for a user with limited permissions
const sanitizedState = SecureFieldManager.sanitizeMetadata(state, "user", false);
console.log("Sanitized State:", sanitizedState);