// LoadAquaState.tsx
import type { AquaState } from '@/core/state/AquaState';
import type { useAquaStore } from '@/core/state/stores/AquaStore';
import type { AquaConfig } from '@/utils/web3/webConfigs/aqua/AquaConfig';
import React, { useEffect, useState } from 'react';

interface LoadAquaStateProps {
  userId?: string;
  projectId?: string;
  autoInitialize?: boolean;
  onStateLoaded?: (state: AquaState) => void;
  onError?: (error: Error) => void;
}

const LoadAquaState: React.FC<LoadAquaStateProps> = ({
  userId,
  projectId,
  autoInitialize = true,
  onStateLoaded,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [aquaState, setAquaState] = useState<AquaState | null>(null);
  const { setAquaConfig, setUserSession, clearSession } = useAquaStore();

  useEffect(() => {
    let isMounted = true;

    const initializeAqua = async () => {
      try {
        setIsLoading(true);
        console.log('🚀 Initializing Aqua state...');

        // 1. Load Aqua configuration
        const config: AquaConfig = await loadAquaConfig();
        
        // 2. Initialize user session if userId is provided
        let session = null;
        if (userId) {
          session = await initializeAquaSession(userId, projectId);
        }

        // 3. Set up Aqua state
        const newAquaState: AquaState = {
          config,
          session,
          isActive: true,
          initializedAt: new Date(),
          lastActivity: new Date(),
          features: {
            realTimeUpdates: config.realTimeUpdates || false,
            advancedAnalytics: config.advancedAnalytics || false,
            collaborativeEditing: config.collaborativeEditing || false
          }
        };

        if (isMounted) {
          // 4. Update global state
          setAquaConfig(config);
          if (session) {
            setUserSession(session);
          }

          // 5. Update local state
          setAquaState(newAquaState);
          setIsLoading(false);

          // 6. Notify parent component
          onStateLoaded?.(newAquaState);

          console.log('✅ Aqua state loaded successfully', newAquaState);
        }

      } catch (error) {
        if (isMounted) {
          console.error('❌ Failed to load Aqua state:', error);
          setIsLoading(false);
          onError?.(error as Error);
        }
      }
    };

    if (autoInitialize) {
      initializeAqua();
    }

    return () => {
      isMounted = false;
      // Cleanup on unmount if needed
      if (aquaState?.session) {
        cleanupAquaSession(aquaState.session.id);
      }
    };
  }, [userId, projectId, autoInitialize, setAquaConfig, setUserSession, onStateLoaded, onError]);

  // Optional: Render loading state or children
  if (isLoading) {
    return (
      <div className="aqua-loading">
        <div className="loading-spinner"></div>
        <span>Loading Aqua Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="aqua-state-loaded">
      <div className="status-indicator">
        <span className="status-dot active"></span>
        <span>Aqua Dashboard Ready</span>
      </div>
      
      {aquaState && (
        <div className="aqua-state-info">
          <div>Initialized: {aquaState.initializedAt.toLocaleTimeString()}</div>
          <div>Features: {Object.keys(aquaState.features).filter(k => aquaState.features[k]).join(', ')}</div>
          <div>User: {aquaState.session?.userId || 'Anonymous'}</div>
        </div>
      )}
    </div>
  );
};

export default LoadAquaState;