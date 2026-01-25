// PhaseManager.tsx
import Stopwatch from "@/core/calendar/Stopwatch";
import type { fetchUserAreaDimensions } from "@/core/config/MetaDataOptions";
import type {  UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { useState } from 'react';
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { useMeta } from "@/core/config/useMeta";
import { useMetadata } from "@/core/config/useMetadata";
import useAsyncHookLinker from "@/core/hooks/useAsyncHookLinker";
import type { Phase } from "@/core/models/phases/Phase";
import { HierarchicalPhaseExecutor } from "@/core/models/phases/PhaseSystem"; // Your hierarchical system
import type { PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields, PhaseK, PhaseMeta, PhaseT } from "@/core/typings/entities/PhaseEntity";
import { createMilestone, isMilestoneOverdue } from "@/core/typings/milestoneTypes";
import type {  Milestone } from "@/core/typings/milestoneTypes";
import { useEffect } from 'react';

// Add this interface for styled-jsx support
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// Function to get a phase component based on the selected phase name
function getPhaseComponent(selectedPhaseName: string): React.FC | undefined {
  const selectedPhase = genericLifecyclePhases.find(
    (phase) => phase.name === selectedPhaseName
  );
  return selectedPhase?.component;
}

const defaultCondition = async (idleTimeoutDuration: number): Promise<boolean> => {
  // Define the threshold for idle timeout
  const IDLE_TIMEOUT_THRESHOLD = 3000; // 3 seconds

  // Check if the idleTimeoutDuration exceeds the threshold
  return idleTimeoutDuration > IDLE_TIMEOUT_THRESHOLD;
};

// Define PhaseMeta type since it's used but not imported

interface PhaseManagerProps {
  phases: Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>[];
  projectId?: string;
}

const PhaseManager: React.FC<PhaseManagerProps> = ({ phases, projectId }) => {
  const [currentPhase, setCurrentPhase] = useState<Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> | null>(null);
  const [hierarchicalExecutor, setHierarchicalExecutor] = useState<HierarchicalPhaseExecutor | null>(null);
  const [phaseMilestones, setPhaseMilestones] = useState<Map<string, Milestone[]>>(new Map());
  const [executionPlan, setExecutionPlan] = useState<any>(null);
  
  const area = fetchUserAreaDimensions().toString();
  const currentMeta: StructuredMetadata<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> = useMeta<PhaseT, PhaseK>(area);
  const currentMetadata: UnifiedMetadata<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> = useMetadata<PhaseT, PhaseK>(area);

  // Initialize hierarchical executor
  useEffect(() => {
    const initializeHierarchicalSystem = async () => {
      try {
        const executor = new HierarchicalPhaseExecutor();
        
        // Convert flat phases to hierarchical structure
        const hierarchicalPhases = phases.map((phase, index) => ({
          id: phase.id,
          name: phase.name,
          description: phase.description || '',
          dependencies: phase.dependencies || [],
          prerequisites: phase.prerequisites || [],
          level: phase.level || 0,
          parentPhaseId: phase.parentPhaseId,
          milestones: phase.milestones || createDefaultMilestones(phase),
          component: phase.component,
          hooks: phase.hooks,
          estimatedEffort: phase.estimatedEffort || phase.duration || 0,
          actualEffort: phase.actualEffort || 0,
          riskLevel: phase.riskLevel || 'low',
          isParallel: phase.isParallel || false,
          status: phase.status || 'planned'
        }));

        // Initialize milestones map
        const milestonesMap = new Map<string, Milestone[]>();
        phases.forEach(phase => {
          if (phase.milestones) {
            milestonesMap.set(phase.id, phase.milestones);
          } else {
            milestonesMap.set(phase.id, createDefaultMilestones(phase));
          }
        });
        setPhaseMilestones(milestonesMap);
        
        setHierarchicalExecutor(executor);
        
        // If there's a current active phase, set it
        const activePhase = phases.find(p => p.isActive);
        if (activePhase) {
          setCurrentPhase(activePhase);
        }
        
      } catch (error) {
        console.error('Failed to initialize hierarchical phase system:', error);
      }
    };

    initializeHierarchicalSystem();
  }, [phases]);

  // Function to create default milestones for a phase
  const createDefaultMilestones = (phase: Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>): Milestone[] => {
    const now = new Date();
    const phaseEndDate = phase.endDate || new Date(now.getTime() + (phase.duration || 0));
    
    return [
      createMilestone({
        name: `Start ${phase.name}`,
        description: `Begin the ${phase.name} phase`,
        date: phase.startDate || now,
        dueDate: phase.startDate || now,
        projectId: projectId || phase.projectId || 'default',
        status: phase.startDate && phase.startDate <= now ? 'completed' : 'pending',
        completed: phase.startDate && phase.startDate <= now ? true : false
      }),
      createMilestone({
        name: `Complete ${phase.name}`,
        description: `Finish the ${phase.name} phase`,
        date: phase.endDate || phaseEndDate,
        dueDate: phase.endDate || phaseEndDate,
        projectId: projectId || phase.projectId || 'default',
        status: 'pending',
        completed: false
      })
    ];
  };

  // Execute a phase with its dependencies
  const executePhase = async (phaseId: string) => {
    if (!hierarchicalExecutor) {
      console.error('Hierarchical executor not initialized');
      return;
    }

    try {
      console.log(`Executing phase: ${phaseId}`);
      
      // Find the phase
      const phase = phases.find(p => p.id === phaseId);
      if (!phase) {
        throw new Error(`Phase not found: ${phaseId}`);
      }

      // Execute with dependencies
      const result = await hierarchicalExecutor.executeSingle(phaseId, true);
      
      // Update execution plan
      setExecutionPlan(result);
      
      // Update current phase
      setCurrentPhase(phase);
      
      // Update phase milestones
      if (phase.milestones && phase.milestones.length > 0) {
        setPhaseMilestones(prev => new Map(prev).set(phaseId, phase.milestones!));
      }
      
      console.log(`Phase ${phaseId} executed successfully:`, result);
      
    } catch (error) {
      console.error(`Failed to execute phase ${phaseId}:`, error);
      throw error;
    }
  };

  // Execute a specific milestone within a phase
  const executeMilestone = async (phaseId: string, milestoneId: string) => {
    if (!hierarchicalExecutor) {
      console.error('Hierarchical executor not initialized');
      return;
    }

    try {
      console.log(`Executing milestone ${milestoneId} in phase ${phaseId}`);
      
      const result = await hierarchicalExecutor.executeMilestoneOnly(phaseId, milestoneId);
      
      // Update the milestone status in our local state
      setPhaseMilestones(prev => {
        const newMap = new Map(prev);
        const milestones = newMap.get(phaseId) || [];
        const updatedMilestones = milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, completed: true, completedDate: new Date() }
            : milestone
        );
        newMap.set(phaseId, updatedMilestones);
        return newMap;
      });
      
      console.log(`Milestone ${milestoneId} executed successfully:`, result);
      
    } catch (error) {
      console.error(`Failed to execute milestone ${milestoneId}:`, error);
      throw error;
    }
  };

  // Navigation functions
  const moveToNextPhase = async () => {
    if (!currentPhase) {
      // Start with first phase
      if (phases.length > 0) {
        await executePhase(phases[0].id);
      }
      return;
    }
    
    // Find next phase in order
    const currentIndex = phases.findIndex(p => p.id === currentPhase.id);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      await executePhase(nextPhase.id);
    } else {
      console.log('No more phases available');
    }
  };

  const moveToPreviousPhase = async () => {
    if (!currentPhase) return;
    
    const currentIndex = phases.findIndex(p => p.id === currentPhase.id);
    if (currentIndex > 0) {
      const prevPhase = phases[currentIndex - 1];
      await executePhase(prevPhase.id);
    }
  };

  // Get current milestone statistics
  const getCurrentMilestoneStats = () => {
    if (!currentPhase) return null;
    
    const milestones = phaseMilestones.get(currentPhase.id) || [];
    if (milestones.length === 0) return null;
    
    const completed = milestones.filter(m => m.completed).length;
    const total = milestones.length;
    const overdue = milestones.filter(m => !m.completed && isMilestoneOverdue(m)).length;
    const progress = milestones.length > 0 ? (completed / total) * 100 : 0;
    
    return {
      completed,
      total,
      overdue,
      progress,
      milestones
    };
  };

  // Check if a phase has unmet dependencies
  const hasUnmetDependencies = (phase: Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>): boolean => {
    if (!phase.dependencies || phase.dependencies.length === 0) return false;
    
    // In a real implementation, check if all dependencies are completed
    // For now, we'll assume they're met if the phase is active
    return phase.isActive !== true;
  };

  // Calculate phase risk score
  const calculatePhaseRisk = (phase: Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>): number => {
    let riskScore = 0;
    
    // Base risk from phase riskLevel
    if (phase.riskLevel === 'high') riskScore += 30;
    else if (phase.riskLevel === 'medium') riskScore += 15;
    
    // Risk from overdue milestones
    const milestonesForPhase = phaseMilestones.get(phase.id) || [];
    const overdueMilestones = milestonesForPhase.filter(m => isMilestoneOverdue(m));
    if (overdueMilestones.length > 0) {
      riskScore += (overdueMilestones.length / milestonesForPhase.length) * 40;
    }
    
    // Risk from unmet dependencies
    if (hasUnmetDependencies(phase)) {
      riskScore += 20;
    }
    
    // Risk from effort overrun
    if (phase.actualEffort && phase.estimatedEffort) {
      const effortRatio = phase.actualEffort / phase.estimatedEffort;
      if (effortRatio > 1.2) riskScore += 25;
      else if (effortRatio > 1.5) riskScore += 40;
    }
    
    return Math.min(100, riskScore);
  };

  // Get phase status color
  const getPhaseStatusColor = (phase: Phase<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>): string => {
    if (phase.status === 'completed') return '#4CAF50';
    if (phase.status === 'active') return '#2196F3';
    if (phase.status === 'cancelled') return '#F44336';
    
    const riskScore = calculatePhaseRisk(phase);
    if (riskScore > 70) return '#FF9800';
    if (riskScore > 40) return '#FFC107';
    
    return '#9E9E9E';
  };

  const milestoneStats = getCurrentMilestoneStats();
  const CurrentPhaseComponent = currentPhase?.component;

  // Setup async hook linker for phase transitions
  const linkerConfig = {
    hooks: phases.map((phase) => ({
      name: phase.name,
      enable: () => {
        console.log(`Enabling hook for ${phase.name}`);
        return {};
      },
      disable: () => {
        console.log(`Disabling hook for ${phase.name}`);
        return {};
      },
      condition: async (idleTimeoutDuration: number) => {
        if (phase.hooks?.condition) {
          return await phase.hooks.condition(idleTimeoutDuration);
        }
        return currentPhase?.id === phase.id;
      },
      asyncEffect: async () => {
        console.log(`Phase condition met for ${phase.name}`);
        
        // Set current phase
        setCurrentPhase(phase);
        
        // Define cleanup function
        const cleanup = () => {
          console.log(`Cleaning up ${phase.name}`);
          // Clear any timers or intervals
        };
        
        return cleanup;
      },
      idleTimeoutId: null,
      startIdleTimeout: () => {
        console.log(`Starting idle timeout for ${phase.name}`);
      },
    })),
  };

  const linker = useAsyncHookLinker(linkerConfig);

  const moveToNextHook = () => {
    linker.moveToNextHook();
  };

  const moveToPreviousHook = () => {
    if (linker.moveToPreviousHook) {
      linker.moveToPreviousHook();
    }
  };

  return (
    <div className="phase-manager">
      <div className="phase-manager-header">
        <h2>Phase Manager - Hierarchical System</h2>
        <div className="phase-manager-meta">
          <span className="meta-item">
            <strong>Project:</strong> {projectId || 'Default Project'}
          </span>
          <span className="meta-item">
            <strong>Active Phases:</strong> {phases.filter(p => p.isActive).length}/{phases.length}
          </span>
          <span className="meta-item">
            <strong>Total Milestones:</strong> {Array.from(phaseMilestones.values()).flat().length}
          </span>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="phase-navigation">
        <button 
          onClick={moveToPreviousPhase} 
          disabled={!currentPhase || !phases.find(p => p.id === currentPhase.id)}
          className="nav-button prev"
        >
          ← Previous Phase
        </button>
        <button 
          onClick={moveToNextPhase}
          className="nav-button next"
        >
          {currentPhase ? "Next Phase →" : "Start First Phase →"}
        </button>
        
        {/* Async Hook Navigation */}
        <div className="hook-navigation">
          <button onClick={moveToPreviousHook} className="hook-button">
            ← Previous Hook
          </button>
          <button onClick={moveToNextHook} className="hook-button">
            Next Hook →
          </button>
        </div>
      </div>

      {/* Current Phase Display */}
      {currentPhase && (
        <div className="current-phase" style={{ borderLeftColor: getPhaseStatusColor(currentPhase) }}>
          <div className="current-phase-header">
            <h3>{currentPhase.name}</h3>
            <div className="phase-badges">
              <span className="badge status" style={{ backgroundColor: getPhaseStatusColor(currentPhase) }}>
                {currentPhase.status || 'planned'}
              </span>
              <span className="badge risk" style={{ 
                backgroundColor: calculatePhaseRisk(currentPhase) > 70 ? '#FF6B6B' : 
                               calculatePhaseRisk(currentPhase) > 40 ? '#FFD93D' : '#6BCF7F'
              }}>
                Risk: {calculatePhaseRisk(currentPhase).toFixed(0)}%
              </span>
              {currentPhase.level !== undefined && (
                <span className="badge level">Level {currentPhase.level}</span>
              )}
            </div>
          </div>
          
          <p className="phase-description">{currentPhase.description}</p>
          
          {/* Phase Metadata */}
          <div className="phase-metadata">
            <Stopwatch
              startTime={currentPhase.startDate}
              endTime={currentPhase.endDate}
            />
            
            {/* Effort Tracking */}
            {currentPhase.estimatedEffort && (
              <div className="effort-tracking">
                <span>Effort: </span>
                <span className="estimated">{currentPhase.estimatedEffort}h estimated</span>
                {currentPhase.actualEffort && (
                  <span className="actual"> / {currentPhase.actualEffort}h actual</span>
                )}
              </div>
            )}
            
            {/* Dependencies */}
            {currentPhase.dependencies && currentPhase.dependencies.length > 0 && (
              <div className="dependencies">
                <span>Dependencies: </span>
                <span className="dependency-count">{currentPhase.dependencies.length}</span>
              </div>
            )}
          </div>

          {/* Milestone Progress */}
          {milestoneStats && (
            <div className="milestone-progress">
              <div className="progress-header">
                <h4>Milestones</h4>
                <span className="progress-count">
                  {milestoneStats.completed}/{milestoneStats.total} complete
                  {milestoneStats.overdue > 0 && ` (${milestoneStats.overdue} overdue)`}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${milestoneStats.progress}%` }}
                />
              </div>
              
              {/* Milestone List */}
              <div className="milestone-list">
                {milestoneStats.milestones.map(milestone => (
                  <div 
                    key={milestone.id} 
                    className={`milestone-item ${milestone.completed ? 'completed' : ''} ${isMilestoneOverdue(milestone) ? 'overdue' : ''}`}
                    onClick={() => executeMilestone(currentPhase.id, milestone.id)}
                  >
                    <div className="milestone-checkbox">
                      {milestone.completed ? '✓' : '○'}
                    </div>
                    <div className="milestone-details">
                      <div className="milestone-name">{milestone.name}</div>
                      <div className="milestone-date">
                        {milestone.dueDate?.toLocaleDateString()}
                        {isMilestoneOverdue(milestone) && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase Component */}
          {CurrentPhaseComponent && (
            <div className="phase-component-container">
              <CurrentPhaseComponent />
            </div>
          )}
        </div>
      )}
      
      {/* Phase List */}
      <div className="phase-list">
        <h4>All Phases</h4>
        <ul>
          {phases.map((phase) => {
            const currentPhaseMilestones = phaseMilestones.get(phase.id) || [];
            const completedMilestones = currentPhaseMilestones.filter(m => m.completed).length;
            const totalMilestones = currentPhaseMilestones.length;
            const isCurrent = currentPhase?.id === phase.id;
            
            return (
              <li 
                key={phase.id}
                className={`
                  phase-list-item
                  ${isCurrent ? 'active' : ''}
                  ${phase.status === 'completed' ? 'completed' : ''}
                  ${phase.status === 'cancelled' ? 'cancelled' : ''}
                  ${hasUnmetDependencies(phase) ? 'blocked' : ''}
                `}
                onClick={() => executePhase(phase.id)}
                style={{ borderLeftColor: getPhaseStatusColor(phase) }}
              >
                <div className="phase-item-main">
                  <div className="phase-item-header">
                    <span className="phase-name">{phase.name}</span>
                    <span className="phase-order">{phase.order || 'N/A'}</span>
                  </div>
                  <div className="phase-item-details">
                    {phase.description && (
                      <div className="phase-description">{phase.description.substring(0, 50)}...</div>
                    )}
                    <div className="phase-stats">
                      <span className="stat">
                        📅 {phase.startDate?.toLocaleDateString('short') || 'No start'}
                      </span>
                      <span className="stat">
                        🎯 {completedMilestones}/{totalMilestones}
                      </span>
                      {phase.riskLevel && (
                        <span className={`stat risk-${phase.riskLevel}`}>
                          ⚠️ {phase.riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {hasUnmetDependencies(phase) && (
                  <div className="blocked-indicator" title="Has unmet dependencies">
                    🔒
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Execution Plan Display */}
      {executionPlan && (
        <div className="execution-plan">
          <h4>Execution Plan</h4>
          <pre>{JSON.stringify(executionPlan, null, 2)}</pre>
        </div>
      )}

      <style jsx>{`
        .phase-manager {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .phase-manager-header {
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .phase-manager-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .phase-manager-meta {
          display: flex;
          gap: 20px;
          font-size: 0.9em;
          color: #666;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .phase-navigation {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
        }
        
        .nav-button, .hook-button {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .nav-button:hover:not(:disabled), 
        .hook-button:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .nav-button.prev {
          border-left: 4px solid #6c757d;
        }
        
        .nav-button.next {
          border-right: 4px solid #0d6efd;
        }
        
        .hook-navigation {
          margin-left: auto;
          display: flex;
          gap: 10px;
        }
        
        .hook-button {
          padding: 8px 15px;
          font-size: 0.9em;
        }
        
        .current-phase {
          border: 1px solid #ddd;
          border-left-width: 4px;
          padding: 25px;
          margin-bottom: 30px;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .current-phase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .current-phase-header h3 {
          margin: 0;
          color: #212529;
          font-size: 1.5em;
        }
        
        .phase-badges {
          display: flex;
          gap: 8px;
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 500;
          color: white;
        }
        
        .badge.status {
          text-transform: capitalize;
        }
        
        .badge.level {
          background: #6c757d;
        }
        
        .phase-description {
          color: #495057;
          line-height: 1.6;
          margin: 15px 0;
        }
        
        .phase-metadata {
          display: flex;
          gap: 30px;
          align-items: center;
          padding: 15px 0;
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
          margin: 20px 0;
        }
        
        .effort-tracking {
          font-size: 0.9em;
          color: #495057;
        }
        
        .effort-tracking .estimated {
          color: #6c757d;
        }
        
        .effort-tracking .actual {
          color: #0d6efd;
          font-weight: 500;
        }
        
        .dependencies {
          font-size: 0.9em;
          color: #495057;
        }
        
        .dependency-count {
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .milestone-progress {
          margin: 25px 0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .progress-header h4 {
          margin: 0;
          color: #495057;
        }
        
        .progress-count {
          font-size: 0.9em;
          color: #6c757d;
        }
        
        .progress-bar {
          height: 10px;
          background: #e9ecef;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
        }
        
        .milestone-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .milestone-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .milestone-item:hover {
          background: #f8f9fa;
          border-color: #dee2e6;
        }
        
        .milestone-item.completed {
          background: #f8fff9;
          border-color: #d4edda;
        }
        
        .milestone-item.overdue {
          border-color: #f5c6cb;
          background: #fff8f8;
        }
        
        .milestone-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #6c757d;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #6c757d;
        }
        
        .milestone-item.completed .milestone-checkbox {
          background: #4CAF50;
          border-color: #4CAF50;
          color: white;
        }
        
        .milestone-details {
          flex: 1;
        }
        
        .milestone-name {
          font-weight: 500;
          color: #212529;
          margin-bottom: 4px;
        }
        
        .milestone-date {
          font-size: 0.85em;
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .overdue-badge {
          background: #dc3545;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
        }
        
        .phase-component-container {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        
        .phase-list {
          margin-top: 40px;
        }
        
        .phase-list h4 {
          margin: 0 0 15px 0;
          color: #495057;
        }
        
        .phase-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .phase-list-item {
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #e9ecef;
          border-left-width: 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .phase-list-item:hover {
          background: #f8f9fa;
          border-color: #dee2e6;
        }
        
        .phase-list-item.active {
          background: #e3f2fd;
          border-color: #2196F3;
        }
        
        .phase-list-item.completed {
          background: #f1f8e9;
          border-color: #8bc34a;
        }
        
        .phase-list-item.cancelled {
          background: #f5f5f5;
          border-color: #9e9e9e;
          opacity: 0.7;
        }
        
        .phase-list-item.blocked {
          background: #fff3cd;
          border-color: #ffc107;
        }
        
        .phase-item-main {
          flex: 1;
        }
        
        .phase-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .phase-name {
          font-weight: 600;
          color: #212529;
        }
        
        .phase-order {
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          color: #6c757d;
        }
        
        .phase-item-details {
          font-size: 0.9em;
        }
        
        .phase-description {
          color: #6c757d;
          margin-bottom: 8px;
        }
        
        .phase-stats {
          display: flex;
          gap: 15px;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85em;
          color: #495057;
        }
        
        .risk-high {
          color: #dc3545;
          font-weight: 500;
        }
        
        .risk-medium {
          color: #ffc107;
          font-weight: 500;
        }
        
        .risk-low {
          color: #28a745;
          font-weight: 500;
        }
        
        .blocked-indicator {
          background: #ffc107;
          color: #856404;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
        }
        
        .execution-plan {
          margin-top: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }
        
        .execution-plan h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }
        
        .execution-plan pre {
          margin: 0;
          font-size: 0.85em;
          color: #495057;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};


// Specific phase components
export const IdeaLifecyclePhase: React.FC = () => {
  // Implement the Idea Lifecycle phase component
  return <div>Idea Lifecycle Phase</div>;
};

// Define an array of phases with proper type parameters
const genericLifecyclePhases: Phase<
  PhaseT,
  PhaseK,
  PhaseAttachment,
  PhaseExcludedFields,
  PhaseIncludedFields,
  keyof PhaseT          // IncludedFields
>[] = [
  {
    id: '02',
    name: "Idea Lifecycle",
    projectId: 'system-project-id',
    startDate: new Date(),
    endDate: new Date(),
    description: "Lifecycle Description",
    date: new Date(),
    createdBy: "user 1",
    component: () => <IdeaLifecyclePhase />,
    subPhases: [],
    hooks: {
      canTransitionTo: () => true,
      handleTransitionTo: () => { },
      resetIdleTimeout: async () => Promise.resolve(),
      isActive: false,
      progress: null,
      condition: defaultCondition,
    },
    duration: 1000,
    lessons: [],
  },
  // Add more generic phases as needed
];

export default PhaseManager;