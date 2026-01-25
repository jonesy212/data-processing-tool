
export interface FileChangeTracker {
  filePath: string;
  originalHash: string;
  currentHash: string;
  changeCount: number;
  lastChangeTime: Date;
  hasBeenFullyFixed: boolean;
  errorsBefore: number;
  errorsAfter: number;
  backupIds: string[];
}

export interface ProductionBackupPoint {
  id: string;
  name: string;
  timestamp: Date;
  description: string;
  fullyFixedFiles: string[];
  partialFixedFiles: string[];
  unfixedFiles: string[];
  totalChanges: number;
  successRate: number;
  metadata: Record<string, any>;
}



export interface FileDiff {
  timestamp: Date;
  operation: string;
  changes: TextChange[] | BinaryPatch[];
  previousHash: string;
  newHash: string;
  compressed?: boolean;
}

export interface TextChange {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  length: number;
  content: string;
  newContent?: string;
}

/**
 * Differential backup system
 */
export class DifferentialBackupSystem {
  private diffs: Map<string, FileDiff[]> = new Map();
  
  async createDiffBackup(filePath: string, operation: string): Promise<string> {
    const currentContent = fs.readFileSync(filePath, 'utf-8');
    const currentHash = await this.getFileHash(filePath);
    
    // Check if we have a previous version
    const existingDiffs = this.diffs.get(filePath) || [];
    
    if (existingDiffs.length === 0) {
      // First time: create full backup
      return await this.createFullBackup(filePath, operation);
    }
    
    // Get last known content
    const lastBackupId = existingDiffs[existingDiffs.length - 1].previousHash;
    const lastContent = await this.restoreFromDiffs(filePath, lastBackupId);
    
    // Calculate diff
    const diff = this.calculateTextDiff(lastContent, currentContent);
    
    // Store diff
    const diffId = `diff-${Date.now()}-${currentHash.slice(0, 8)}`;
    const diffEntry: FileDiff = {
      timestamp: new Date(),
      operation,
      changes: diff,
      previousHash: lastBackupId,
      newHash: currentHash,
      compressed: true
    };
    
    existingDiffs.push(diffEntry);
    this.diffs.set(filePath, existingDiffs);
    
    // Save diff to disk
    await this.saveDiffToDisk(filePath, diffId, diffEntry);
    
    return diffId;
  }
  
  private calculateTextDiff(oldContent: string, newContent: string): TextChange[] {
    // Simple line-based diff for demonstration
    // In production, use a library like diff-match-patch or jsdiff
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const changes: TextChange[] = [];
    
    // This is simplified - use a proper diff algorithm
    let i = 0, j = 0;
    while (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] !== newLines[j]) {
        changes.push({
          type: 'replace',
          position: i,
          length: 1,
          content: oldLines[i],
          newContent: newLines[j]
        });
      }
      i++; j++;
    }
    
    return changes;
  }
  
  async restoreFromDiffs(filePath: string, targetHash: string): Promise<string> {
    const diffs = this.diffs.get(filePath);
    if (!diffs || diffs.length === 0) {
      throw new Error(`No diffs found for ${filePath}`);
    }
    
    // Find the full backup to start from
    let content = '';
    for (const diff of diffs) {
      if (diff.previousHash === targetHash) {
        // Found starting point - apply all subsequent diffs
        return this.applyDiffs(content, diffs.slice(diffs.indexOf(diff)));
      }
    }
    
    return content;
  }
  
  private applyDiffs(content: string, diffs: FileDiff[]): string {
    let result = content;
    for (const diff of diffs) {
      for (const change of diff.changes as TextChange[]) {
        switch (change.type) {
          case 'insert':
            result = result.slice(0, change.position) + 
                    change.content + 
                    result.slice(change.position);
            break;
          case 'delete':
            result = result.slice(0, change.position) + 
                    result.slice(change.position + change.length);
            break;
          case 'replace':
            result = result.slice(0, change.position) + 
                    (change.newContent || change.content) + 
                    result.slice(change.position + change.length);
            break;
        }
      }
    }
    return result;
  }
  
  async cleanupOldDiffs(filePath: string, keepLast: number = 10): Promise<void> {
    const diffs = this.diffs.get(filePath);
    if (!diffs || diffs.length <= keepLast) return;
    
    // Keep the last 'keepLast' diffs, create a new full backup
    const oldDiffs = diffs.slice(0, diffs.length - keepLast);
    const recentDiffs = diffs.slice(diffs.length - keepLast);
    
    // Create a new full backup from the remaining diffs
    const fullContent = await this.restoreFromDiffs(filePath, recentDiffs[0].previousHash);
    const fullBackupId = await this.createFullBackupFromContent(
      filePath, 
      fullContent, 
      'consolidation'
    );
    
    // Replace diffs with the new full backup + recent diffs
    this.diffs.set(filePath, recentDiffs);
  }
}