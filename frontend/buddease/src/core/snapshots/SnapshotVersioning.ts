// SnapshotVersioning.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Version } from '@/core/versions/Version';
import { VersionData } from '@/core/versions/VersionData';

/**
 * SnapshotVersioning interface for comprehensive version management in snapshots
 */
export interface SnapshotVersioning<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedVersioning {
  // Core version information
  id: string | number;
  versionNumber: string;
  versionString: string;
  versionHash: string;
  
  // Version metadata
  description?: string;
  changeLog: string[];
  tags: string[];
  categories: string[];
  
  // Version relationships
  parentVersionId?: string | number;
  rootVersionId?: string | number;
  previousVersion?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  nextVersion?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  relatedVersions: Array<{
    id: string | number;
    versionNumber: string;
    relationship: 'branch' | 'merge' | 'rebase' | 'patch' | 'fork';
    timestamp: Date;
  }>;
  
  // Version history tracking
  versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  releaseHistory: Array<{
    version: string;
    releaseDate: Date;
    releaseType: 'major' | 'minor' | 'patch' | 'hotfix';
    releaseNotes: string;
    releasedBy: string;
  }>;
  
  // Branch management (for git-like workflows)
  branchInfo?: {
    branchName: string;
    branchType: 'main' | 'develop' | 'feature' | 'release' | 'hotfix';
    isDefaultBranch: boolean;
    lastCommit: string;
    branchCreatedAt: Date;
    lastMerge?: {
      fromBranch: string;
      mergedAt: Date;
      mergedBy: string;
    };
  };
  
  // Version state
  isLatest: boolean;
  isStable: boolean;
  isPrerelease: boolean;
  isBeta: boolean;
  isAlpha: boolean;
  isReleaseCandidate: boolean;
  isArchived: boolean;
  
  // Version lifecycle dates
  createdAt: Date;
  publishedAt?: Date;
  deprecatedAt?: Date;
  archivedAt?: Date;
  sunsetDate?: Date;
  
  // Author information
  author?: string;
  authoredBy?: string;
  reviewedBy?: string[];
  approvedBy?: string[];
  
  // Dependencies and compatibility
  dependencies?: {
    [dependencyName: string]: {
      version: string;
      type: 'required' | 'optional' | 'dev' | 'peer';
      compatibility: 'compatible' | 'incompatible' | 'unknown';
    };
  };
  compatibilityMatrix: {
    [component: string]: {
      minVersion: string;
      maxVersion: string;
      recommendedVersion: string;
    };
  };
  
  // Quality metrics
  qualityMetrics?: {
    testCoverage: number;
    bugCount: number;
    performanceScore: number;
    securityScore: number;
    documentationCoverage: number;
    lastQualityScan: Date;
  };
  
  // Rollback and recovery information
  rollbackInfo?: {
    canRollbackTo: Array<{
      versionId: string | number;
      versionNumber: string;
      rollbackReason: string;
      rollbackSteps: string[];
    }>;
    lastSuccessfulVersion?: string;
    rollbackCount: number;
  };
  
  // Migration information
  migrationInfo?: {
    requiresMigration: boolean;
    migrationScripts: Array<{
      fromVersion: string;
      toVersion: string;
      scriptPath: string;
      estimatedDuration: string;
      complexity: 'simple' | 'moderate' | 'complex';
    }>;
    lastMigration?: {
      fromVersion: string;
      toVersion: string;
      migratedAt: Date;
      migrationStatus: 'success' | 'partial' | 'failed';
      migrationNotes: string;
    };
  };
  
  // Backup and restore information
  backupInfo?: {
    backupFrequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    lastBackup: Date;
    backupLocation: string;
    backupSize: number;
    restorePoints: Array<{
      version: string;
      backupDate: Date;
      restoreStatus: 'available' | 'verified' | 'corrupted';
    }>;
  };
  
  // Methods
  getVersionInfo: () => {
    version: string;
    major: number;
    minor: number;
    patch: number;
    build: number | string;
    prerelease: boolean;
    stable: boolean;
  };
  
  getVersionComparison: (
    otherVersion: string | SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    isNewer: boolean;
    isOlder: boolean;
    isSame: boolean;
    breakingChanges: string[];
    backwardCompatible: boolean;
  };
  
  canUpgradeTo: (targetVersion: string) => {
    canUpgrade: boolean;
    requiredSteps: string[];
    breakingChanges: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
  };
  
  getMigrationPath: (targetVersion: string) => Array<{
    fromVersion: string;
    toVersion: string;
    steps: string[];
    requiredActions: string[];
    validationSteps: string[];
  }>;
  
  validateVersionConsistency: () => {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    suggestions: string[];
  };
  
  generateVersionReport: () => {
    summary: string;
    changes: string[];
    metrics: {
      linesChanged: number;
      filesChanged: number;
      featuresAdded: number;
      bugsFixed: number;
      performanceImpact: 'positive' | 'neutral' | 'negative';
    };
    recommendations: string[];
  };
  
  // Utility methods
  bumpVersion: (type: 'major' | 'minor' | 'patch', notes?: string) => Promise<{
    success: boolean;
    newVersion: string;
    changes: string[];
    timestamp: Date;
  }>;
  
  createRelease: (releaseType: 'major' | 'minor' | 'patch' | 'hotfix', releaseNotes: string) => Promise<{
    success: boolean;
    releaseVersion: string;
    releaseId: string;
    publishedAt: Date;
  }>;
  
  archiveVersion: (reason: string, archivedBy: string) => Promise<{
    success: boolean;
    archiveId: string;
    archivedAt: Date;
    archivedBy: string;
  }>;
  
  restoreVersion: (versionId: string | number, restoreReason: string) => Promise<{
    success: boolean;
    restoredVersion: string;
    restoredAt: Date;
    restoredBy: string;
  }>;
  
  compareWithVersion: (
    otherVersion: SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    differences: Array<{
      field: string;
      currentValue: any;
      otherValue: any;
      changeType: 'added' | 'removed' | 'modified' | 'unchanged';
      impact: 'low' | 'medium' | 'high' | 'breaking';
    }>;
    similarityScore: number;
    compatibility: 'full' | 'partial' | 'none';
  };
}

/**
 * Default implementation of SnapshotVersioning
 */
export const createDefaultSnapshotVersioning = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  overrides?: Partial<SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const now = new Date();
  
  const defaultVersioning: SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    // SharedVersioning properties
    major: 1,
    minor: 0,
    patch: 0,
    buildNumber: "1",
    
    // Core version properties
    id: "snapshot-version-1",
    versionNumber: "1.0.0",
    versionString: "v1.0.0",
    versionHash: "",
    
    // Version metadata
    changeLog: ["Initial version created"],
    tags: ["initial", "snapshot"],
    categories: ["default"],
    
    // Version relationships
    relatedVersions: [],
    
    // Version history
    versionHistory: {
      versionData: null,
      latestVersion: undefined,
      history: [],
      timestamp: now,
      versions: [],
      currentVersionIndex: 0
    },
    
    releaseHistory: [],
    
    // Version state
    isLatest: true,
    isStable: true,
    isPrerelease: false,
    isBeta: false,
    isAlpha: false,
    isReleaseCandidate: false,
    isArchived: false,
    
    // Dates
    createdAt: now,
    
    // Author information
    author: "system",
    
    // Compatibility
    compatibilityMatrix: {},
    
    // Methods with default implementations
    getVersionInfo: () => ({
      version: "1.0.0",
      major: 1,
      minor: 0,
      patch: 0,
      build: "1",
      prerelease: false,
      stable: true
    }),
    
    getVersionComparison: (otherVersion) => ({
      isNewer: false,
      isOlder: false,
      isSame: true,
      breakingChanges: [],
      backwardCompatible: true
    }),
    
    canUpgradeTo: (targetVersion) => ({
      canUpgrade: true,
      requiredSteps: [],
      breakingChanges: [],
      estimatedEffort: 'low'
    }),
    
    getMigrationPath: (targetVersion) => [],
    
    validateVersionConsistency: () => ({
      isValid: true,
      issues: [],
      warnings: [],
      suggestions: []
    }),
    
    generateVersionReport: () => ({
      summary: "Initial version report",
      changes: ["Initial version created"],
      metrics: {
        linesChanged: 0,
        filesChanged: 0,
        featuresAdded: 0,
        bugsFixed: 0,
        performanceImpact: 'neutral'
      },
      recommendations: []
    }),
    
    // Async methods with default implementations
    bumpVersion: async (type, notes) => ({
      success: true,
      newVersion: "1.0.1",
      changes: [notes || `Bumped ${type} version`],
      timestamp: now
    }),
    
    createRelease: async (releaseType, releaseNotes) => ({
      success: true,
      releaseVersion: "1.0.0",
      releaseId: `release-${Date.now()}`,
      publishedAt: now
    }),
    
    archiveVersion: async (reason, archivedBy) => ({
      success: true,
      archiveId: `archive-${Date.now()}`,
      archivedAt: now,
      archivedBy: archivedBy
    }),
    
    restoreVersion: async (versionId, restoreReason) => ({
      success: true,
      restoredVersion: "1.0.0",
      restoredAt: now,
      restoredBy: "system"
    }),
    
    compareWithVersion: (otherVersion) => ({
      differences: [],
      similarityScore: 100,
      compatibility: 'full'
    })
  };
  
  // Calculate initial version hash
  defaultVersioning.versionHash = calculateVersionHash(defaultVersioning);
  
  // Merge with overrides
  return {
    ...defaultVersioning,
    ...overrides,
  };
};

/**
 * Helper function to calculate a version hash
 */
export const calculateVersionHash = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  versioning: SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): string => {
  const content = `${versioning.major}.${versioning.minor}.${versioning.patch}.${versioning.buildNumber}`;
  let hash = 0;
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Type guard to check if an object is SnapshotVersioning
 */
export const isSnapshotVersioning = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  obj: any
): obj is SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return (
    obj &&
    typeof obj === 'object' &&
    'versionNumber' in obj &&
    'isLatest' in obj &&
    'getVersionInfo' in obj &&
    typeof obj.getVersionInfo === 'function'
  );
};

/**
 * Convert version data to snapshot versioning
 */
export const versionDataToSnapshotVersioning = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    // Map VersionData properties to SnapshotVersioning
    major: versionData.major,
    minor: versionData.minor,
    patch: versionData.patch,
    buildNumber: versionData.buildNumber,
    
    id: versionData.id.toString(),
    versionNumber: versionData.versionNumber || `${versionData.major}.${versionData.minor}.${versionData.patch}`,
    versionString: `v${versionData.major}.${versionData.minor}.${versionData.patch}`,
    versionHash: versionData.checksum || calculateVersionHashFromData(versionData),
    
    changeLog: versionData.changes || [],
    tags: versionData.metadata?.tags || [],
    categories: versionData.metadata?.categories || ['default'],
    
    versionHistory: versionData.versionHistory || {
      versionData: null,
      latestVersion: undefined,
      history: [],
      timestamp: new Date(),
      versions: [],
      currentVersionIndex: 0
    },
    
    releaseHistory: versionData.releaseDate ? [{
      version: versionData.versionNumber || `${versionData.major}.${versionData.minor}.${versionData.patch}`,
      releaseDate: new Date(versionData.releaseDate),
      releaseType: 'patch',
      releaseNotes: versionData.description || '',
      releasedBy: versionData.author || 'system'
    }] : [],
    
    isLatest: versionData.isLatest,
    isStable: !versionData.draft,
    isPrerelease: versionData.draft,
    isBeta: versionData.status === 'beta',
    isAlpha: versionData.status === 'alpha',
    isReleaseCandidate: versionData.status === 'rc',
    isArchived: versionData.isArchived || false,
    
    createdAt: new Date(versionData.timestamp || Date.now()),
    publishedAt: versionData.publishedAt || undefined,
    
    author: versionData.author,
    authoredBy: versionData.author,
    
    compatibilityMatrix: {},
    relatedVersions: [],
    
    // Method implementations
    getVersionInfo: () => ({
      version: versionData.versionNumber || `${versionData.major}.${versionData.minor}.${versionData.patch}`,
      major: versionData.major,
      minor: versionData.minor,
      patch: versionData.patch,
      build: versionData.buildNumber,
      prerelease: versionData.draft,
      stable: !versionData.draft
    }),
    
    getVersionComparison: (otherVersion) => ({
      isNewer: false,
      isOlder: false,
      isSame: true,
      breakingChanges: [],
      backwardCompatible: true
    }),
    
    canUpgradeTo: (targetVersion) => ({
      canUpgrade: true,
      requiredSteps: [],
      breakingChanges: [],
      estimatedEffort: 'low'
    }),
    
    getMigrationPath: (targetVersion) => [],
    
    validateVersionConsistency: () => ({
      isValid: true,
      issues: [],
      warnings: [],
      suggestions: []
    }),
    
    generateVersionReport: () => ({
      summary: "Version report generated from VersionData",
      changes: versionData.changes || [],
      metrics: {
        linesChanged: 0,
        filesChanged: 0,
        featuresAdded: 0,
        bugsFixed: 0,
        performanceImpact: 'neutral'
      },
      recommendations: []
    }),
    
    bumpVersion: async (type, notes) => ({
      success: true,
      newVersion: "1.0.1",
      changes: [notes || `Bumped ${type} version`],
      timestamp: new Date()
    }),
    
    createRelease: async (releaseType, releaseNotes) => ({
      success: true,
      releaseVersion: "1.0.0",
      releaseId: `release-${Date.now()}`,
      publishedAt: new Date()
    }),
    
    archiveVersion: async (reason, archivedBy) => ({
      success: true,
      archiveId: `archive-${Date.now()}`,
      archivedAt: new Date(),
      archivedBy: archivedBy
    }),
    
    restoreVersion: async (versionId, restoreReason) => ({
      success: true,
      restoredVersion: "1.0.0",
      restoredAt: new Date(),
      restoredBy: "system"
    }),
    
    compareWithVersion: (otherVersion) => ({
      differences: [],
      similarityScore: 100,
      compatibility: 'full'
    })
  };
};

/**
 * Helper to calculate hash from VersionData
 */
const calculateVersionHashFromData = (versionData: any): string => {
  const content = JSON.stringify(versionData);
  let hash = 0;
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};