import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from '@/config/BaseConfig';
import React, { useCallback, useMemo, useState } from 'react';

// Types
interface VersionMetadata {
  timestamp: Date;
  author?: string;
  description?: string;
  tags?: string[];
  commitHash?: string;
  buildNumber?: string;
}

interface SnapshotVersion<T extends BaseDataEntity> {
  id: string;
  snapshotId: string;
  data: T;
  version: string;
  metadata: VersionMetadata;
  previousVersionId?: string;
  nextVersionIds: string[];
}

interface SnapshotVersioningSystemProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  initialSnapshots?: Map<string, SnapshotVersion<T>>;
  onVersionChange?: (versionId: string, snapshot: SnapshotVersion<T>) => void;
  maxHistory?: number;
}

// Functional Component
export function useSnapshotVersioningSystem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>({
  initialSnapshots = new Map(),
  onVersionChange,
  maxHistory = 100
}: SnapshotVersioningSystemProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  // State
// Fix the useState type annotation
  const [snapshots, setSnapshots] = useState<Map<string, SnapshotVersion<T>>>(initialSnapshots);
  const [currentVersionIds, setCurrentVersionIds] = useState<Map<string, string>>(new Map()); // snapshotId -> currentVersionId

  // 🎯 Create new version
  const createVersion = useCallback((
    snapshotId: string,
    data: T,
    version: string,
    metadata: Omit<VersionMetadata, 'timestamp'> = {}
  ): SnapshotVersion<T> => {
    const newVersion: SnapshotVersion<T> = {
      id: `${snapshotId}-v${version}-${Date.now()}`,
      snapshotId,
      data,
      version,
      metadata: {
        ...metadata,
        timestamp: new Date()
      },
      nextVersionIds: []
    };

    // Get current version for this snapshot
    const currentVersionId = currentVersionIds.get(snapshotId);
    
    if (currentVersionId) {
      // Update previous version to point to this new version
      const previousVersion = snapshots.get(currentVersionId);
      if (previousVersion) {
        previousVersion.nextVersionIds.push(newVersion.id);
        snapshots.set(currentVersionId, { ...previousVersion });
      }
      newVersion.previousVersionId = currentVersionId;
    }

    // Add new version
    const newSnapshots = new Map(snapshots);
    newSnapshots.set(newVersion.id, newVersion);
    
    // Update current version pointer
    const newCurrentVersionIds = new Map(currentVersionIds);
    newCurrentVersionIds.set(snapshotId, newVersion.id);
    
    setSnapshots(newSnapshots);
    setCurrentVersionIds(newCurrentVersionIds);
    
    // Clean up old versions if exceeding max history
    cleanupOldVersions(snapshotId, newSnapshots);
    
    onVersionChange?.(newVersion.id, newVersion);
    
    return newVersion;
  }, [snapshots, currentVersionIds, maxHistory, onVersionChange]);

  // 🧹 Clean up old versions
  const cleanupOldVersions = useCallback((snapshotId: string, snapshotsMap: Map<string, SnapshotVersion<T>>) => {
    const versions = Array.from(snapshotsMap.values())
      .filter(v => v.snapshotId === snapshotId)
      .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime());
    
    if (versions.length > maxHistory) {
      const versionsToRemove = versions.slice(maxHistory);
      versionsToRemove.forEach(version => {
        snapshotsMap.delete(version.id);
        
        // Remove references from other versions
        if (version.previousVersionId) {
          const previous = snapshotsMap.get(version.previousVersionId);
          if (previous) {
            previous.nextVersionIds = previous.nextVersionIds.filter(id => id !== version.id);
          }
        }
        
        version.nextVersionIds.forEach(nextId => {
          const next = snapshotsMap.get(nextId);
          if (next) {
            next.previousVersionId = undefined;
          }
        });
      });
      
      setSnapshots(new Map(snapshotsMap));
    }
  }, [maxHistory]);

  // 📋 Get current version of a snapshot
  const getCurrentVersion = useCallback((snapshotId: string): SnapshotVersion<T> | undefined => {
    const currentVersionId = currentVersionIds.get(snapshotId);
    return currentVersionId ? snapshots.get(currentVersionId) : undefined;
  }, [snapshots, currentVersionIds]);

  // 🔍 Get version history for a snapshot
  const getVersionHistory = useCallback((snapshotId: string): SnapshotVersion<T>[] => {
    return Array.from(snapshots.values())
      .filter((v): v is SnapshotVersion<T> => 
        typeof v === 'object' && 
        v !== null &&
        'snapshotId' in v &&
        v.snapshotId === snapshotId
      )
      .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime());
  }, [snapshots]);
    
  // ⏪ Revert to previous version
  const revertToVersion = useCallback((versionId: string): SnapshotVersion<T> | undefined => {
    const version = snapshots.get(versionId);
    if (!version) return undefined;

    const newCurrentVersionIds = new Map(currentVersionIds);
    newCurrentVersionIds.set(version.snapshotId, versionId);
    setCurrentVersionIds(newCurrentVersionIds);

    onVersionChange?.(versionId, version);
    return version;
  }, [snapshots, currentVersionIds, onVersionChange]);

  // 🔎 Find version by criteria
  const findVersion = useCallback((
    snapshotId: string,
    predicate: (version: SnapshotVersion<T>) => boolean
  ): SnapshotVersion<T> | undefined => {
    return getVersionHistory(snapshotId).find(predicate);
  }, [getVersionHistory]);

  // 📊 Get version statistics
  const getVersionStats = useCallback((snapshotId: string) => {
    const history = getVersionHistory(snapshotId);
    return {
      totalVersions: history.length,
      latestVersion: history[0]?.version,
      earliestVersion: history[history.length - 1]?.version,
      timeSpan: history.length > 1 
        ? new Date(history[0].metadata.timestamp).getTime() - 
          new Date(history[history.length - 1].metadata.timestamp).getTime()
        : 0
    };
  }, [getVersionHistory]);

  // 🎯 Memoized values
  const value = useMemo(() => ({
    // State
    snapshots,
    currentVersionIds,
    
    // Methods
    createVersion,
    getCurrentVersion,
    getVersionHistory,
    revertToVersion,
    findVersion,
    getVersionStats,
    
    // Utilities
    hasVersions: (snapshotId: string) => getVersionHistory(snapshotId).length > 0,
    getSnapshotIds: () => {
      const values = Array.from(snapshots.values());
      const snapshotIds = values
        .filter((v): v is SnapshotVersion<T> => 
          typeof v === 'object' && 
          v !== null && 
          'snapshotId' in v
        )
        .map(v => v.snapshotId);
      return Array.from(new Set(snapshotIds));
    },    
  }), [
    snapshots,
    currentVersionIds,
    createVersion,
    getCurrentVersion,
    getVersionHistory,
    revertToVersion,
    findVersion,
    getVersionStats
  ]);

  return value;
}

export type { SnapshotVersion }

// 🎨 React Hook Component
export const SnapshotVersioningSystem: React.FC<SnapshotVersioningSystemProps<any>> = ({
  children,
  initialSnapshots,
  onVersionChange,
  maxHistory
}) => {
  const versioningSystem = useSnapshotVersioningSystem({
    initialSnapshots,
    onVersionChange,
    maxHistory
  });

  return children(versioningSystem);
};