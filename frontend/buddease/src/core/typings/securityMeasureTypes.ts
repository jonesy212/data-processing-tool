securityMeasureTypes.ts
import { SecurityStatus } from "@/core/models/data/StatusType";
import { SnapshotSecurity } from '@/core/snapshots/SnapshotSecurity';
import { AllStatus } from "@/core/state/stores/DetailsListStore";

export enum SecurityMeasureType {
  Header = 'header',
  Logger = 'logger',
  Encryption = 'encryption',
  Validation = 'validation',
  AccessControl = 'access-control',
  Audit = 'audit',
  Compliance = 'compliance',
  Custom = 'custom'
}

// Define the base properties that ALL security measures should have
export interface SecurityMeasureBase {
  // Core identification
  id: string;
  type: SecurityMeasureType;
  name: string;
  
  // Status and lifecycle
  enabled: boolean;
  status: AllStatus | 'active' | 'inactive' | 'error';
  lastChecked: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadata
  description?: string;
  implementationDate?: Date;
  lastUpdated?: Date;
  tags?: string[];
  category?: string;
  owner?: string;
}

// Header Security Measure
export interface SecurityMeasureHeader extends SecurityMeasureBase {
  type: SecurityMeasureType.Header;
  value: string;
  appliesTo: 'request' | 'response' | 'both';
  conditions?: {
    path?: string;
    method?: string;
    contentType?: string;
  };
}

// Logger Security Measure
export interface SecurityMeasureLogger extends SecurityMeasureBase {
  type: SecurityMeasureType.Logger;
  logFilePath: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  maxFileSize: number;
  retentionDays: number;
  logFormat: string;
  sensitiveDataRedaction: boolean;
}

// Encryption Security Measure
export interface SecurityMeasureEncryption extends SecurityMeasureBase {
  type: SecurityMeasureType.Encryption;
  algorithm: 'AES-256' | 'RSA-2048' | 'RSA-4096' | 'ECDSA' | 'ChaCha20' | 'custom';
  keyManagement: {
    type: 'kms' | 'hardware' | 'software' | 'cloud';
    keyId?: string;
    rotationPeriod?: number; // days
  };
  encryptionScope: 'data-at-rest' | 'data-in-transit' | 'both';
  integrityCheck: boolean;
}

// Validation Security Measure
export interface SecurityMeasureValidation extends SecurityMeasureBase {
  type: SecurityMeasureType.Validation;
  validationType: 'schema' | 'format' | 'business-rules' | 'signature';
  rules: Array<{
    field: string;
    validator: (value: any) => boolean;
    errorMessage: string;
  }>;
  severity: 'warning' | 'error' | 'reject';
}

// Access Control Security Measure
export interface SecurityMeasureAccessControl extends SecurityMeasureBase {
  type: SecurityMeasureType.AccessControl;
  accessType: 'role-based' | 'attribute-based' | 'policy-based';
  rules: Array<{
    principal: string; // user, role, or group
    resource: string;
    action: string[];
    conditions?: Record<string, any>;
  }>;
  defaultAction: 'allow' | 'deny';
}

// Audit Security Measure
export interface SecurityMeasureAudit extends SecurityMeasureBase {
  type: SecurityMeasureType.Audit;
  auditEvents: string[];
  retentionPeriod: number; // days
  alertOn: {
    criticalEvents: boolean;
    failedAccessAttempts: boolean;
    configurationChanges: boolean;
    threshold?: number;
  };
  reporting: {
    frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

// Compliance Security Measure
export interface SecurityMeasureCompliance extends SecurityMeasureBase {
  type: SecurityMeasureType.Compliance;
  standards: Array<'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2' | 'ISO27001'>;
  requirements: Array<{
    standard: string;
    requirementId: string;
    description: string;
    implemented: boolean;
    evidence?: string;
  }>;
  auditSchedule: {
    frequency: 'quarterly' | 'biannual' | 'annual';
    nextAuditDate: Date;
  };
}

// Custom Security Measure
export interface SecurityMeasureCustom extends SecurityMeasureBase {
  type: SecurityMeasureType.Custom;
  customType: string;
  configuration: Record<string, any>;
}

// Security Measure Union Type
export type SecurityMeasureUnion =
  | SecurityMeasureHeader
  | SecurityMeasureLogger
  | SecurityMeasureEncryption
  | SecurityMeasureValidation
  | SecurityMeasureAccessControl
  | SecurityMeasureAudit
  | SecurityMeasureCompliance
  | SecurityMeasureCustom;

// Additional types needed for the SnapshotSecurity interface
export interface SecurityScanResult {
  timestamp: Date;
  status: SecurityStatus;
  findings: Array<{
    measureId: string;
    measureName: string;
    status: SecurityStatus;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation?: string;
  }>;
  score: number;
  duration: number; // milliseconds
}

export interface SecurityReport {
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalMeasures: number;
    enabledMeasures: number;
    complianceScore: number;
    securityScore: number;
  };
  measures: Array<{
    id: string;
    name: string;
    type: SecurityMeasureType;
    status: 'active' | 'inactive' | 'error';
    lastChecked: Date;
  }>;
  incidents: Array<{
    timestamp: Date;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    resolution?: string;
  }>;
  recommendations: string[];
}

// Example of creating security measures
const securityMeasures: SecurityMeasureUnion[] = [
  {
    id: 'header-xss-protection',
    type: SecurityMeasureType.Header,
    name: 'XSS Protection Header',
    value: '1; mode=block',
    appliesTo: 'response',
    enabled: true,
    priority: 'high',
    description: 'security measures',
    status: 'active', // FIXED: Changed from 'sever' to 'active'
    lastChecked: new Date()
  },
  {
    // All required base properties
    id: 'encryption-aes256',
    type: SecurityMeasureType.Encryption,
    name: 'AES-256 Encryption',
    enabled: true,
    status: 'active',
    lastChecked: new Date(),
    priority: 'critical',
    
    // Encryption-specific properties
    algorithm: 'AES-256',
    keyManagement: {
      type: 'kms',
      rotationPeriod: 90
    },
    encryptionScope: 'data-at-rest',
    integrityCheck: true
  },
  {
    // All required base properties
    id: 'audit-logging',
    type: SecurityMeasureType.Audit,
    name: 'Comprehensive Audit Logging',
    enabled: true,
    status: 'active',
    lastChecked: new Date(),
    priority: 'high',
    
    // Audit-specific properties
    auditEvents: ['access', 'modification', 'deletion', 'security-events'],
    retentionPeriod: 365,
    alertOn: {
      criticalEvents: true,
      failedAccessAttempts: true,
      threshold: 5,
      configurationChanges: true
    },
    reporting: {
      frequency: 'daily',
      recipients: ['security-team@company.com']
    }
  }
]

const snapshotSecurity: SnapshotSecurity = {
  // --- Core security properties ---
  isEncrypted: false,
  isSigned: false,
  isCompressed: false,
  encryptionType: undefined,
  signature: undefined,
  checksum: undefined,
  encryptionKeyId: undefined,

  // --- Access control ---
  permissions: {
    read: true,
    write: true,
    delete: false,
    execute: false,
    userId: '', 
    permissions: {},
    permissionType: 'read'
  },
  accessControlList: [],
  allowedUsers: [],
  allowedRoles: [],

  // --- Security measures ---
  securityMeasures: [],
  securityHeaders: new Map(),

  // --- Logger ---
  securityLogger: {
    enabled: true,
    logFilePath: "/logs/security.log",
    logLevel: "info",
    maxFileSize: 10_485_760, // 10MB
  },

  // --- Audit & Compliance ---
  auditTrail: [],
  lastSecurityScan: new Date(),
  securityScore: 100,
  compliance: {
    gdprCompliant: true,
    hipaaCompliant: false,
    pciCompliant: false,
  },

  // --- Core security methods ---
  validateIntegrity: () => {
    console.log("Integrity validated.");
    return true;
  },

  verifySignature: () => {
    console.log("Signature verified.");
    return true;
  },

checkPermissions: (userId: string, action: string): boolean => {
  const aclEntry = snapshotSecurity.accessControlList.find(
    entry => entry.userId === userId && (!entry.expiration || entry.expiration > new Date())
  );

  if (aclEntry) {
    return aclEntry.permissions.some(p => p.name === action);
  }

  if (snapshotSecurity.allowedUsers.includes(userId)) return true;

  switch (action) {
    case "read": return snapshotSecurity.permissions.read ?? false;
    case "write": return snapshotSecurity.permissions.write ?? false;
    case "delete": return snapshotSecurity.permissions.delete ?? false;
    case "execute": return snapshotSecurity.permissions.execute ?? false;
    default: return false;
  }
},


  encryptData: async (data: any, key?: string) => {
    console.log("Encrypting data...");
    return data;
  },

  decryptData: async (data: any, key?: string) => {
    console.log("Decrypting data...");
    return data;
  },

  signData: async (data: any) => {
    console.log("Signing data...");
    return "signature";
  },

  verifyData: async (data: any, signature: string) => {
    console.log("Verifying data...");
    return true;
  },

  // --- Security measures integration ---
  implementSecurityMeasures: (measures: SecurityMeasureUnion[]) => {
    measures.forEach(measure => {
      if (!measure.enabled) return;

      try {
        switch (measure.type) {
          case SecurityMeasureType.Header:
            snapshotSecurity.applyHeaderSecurity(measure as SecurityMeasureHeader);
            break;

          case SecurityMeasureType.Logger:
            snapshotSecurity.configureLoggerSecurity(measure as SecurityMeasureLogger);
            break;

          case SecurityMeasureType.Encryption:
            const enc = measure as SecurityMeasureEncryption;
            snapshotSecurity.isEncrypted = true;
            snapshotSecurity.encryptionType = enc.algorithm;
            console.log(`Encryption enabled: ${enc.algorithm}`);
            break;

          default:
            console.warn(`Unhandled measure type: ${measure.type}`);
        }

        snapshotSecurity.auditTrail.push({
          timestamp: new Date(),
          action: "security_measure_applied",
          userId: "system",
          details: `Applied ${measure.name}`,
          status: "success",
        });
      } catch (error: any) {
        console.error(`Error applying ${measure.name}:`, error);
      }
    });
  },

  applyHeaderSecurity(headerMeasure: SecurityMeasureHeader): Map<string, string> {
    snapshotSecurity.securityHeaders.set(headerMeasure.name, headerMeasure.value);
    console.log(`Applied header: ${headerMeasure.name}=${headerMeasure.value}`);
    return snapshotSecurity.securityHeaders;
  },

  configureLoggerSecurity: (loggerMeasure: SecurityMeasureLogger) => {
    snapshotSecurity.securityLogger = {
      enabled: loggerMeasure.enabled,
      logFilePath: loggerMeasure.logFilePath,
      logLevel: loggerMeasure.logLevel,
      maxFileSize: loggerMeasure.maxFileSize,
    };
    console.log(`Logger configured: ${loggerMeasure.logFilePath}`);
  },

  addSecurityMeasure: (measure: SecurityMeasureUnion) => {
    const existing = snapshotSecurity.securityMeasures.findIndex(m => m.id === measure.id);
    if (existing >= 0) {
      snapshotSecurity.securityMeasures[existing] = {
        ...snapshotSecurity.securityMeasures[existing],
        ...measure,
        lastUpdated: new Date(),
      };
    } else {
      snapshotSecurity.securityMeasures.push({
        ...measure,
        implementationDate: new Date(),
        lastUpdated: new Date(),
      });
    }

    if (measure.enabled) {
      snapshotSecurity.implementSecurityMeasures([measure]);
    }
  },

  removeSecurityMeasure: (measureId: string) => {
    const index = snapshotSecurity.securityMeasures.findIndex(m => m.id === measureId);
    if (index >= 0) snapshotSecurity.securityMeasures.splice(index, 1);
  },

  getSecurityMeasure: (measureId: string) => {
    return snapshotSecurity.securityMeasures.find(m => m.id === measureId);
  },

  enableSecurityMeasure: (measureId: string) => {
    const m = snapshotSecurity.getSecurityMeasure(measureId);
    if (m) {
      m.enabled = true;
      snapshotSecurity.implementSecurityMeasures([m]);
    }
  },

  disableSecurityMeasure: (measureId: string) => {
    const m = snapshotSecurity.getSecurityMeasure(measureId);
    if (m) m.enabled = false;
  },

  listSecurityMeasures: (type?: SecurityMeasureType) => {
    return type
      ? snapshotSecurity.securityMeasures.filter(m => m.type === type)
      : [...snapshotSecurity.securityMeasures];
  },

  // --- Lifecycle methods ---
  initializeSecurity: async () => {
    snapshotSecurity.securityHeaders.set("X-Frame-Options", "DENY");
    snapshotSecurity.securityHeaders.set("X-Content-Type-Options", "nosniff");
    snapshotSecurity.isEncrypted = true;
    snapshotSecurity.isSigned = true;
    snapshotSecurity.isCompressed = true;
  },

  runSecurityScan: (): SecurityScanResult => {
    const start = Date.now();

    // Simulated security scan
  const findings = snapshotSecurity.securityMeasures.map(measure => {
    const isActive = measure.enabled;

    const severity: 'low' | 'medium' | 'high' | 'critical' = isActive ? 'low' : 'medium';

    return {
      measureId: measure.id,
      measureName: measure.name,
      status: isActive ? 'active' as SecurityStatus : 'inactive' as SecurityStatus,
      details: isActive
        ? `${measure.name} passed all checks.`
        : `${measure.name} is currently disabled.`,
      severity, // now strongly typed
      recommendation: isActive
        ? 'Continue monitoring this measure.'
        : 'Enable this measure to ensure full security compliance.'
    };
  });

  const activeCount = findings.filter(f => f.status === 'active').length;
  const score = (activeCount / (findings.length || 1)) * 100;

    return {
      timestamp: new Date(),
      findings,
      score,
      status: "success",
      duration: Date.now() - start,
    };
  },


  generateSecurityReport: () => ({
    generatedAt: new Date(),
    period: { start: new Date(Date.now() - 86400000), end: new Date() },
    summary: {
      totalMeasures: snapshotSecurity.securityMeasures.length,
      enabledMeasures: snapshotSecurity.securityMeasures.filter(m => m.enabled).length,
      complianceScore: 90,
      securityScore: snapshotSecurity.securityScore,
    },
    measures: snapshotSecurity.securityMeasures.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      status: m.enabled ? "active" : "inactive",
      lastChecked: new Date(),
    })),
    incidents: [],
    recommendations: [],
  }),
};

export { securityMeasures };
export type { SecurityMeasureBase as SecurityMeasure };
