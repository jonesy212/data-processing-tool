// usePhaseManagement.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Phase, PhaseData } from '@/core/models/phases/Phase';
import { BackupRecord } from '@/core/error-analyzer/phases/PhaseBackupSystem';
import { useCallback, useState } from 'react';


export type SimplifiedPhaseData = AppPhase['data']; // Extract the PhaseData type from AppPhase

export function usePhaseManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  initialPhaseIndex: number = 0
) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex);
  const [phaseData, setPhaseData] = useState<Record<string, PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>({});
  const [phaseHistory, setPhaseHistory] = useState<number[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);

  const currentPhase = phases[currentPhaseIndex];
  const currentPhaseData = phaseData[currentPhase.id] || {};

   // Helper to find phase by ID without type recursion
  const findPhaseById = useCallback((phaseId: string) => {
    return phases.find(p => p.id === phaseId);
  }, [phases]);

  const updatePhaseStatus = useCallback((phaseId: string, updates: Partial<SimplifiedPhaseData<T>>) => {
    setPhaseData(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        ...updates
      } as SimplifiedPhaseData<T>
    }));
  }, []);

  // Generate a backup ID
  const generateBackupId = useCallback((): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `backup-${timestamp}-${random}`;
  }, []);

  // Simple checksum calculation
  const calculateChecksum = useCallback((content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }, []);

  // Create a backup
  const createBackup = useCallback((
    operation: string,
    milestone?: { id: string; name: string; type: string },
    customMetadata?: any
  ): BackupRecord => {
    const timestamp = new Date();
    const backupId = generateBackupId(); // Now backupId is defined!
    
    // For simplicity, we're storing in memory. In production, you'd save to disk/database
    const backupPath = `memory://backups/${backupId}`;
    
    const checksum = calculateChecksum(JSON.stringify({
      phaseId: currentPhase.id,
      phaseName: currentPhase.name,
      timestamp,
      operation,
      milestone
    }));

    // Create the backup record - all variables are now in scope
    const record: BackupRecord = {
      id: backupId,
      timestamp,
      operation,
      phaseId: currentPhase.id,
      phaseName: currentPhase.name,
      backupPath,
      checksum,
      originalPath: milestone 
        ? `${currentPhase.id}:milestone:${milestone.id}` 
        : `${currentPhase.id}:operation:${operation}`,
      metadata: {
        // Core metadata
        version: '1.0.0',
        user: 'system', // In a real app, you'd get this from auth context
        tags: milestone 
          ? ['milestone', milestone.id, operation] 
          : ['phase', currentPhase.id, operation],
        backupType: milestone ? 'milestone' : 'phase',
        operation,
        
        // Extended metadata
        milestoneId: milestone?.id,
        milestoneName: milestone?.name,
        author: 'system',
        generatedAt: timestamp,
        customMetadata: {
          phaseProgress: currentPhaseData.progress || 0,
          milestoneStatus: milestone?.type,
          ...customMetadata
        }
      },
      status: 'active'
    };

    // Save the backup
    setBackups(prev => [...prev, record]);
    
    console.log(`✅ Backup created: ${backupId} for ${currentPhase.name}`);
    
    return record;
  }, [currentPhase, currentPhaseData, generateBackupId, calculateChecksum]);


  // Create milestone backup
  const backupMilestone = useCallback((
    milestone: { id: string; name: string; type: string },
    operation: 'complete' | 'update' | 'revert'
  ): BackupRecord => {
    return createBackup(
      `milestone-${operation}`,
      milestone,
      { milestoneType: milestone.type }
    );
  }, [createBackup]);

  // Create phase transition backup
  const backupPhaseTransition = useCallback((
    targetPhaseId: string,
    transitionType: 'forward' | 'backward' | 'jump'
  ): BackupRecord => {
    const targetPhase = phases.find(p => p.id === targetPhaseId);
    
    return createBackup(
      `phase-transition-${transitionType}`,
      undefined,
      {
        fromPhase: currentPhase.id,
        toPhase: targetPhaseId,
        transitionType,
        targetPhaseName: targetPhase?.name
      }
    );
  }, [currentPhase, phases, createBackup]);

  // Update your existing methods to create backups
  const goToNextPhase = useCallback((data?: Partial<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    if (currentPhaseIndex < phases.length - 1) {
      // Create backup before transitioning
      backupPhaseTransition(phases[currentPhaseIndex + 1].id, 'forward');
      
      // Save data for current phase
      if (data) {
        updatePhaseStatus(currentPhase.id, data);
      }
      
      // Mark current phase as complete
      updatePhaseStatus(currentPhase.id, { 
        isComplete: true,
        endDate: new Date()
      });

      setPhaseHistory(prev => [...prev, currentPhaseIndex]);
      setCurrentPhaseIndex(prev => prev + 1);

      // Initialize next phase
      const nextPhase = phases[currentPhaseIndex + 1];
      updatePhaseStatus(nextPhase.id, {
        isActive: true,
        startDate: new Date()
      });
    }
  }, [currentPhase, currentPhaseIndex, phases, backupPhaseTransition]);

  const goToPreviousPhase = useCallback(() => {
    if (phaseHistory.length > 0) {
      const previousPhaseIndex = phaseHistory[phaseHistory.length - 1];
      const previousPhase = phases[previousPhaseIndex];

      // Create backup before transitioning
      backupPhaseTransition(previousPhase.id, 'backward');
      
      const currentPhase = phases[currentPhaseIndex];

      // Deactivate current phase
      updatePhaseStatus(currentPhase.id, { isActive: false });

      setPhaseHistory(prev => prev.slice(0, -1));
      setCurrentPhaseIndex(previousPhaseIndex);

      // Reactivate previous phase
      updatePhaseStatus(previousPhase.id, { isActive: true });
    }
  }, [currentPhaseIndex, phaseHistory, phases, backupPhaseTransition]);


  const goToPhase = useCallback((
    phaseId: string, 
    data?: Partial<SimplifiedPhaseData<T>>
  ) => {
    const targetIndex = phases.findIndex(phase => phase.id === phaseId);
    if (targetIndex !== -1) {
      const currentPhase = phases[currentPhaseIndex];
      const targetPhase = phases[targetIndex]; // Type assertion if needed
      
      // Deactivate current phase
      updatePhaseStatus(currentPhase.id, { isActive: false });

      setPhaseHistory(prev => [...prev, currentPhaseIndex]);
      setCurrentPhaseIndex(targetIndex);

      // Activate and update target phase
      updatePhaseStatus(targetPhase.id, {
        ...data,
        isActive: true,
        startDate: new Date()
      });
    }
  }, [currentPhaseIndex, phases, updatePhaseStatus]);



  const getCurrentPhaseIndex = () => currentPhaseIndex;
  const isFirstPhase = currentPhaseIndex === 0;
  const isLastPhase = currentPhaseIndex === phases.length - 1;

  // Helper to get phase by ID with proper typing
  const getPhaseById = (phaseId: string): Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
    return phases.find(phase => phase.id === phaseId);
  };

  // Execute phase hooks
  const executePhaseHooks = async (hookType: 'onStart' | 'onEnd') => {
    const phase = currentPhase;
    if (phase.hooks && phase.hooks[hookType]) {
      await phase.hooks[hookType]();
    }
  };

    const getBackupById = useCallback((backupId: string): BackupRecord | undefined => {
    return backups.find(backup => backup.id === backupId);
  }, [backups]);

  // Get backups for a specific phase
  const getPhaseBackups = useCallback((phaseId: string): BackupRecord[] => {
    return backups.filter(backup => backup.phaseId === phaseId);
  }, [backups]);

  return {
    // Existing returns
    currentPhase,
    currentPhaseIndex,
    phaseData,
    phaseHistory,
    phases,
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    updatePhaseStatus,
    getCurrentPhaseIndex,
    getPhaseById,
    executePhaseHooks,
    isFirstPhase,
    isLastPhase,
    totalPhases: phases.length,
    
    // New backup-related returns
    backups,
    createBackup,
    backupMilestone,
    backupPhaseTransition,
    getBackupById,
    getPhaseBackups,
    generateBackupId
  };
}