// hooks/useLifecycle.ts
import { useState, useEffect, useCallback } from 'react';
import { LifecycleManager } from '../LifecycleManager';
import { PhaseOptions, LifecycleConfig } from '../Lifecycle';

export const useLifecycle = (config: LifecycleConfig) => {
  const [manager] = useState(() => new LifecycleManager(config));
  const [currentPhase, setCurrentPhase] = useState(manager.getCurrentPhase());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback(async (phaseName: string): Promise<boolean> => {
    setIsTransitioning(true);
    try {
      const success = await manager.transitionTo(phaseName);
      if (success) {
        setCurrentPhase(manager.getCurrentPhase());
      }
      return success;
    } finally {
      setIsTransitioning(false);
    }
  }, [manager]);

  const canTransitionTo = useCallback((phaseName: string): boolean => {
    return manager.canTransitionTo(phaseName);
  }, [manager]);

  const updateActivity = useCallback((): void => {
    manager.updateActivity();
  }, [manager]);

  return {
    currentPhase,
    isTransitioning,
    transitionTo,
    canTransitionTo,
    updateActivity,
    getNextPossiblePhases: manager.getNextPossiblePhases.bind(manager),
    getPhase: manager.getPhase.bind(manager),
    getAllPhases: manager.getAllPhases.bind(manager),
    getPhaseHistory: manager.getPhaseHistory.bind(manager),
    checkIdleTimeout: manager.checkIdleTimeout.bind(manager),
  };
};