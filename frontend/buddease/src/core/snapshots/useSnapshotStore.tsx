// useSnapshotStore.tsx

import { ProjectLogger } from '@/core/dataIntegration/projectIntegration/ProjectLogger';
import { ModifiedDate } from "@/core/documents/DocType";
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import {
    SnapshotStoreOptions
} from "@/core/hooks/useSnapshotManager";
import { BaseData, Data } from '@/core/models/data/Data';
import {
    SubscriberTypeEnum,
    SubscriptionTypeEnum
} from "@/core/models/data/StatusType";
import {
    DataStoreWithSnapshotMethods
} from "@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';
import { SnapshotStoreProps, storeProps } from '@/core/snapshots/SnapshotStoreProps';
import { triggerOnSnapshot } from '@/core/snapshots/snapshotTrigger';
import { getSubscriptionLevel } from '@/core/subscriptions/SubscriptionLevel';
import { useCallback, useEffect, useRef, useState } from "react";

import { useSecureUserId } from '@/core/hooks/useSecureUserId';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { Subscriber } from "@/core/subscribers/Subscriber";
import {
    logActivity,
    notifyEventSystem,
    triggerIncentives,
    updateProjectState,
} from "@/utils/web3/applicationUtils";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { useEmergencyShutdown } from '@/core/dataIntegration/errorRecovery';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { useEventSystem } from '@/core/hooks/useEventSystem';
import { useSnapshotNotifications } from '@/core/hooks/useSnapshotNotifications';
import { validationMiddleware } from '@/core/middleware/core/validationMiddleware';
import { useSnapshotOperations } from '@/core/snapshots/operations/useSnapshotOperations';
import { CustomSnapshotData } from "@/core/snapshots/SnapshotData";
import { delegate } from "@/core/snapshots/snapshotHandlers";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { Subscription } from '@/core/subscriptions/Subscription';
import { useSnapshotSubscriptions } from '@/core/subscriptions/useSnapshotSubscriptions';

const SNAPSHOT_URL = process.env.REACT_APP_SNAPSHOT_URL;

const useSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  addToSnapshotList: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {

  const [snapshots, setSnapshots] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const storeRef = useRef<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  const userId = useSecureUserId(); 

   // === PROJECT INTEGRATION INITIALIZATION ===
  const projectManager = useRef<ProjectManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    new ProjectManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      enableLogging: true,
      autoSave: true,
      validationStrict: true
    })
  );

  // THESE HOOKS ARE REFERENCED BUT NEVER DEFINED:
  const operations = useSnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  const subscriptions = useSnapshotSubscriptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(); 
  const notifications = useSnapshotNotifications<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(); 
  const eventSystem = useEventSystem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  const reduxIntegration = useReduxIntegration<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
    enableBatchOperations: true,
    batchSize: 50,
    errorHandling: 'log'
  });


  // ERROR BOUNDARY & RECOVERY (lines ~100-150)
  const { emergencyShutdown } = useEmergencyShutdown();

   // Initialize persistence
  const persistenceAdapter = createPersistenceAdapter(
    storeConfig?.options.persistence?.strategy || 'localStorage'
  );
  
  const persistence = usePersistenceLayer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    persistenceAdapter,
    {
      maxAge: storeConfig?.options.performance?.cacheMaxAge || 300000,
      strategy: 'lazy'
    }
  );

    // For data persistence and API calls
  const apiCommunication = useApiCommunication<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  
  // For real-time user communication (completely separate)
  const communicationService = new CommunicationServiceImpl();

  // Use them for different purposes:
  const saveSnapshot = async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    // Use apiCommunication for saving data
    await apiCommunication.saveSnapshotToDatabase(snapshot);
  };

  const startTeamMeeting = () => {
    // Use communicationService for team collaboration
    communicationService.startCollaborationSession();
  };


  // === 1. COMPLEX GENERIC TYPE HANDLING (100-150 lines) ===
  
  // Type validation at runtime
  const validateGenericConstraints = useCallback(() => {
    if (!storeProps) return false;
    
    // Validate BaseDataEntity constraints
    if (typeof (storeProps.initialState as T)?.id !== 'string') {
      throw new Error('BaseDataEntity must have string id property');
    }
    
    // Validate Meta structure
    if (storeProps.config?.metaValidator) {
      const metaValidation = storeProps.config.metaValidator(storeProps.initialState?.meta);
      if (!metaValidation.isValid) {
        throw new Error(`Invalid meta structure: ${metaValidation.errors.join(', ')}`);
      }
    }
    
    // Validate attachment type compatibility
    if (storeProps.config?.allowedAttachmentTypes) {
      const validAttachment = storeProps.config.allowedAttachmentTypes.some(
        type => type === (storeProps.initialState?.attachments?.[0]?.type || '')
      );
      if (!validAttachment && storeProps.initialState?.attachments?.length) {
        throw new Error('Attachment type not allowed in configuration');
      }
    }
    
    return true;
  }, [storeProps]);

  // Generic type transformation utilities
  const transformGenericData = useCallback(<U extends any>(data: U): U => {
    // Apply type-specific transformations based on generic constraints
    if (storeProps?.config?.dataTransformers) {
      return storeProps.config.dataTransformers.reduce((transformedData, transformer) => {
        return transformer(transformedData);
      }, data);
    }
    return data;
  }, [storeProps?.config]);

  // === 2. STORE CONFIGURATION & INITIALIZATION (150-200 lines) ===

  const [storeConfig, setStoreConfig] = useState<ResolvedStoreConfig | null>(null);
  
  // Complex configuration parsing and validation
  const parseStoreConfig = useCallback((props: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): ResolvedStoreConfig => {
    if (!props) {
      throw new Error('Store props are required');
    }

    const config: ResolvedStoreConfig = {
      // Core required properties
      storeId: props.storeId || generateStoreId(),
      name: props.name || 'default-snapshot-store',
      version: props.version || '1.0.0',
      
      // Schema validation
      schema: props.schema ? {
        ...props.schema,
        validators: props.schema.validators || [defaultDataValidator]
      } : defaultSchema,
      
      // Options with defaults
      options: {
        persistence: props.options?.persistence || { enabled: true, strategy: 'localStorage' },
        validation: props.options?.validation || { strict: false, onError: 'throw' },
        performance: props.options?.performance || { debounceMs: 100, batchSize: 50 },
        ...props.options
      },
      
      // Category and classification
      category: props.category || 'uncategorized',
      operation: props.operation || 'read-write',
      
      // Expiration and lifecycle
      expirationDate: props.expirationDate || calculateDefaultExpiration(),
      autoCleanup: props.config?.autoCleanup !== false,
      
      // Advanced features
      plugins: props.config?.plugins || [],
      middleware: props.config?.middleware || [],
      conflictResolution: props.config?.conflictResolution || { strategy: 'last-write-wins' }
    };

    // Validate configuration integrity
    if (config.expirationDate && config.expirationDate < new Date()) {
      throw new Error('Store expiration date cannot be in the past');
    }

    if (config.options.persistence.enabled && !config.options.persistence.strategy) {
      throw new Error('Persistence strategy must be specified when persistence is enabled');
    }

    return config;
  }, []);

  // Multi-phase store initialization
  const initializeStoreInstance = useCallback(async (): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    if (!storeProps) {
      throw new Error('Store props required for initialization');
    }

    // Phase 1: Configuration validation
    const config = parseStoreConfig(storeProps);
    setStoreConfig(config);

    // Phase 2: Schema validation
    if (config.schema.validators) {
      for (const validator of config.schema.validators) {
        const validationResult = await validator(storeProps.initialState);
        if (!validationResult.valid) {
          throw new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`);
        }
      }
    }

    // Phase 3: Persistence layer setup
    let persistenceAdapter: PersistenceAdapter | null = null;
    if (config.options.persistence.enabled) {
      persistenceAdapter = await createPersistenceAdapter(config.options.persistence.strategy);
      await persistenceAdapter.initialize();
    }

    // Phase 4: Store instance creation
    const storeInstance = new SnapshotStore({
      ...config,
      persistenceAdapter,
      initialState: storeProps.initialState,
      onError: (error) => handleStoreError(error)
    });

    // Phase 5: Plugin initialization
    if (config.plugins.length > 0) {
      await Promise.all(
        config.plugins.map(plugin => 
          plugin.initialize(storeInstance, config)
        )
      );
    }

    return storeInstance;
  }, [storeProps, parseStoreConfig]);

  // === 3. ERROR BOUNDARY & RECOVERY (100 lines) ===

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    lastError: null,
    recoveryAttempts: 0,
    lastRecovery: null
  });

  const handleStoreError = useCallback(async (error: Error, context?: string) => {
    console.error(`SnapshotStore error${context ? ` in ${context}` : ''}:`, error);
    
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      lastError: error,
      lastRecovery: new Date()
    }));

    const maxAttempts = storeConfig?.options.maxRecoveryAttempts || 3;

    // Automatic recovery logic
    if (errorState.recoveryAttempts < maxAttempts) {
      try {
        await attemptStoreRecovery(error);
        setErrorState(prev => ({
          ...prev,
          hasError: false,
          recoveryAttempts: prev.recoveryAttempts + 1
        }));
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
        if (errorState.recoveryAttempts >= maxAttempts) {
          await emergencyShutdown(
            `Store recovery failed after ${errorState.recoveryAttempts} attempts`,
            'critical',
            storeRef.current?.getState(),
            error
          );
        }
      }
    } else {
      // Direct to emergency shutdown if already at max attempts
      await emergencyShutdown(
        `Store recovery failed after ${errorState.recoveryAttempts} attempts`,
        'critical',
        storeRef.current?.getState(),
        error
      );
    }
  }, [errorState.recoveryAttempts, storeConfig]);

  const attemptStoreRecovery = useCallback(async (error: Error) => {
    // Complex recovery strategies based on error type
    if (error.message.includes('persistence')) {
      // Reset persistence layer
      await storeRef.current?.resetPersistence();
    } else if (error.message.includes('subscription')) {
      // Reconnect subscriptions
      await subscriptions.reconnectAll();
    } else if (error.message.includes('memory')) {
      // Clear cache and reload
      await storeRef.current?.clearCache();
      await reloadInitialState();
    }
    
    // Notify recovery attempt
    notifications.showRecoveryAttempt(errorState.recoveryAttempts + 1);
  }, [subscriptions, notifications, errorState.recoveryAttempts]);

  // === 4. PERFORMANCE OPTIMIZATIONS (80 lines) ===

  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    lastOptimization: null,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0
  });

  // Memoized snapshot data with caching
  const optimizedSnapshots = useMemo(() => {
    const startTime = performance.now();
    
    const optimized = snapshots.map(snapshot => {
      // Create performance-optimized snapshot proxies
      return {
        ...snapshot,
        data: createCacheProxy(snapshot.data, {
          maxAge: storeConfig?.options.performance?.cacheMaxAge || 300000,
          strategy: 'lazy'
        }),
        subscribers: createLazySubscriberArray(snapshot.subscribers),
        metadata: snapshot.meta ? createImmutableProxy(snapshot.meta) : undefined
      };
    });

    const endTime = performance.now();
    setPerformanceState(prev => ({
      ...prev,
      averageResponseTime: (prev.averageResponseTime + (endTime - startTime)) / 2,
      lastOptimization: new Date()
    }));

    return optimized;
  }, [snapshots, storeConfig]);

  // Debounced batch operations
  const debouncedBatchUpdate = useDebouncedCallback((updates: SnapshotUpdate[]) => {
    const batchStartTime = performance.now();
    
    operations.batchUpdate(updates).then(() => {
      const batchEndTime = performance.now();
      const batchDuration = batchEndTime - batchStartTime;
      
      // Performance monitoring
      if (batchDuration > (storeConfig?.options.performance?.slowOperationThreshold || 1000)) {
        console.warn(`Slow batch operation detected: ${batchDuration}ms`);
      }
    });
  }, storeConfig?.options.performance?.debounceMs || 100);

  // === 5. DEPENDENCY INJECTION & PLUGIN SYSTEM (120 lines) ===

  const [plugins, setPlugins] = useState<SnapshotPlugin[]>([]);
  const [middlewarePipeline, setMiddlewarePipeline] = useState<MiddlewareFunction | null>(null);

  // Plugin initialization and management
  const initializePlugins = useCallback(async (storeInstance: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    if (!storeConfig?.plugins) return;

    const enabledPlugins: SnapshotPlugin[] = [];
    
    for (const pluginConfig of storeConfig.plugins) {
      try {
        const plugin = await loadPlugin(pluginConfig);
        await plugin.initialize(storeInstance, storeConfig);
        enabledPlugins.push(plugin);
        
        console.log(`Plugin ${plugin.name} initialized successfully`);
      } catch (error) {
        console.error(`Failed to initialize plugin ${pluginConfig.name}:`, error);
        handleStoreError(error as Error, `plugin-${pluginConfig.name}-init`);
      }
    }

    setPlugins(enabledPlugins);
    
    // Build middleware pipeline
    const pipeline = createMiddlewarePipeline([
      validationMiddleware,
      loggingMiddleware,
      ...enabledPlugins.map(p => p.middleware),
      persistenceMiddleware,
      notificationMiddleware
    ]);
    
    setMiddlewarePipeline(() => pipeline);
  }, [storeConfig, handleStoreError]);

  // Plugin-aware operation execution
  const executeWithPlugins = useCallback(async <R,>(operation: string, payload: any): Promise<R> => {
    if (!middlewarePipeline) {
      throw new Error('Middleware pipeline not initialized');
    }

    // Execute through plugin middleware pipeline
    const context = {
      operation,
      payload,
      store: storeRef.current,
      timestamp: new Date(),
      plugins: plugins.map(p => p.name)
    };

    return await middlewarePipeline(context, async (ctx) => {
      // Core operation execution
      return await operations.executeCoreOperation(operation, ctx.payload);
    });
  }, [middlewarePipeline, plugins, operations]);

  // === 6. STATE SYNCHRONIZATION LOGIC (100 lines) ===

  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    conflicts: [],
    syncStrategy: storeProps?.config?.syncStrategy || 'optimistic'
  });

  // Real-time synchronization manager
  const synchronizationManager = useRef(new SynchronizationManager({
    strategy: syncState.syncStrategy,
    conflictResolver: storeConfig?.conflictResolution,
    onConflict: (conflicts) => handleSyncConflicts(conflicts),
    onSyncComplete: (result) => handleSyncComplete(result)
  }));

  // Conflict resolution logic
  const handleSyncConflicts = useCallback(async (conflicts: SnapshotConflict<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    setSyncState(prev => ({ ...prev, conflicts }));
    
    if (conflicts.length === 0) return;

    try {
      const resolutionStrategy = storeConfig?.conflictResolution?.strategy || 'last-write-wins';
      const resolved = await conflictResolver.resolve(conflicts, {
        strategy: resolutionStrategy,
        userPreferences: await getUserMergePreferences(),
        storeConfig
      });

      await operations.applyResolvedConflicts(resolved);
      
      setSyncState(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => !resolved.some(r => r.conflictId === c.id))
      }));
    } catch (error) {
      handleStoreError(error as Error, 'conflict-resolution');
    }
  }, [storeConfig, operations, handleStoreError]);

  // Background synchronization
  useEffect(() => {
    if (!storeConfig?.options.backgroundSync || !isInitialized) return;

    const syncInterval = setInterval(async () => {
      if (syncState.isSyncing) return; // Don't overlap sync operations
      
      setSyncState(prev => ({ ...prev, isSyncing: true }));
      
      try {
        await synchronizationManager.current.sync(storeRef.current!);
      } catch (error) {
        handleStoreError(error as Error, 'background-sync');
      } finally {
        setSyncState(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
      }
    }, storeConfig.options.backgroundSync.interval || 30000);

    return () => clearInterval(syncInterval);
  }, [storeConfig?.options.backgroundSync, isInitialized, syncState.isSyncing, handleStoreError]);

  // === 7. MEMORY MANAGEMENT & CLEANUP (50 lines) ===

  const [memoryState, setMemoryState] = useState<MemoryState>({
    totalSnapshots: 0,
    memoryUsage: 0,
    lastCleanup: null
  });

 // Extract storeProps
  const {
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    expirationDate,
    initialState,
    payload,
    callback,
    endpointCategory
  } = storeProps || {};

  // === Integrated addSnapshot with Event System ===
  const addSnapshot = useCallback(async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    const projectId = `project-${snapshot.id || Date.now()}`;
    try {
      
      // Log project operation start
      ProjectLogger.logProjectCreation(
        projectId,
        `Snapshot Project ${snapshot.id}`,
        ProjectPhase.PHASE_1,
        userId,
        {
          snapshotId: snapshot.id,
          snapshotType: snapshot.type,
          storeId: storeProps?.storeId
        }
      );
      
      // Step 1: Convert snapshot to project data
      const conversionResult = projectManager.current.importSnapshotAsProject(snapshot, projectId);
      
      if (!conversionResult.success) {
        throw new Error(`Failed to convert snapshot to project: ${conversionResult.error}`);
      }
      const projectData = conversionResult.projectData!;

      await persistence.saveSnapshot(snapshot);
      await reduxIntegration.snapshotOperations.addSnapshot(snapshot);
  
      
      const defaultImplementation = (): void => {
        console.log("Default implementation - Method not provided.");
      };

      const resolvedDelegate = await delegate(); // Resolve the promise

      // Convert dataStoreMethods
      const dataStoreMethods = snapshot.store?.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

      const data = {} as Map<string, Snapshot<any, any>>;
      const newSnap = {} as Snapshot<any, any>;

      const newSnapshotStore = new SnapshotStore<any>({
        storeId,
        name,
        version,
        schema,
        options,
        category,
        config,
        operation,
        expirationDate, 
        initialState,
        payload, 
        callback, 
        storeProps, 
        endpointCategory,
      });

      const dataStore = newSnapshotStore.getDataStore();

      // Add the new snapshot to the list (example usage)
      const subscriptionResult = await addToSnapshotList(newSnap, []);

      // Update the state synchronously
      setSnapshots((currentSnapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => {
        if (!currentSnapshots) {
          return new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            snapshots: [snapshot], // Use the provided snapshot
            expirationDate,
            payload, 
            callback, 
            storeProps, 
            endpointCategory, 
            initialState
          });
        }

        if (payload?.error) {
          ProjectLogger.logProjectError(
            projectId,
            "SNAPSHOT_PAYLOAD_ERROR",
            "Error found in snapshot payload",
            {
              snapshotId: snapshot.id,
              error: payload.error,
              phase: ProjectPhase.PHASE_1
            }
          );
        }

        if (payload?.meta) {
          console.error("An error occurred:", payload.meta);
        } else {
          console.log("No error found.");
        }

        return new SnapshotStore<BaseData>({
          storeId: currentSnapshots.storeId?.toString() || "",
          name: currentSnapshots.getName(),
          schema: currentSnapshots.getSchema(),
          version: currentSnapshots.getVersion(),
          options: currentSnapshots.options,
          category: currentSnapshots.category,
          config: currentSnapshots.getConfig(),
          operation: currentSnapshots.operation,
          snapshots: [...currentSnapshots.snapshots, snapshot], // Add the new snapshot
          expirationDate: new Date(),
          payload: {
            error: currentSnapshots.getPayload()?.error ?? undefined,
            meta: currentSnapshots.getPayload()?.meta ?? undefined,
            projectData: conversionResult.projectData
          },
          callback: (data: BaseData) => {
            defaultImplementation();
          },
          storeProps: {},
          endpointCategory: "",
        });
      });


      // Step 5: Log successful project creation
      ProjectLogger.logPhaseTransition(
        projectId,
        `Snapshot Project ${snapshot.id}`,
        ProjectPhase.PHASE_1,
        ProjectPhase.PHASE_2,
        userId,
        {
          tasksCompleted: projectData.tasks.filter(t => t.completed).length,
          tasksTotal: projectData.tasks.length,
          conversionSuccess: true
        }
      );

      // === EVENT SYSTEM INTEGRATION - Success Case ===
      await eventSystem.emitSnapshotAdded(snapshot, {
        userId: userId,
        source: 'addSnapshot',
        timestamp: new Date().toISOString(),
        operation: 'create',
        storeId: storeId,
        success: true,
        subscriptionId: subscriptionResult?.id,
        projectId: projectId,
        projectPhase: ProjectPhase.PHASE_2
      });

      // Notify success
      notifications.showSuccess('Snapshot added successfully');

      return snapshot;

    } catch (error) {


      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // === PROJECT ERROR LOGGING ===
      ProjectLogger.logProjectError(
        projectId,
        "SNAPSHOT_ADD_FAILED",
        `Failed to add snapshot: ${errorMessage}`,
        {
          snapshotId: snapshot.id,
          userId: userId,
          storeId: storeId,
          phase: ProjectPhase.PHASE_1,
          stackTrace: error instanceof Error ? error.stack : undefined
        }
      );

      // === EVENT SYSTEM INTEGRATION - Error Case ===
      await eventSystem.emitError(error as Error, {
        userId: userId,
        source: 'addSnapshot',
        timestamp: new Date().toISOString(),
        operation: 'create',
        storeId: storeId,
        snapshotId: snapshot.id
      });

      // Notify error
      notifications.showError(`Failed to add snapshot: ${(error as Error).message}`);
      
      throw error;
    }
  }, [
    eventSystem, 
    userId, 
    addToSnapshotList,
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    expirationDate,
    initialState,
    payload,
    callback,
    endpointCategory,
    notifications,
    projectManager.current
  ]);

  // === Event Listener Setup ===
  useEffect(() => {
    if (!eventSystem) return;

    const handleSnapshotAdded = async (event: any) => {
      console.log('Snapshot added event received:', event);
      
      // Update local state if needed based on external events
      if (event.context.source !== 'addSnapshot') { // Avoid double handling
        setSnapshots(prev => [...prev, event.snapshot]);
      }
      
      // Auto-convert external snapshots to projects
      if (event.context.source === 'external') {
        try {
          const projectId = `external-project-${event.snapshot.id}`;
          const conversionResult = await projectManager.current.importSnapshotAsProject(
            event.snapshot, 
            projectId
          );
          
          if (conversionResult.success) {
            ProjectLogger.logSnapshotConversion(
              projectId,
              event.snapshot.id,
              'import',
              true,
              {
                source: 'external',
                convertedTasks: conversionResult.projectData?.tasks.length
              }
            );
          }
        } catch (error) {
          ProjectLogger.logProjectError(
            `external-project-${event.snapshot.id}`,
            "EXTERNAL_SNAPSHOT_CONVERSION_FAILED",
            "Failed to convert external snapshot to project",
            {
              snapshotId: event.snapshot.id,
              source: 'external'
            }
          );
        }
      }
  
      notifications.notify('SNAPSHOT_ADDED', {
        snapshotId: event.snapshot.id,
        userId: event.context.userId,
        timestamp: event.context.timestamp,
        source: event.context.source,
        projectId: event.context.projectId
      });
    };

    const handleError = (event: any) => {
      console.error('Error event received:', event);
      
      if (event.context.source === 'addSnapshot') {
            ProjectLogger.logProjectError(
          event.context.projectId || 'unknown-project',
          "SNAPSHOT_OPERATION_ERROR",
          `Snapshot operation failed: ${event.error.message}`,
          {
            snapshotId: event.context.snapshotId,
            operation: event.context.operation,
            userId: event.context.userId
          }
        );
        
        notifications.showError(`Snapshot operation failed: ${event.error.message}`);
      }
    };

    // Subscribe to events
    const addedListenerId = eventSystem.onSnapshotAdded(handleSnapshotAdded);
    const errorListenerId = eventSystem.onError(handleError);

    // Cleanup
    return () => {
      eventSystem.removeListener('snapshot:added', addedListenerId);
      eventSystem.removeListener('error', errorListenerId);
    };
  }, [eventSystem, notifications]);


  // Automatic memory cleanup
  useEffect(() => {
    if (!storeConfig?.autoCleanup) return;

    const cleanupOrphanedSnapshots = () => {
      const orphaned = findOrphanedSnapshots(snapshots, storeRef.current?.getReferenceMap() || new Map());
      if (orphaned.length > 0) {
        operations.removeSnapshots(orphaned);

         // Log cleanup operation
        ProjectLogger.logBatchOperation(
          "orphaned_snapshot_cleanup",
          orphaned.length,
          orphaned.length, // Assume all successful for simplicity
          0,
          "system",
          undefined
        );
        console.log(`Cleaned up ${orphaned.length} orphaned snapshots`);
      }
    };

    const memoryMonitor = setInterval(() => {
      // Monitor memory usage
      const currentMemory = performance.memory?.usedJSHeapSize || 0;
      setMemoryState(prev => ({
        totalSnapshots: snapshots.length,
        memoryUsage: currentMemory,
        lastCleanup: prev.lastCleanup
      }));

      // Trigger cleanup if memory usage is high
      if (currentMemory > (storeConfig?.options.memoryThreshold || 50000000)) { // 50MB
        cleanupOrphanedSnapshots();
        setMemoryState(prev => ({ ...prev, lastCleanup: new Date() }));


        // Log memory pressure event
        ProjectLogger.logProjectError(
          "system-maintenance",
          "MEMORY_PRESSURE",
          "High memory usage triggered cleanup",
          {
            memoryUsage: currentMemory,
            threshold: storeConfig?.options.memoryThreshold || 50000000,
            snapshotsCount: snapshots.length,
            cleanedCount: 0 // Would need to track actual cleaned count
          }
        );
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(memoryMonitor);
  }, [snapshots, storeConfig, operations]);


    // === PROJECT MANAGEMENT INTEGRATION METHODS ===
  const getProjectManager = useCallback(() => {
    return projectManager.current;
  }, [projectManager.current]);

  const convertSnapshotToProject = useCallback(async (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    projectId?: string
  ) => {
    return await projectManager.current.importSnapshotAsProject(snapshot, projectId);
  }, [projectManager.current]);

  const getProjectStatistics = useCallback((projectId: string) => {
    return projectManager.current.getProjectStatistics(projectId);
  }, [projectManager.current]);




  // === REST OF THE HOOK LOGIC (from previous version) ===
  // [Previous useEffect, state management, and public API code would go here]

  useEffect(() => {
    storeRef.current = new SnapshotStore(props);
    storeRef.current.mount();
    const payload: SubscriptionPayloadActions = {
      id: "unique_id",
      subscriberId: "unique_id",
      email: "<EMAIL>",
      value: 100,
      category: "category",
      notify: (message: string) => {},
      content: "",
      date: new Date(),
      subscribers: [],
      
      notifyEventSystem: notifyEventSystem,
      updateProjectState: updateProjectState,
      logActivity: logActivity,
      triggerIncentives: triggerIncentives,
      name: undefined,
      data: undefined,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      toSnapshotStore: undefined,
      getId: undefined,
      getUserId: undefined,
      receiveSnapshot: undefined,
      getState: undefined,
      onError: undefined,
      triggerError: undefined,
      onUnsubscribe: undefined,
      onSnapshot: undefined,
      triggerOnSnapshot: triggerOnSnapshot,
      subscriber: undefined,
    };

    const takeSnapshot = async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      const snapshotUrl = `${SNAPSHOT_URL}/snapshot`;
      const response = await fetch(snapshotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshot),
      });
      const data = await response.json();
      console.log(data);
    };
    // Create a new Subscriber instance with the required arguments
    const subscriber = new Subscriber<CustomSnapshotData<T, K, Meta, Attachment, ExcludedFields>, Data<T, K, Meta, Attachment, ExcludedFields>>(
      payload.id, // Replace 'unique_id' with the actual subscriber ID
      payload.name,
      {
        subscriberId: "subscriber_id", // Replace 'subscriber_id' with the actual subscriber ID
        subscriberType: SubscriberTypeEnum.FREE, // or appropriate value
        subscriptionType: SubscriptionTypeEnum.Snapshot, // or appropriate value
        getPlanName: () => SubscriberTypeEnum.FREE, // or appropriate function
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => {},
        triggerIncentives: () => {},
        unsubscribe: (subscriberId: string) => {},
        determineCategory: (data) => data.category,
        portfolioUpdatesLastUpdated: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
        subscribers: [], 
        data: {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
        getSubscriptionLevel: getSubscriptionLevel,

      },
      "subscriber_id", // Replace 'subscriber_id' with the actual subscriber ID
      notifyEventSystem, // Replace with your actual function
      updateProjectState, // Replace with your actual function
      logActivity, // Replace with your actual function
      triggerIncentives, // Replace with your actual function
      {
        email: "<EMAIL>", // Replace '<EMAIL>' with the subscriber's email
        timestamp: new Date(),
        value: 100, // Replace with the appropriate value
        category: "category", // Replace 'category' with the appropriate value or leave empty string if not applicable
      }
    );

    subscribe();

    return () => {
      const subscriberId = subscriber.id!;
      unsubscribe(subscriberId);
      };
    }, [
    notifyEventSystem,
    updateProjectState,
    logActivity,
    triggerIncentives,
    subscribe,
    unsubscribe,

  ]);
  // Combine all state and functionality into public API
  const publicAPI = useMemo(() => ({
    // Core state
    snapshots: optimizedSnapshots,
    isInitialized,
    store: storeRef.current,
    
    // Configuration and status
    config: storeConfig,
    errorState,
    syncState,
    performanceState,
    memoryState,

    // Core operations
    addSnapshot,
    
    // Event system access
    eventSystem,
    
    // Subscription management
    subscribe: subscriptions.subscribe,
    unsubscribe: subscriptions.unsubscribe,
    getSubscribers: subscriptions.getSubscribers,
  
    // Enhanced operations with plugins
    addSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => 
    executeWithPlugins('addSnapshot', snapshot),
    updateSnapshot: (id: string, updates: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) =>
    executeWithPlugins('updateSnapshot', { id, updates }),
    

    updateSnapshot: async (id: string, updates: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
      try {
        // Your update logic here
        await eventSystem.emitSnapshotUpdated(updates, {
          userId,
          source: 'updateSnapshot',
          snapshotId: id,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await eventSystem.emitError(error as Error, {
          userId,
          source: 'updateSnapshot',
          snapshotId: id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    },
    
    removeSnapshot: async (snapshotId: string) => {
      try {
        // Your remove logic here
        await eventSystem.emitSnapshotRemoved(snapshotId, {
          userId,
          source: 'removeSnapshot',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await eventSystem.emitError(error as Error, {
          userId,
          source: 'removeSnapshot',
          snapshotId: snapshotId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    },
    
    // ... rest of API
  }), [
    // === STATE DEPENDENCIES ===
    optimizedSnapshots,           // Memoized snapshot data
    isInitialized,                // Initialization status
    storeConfig,                  // Store configuration
    errorState,                   // Error handling state
    syncState,                    // Synchronization state
    performanceState,             // Performance metrics
    memoryState,                  // Memory management state
    

    // === PROJECT DEPENDENCIES ===
    getProjectManager,
    convertSnapshotToProject,
    getProjectStatistics,
    // === FUNCTION DEPENDENCIES ===
    executeWithPlugins,           // Plugin-aware operation executor
    operations.addSnapshot,       // Core add operation
    operations.updateSnapshot,    // Core update operation
    operations.removeSnapshot,    // Core remove operation
    operations.clearSnapshots,    // Core clear operation
    operations.takeSnapshot,      // Snapshot capture
    operations.takeSnapshots,     // Batch snapshot capture
    operations.batchUpdate,       // Batch operations
    operations.findSnapshot,      // Search functionality
    operations.filterSnapshots,   // Filtering
    operations.sortSnapshots,     // Sorting
    
    // === SUBSCRIPTION DEPENDENCIES ===
    subscriptions,
    subscriptions.subscribe,      // Subscription management
    subscriptions.unsubscribe,    // Unsubscription
    subscriptions.getSubscribers, // Subscriber access
    subscriptions.initialize,     // Subscription setup
    subscriptions.cleanup,        // Subscription cleanup

    // === NOTIFICATION DEPENDENCIES ===
    notifications.notify,         // General notifications
    notifications.showError,      // Error display
    notifications.showSuccess,    // Success messages
    notifications.showRecoveryAttempt, // Recovery notifications
    
    // === STORE INSTANCE DEPENDENCIES ===
    storeRef.current,             // Store instance reference
    
    // === VALIDATION DEPENDENCIES ===
    validateGenericConstraints,   // Type validation
    transformGenericData,         // Data transformation
    
    // === PERFORMANCE DEPENDENCIES ===
    debouncedBatchUpdate,         // Debounced operations
    
    // === PLUGIN DEPENDENCIES ===
    plugins,                      // Loaded plugins
    middlewarePipeline,           // Middleware chain
    
    // === SYNCHRONIZATION DEPENDENCIES ===
    synchronizationManager.current, // Sync manager
    handleSyncConflicts,          // Conflict resolution
    
    // === ERROR HANDLING DEPENDENCIES ===
    handleStoreError,             // Error recovery
    attemptStoreRecovery,         // Recovery attempts
    
    // === MEMORY MANAGEMENT DEPENDENCIES ===
    memoryState.totalSnapshots,   // Snapshot count for cleanup
    
    // === CONFIGURATION DEPENDENCIES ===
    storeProps?.storeId,          // Store identifier (for re-initialization)
    storeProps?.config,           // Configuration changes
    storeProps?.options,          // Options changes
    
    // === GENERIC TYPE DEPENDENCIES ===
    // Note: These are tricky with generics - we need to handle them carefully
    JSON.stringify(storeProps?.initialState), // Deep comparison for initialState
    storeProps?.schema,           // Schema definition
    storeProps?.category,         // Category changes
    storeProps?.operation,        // Operation mode
    
    // === EXTERNAL DEPENDENCIES ===
    addToSnapshotList,            // External callback function
    eventSystem,
    id
  ]);
  return publicAPI;
};

export { useSnapshotStore };
export type { SnapshotStoreOptions, SnapshotStoreProps };

const { storeProps } = store

// However, for complex objects, we might need more specific dependencies:
const specificDependencies = [
  // Instead of storeProps, use specific properties:
  storeProps?.storeId,
  storeProps?.name,
  storeProps?.version,
  storeProps?.expirationDate?.getTime(), // Convert date to number for comparison
  
  // For complex config objects, use deep comparison or specific fields:
  storeProps?.config?.persistence?.enabled,
  storeProps?.config?.validation?.strict,
  storeProps?.config?.plugins?.length,
  
  // For initialState, we might need a deep equality check:
  useDeepCompareMemoize(storeProps?.initialState),
  
  // For functions, we need to ensure stability:
  useCallbackRef(addToSnapshotList),
];


// // Create the snapshot store
// const useSnapshotStore = <
//   T extends BaseDataEntity,
//   K extends T = T,
//   Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
//   AttachmentType extends Attachment = Attachment,
//   ExcludedFields extends keyof T = DefaultExcludedFields<T>,
//   IncludedFields extends keyof T = keyof T
// >(
//   addToSnapshotList: (
//     snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//     storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//   ) => Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  
//   storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
// ): Promise<SnapshotStore<any>> => {
//   const [subscribers, setSubscribers] = useState<Subscriber<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]>([]);
  
//     const storeRef = useRef<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  
//   if(!storeProps){
//     throw new Error("SnapshotStoreProps not provided");
//   }

//   const {
//     storeId,
//     name,
//     version,
//     schema,
//     options,
//     category,
//     config,
//     operation,
//     expirationDate, payload, callback, 
//     endpointCategory, findIndex,
//     initialState
//   } = storeProps;

//   // Initialize state for snapshots
//   const [snapshots, setSnapshots] = useState<SnapshotStore<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>(
//     () => new SnapshotStore<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>({
//       storeId,
//       initialState,
//       name,
//       version,
//       schema,
//       options,
//       category,
//       config,
//       operation,
//       expirationDate, payload, callback, storeProps, 
//       endpointCategory, findIndex
//     })
//   );


//   const addSnapshot = async (snapshot: Snapshot<any, any>) => {
//     const defaultImplementation = (): void => {
//       console.log("Default implementation - Method not provided.");
//     };

//     const resolvedDelegate = await delegate(); // Resolve the promise

    
//     // Convert dataStoreMethods
//     const dataStoreMethods =
//       snapshot.store?.getDataStoreMethods() as DataStoreWithSnapshotMethods<
//         T,
//         K
//       >;

//     const data = {} as Map<string, Snapshot<any, any>>;

//     const newSnap = {} as Snapshot<any, any>;

//     const newSnapshotStore = new SnapshotStore<any>({
//       storeId,
//       name,
//       version,
//       schema,
//       options,
//       category,
//       config,
//       operation,
//       expirationDate, 
//       initialState,
//       payload, callback, storeProps, endpointCategory,
//     });

//     const dataStore = newSnapshotStore.getDataStore();

//     // Add the new snapshot to the list (example usage)
//     addToSnapshotList(newSnap, []);

//     // Update the state synchronously
//     setSnapshots((currentSnapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => {
//       if (!currentSnapshots) {
//         return new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
//           storeId,
//           name,
//           version,
//           schema,
//           options,
//           category,
//           config,
//           operation,
//           snapshots: [newSnapshot], // Add the new snapshot to the store
//           expirationDate,
//           payload, callback, storeProps, endpointCategory, initialState
//         });
//       }


//       if (payload?.error) {
//         console.error("An error occurred:", payload.error);
//       } else {
//         console.log("No error found.");
//       }

//       if (payload?.meta) {
//         console.error("An error occurred:", payload.meta);
//       } else {
//         console.log("No error found.");
//       }


//       return new SnapshotStore<BaseData>({
//         storeId: currentSnapshots.storeId?.toString() || "",
//         name: currentSnapshots.getName(),
//         schema: currentSnapshots.getSchema(),
//         version: currentSnapshots.getVersion(),
//         options: currentSnapshots.options,
//         category: currentSnapshots.category,
//         config: currentSnapshots.getConfig(),
//         operation: currentSnapshots.operation,
//         snapshots: [...currentSnapshots.snapshots, newSnapshot], // Add the new snapshot
//         expirationDate: new Date(),
//         payload: {
//           error: currentSnapshots.getPayload()?.error ?? undefined,
//           meta: currentSnapshots.getPayload()?.meta ?? undefined,
//         },
//         callback: (data: BaseData) => {
//           defaultImplementation();
//         },
//         storeProps: {},
//         endpointCategory: "",
//       });
//     });

//   };
//   // Subscribe to live events using useSubscription hook
//   const { subscribe, unsubscribe } = useSubscription({
//     channel: "your_channel_here",
//     onLiveEvent: (event: LiveEvent) => {
//       const payload = event.payload;
  
//       // Handle errors in the payload
//       if (payload.error) {
//         const errorLogType = "Error";
//         const errorMessage = `Received error in payload: ${payload.error}`;
//         SnapshotLogger.log(errorLogType, errorMessage);
//         return;
//       }
  
//       // Log the payload
//       const payloadLogType = "Payload";
//       const payloadMessage = "Received new snapshot payload";
//       SnapshotLogger.log(payloadLogType, payloadMessage, payload);
  
//       const dispatch = useDispatch();
//       const snapshot = payload.data;
  
//       // Determine the type of operation based on the scenario (e.g., replacing or appending)
//       const isAppendingSnapshot = true; // This can be set based on your app's logic
//       const snapshotsArray = [snapshot]; // Single snapshot to be added
  
//       const actions = SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

//       if (isAppendingSnapshot) {
//         // Conditionally dispatch based on the expected behavior of setSnapshots
//         setSnapshots((prevSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => [...prevSnapshots, ...snapshotsArray]);
//         // Dispatch action to update Redux state
//         dispatch(actions.updateSnapshots([...snapshots, ...snapshotsArray]));
//       } else {
//         // If we're replacing the entire snapshot list, just dispatch the new snapshots
//         setSnapshots(snapshotsArray);
//         // Dispatch action to replace Redux state
//         dispatch(actions.updateSnapshots(snapshotsArray));
//       }
  
//       // If you need to update the snapshot list with subscribers
//       addToSnapshotList(snapshot, subscribers); 
//     },
//     enabled: true, // Enable subscription
//   });  
//   const [project, setProject] = useState<Project>();
  


// ***** TODO move useEffect from her ***** //
//   const dispatch = useDispatch();
//   const { notify } = useNotification();
//   const notificationContext = useNotification();
//   const userId = useSecureUserId();

//   const id = "unique_notification_id";
//   const message = "New snapshot created successfully!";
//   const content = "Details of the new snapshot";
//   const date = new Date(); // Current date and time
//   const type: NotificationType = NotificationTypeEnum.SUCCESS;
//   let currentState: any = null;

//   // Define or initialize newData (placeholder)
//   const newData: Data = {
//     id: "new-id",
//     name: "New Name",
//     value: "New Value",
//     timestamp: new Date(),
//     category: "New Category",
//   };

//   // Example usage:
//   const newSnapshot = await createCompleteSnapshot(
//     content.data,
//     new Map(), // baseMeta - you might want to pass actual metadata
//     UniqueIDGenerator.generateSnapshotID(),
//     storeProps.category,
//     storeRef.current,
//     null, // snapshotManager - you might want to pass this
//     storeProps.config,
//     false, // isSubscribed
//     storeProps
//   );

//   const flatMap = () => {
//     const flatMap = (
//       snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//     ) => {
//       snapshots.forEach((snapshot) => {
//         callback(snapshot);
//       });
//     };
//     if (snapshots && Array.isArray(snapshots)) {
//       flatMap(snapshots, (snapshot) => {
//         console.log(snapshot);
//       });
//     }
//     console.log("Flat map complete");
//     return;
//   };

//   addSnapshot(newSnapshot);

//   const updateSnapshot = async (snapshotIdToUpdate: string, newData: Data) => {
//     return new Promise((resolve, reject) => {
//       try {
//         snapshotApi
//           .fetchSnapshotById(snapshotIdToUpdate)
//           .then((snapshotToUpdate) => {
//             if (snapshotToUpdate) {
//               snapshotToUpdate.data = newData;
//               snapshotToUpdate.timestamp = new Date();
//               console.log(
//                 `Snapshot ${snapshotIdToUpdate} updated successfully.`
//               );
//               resolve(snapshotToUpdate);
//             } else {
//               const message = `Snapshot ${snapshotIdToUpdate} not found.`;
//               console.warn(message);
//               resolve(message);
//             }
//           })
//           .catch((error) => {
//             console.error(
//               `Error updating snapshot ${snapshotIdToUpdate}:`,
//               error
//             );
//             reject(error);
//           });
//       } catch (error) {
//         console.error(`Error updating snapshot ${snapshotIdToUpdate}:`, error);
//         reject(error);
//       }
//     });
//   };

//   // Function to remove a snapshot
//   const removeSnapshot = (snapshotToRemove: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     if (snapshots) {
//       const updatedSnapshots = snapshots.filter(
//         (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.id !== snapshotToRemove.id
//       );
//       if (updatedSnapshots.length < snapshots.length) {
//         setSnapshots(updatedSnapshots);
//         console.log(`Snapshot ${snapshotToRemove.id} removed successfully.`);
//       } else {
//         console.warn(`Snapshot ${snapshotToRemove.id} not found.`);
//       }
//     }
//   };

//   const clearSnapshots = () => {
//     setSnapshots([]);
//   }; // Function to notify subscribers

//   const notifySubscribers = async (
//     subscribers: Subscriber<CustomSnapshotData<T, K, Meta, Attachment, ExcludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[], // Accept both Data and CustomSnapshotData
//     notify: NotificationContextType["notify"],
//     id: string,
//     notification: NotificationData,
//     date: Date,
//     content?: string | Content<T>,
//     type?: string
//   ): Promise<void> => {
//     // Iterate over each subscriber
//     for (const subscriber of subscribers) {
//       // Customize notification message if needed
//       const personalizedMessage = `${notification.message} - Sent to: ${
//         subscriber.getData()?.name ?? ""
//       } (${subscriber.getData()?.email ?? ""})`;

//       // Check if the subscriber data type is CustomSnapshotData
//       if (
//         subscriber.getData()?.data &&
//         "category" in subscriber.getData()?.data
//       ) {
//         // Convert CustomSnapshotData to Data
//         const data: Data = {
//           email: subscriber.getData()?.data.email ?? "",
//           timestamp: subscriber.getData()?.data.timestamp ?? 0,
//           value: subscriber.getData()?.data.value ?? "",
//           // Map other properties as needed
//         };

//         // Send notification to the subscriber
//         await notify(
//           subscriber.getSubscriberId(),
//           personalizedMessage,
//           data,
//           new Date(),
//           notification.type!
//         );
//       } else if (subscriber.getData()?.data) {
//         // Send notification to the subscriber using existing data
//         await notify(
//           subscriber.getSubscriberId(),
//           personalizedMessage,
//           subscriber.getData()?.data, // Assert type to Data
//           new Date(),
//           notification.type!
//         );
//       }
//     }
//   };

//   const addSnapshotSuccess = async (
//     snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     subscribers: Subscriber<CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields,  <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>[]
//   ) => {
//     // Notify subscribers
//     await notifySubscribers(
//       subscribers,
//       notify,
//       id,
//       {
//         id: id,
//         message: message,
//         content: content,
//         date: date,
//         type: type,
//         completionMessageLog: {
//           message: "Snapshot added successfully.",
//           date: new Date(),
//           timestamp: new Date().getTime(),
//           level: "info",
//           sent: new Date(),
//           isSent: false,
//           delivered: new Date(),
//           opened: new Date(),
//           clicked: new Date(),
//           responseTime: new Date(),
//           responded: false,
//           isDelivered: false,
//           eventData: {}, 
//           topics: [],
//           highlights: [],

//           files: [],
//           meta: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
         
//         },
//         topics: [],
//         highlights: [],
//         files: [],
//         rsvpStatus: "yes",
//         host: {} as Member,
//         participants: [],
//         teamMemberId: "",
//         meta: undefined,
//         getSnapshotStoreData: function (): Promise<
//           SnapshotStore<
//             SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             SnapshotWithCriteria<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>
//           >[]
//         > {
//           throw new Error("Function not implemented.");
//         },
//         getData: function <  T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T>(): Promise<
//           Snapshot<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]
//         > {
//           throw new Error("Function not implemented.");
//         },
//       },
//       date,
//       content,
//       type
//     );
//     console.log("Snapshot added successfully.");
//     return;
//   };

//   // Function to get subscribers
//   const getSubscribers = (
//     payload: SubscriptionPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//   ): Subscriber<CustomSnapshotData<T, K, Meta, Attachment, ExcludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] => {
//     // Implement logic to fetch subscribers from a database or an API
//     // For demonstration purposes, returning a mock list of subscribers
//     const subscribers: Subscriber<CustomSnapshotData<T, K, Meta, Attachment, ExcludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] = [];
//     const subscriberId = payload.getId();
//     const userId = useSecureUserId(); // Retrieve the user ID using the hook
//     // Create subscriber instances and push them into the array
//     const subscriber1 = new Subscriber<CustomSnapshotData<T, K, Meta, Attachment, ExcludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
//       payload.id,
//       payload.name,
//       {
//         subscriberId: subscriberId,
//         subscriberType: SubscriberTypeEnum.STANDARD,
//         subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
//         getPlanName: () => SubscriberTypeEnum.STANDARD,
//         portfolioUpdates: () => {},
//         tradeExecutions: () => {},
//         marketUpdates: () => {},
//         communityEngagement: () => {},
//         triggerIncentives: () => {},
//         unsubscribe: (subscriberId: string) => {},
//         determineCategory: (data: any) => data,
//         portfolioUpdatesLastUpdated: {
//           value: new Date(),
//           isModified: false,
//         } as ModifiedDate,
//       },
//       subscriberId,
//       notifyEventSystem,
//       updateProjectState,
//       logActivity,
//       triggerIncentives,
//       {
//         email: "john@example.com",
//         timestamp: new Date(),
//         value: 42,
//         category: "",
//       }
//     );

//     const subscriber2 = new Subscriber<CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
//       payload.id,
//       payload.name,
//       {
//         subscriberId: subscriberId,
//         subscriberType: SubscriberTypeEnum.STANDARD,
//         subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
//         getPlanName: () => SubscriberTypeEnum.STANDARD,
//         portfolioUpdates: () => {},
//         tradeExecutions: () => {},
//         marketUpdates: () => {},
//         communityEngagement: () => {},
//         triggerIncentives: () => {},
//         determineCategory: (data: any) => data,
//         unsubscribe: (subscriberId: string) => {},
//         portfolioUpdatesLastUpdated: {
//           value: new Date(),
//           isModified: false,
//         } as ModifiedDate,
//       },
//       subscriberId,
//       notifyEventSystem,
//       updateProjectState,
//       logActivity,
//       triggerIncentives,
//       {
//         email: "jane@example.com",
//         timestamp: new Date(),
//         value: 42,
//         category: "example-category",
//       }
//     );

//     subscribers.push(subscriber1, subscriber2);

//     return subscribers;
//   };

//   // Usage example
//   // const subscribers = getSubscribers()
//   const notification: NotificationData = {
//     id: "notification-id", // Provide a unique identifier
//     message: "Notification message",
//     content: "Notification content",
//     type: NotificationTypeEnum.INFO,
//     sendStatus: false, // Assuming sendStatus indicates whether the notification was sent
//     completionMessageLog: {
//       timestamp: new Date(),
//       level: "0",
//       message: "Notification message",
//       date: new Date(),
//     },
//     topics: [],
//     highlights: [],
//     files: [],
//     rsvpStatus: "yes",
//     host: {} as Member,
//     participants: [],
//     teamMemberId: "",
//     meta: undefined,
//     getSnapshotStoreData: function <T extends BaseDataEntity, 
//     K extends T = T, 
//     Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
//     >(): Promise<
//       SnapshotStore<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, SnapshotWithCriteria<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>>[]
//     > {
//       throw new Error("Function not implemented.");
//     },
//     getData: function <  T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T>(): Promise<
//       Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//     > {
//       throw new Error("Function not implemented.");
//     },
//   };

//   const convertedSubscribers = subscribers.map(
//     convertSubscriptionPayloadToSubscriber
//   );

//   await notifySubscribers(
//     convertedSubscribers,
//     notify,
//     id,
//     notification,
//     date,
//     content,
//     type
//   );

//   const snapshotId = UniqueIDGenerator.generateSnapshotID();

//   const convertSnapshotToProject = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Project => {
//     return {
//       id: snapshot.id!.toString(),
//       data: snapshot.data as ProjectData,
//       timestamp: snapshot.timestamp,
//       category: snapshot.category,
//       type: snapshot.type as ProjectType,
//       phase: snapshot.phase!,
//       name: "",
//       description: "",
//       members: [],
//       tasks: [],
//       status: "",
//       priority: "",
//       isActive: false,
//       leader: {
//         id: "",
//         username: "",
//         email: "",
//         avatarUrl: "",
//         role: UserRoles.Administrator,
//         isCurrent: false,
//         firstName: "",
//         lastName: "",
//         tier: "",
//         token: "",
//       } as Member,
//       budget: 0,
//       phases: [],
//       currentPhase: {
//         id: "",
//         name: "",
//         description: "",
//         subPhases: [],
//         duration: 0,
//         startDate: new Date(),
//         endDate: new Date(),
//         component: {} as FC<any>,
//       },
//       startDate: new Date(),
//       endDate: new Date(),
//     };
//   };

//   const updateSnapshotSuccess = (
//     snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     subscribers: Subscriber<CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]
//   ) => {
//     // Update the snapshot in the database or an API
//     // For demonstration purposes, updating the snapshot in the snapshots array
//     const snapshotIndex = snapshots.findIndex(
//       (snapshot) => snapshot.id === snapshot.id
//     );
//     snapshots[snapshotIndex] = snapshot;
//     // Notify subscribers
//     notifySubscribers(
//       subscribers,
//       notify,
//       id,
//       notification,
//       date,
//       content,
//       type
//     );
//     // Convert snapshot to project
//     const project = convertSnapshotToProject(snapshot);

//     // Update the project state
//     updateProjectState(
//       ProjectStateEnum.Snapshots,
//       snapshot.id!.toString(),
//       project,
//       content
//     );
//     // Log the activity
//     logActivity({
//       activityType: ActivityTypeEnum.Snapshot,
//       action: ActivityActionEnum.Create,
//       userId: "user_id", // Replace with actual user ID
//       date: new Date(),
//       snapshotId: snapshot.id!.toString(),
//     });
//   };

//   const createSnapshot = (
//     id: string,
//     subscribers: Subscriber<CustomSnapshotData<T>, Data<T>>[],
//     notify: NotificationContextType["notify"],
//     message: string,
//     notification: NotificationData,
//     content: any,
//     date: Date,
//     type: NotificationType
//   ) => {
//     const generateSnapshotID = () => {
//       return UniqueIDGenerator.generateSnapshotID();
//     };

//     const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
//       id: generateSnapshotID().toString(),
//       data: content,
//       timestamp: date,
//       category: type,
//       type: type,
//       events: {
//         eventRecords: {} as Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null,
//         callbacks: {} as Record<
//           string,
//           Array<(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void>
//         >,
//         subscribers: [] as SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//         eventIds: [] as string[],
//         on: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
//           if (
//             !newSnapshot.events?.callbacks[event] &&
//             newSnapshot.events?.callbacks[event] !== undefined
//           ) {
//             newSnapshot.events.callbacks[event] = [];
//           }
//           newSnapshot.events?.callbacks[event].push(callback);
//         },
//         off: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
//           if (newSnapshot.events?.callbacks[event]) {
//             newSnapshot.events.callbacks[event] = newSnapshot.events?.callbacks[
//               event
//             ].filter((cb) => cb !== callback);
//           }
//         },
//         emit: (event: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//           if (newSnapshot.events?.callbacks[event]) {
//             newSnapshot.events?.callbacks[event].forEach((callback) =>
//               callback(snapshot)
//             );
//           }
//         },
//         once: (
//           event: string,
//           callback: (event: string, snapshot: Snapshot<TemplateStringsArray, K>) => void
//         ) => {
//           const onceCallback = (
//             snapshot: Snapshot<TemplateStringsArray, K>
//           ) => {
//             callback(event, snapshot);
//             newSnapshot.events?.off(snapshotId, event, onceCallback);
//           };
//           newSnapshot.events?.on(snapshotId, event, onceCallback);
//         },
//         removeAllListeners: (event?: string) => {
//           if (!newSnapshot.events) {
//             newSnapshot.events = {
//               callbacks: {},
//               subscribers: [],
//               trigger: ()=> {},
//               initialConfig: {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               eventRecords: {} as Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
//               records: {} as Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
//               eventIds: [],
//               onInitialize: () => {},
//               on: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) =>{},
//               off: (event: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshotId: string, unsubscribeDetails?: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; unsubscribeReason: string; unsubscribeData: any; } | undefined) =>{},
//               subscribe: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) =>{},
//               event: "",
//               unsubscribeDetails: {} as UnsubscribeDetails,
//               callback: {} as Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//            };
//           }

//           if (event && !newSnapshot.events?.callbacks[event]) {
//             newSnapshot.events.callbacks[event] = [];
//           } else {
//             newSnapshot.events.callbacks = {};
//           }
//         },
//         subscribe: (
//           event: string,
//           callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ) => {
//           newSnapshot.events.on(event, callback);
//         },
//         unsubscribe: (
//           event: string,
//           callback: (snapshot: Snapshot<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>) => void
//         ) => {
//           newSnapshot.events.off(snapshotId, event, callback);
//         },
//         trigger: (event: string, snapshot: Snapshot<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>) => {
//           newSnapshot.events.emit(event, snapshot);
//         },
//         eventsDetails: [] as CalendarManagerStoreClass<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>[] | undefined,
//       },
//       meta: {},
//       subscribers: subscribers,
//     };

//     // Add the new snapshot to the snapshots array
//     addSnapshot(newSnapshot);

//     // Notify subscribers or perform any other necessary actions
//     notifySubscribers(
//       convertedSubscribers,
//       notify,
//       id,
//       notification,
//       date,
//       type
//     );

//     // Call the success callback with the newly created snapshot
//     createSnapshotSuccess(newSnapshot);
//   };
//   const configureSnapshotStore = (subscriber: SubscriptionPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     const subscribers = getSubscribers(subscriber);
//     const notify = (
//       id: string,
//       notification: WritableDraft<NotificationData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
//       date: Date,
//       content: any,
//       type: NotificationType
//     ) => {
//       // Add the notification to the notifications array
//       addNotification(notification);
//       // Example: Initializing any required variables or setting up connections
//       console.log("Snapshot store configured successfully.");
//     };
//   };

//   // This function takes an existing snapshot and updates its data
//   const updateExistingSnapshot = (
//     existingSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     newData: Data
//   ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
//     // Assuming newData is an object with updated data
//     const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
//       ...existingSnapshot, // Copy existing snapshot properties
//       data: newData, // Update data with new data
//       timestamp: new Date(), // Update timestamp to indicate modification time
//     };
//     return updatedSnapshot;
//   };

//   // Define the updatedData
//   const updatedData: Data = {
//     id: "updated-id",
//     name: "Updated Name",
//     value: "Updated Value",
//     timestamp: new Date(),
//     category: "Updated Category",
//     // Add other properties if needed
//   };

//   // Assuming you have the ID of the snapshot you want to update
//   const snapshotIdToUpdate = "123";

//   // Fetch the existing snapshot from the database
//   const existingSnapshot = snapshotApi.fetchSnapshotById(snapshotIdToUpdate);

//   if (existingSnapshot) {
//     // Assuming you have some updated data
//     const updatedData: Data = {
//       id: "updated-id",
//       name: "Updated Name",
//       value: "Updated Value",
//       timestamp: new Date(),
//       category: "Updated Category",
//       // Add other properties if needed
//     };

//     // Update the existing snapshot with the new data
//     const updatedSnapshot = updateExistingSnapshot(
//       await existingSnapshot,
//       updatedData
//     );

//     // Now you can use the updatedSnapshot as needed
//     console.log("Updated Snapshot:", updatedSnapshot);
//   } else {
//     console.warn("Snapshot not found.");
//   }

//   const createSnapshotSuccess = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     // Perform any actions or UI updates required after successful snapshot creation
//     console.log("Snapshot created successfully:", snapshot);
//     // For example, update UI to reflect the newly created snapshot
//     updateUIWithNewSnapshot(snapshot);
//   };

//   const createSnapshotFailure = (error: Payload) => {
//     // Handle error logging or display error messages after failed snapshot creation
//     console.error("Snapshot creation failed:", error);
//     // For example, display an error message to the user or log the error for debugging

//     // Notify the user about failed snapshot creation
//     useNotification().showErrorNotification(
//       "SNAPSHOT_CREATION_FAILED",
//       "Failed to create snapshot. Please try again later.",
//       null
//     );
//   };
//   const updateUIWithNewSnapshot = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     // Assuming you have a state variable to store snapshots
//     // const [snapshots, setSnapshots] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);

//     // Update the state with the newly created snapshot
//     setSnapshots([...snapshots, snapshot]);

//     // Show a success notification to the user
//     useNotification().showSuccessNotification(
//       "Snapshot Created", // Provide an ID for the notification
//       {
//         text: "Snapshot created successfully!",
//         description: "Snapshot Created",
//       } as Message, // Provide a message object
//       "Details of the new snapshot", // Provide content
//       new Date(), // Provide the current date
//       NotificationTypeEnum.SUCCESS // Provide the notification type
//     );
//   };

//   const updateSnapshots = () => {
//     // Logic to update multiple snapshots
//     // This function can iterate over the existing snapshots and update them accordingly
//     snapshots.forEach((snapshot) => {
//       // Logic to update each snapshot
//       // For example, update the data or timestamp of each snapshot
//       snapshot.data = updatedData;
//       snapshot.timestamp = new Date();
//     });

//     // After updating all snapshots, perform any necessary actions
//     // Function to notify subscribers
//     const notifySubscribers = async (
//       notify: NotificationContextType["notify"],
//       id: string,
//       message: string,
//       content: any,
//       date: Date,
//       type: NotificationType
//     ) => {
//       // Assuming `notify` is a function provided by the notification context
//       await notify(id, message, content, date, type); // Call the notify function with the provided parameters
//     };

//     // Updated call to notifySubscribers with example arguments
//     notifySubscribers(
//       notify, // Pass the notify function
//       id,
//       message,
//       content,
//       date,
//       type
//     );

//     // Call the success callback to indicate successful snapshot updates
//     updateSnapshotsSuccess();
//     dispatch(SnapshotActions.batchTakeSnapshots({ snapshots: { snapshots } }));
//   };

//   const showErrorModal = (title: string, message: string) => {
//     // Assuming you have a modal component that displays the title and message
//     console.error(`Error: ${title}`, message);
//     // You can customize this function to display a modal in your UI framework
//   };

//   // Function to handle error logging or display error messages after failed snapshot update
//   const updateSnapshotFailure = (error: Error) => {
//     // Example: Display an error modal with the error message to the user
//     showErrorModal(
//       "Snapshot Update Failed",
//       `Failed to update snapshot: ${error.message}`
//     );
//     // Example: Log the error message to a remote logging service for further investigation
//     SnapshotLogger.logErrorToService(error);
//   };

//   // Function to handle actions or UI updates after successful batch snapshot updates
//   const updateSnapshotsSuccess = () => {
//     // Example: Show a success message indicating that batch updates were successful

//     showToast({ content: "Batch Updates Successful" });
//     showToast({ content: "Snapshots were successfully updated in batch." }); // Additional actions or UI updates can be added here
//     // For example, you can update the UI to reflect the changes made by batch updates
//   };

//   const updateSnapshotsFailure = (error: Error | { message: string }) => {
//     // Log the error to a logging service
//     console.error("Failed to update snapshots:", error);

//     // Display an error modal with the error message to the user
//     showErrorModal(
//       "Snapshot Update Failed",
//       `Failed to update snapshots: ${
//         error instanceof Error ? error.message : error
//       }`
//     );

//     // Log the error message to a remote logging service for further investigation
//     if (error instanceof Error) {
//       SnapshotLogger.logErrorToService(error);
//     } else {
//       const errorMessage = error.message;
//       SnapshotLogger.logErrorToService(new Error(errorMessage));
//     }

//     // Optionally, display an error message to the user
//     if (typeof showErrorMessage === "function") {
//       showErrorMessage("Failed to update snapshots. Please try again later.");
//     }
//   };

//   const snapshotStore: SnapshotStore<<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K> = {
//     // Initialize the snapshot data
//     snapshots: [],
//     config: {
//       snapshotId: "",
//       initialConfig: null,
//       initialState: {},
//       timestamp: new Date(),
//       state: [],
//       // handleSnapshot: handleSnapshot,
//       snapshots: [],
//       // snapshot: null,
//       subscribers: [],
//       category: "",
//       createSnapshot: createSnapshot,
//       configureSnapshotStore: configureSnapshotStore,
//     }, // Initialize the config object with appropriate initialConfig

//     // Function to initialize the snapshot
//     initSnapshot: async () => {
//       try {
//         // Perform initialization logic here, such as fetching initial snapshot data
//         // For example:
//         const initialSnapshotData = await fetchInitialSnapshotData();

//         // Update the snapshotData in the store
//         snapshotStore.snapshots = initialSnapshotData;

//         // Optionally, perform any additional logic after initialization
//       } catch (error) {
//         // Handle initialization error
//         console.error("Error initializing snapshot:", error);
//       }
//     },

//     takeSnapshot: async (
//       updatedSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//     ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null> => {
//       try {
//         // Perform logic to capture a snapshot, such as fetching current data
//         // Assuming you have a function to fetch current data
//         const currentData = await fetchCurrentData();

//         // Create a new snapshot object
//         const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
//           id: "unique-id",
//           timestamp: new Date(),
//           data: currentData,
//           category: "example-category",
//           type: "example-type",
//           snapshotStoreConfig: undefined,
//           getSnapshotItems: () => [],
//           defaultSubscribeToSnapshots: function (
//             snapshotId: string,
//             callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//             snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           transformSubscriber: function (
//             sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//             throw new Error("Function not implemented.");
//           },
//           transformDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//             throw new Error("Function not implemented.");
//           },
//           initializedState: undefined,
//           getAllKeys: function (): Promise<string[]> | undefined {
//             throw new Error("Function not implemented.");
//           },
//           getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | undefined {
//             throw new Error("Function not implemented.");
//           },
//           addDataStatus: function (
//             id: number,
//             status: "completed" | "pending" | "inProgress"
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           removeData: function (id: number): void {
//             throw new Error("Function not implemented.");
//           },
//           updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           updateDataTitle: function (id: number, title: string): void {
//             throw new Error("Function not implemented.");
//           },
//           updateDataDescription: function (
//             id: number,
//             description: string
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           updateDataStatus: function (
//             id: number,
//             status: StatusType | undefined
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }): void {
//             throw new Error("Function not implemented.");
//           },
//           getDataVersions: function (
//             id: number
//           ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
//             throw new Error("Function not implemented.");
//           },
//           updateDataVersions: function (
//             id: number,
//             versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           getBackendVersion: function (): Promise<string | undefined> {
//             throw new Error("Function not implemented.");
//           },
//           getFrontendVersion: function (): Promise<
//             string | IHydrateResult<number>
//           > {
//             throw new Error("Function not implemented.");
//           },
//           fetchData: function (id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
//             throw new Error("Function not implemented.");
//           },
//           defaultSubscribeToSnapshot: function (
//             snapshotId: string,
//             callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): string {
//             throw new Error("Function not implemented.");
//           },
//           handleSubscribeToSnapshot: function (
//             snapshotId: string,
//             callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           removeItem: function (key: string): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           getSnapshot: function (
//             snapshot: (id: string) =>
//               | Promise<{
//                   category: any;
//                   timestamp: any;
//                   id: any;
//                   snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                   snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                   data: Data;
//                 }>
//               | undefined
//           ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//             throw new Error("Function not implemented.");
//           },
//           getSnapshotSuccess: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//             throw new Error("Function not implemented.");
//           },
//           setItem: function (key: string, value: Data): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           getDataStore: function (): Promise<DataStore<any, any>> {
//             throw new Error("Function not implemented.");
//           },
//           addSnapshotSuccess: function (
//             snapshot: <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           deepCompare: function (objA: any, objB: any): boolean {
//             throw new Error("Function not implemented.");
//           },
//           shallowCompare: function (objA: any, objB: any): boolean {
//             throw new Error("Function not implemented.");
//           },
//           getDataStoreMethods: function (): DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//             throw new Error("Function not implemented.");
//           },
//           getDelegate: function (
//             snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//             throw new Error("Function not implemented.");
//           },
//           determineCategory: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//           ): string {
//             throw new Error("Function not implemented.");
//           },
//           determinePrefix: function <T extends <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
//             snapshot: T | null | undefined,
//             category: string
//           ): string {
//             throw new Error("Function not implemented.");
//           },
//           removeSnapshot: function (
//             snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           addSnapshotItem: function (
//             item: Snapshot<any, any> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           addNestedStore: function (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           clearSnapshots: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           addSnapshot: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           createSnapshot: undefined,
//           createInitSnapshot: function (
//             id: string,
//             snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             category: string
//           ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//             throw new Error("Function not implemented.");
//           },
//           setSnapshotSuccess: function (
//             snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             subscribers: ((data: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           setSnapshotFailure: function (error: Error): void {
//             throw new Error("Function not implemented.");
//           },
//           updateSnapshots: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           updateSnapshotsSuccess: function (
//             snapshotData: (
//               subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//               snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//             ) => void
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           updateSnapshotsFailure: function (error: Payload): void {
//             throw new Error("Function not implemented.");
//           },
//           initSnapshot: function (
//             snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           takeSnapshot: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//             throw new Error("Function not implemented.");
//           },
//           takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           takeSnapshotsSuccess: function (snapshots: Data[]): void {
//             throw new Error("Function not implemented.");
//           },
//           flatMap: function <U extends Iterable<any>>(
//             callback: (
//               value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               index: number,
//               array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//             ) => U
//           ): U extends (infer I)[] ? I[] : U[] {
//             throw new Error("Function not implemented.");
//           },
//           getState: function () {
//             throw new Error("Function not implemented.");
//           },
//           setState: function (state: any): void {
//             throw new Error("Function not implemented.");
//           },
//           validateSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
//             throw new Error("Function not implemented.");
//           },
//           handleActions: function (
//             action: (selectedText: string) => void
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           transformSnapshotConfig: function <T extends BaseDataEntity>(
//             config: SnapshotStoreConfig<BaseData, T>
//           ) {
//             throw new Error("Function not implemented.");
//           },
//           setSnapshots: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           clearSnapshot: function (snapshotId: string): void {
//             throw new Error("Function not implemented.");
//           },
//           mergeSnapshots: function (
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             category: string
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           reduceSnapshots: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           sortSnapshots: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           filterSnapshots: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           findSnapshot: function (
//             snapshotId: string,
//             predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           getSubscribers: function (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Promise<{
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//           }> {
//             throw new Error("Function not implemented.");
//           },
//           notify: function (
//             id: string,
//             message: string,
//             content: any,
//             date: Date,
//             type: NotificationType,
//             notificationPosition?: NotificationPosition | undefined
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           notifySubscribers: function (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             data: Partial<SnapshotStoreConfig<BaseData, any>>
//           ): Subscriber <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] {
//             throw new Error("Function not implemented.");
//           },
//           getSnapshots: function (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           getAllSnapshots: function (
//             data: (
//               subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//               snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//             ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           generateId: function (): string {
//             throw new Error("Function not implemented.");
//           },
//           batchFetchSnapshots: function (
//             criteria: CriteriaType,
//             snapshotData: (
//               snapshotIds: string[],
//               subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//             ) => Promise<{
//               subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//               snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Include snapshots here for consistency
//             }>
//           ): Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//             throw new Error("Function not implemented.");
//           },
//           batchTakeSnapshotsRequest: function (
//             criteria: CriteriaType,
//             snapshotData: (
//               snapshotIds: string[],
//               snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//             ) => Promise<{
//               subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//             }>
//           ): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           batchUpdateSnapshotsRequest: function (
//             snapshotData: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
//               subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//               snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//             }>,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {},
//           filterSnapshotsByCategory: (category: Category): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {},
//           filterSnapshotsByTag: (tag: string): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {},
//           batchFetchSnapshotsSuccess: function (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           batchFetchSnapshotsFailure: function (
//             date: Date,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload: { error: Error; }
//         ): void {
//             throw new Error("Function not implemented.");
//           },
//           batchUpdateSnapshotsSuccess: function (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           batchUpdateSnapshotsFailure: function (
//             date: Date,
//             snapshotId: string | number | null,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload: { error: Error; }
//         ): void {
//             throw new Error("Function not implemented.");
//           },
//           batchTakeSnapshot: function (
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//             throw new Error("Function not implemented.");
//           },
//           handleSnapshotSuccess: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//             snapshotId: string
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           getSnapshotId: function (key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
//             throw new Error("Function not implemented.");
//           },
//           compareSnapshotState: function (
//             arg0: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//             state: any
//           ): unknown {
//             throw new Error("Function not implemented.");
//           },
//           eventRecords: null,
//           snapshotStore: null,
//           getParentId: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null {
//             throw new Error("Function not implemented.");
//           },
//           getChildIds: function (
//             childSnapshot: Snapshot <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           addChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           removeChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           getChildren: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           hasChildren: function (): boolean {
//             throw new Error("Function not implemented.");
//           },
//           isDescendantOf: function (
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): boolean {
//             throw new Error("Function not implemented.");
//           },
//           dataItems: null,
//           newData: null,
//           getInitialState: function (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//             throw new Error("Function not implemented.");
//           },
//           getConfigOption: function () {
//             throw new Error("Function not implemented.");
//           },
//           getTimestamp: function (): Date | undefined {
//             throw new Error("Function not implemented.");
//           },
//           getData: function ():
//             | Data<T>
//             | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//             | null
//             | undefined {
//             throw new Error("Function not implemented.");
//           },
//           setData: function (id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//             throw new Error("Function not implemented.");
//           },
//           addData: function (): void {
//             throw new Error("Function not implemented.");
//           },
//           stores: (storeProps: any): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {},
//           getStore: function (
//             storeId: number,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotId: string | null,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: Event
//           ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//             throw new Error("Function not implemented.");
//           },
//           addStore: function (
//             storeId: number,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotId: string,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: Event
//           ): void | null {
//             throw new Error("Function not implemented.");
//           },
//           mapSnapshot: function (
//             id: number,
//             storeId: string | number,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotId: string,
//             criteria: CriteriaType,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
//             mapFn: (item: T) => T
//           ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//             throw new Error("Function not implemented.");
//           },
//           mapSnapshots: function <U, V>(
//             storeIds: number[],
//             snapshotId: string,
//             category?: Category,            categoryProperties: CategoryProperties | undefined,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             timestamp: string | number | Date | undefined,
//             type: string,
//             event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             id: number,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             data: K,
//             callback: (
//               storeIds: number[],
//               snapshotId: string,
//               category?: Category,              categoryProperties: CategoryProperties | undefined,
//               snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               timestamp: string | number | Date | undefined,
//               type: string,
//               event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               id: number,
//               snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               data: V, // Use V for the callback data type
//               index: number
//             ) => U 
//           ): U[] {
//             throw new Error("Function not implemented.");
//           },
//           removeStore: function (
//             storeId: number,
//             store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotId: string,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: Event
//           ): void | null {
//             throw new Error("Function not implemented.");
//           },
//           unsubscribe: function (
//             unsubscribeDetails: {
//               userId: string; 
//               snapshotId: string;
//               unsubscribeType: string; 
//               unsubscribeDate: Date; 
//               unsubscribeReason: string; 
//               unsubscribeData: any;
//             },
//             callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           fetchSnapshot: function (
//             snapshotId: string, 
//             callback: (
//               snapshotId: string,
//               payload: FetchSnapshotPayload<T> | undefined,
//               snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//               payloadData: T | Data<T>,
//               category?: Category,
//               categoryProperties: CategoryProperties | undefined,
//               timestamp: Date,
//               data: T,
//               delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): Promise<{
//             id: string; 
//             category: Category; 
//             categoryProperties: CategoryProperties; 
//             timestamp: Date; 
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//             data: BaseData;
//             delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 
//           }>  {
//             throw new Error("Function not implemented.");
//           },
//           addSnapshotFailure: function (
//             date: Date, 
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//              payload: { error: Error; }
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           configureSnapshotStore: function (
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotId: string,
//             data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//             events: Record<string, CalendarEvent[]>,
//             dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             store: SnapshotStore<any, K>,
//             callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
//             config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ): void | null {
//             throw new Error("Function not implemented.");
//           },
//           updateSnapshotSuccess: function (
//             snapshotId: string,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload?: { data?: Error }
//           ): void | null {
//             throw new Error("Function not implemented.");
//           },
//           createSnapshotFailure: function (
//             date: Date,
//             snapshotId: string,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload: { error: Error; }
//           ): Promise<void> {
//             throw new Error("Function not implemented.");
//           },
//           createSnapshotSuccess: function (
//             snapshotId: string | number | null,
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload?: { data?: any }
//           ): void | null {
//             throw new Error("Function not implemented.");
//           },
//           createSnapshots: function (
//             id: string,
//             snapshotId: string | number | null,
//             snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Use Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] here
//             snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
//             snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
//             category?: symbol | string | Category,
//              categoryProperties?: CategoryProperties;
//           ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
//             throw new Error("Function not implemented.");
//           },
//           onSnapshot: function (
//             snapshotId: string,
//             snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           onSnapshots: function (
//             snapshotId: string,
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//           ): void {
//             throw new Error("Function not implemented.");
//           },
//           label: undefined,
//           events: {
//             callbacks: function (snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//               throw new Error("Function not implemented.");
//             },
//             eventRecords: undefined,
//           },
//           handleSnapshot: function (
//             id: string,
//             snapshotId: string | number | null,
//             snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,
//             snapshotData: T,
//             category?: Category,            categoryProperties: CategoryProperties | undefined,
//             callback: (snapshot: T) => void,
//             snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             type: string,
//             event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotContainer?: T | undefined,
//             snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
//             storeConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
//             throw new Error("Function not implemented.");
//           },
//           meta: {},
//         }

//         // Optionally, you can add the new snapshot to the updatedSnapshots array
//         const snapshots = [...updatedSnapshots, newSnapshot];

//         // Return the array of snapshots
//         return snapshots;
//       } catch (error) {
//         // Handle snapshot capture error
//         console.error("Error capturing snapshot:", error);
//         return null;
//       }
//     },

//     // Function to handle actions or UI updates after successful single snapshot capture
//     takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//       // Example: Display a success message indicating that the snapshot was captured successfully
//       showToast({ content: "Snapshot captured successfully!" });

//       // Additional actions or UI updates can be added here
//       // For example, update the UI to reflect the newly captured snapshot
//       updateSnapshotList(snapshot);
//     },

//     // Function to handle actions or UI updates after successful batch snapshot captures
//     takeSnapshotsSuccess: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
//       // Example: Display a success message indicating that batch snapshots were captured successfully
//       showToast({ content: "Batch snapshots captured successfully!" });

//       // Additional actions or UI updates can be added here
//       // For example, update the UI to reflect the batch of captured snapshots
//       snapshots.forEach((snapshot) => {
//         updateSnapshotList(snapshot);
//       });
//     },

//     // fetchSnapshotById: async (id: string) => {
//     //   try {
//     //     // Perform logic to fetch a snapshot by id, such as fetching data from a database
//     //     // For example:
//     //     const snapshot = await fetchSnapshotById(id);
//     //     return snapshot;
//     //   } catch (error) {
//     //     // Handle snapshot capture error
//     //     console.error("Error capturing snapshot:", error);
//     //     return null;
//     //   }
//     // },
//   };

//   // Example function to update the UI with the newly captured snapshot
//   const updateSnapshotList = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     // Assuming you have a function to add the snapshot to a list in your UI
//     addToSnapshotList(snapshot);
//   };
//   // Assuming you have a function to display toast messages in your UI
//   displayToast(message);

//   // Example functions for fetching initial snapshot data and current data
//   const fetchInitialSnapshotData = async (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
//     // Simulate fetching initial snapshot data from an API
//     // For example, you can fetch data from a database or external service
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

//     // Return initial snapshot data as an array of Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> objects
//     return [
//       {
//         id: "1",
//         data: {
//           exampleData: "Initial snapshot data 1",
//           timestamp: undefined,
//           category: "",
//         },
//         timestamp: new Date(),
//         category: "Initial Category 1",
//         type: "",
//         snapshotStoreConfig: undefined,
//         getSnapshotItems: () => (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined),
//         defaultSubscribeToSnapshots: function (
//           snapshotId: string,
//           callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         transformSubscriber: function (
//           sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         transformDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//           throw new Error("Function not implemented.");
//         },
//         initializedState: undefined,
//         getAllKeys: function (): Promise<string[]> | undefined {
//           throw new Error("Function not implemented.");
//         },
//         getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | undefined {
//           throw new Error("Function not implemented.");
//         },
//         addDataStatus: function (
//           id: number,
//           status: "completed" | "pending" | "inProgress"
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         removeData: function (id: number): void {
//           throw new Error("Function not implemented.");
//         },
//         updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataTitle: function (id: number, title: string): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataDescription: function (
//           id: number,
//           description: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataStatus: function (
//           id: number,
//           status: "completed" | "pending" | "inProgress"
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }): void {
//           throw new Error("Function not implemented.");
//         },
//         getDataVersions: function (
//           id: number
//         ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         updateDataVersions: function (
//           id: number,
//           versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         getBackendVersion: function (): Promise<string | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         getFrontendVersion: function (): Promise<
//           string | IHydrateResult<number>
//         > {
//           throw new Error("Function not implemented.");
//         },
//         fetchData: function (id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
//           throw new Error("Function not implemented.");
//         },
//         defaultSubscribeToSnapshot: function (
//           snapshotId: string,
//           callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         handleSubscribeToSnapshot: function (
//           snapshotId: string,
//           callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         removeItem: function (key: string): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshot: function (
//           snapshot: (id: string) =>
//             | Promise<{
//                 category: any;
//                 timestamp: any;
//                 id: any;
//                 snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                 snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                 data: Data;
//               }>
//             | undefined
//         ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotSuccess: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//           throw new Error("Function not implemented.");
//         },
//         setItem: function (key: string, value: Data): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         getDataStore: {},
//         addSnapshotSuccess: function (
//           snapshot: <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         deepCompare: function (objA: any, objB: any): boolean {
//           throw new Error("Function not implemented.");
//         },
//         shallowCompare: function (objA: any, objB: any): boolean {
//           throw new Error("Function not implemented.");
//         },
//         getDataStoreMethods: function (): DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         getDelegate: function (
//           snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//           throw new Error("Function not implemented.");
//         },
//         determineCategory: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         determinePrefix: function <T extends BaseDataEntity>(
//           snapshot: T | null | undefined,
//           category: string
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshotItem: function (
//           item: Snapshot<any, any> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         addNestedStore: function (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         clearSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshot: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshot: undefined,
//         createInitSnapshot: function (
//           id: string,
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           category: string
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshotSuccess: function (
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: ((data: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshotFailure: function (error: Error): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotsSuccess: function (
//           snapshotData: (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotsFailure: function (error: Payload): void {
//           throw new Error("Function not implemented.");
//         },
//         initSnapshot: function (
//           snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshot: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshotsSuccess: function (snapshots: Data[]): void {
//           throw new Error("Function not implemented.");
//         },
//         flatMap: function <U extends Iterable<any>>(
//           callback: (
//             value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             index: number,
//             array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ) => U
//         ): U extends (infer I)[] ? I[] : U[] {
//           throw new Error("Function not implemented.");
//         },
//         getState: function () {
//           throw new Error("Function not implemented.");
//         },
//         setState: function (state: any): void {
//           throw new Error("Function not implemented.");
//         },
//         validateSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
//           throw new Error("Function not implemented.");
//         },
//         handleActions: function (action: (selectedText: string) => void): void {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         transformSnapshotConfig: function <T extends BaseDataEntity>(
//           config: SnapshotStoreConfig<BaseData, T>
//         ) {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshots: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         clearSnapshot: function (snapshotId: string): void {
//           throw new Error("Function not implemented.");
//         },
//         mergeSnapshots: function (
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           category: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         reduceSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         sortSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         filterSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         findSnapshot: function (
//           snapshotId: string,
//           predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         getSubscribers: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<{
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//         }> {
//           throw new Error("Function not implemented.");
//         },
//         notify: function (
//           id: string,
//           message: string,
//           content: any,
//           date: Date,
//           type: NotificationType,
//           notificationPosition?: NotificationPosition | undefined
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         notifySubscribers: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           data: Partial<SnapshotStoreConfig<BaseData, any>>
//         ): Subscriber <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshots: function (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         getAllSnapshots: function (
//           data: (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         generateId: function (): string {
//           throw new Error("Function not implemented.");
//         },
//         batchFetchSnapshots: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchTakeSnapshotsRequest: function (snapshotData: any): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsRequest: function (
//           snapshotData: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Promise<{
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//           }>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         filterSnapshotsByStatus: undefined,
//         filterSnapshotsByCategory: undefined,
//         filterSnapshotsByTag: undefined,
//         batchFetchSnapshotsSuccess: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchFetchSnapshotsFailure: function (payload: { error: Error }): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsSuccess: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsFailure: function (payload: {
//           error: Error;
//         }): void {
//           throw new Error("Function not implemented.");
//         },
//         batchTakeSnapshot: function (
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//           throw new Error("Function not implemented.");
//         },
//         handleSnapshotSuccess: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshotId: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotId: function (key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
//           throw new Error("Function not implemented.");
//         },
//         compareSnapshotState: function (
//           arg0: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           state: any
//         ): unknown {
//           throw new Error("Function not implemented.");
//         },
//         eventRecords: null,
//         snapshotStore: null,
//         getParentId: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null {
//           throw new Error("Function not implemented.");
//         },
//         getChildIds: function (childSnapshot: Snapshot <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         addChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         removeChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         getChildren: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         hasChildren: function (): boolean {
//           throw new Error("Function not implemented.");
//         },
//         isDescendantOf: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): boolean {
//           throw new Error("Function not implemented.");
//         },
//         dataItems: null,
//         newData: null,
//         getInitialState: function (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         getConfigOption: function () {
//           throw new Error("Function not implemented.");
//         },
//         getTimestamp: function (): Date | undefined {
//           throw new Error("Function not implemented.");
//         },
//         getData: function ():
//           | Data
//           | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//           | null
//           | undefined {
//           throw new Error("Function not implemented.");
//         },
//         setData: function (data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         addData: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         stores: null,
//         getStore: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string | null,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         addStore: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         mapSnapshot: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         mapSnapshots: function (
//           storeIds: number[],
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         removeStore: function (
//           storeId: number,
//           store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         unsubscribe: function (callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         fetchSnapshot: function (
//           callback: (
//             snapshotId: string,
//             payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payloadData: Data
//           ) => void
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshotFailure: function (
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         configureSnapshotStore: function (
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           events: Record<string, CalendarEvent[]>,
//           dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           store: SnapshotStore<any, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotSuccess: function (
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshotFailure: function (
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshotSuccess: function (
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshots: function (
//           id: string,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
//           snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
//           category?: string | symbol | Category
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
//           throw new Error("Function not implemented.");
//         },
//         onSnapshot: function (
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         onSnapshots: function (
//           snapshotId: string,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         label: undefined,
//         events: {
//           callbacks: function (snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           eventRecords: undefined,
//         },
//         handleSnapshot: function (
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): Promise<void> | null {
//           throw new Error("Function not implemented.");
//         },
//         meta: undefined,
//       },
//       {
//         id: "2",
//         data: {
//           exampleData: "Initial snapshot data 2",
//           timestamp: undefined,
//           category: "",
//         },
//         timestamp: new Date(),
//         category: "Initial Category 2",
//         type: "",
//         snapshotStoreConfig: undefined,
//         getSnapshotItems: [],
//         defaultSubscribeToSnapshots: function (
//           snapshotId: string,
//           callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         transformSubscriber: function (
//           sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         transformDelegate: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//           throw new Error("Function not implemented.");
//         },
//         initializedState: undefined,
//         getAllKeys: function (): Promise<string[]> | undefined {
//           throw new Error("Function not implemented.");
//         },
//         getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | undefined {
//           throw new Error("Function not implemented.");
//         },
//         addDataStatus: function (
//           id: number,
//           status: "completed" | "pending" | "inProgress"
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         removeData: function (id: number): void {
//           throw new Error("Function not implemented.");
//         },
//         updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataTitle: function (id: number, title: string): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataDescription: function (
//           id: number,
//           description: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         updateDataStatus: function (
//           id: number,
//           status: "completed" | "pending" | "inProgress"
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }): void {
//           throw new Error("Function not implemented.");
//         },
//         getDataVersions: function (
//           id: number
//         ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         updateDataVersions: function (
//           id: number,
//           versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         getBackendVersion: function (): Promise<string | undefined> {
//           throw new Error("Function not implemented.");
//         },
//         getFrontendVersion: function (): Promise<
//           string | IHydrateResult<number>
//         > {
//           throw new Error("Function not implemented.");
//         },
//         fetchData: function (id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
//           throw new Error("Function not implemented.");
//         },
//         defaultSubscribeToSnapshot: function (
//           snapshotId: string,
//           callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         handleSubscribeToSnapshot: function (
//           snapshotId: string,
//           callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         removeItem: function (key: string): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshot: function (
//           snapshot: (id: string) =>
//             | Promise<{
//                 category: any;
//                 timestamp: any;
//                 id: any;
//                 snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                 snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//                 data: Data;
//               }>
//             | undefined
//         ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotSuccess: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
//           throw new Error("Function not implemented.");
//         },
//         setItem: function (key: string, value: Data): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         getDataStore: {},
//         addSnapshotSuccess: function (
//           snapshot: <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         deepCompare: function (objA: any, objB: any): boolean {
//           throw new Error("Function not implemented.");
//         },
//         shallowCompare: function (objA: any, objB: any): boolean {
//           throw new Error("Function not implemented.");
//         },
//         getDataStoreMethods: function (): DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         getDelegate: function (
//           snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
//           throw new Error("Function not implemented.");
//         },
//         determineCategory: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         determinePrefix: function <T extends <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
//           snapshot: T | null | undefined,
//           category: string
//         ): string {
//           throw new Error("Function not implemented.");
//         },
//         removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshotItem: function (
//           item: Snapshot<any, any> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         addNestedStore: function (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         clearSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshot: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshot: undefined,
//         createInitSnapshot: function (
//           id: string,
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           category: string
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshotSuccess: function (
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: ((data: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshotFailure: function (error: Error): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotsSuccess: function (
//           snapshotData: (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotsFailure: function (error: Payload): void {
//           throw new Error("Function not implemented.");
//         },
//         initSnapshot: function (
//           snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshot: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//         ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         takeSnapshotsSuccess: function (snapshots: Data[]): void {
//           throw new Error("Function not implemented.");
//         },
//         flatMap: function <U extends Iterable<any>>(
//           callback: (
//             value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             index: number,
//             array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
//           ) => U
//         ): U extends (infer I)[] ? I[] : U[] {
//           throw new Error("Function not implemented.");
//         },
//         getState: function () {
//           throw new Error("Function not implemented.");
//         },
//         setState: function (state: any): void {
//           throw new Error("Function not implemented.");
//         },
//         validateSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
//           throw new Error("Function not implemented.");
//         },
//         handleActions: function (action: (selectedText: string) => void): void {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         transformSnapshotConfig: function <T extends BaseDataEntity>(
//           config: SnapshotStoreConfig<BaseData, T>
//         ) {
//           throw new Error("Function not implemented.");
//         },
//         setSnapshots: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         clearSnapshot: function (snapshotId: string): void {
//           throw new Error("Function not implemented.");
//         },
//         mergeSnapshots: function (
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           category: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         reduceSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         sortSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         filterSnapshots: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         getSubscribers: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<{
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//         }> {
//           throw new Error("Function not implemented.");
//         },
//         notify: function (
//           id: string,
//           message: string,
//           content: any,
//           date: Date,
//           type: NotificationType,
//           notificationPosition?: NotificationPosition | undefined
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         notifySubscribers: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           data: Partial<SnapshotStoreConfig<BaseData, any>>
//         ): Subscriber <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshots: function (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         getAllSnapshots: function (
//           data: (
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//           ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         generateId: function (): string {
//           throw new Error("Function not implemented.");
//         },
//         batchFetchSnapshots: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchTakeSnapshotsRequest: function (snapshotData: any): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsRequest: function (
//           snapshotData: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Promise<{
//             subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//             snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//           }>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         filterSnapshotsByStatus: undefined,
//         filterSnapshotsByCategory: undefined,
//         filterSnapshotsByTag: undefined,
//         batchFetchSnapshotsSuccess: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchFetchSnapshotsFailure: function (payload: { error: Error }): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsSuccess: function (
//           subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         batchUpdateSnapshotsFailure: function (payload: {
//           error: Error;
//         }): void {
//           throw new Error("Function not implemented.");
//         },
//         batchTakeSnapshot: function (
//           id: number, snapshotId: string, 
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
//           throw new Error("Function not implemented.");
//         },
//         handleSnapshotSuccess: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshotId: string
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         getSnapshotId: function (key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
//           throw new Error("Function not implemented.");
//         },
//         compareSnapshotState: function (
//           arg0: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           state: any
//         ): unknown {
//           throw new Error("Function not implemented.");
//         },
//         eventRecords: null,
//         snapshotStore: null,
//         getParentId: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null {
//           throw new Error("Function not implemented.");
//         },
//         getChildIds: function (childSnapshot: Snapshot <<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         addChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         removeChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//           throw new Error("Function not implemented.");
//         },
//         getChildren: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         hasChildren: function (): boolean {
//           throw new Error("Function not implemented.");
//         },
//         isDescendantOf: function (
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//         ): boolean {
//           throw new Error("Function not implemented.");
//         },
//         dataItems: undefined,
//         newData: null,
//         getInitialState: function (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         getConfigOption: function () {
//           throw new Error("Function not implemented.");
//         },
//         getTimestamp: function (): Date | undefined {
//           throw new Error("Function not implemented.");
//         },
//         getData: function ():
//           | Data
//           | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
//           | null
//           | undefined {
//           throw new Error("Function not implemented.");
//         },
//         setData: function (data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         addData: function (): void {
//           throw new Error("Function not implemented.");
//         },
//         stores: null,
//         getStore: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string | null,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         addStore: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         mapSnapshot: function (
//           storeId: number,
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
//           throw new Error("Function not implemented.");
//         },
//         mapSnapshots: function (
//           storeIds: number[],
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         removeStore: function (
//           storeId: number,
//           store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         unsubscribe: function (callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
//           throw new Error("Function not implemented.");
//         },
//         fetchSnapshot: function (
//           callback: (
//             snapshotId: string,
//             payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//             payloadData: Data
//           ) => void
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//           throw new Error("Function not implemented.");
//         },
//         addSnapshotFailure: function (
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         configureSnapshotStore: function (
//           snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           storeId: number,
//           snapshotId: string,
//           data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           events: Record<string, CalendarEvent[]>,
//           dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//           newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           store: SnapshotStore<any, <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
//           callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         updateSnapshotSuccess: function (
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload?: { data?: Error }
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshotFailure: function (
//           date: Date,
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): Promise<void> {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshotSuccess: function (
//           snapshotId: string,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: { error: Error }
//         ): void | null {
//           throw new Error("Function not implemented.");
//         },
//         createSnapshots: function (
//           id: string,
//           snapshotId: string,
//           snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
//           snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
//           category?: string | symbol | Category
//         ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
//           throw new Error("Function not implemented.");
//         },
//         onSnapshot: function (
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         onSnapshots: function (
//           snapshotId: string,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
//         ): void {
//           throw new Error("Function not implemented.");
//         },
//         label: undefined,
//         events: {
//           callbacks: function (snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
//             throw new Error("Function not implemented.");
//           },
//           eventRecords: undefined,
//         },
//         handleSnapshot: function (
//           snapshotId: string,
//           snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
//           snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//           type: string,
//           event: Event
//         ): Promise<void> | null {
//           throw new Error("Function not implemented.");
//         },
//         meta: undefined,
//       },
//       // Add more initial snapshot data objects as needed
//     ];
//   };

//   const fetchCurrentData = async (): Promise<{
//     exampleData: string;
//     timestamp: Date;
//     category: string;
//   }> => {
//     // Simulate fetching current data from an API
//     // For example, you can fetch data from a database or external service
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

//     // Return current data object
//     return {
//       exampleData: "Current data",
//       timestamp: new Date(),
//       category: "Current Category",
//     };
//   };

//   const getData = async (dispatch: DataAnalysisDispatch) => {
//     try {
//       // Call the fetchData function to fetch data from the API
//       const data = await dispatch(
//         SnapshotActions().fetchSnapshotData(`${SNAPSHOT_URL}`)
//       );
//       return data;
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       throw error;
//     }
//   };

//   const setData = (data: Data) => {
//     snapshotApi.saveSnapshotToDatabase(data);
//   };

//   // Function to get the current state
//   const getState = () => {
//     return currentState;
//   };

//   // Function to set the state
//   const setState = (state: any) => {
//     currentState = state;
//   };

//   // Function to validate a snapshot
//   const validateSnapshot = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean => {
//     // Implement your validation logic here
//     // For example, you can check if the snapshot data meets certain criteria
//     if (snapshot.data && snapshot.name !== "") {
//       // Valid snapshot based on specific criteria
//       return true;
//     }

//     // Add your demonstration validation logic here
//     // For demonstration, let's assume the snapshot is valid if it has a timestamp
//     return snapshot.timestamp !== undefined;
//   };

//   // Function to handle a snapshot
//   const handleSnapshot = (
//     id: string,
//     snapshotId: string,
//     snapshot: T | null,
//     snapshotData: T,
//     category?: Category,    callback: (snapshot: T) => void,
//     snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     type: string,
//     event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//     snapshotContainer?: T,
//     snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//   ) => {
//     if (snapshot) {
//       // Implement actions based on the snapshot
//       // For example, you can log the snapshot details
//       console.log(`Handling snapshot with ID ${snapshotId}:`, snapshot);
//     } else {
//       // Handle the case when snapshot is null
//       console.warn(`Snapshot with ID ${snapshotId} is null.`);
//     }
//   };

//   // Function to handle actions
//   const handleActions = async () => {
//     try {
//       // Example actions related to project management
//       // These actions can interact with project-related data and functionalities

//       // Action: Start a new project
//       dispatch(ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().startNewProject());

//       // Action: Add a team member to a project
//       dispatch(
//         ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().addTeamMember({
//           projectId: "project123",
//           memberId: "user456",
//         })
//       );

//       // Action: Update project status
//       dispatch(
//         ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().updateProjectStatus({
//           projectId: "project123",
//           status: "In Progress",
//         })
//       );

//       // Action: Create a new task within a project phase
//       dispatch(
//         TaskActions.createTask({
//           projectId: "project123",
//           phaseId: "phase456",
//           task: {
//             name: "Task 1",
//             description: "Description of Task 1",
//             id: "",
//             title: "",
//             assignedTo: null,
//             assigneeId: undefined,
//             dueDate: undefined,
//             payload: undefined,
//             priority: PriorityTypeEnum.Low,
//             previouslyAssignedTo: [],
//             done: false,
//             data: undefined,
//             source: "user",
//             startDate: undefined,
//             endDate: undefined,
//             isActive: false,
//             tags: [],
//             [Symbol.iterator]: function (): Iterator<any, any, undefined> {
//               throw new Error("Function not implemented.");
//             },
//             timestamp: undefined,
//             category: "",
//           },
//         })
//       );

//       // Action: Assign a task to a team member
//       dispatch(
//         TaskActions.assignTask({
//           projectId: "project123",
//           taskId: "task789",
//           assigneeId: "user456",
//         })
//       );

//       // Example actions related to crypto functionalities
//       // These actions can interact with cryptocurrency-related data and functionalities
//       // Action: Buy cryptocurrency
//       dispatch(CryptoActions.buyCrypto({ currency: "BTC", amount: 1 }));

//       // Action: Sell cryptocurrency
//       dispatch(CryptoActions.sellCrypto({ currency: "ETH", amount: 2 }));

//       // Action: Monitor crypto market trends
//       dispatch(CryptoActions.monitorMarketTrends());

//       // Action: Join a crypto community forum
//       dispatch(CryptoActions.joinCryptoCommunity({ communityId: "crypto123" }));
//       console.log("Actions handled successfully.");
//     } catch (error) {
//       console.error("Error handling actions:", error);
//     }
//   };
//   // Function to set a single snapshot
//   const setSnapshot = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
//     const dispatch = useDispatch();
//     // Dispatch the add snapshot action with the provided snapshot
//     dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().add(snapshot));
//   };

//   // Function to clear a snapshot from the store
//   const clearSnapshot = (snapshotId: string) => {
//     const updatedSnapshots = snapshots?.filter(
//       (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.id !== snapshotId
//     );
//     setSnapshots(updatedSnapshots);
//   };

//   // Function to merge new snapshots into the store
//   const mergeSnapshots = (newSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
//     // Merge the new snapshots with the existing ones
//     setSnapshots([...snapshots, ...newSnapshots]);
//   };

//   const reduceSnapshots = () => {
//     const uniqueSnapshots = Array.from(
//       new Set(snapshots.map((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.id))
//     )
//       .map((id) => snapshots.find((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.id === id))
//       .filter((snapshot) => snapshot !== undefined) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
//     setSnapshots(uniqueSnapshots);
//   };

//   // In your useSnapshotStore hook:
//   const sortSnapshots = (direction: 'asc' | 'desc' = 'asc') => {
//     const sortedSnapshots = sortByTimestamp(snapshots, direction);
//     setSnapshots(sortedSnapshots);
//   };

//   const filterSnapshots = () => {
//     const filteredSnapshots =
//       snapshots?.filter(
//         (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot.type === "important"
//       ) || [];
//     setSnapshots(filteredSnapshots);
//   };

//   // Function to map snapshots based on a specific criterion
//   const mapSnapshots = (callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => any) => {
//     // Apply the callback function to each snapshot and return the results
//     return snapshots.map(callback);
//   };

//   // Function to find a specific snapshot by ID
//     const findSnapshot = (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => {
//     return snapshots.find(predicate);
//   };

//     const findSnapshotById = (snapshotId: string) => {
//     return snapshots.find(snapshot => snapshot.id === snapshotId);
//   };


//   // // Function to send a notification
//   // const notify = (notification: NotificationData): void => {
//   //   // Implement logic to send the notification (e.g., via email, push notification, etc.)
//   //   console.log(`Notification sent: ${notification.message}`);
//   // };

//   // Return the snapshot store object

//   return {
//     // flatMap,

//     // Core methods
//     addSnapshot: useCallback((...args) => storeRef.current?.addSnapshot(...args), []),
//     getData: useCallback((...args) => storeRef.current?.getData(...args), []),
    
//     // State access
//     currentState: storeRef.current?.getCurrentState(),
//     snapshots: storeRef.current?.snapshots,
    
//     // Utility methods
//     isExpired: storeRef.current?.isExpired,
//     snapshots,
//     snapshotId,
//     findSnapshot,
//     addSnapshot,
//     takeSnapshot,
//     updateSnapshot,
//     removeSnapshot,
//     clearSnapshots,
//     handleActions,
//     handleSnapshot,
//     validateSnapshot,
//     addSnapshotSuccess,
//     taskIdToAssign: {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

//     // Snapshot Creation and Management
//     createSnapshot: async (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
//       // You need to provide all required arguments for createSnapshot
//       return createSnapshot(
//         {} as T, // baseData - you need to provide actual data
//         new Map(), // baseMeta - empty map or provide actual metadata
//         null, // snapshotId - null or provide actual ID
//         undefined, // category - undefined or provide actual category
//         null, // snapshotStore - null or provide actual store
//         null, // snapshotManager - null or provide actual manager
//         null, // snapshotStoreConfig - null or provide actual config
//         false, // isSubscribed
//         storeProps, // storeProps
//         undefined // storeOptions - optional
//       );
//     },
//     createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
//     createSnapshotFailure: (
//       date: Date,
//       snapshotId: string,
//       snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       payload: { error: Error }
//     ) => {},
//     updateSnapshots: () => {},
//     updateSnapshotSuccess: () => {},
//     updateSnapshotFailure: (error: Payload) => {},
//     updateSnapshotsSuccess: () => {},
//     updateSnapshotsFailure: (error: Payload) => {},
//     initSnapshot: () => {},
//     initSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
//     takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
//     takeSnapshotsSuccess: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {},

//     // Configuration
//     configureSnapshotStore: () => {},

//     // Data and State Handling
//     getData: () => {
//       return {} as Promise<Data<T>>;
//     },
//     setData: (data: Data<T>) => {},
//     getState: () => null,
//     setState: (state: any) => {},
//     // validateSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => false,
//     // handleSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshotId: string) => {},
//     // handleActions: () => {},

//     // Snapshot Operations
//     setSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
//     setSnapshots: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {},
//     clearSnapshot: (snapshotId: string) => {},
//     mergeSnapshots: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {},
//     reduceSnapshots: <U,>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U): U => {
//       return snapshots.reduce((acc, snapshot) => callback(acc, snapshot), initialValue);
//     },
//     sortSnapshots: () => {},
//     filterSnapshots: () => {},
//         // Fixed mapSnapshots implementation
//     mapSnapshots: async <U,>(
//       storeIds: number[],
//       snapshotId: string,
//       category?: Category,
//       categoryProperties: CategoryProperties | undefined,
//       snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       timestamp: string | number | Date | undefined,
//       type: string,
//       event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       id: number,
//       snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       data: K,
//       callback: (
//         storeIds: number[],
//         snapshotId: string,
//         category?: Category,
//         categoryProperties: CategoryProperties | undefined,
//         snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//         timestamp: string | number | Date | undefined,
//         type: string,
//         event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//         id: number,
//         snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//         data: K,
//         index: number
//       ) => U
//     ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
//       const results: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      
//       snapshots.forEach((snapshot, index) => {
//         const result = callback(
//           storeIds,
//           snapshotId,
//           category,
//           categoryProperties,
//           snapshot,
//           timestamp,
//           type,
//           event,
//           id,
//           snapshotStore,
//           data,
//           index
//         );
//         // You might want to handle the result differently based on your needs
//         // This is just a basic implementation
//         results.push(snapshot);
//       });
      
//       return results;
//     },

//     // Alternative simpler map implementation if you just want to transform snapshots
//     mapSnapshotsSimple: <U,>(callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number) => U): U[] => {
//       return snapshots.map(callback);
//     },
//     // Subscribers and Notifications
//     getSubscribers: () => {},
//     notify: () => {},
//     notifySubscribers: () => {},
//     subscribe: () => {},
//     unsubscribe: () => {},

//     // Fetching Snapshots
//     fetchSnapshot: () => {},
//     fetchSnapshotSuccess: () => {},
//     fetchSnapshotFailure: () => {},
//     getSnapshot: () => {},
//     getSnapshots: () => {},
//     getAllSnapshots: (
//       storeId: number,
//       event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//       ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
//         timestamp: string;
//         type: string;
//         id: number;
//         categoryProperties?: CategoryProperties;
//         dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
//         data: T;
//       },
//       filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
//       dataCallback?: (
//         subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
//         snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
//       ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
//     ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
//       // Your implementation logic here
//       return Promise.resolve([] as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]);
//     },
//     // Utility Methods
//     generateId: () => {},

//     // Batch Operations
//     batchFetchSnapshots: () => {},
//     batchTakeSnapshotsRequest: () => {},
//     batchUpdateSnapshotsRequest: () => {},
//     batchFetchSnapshotsSuccess: () => {},
//     batchFetchSnapshotsFailure: () => {},
//     batchUpdateSnapshotsSuccess: () => {},
//     batchUpdateSnapshotsFailure: () => {},
//     batchTakeSnapshot: () =>
//       new Promise<{ snapshots: Snapshots<Snapshot<any>> }>((resolve) => {
//         resolve({ snapshots: [] as Snapshots<Snapshot<any>> });
//       }),

//       [Symbol.toStringTag]: "useSnapshotStore",
//     // Additional properties
//     config: {} as Promise<SnapshotStoreConfig<Snapshot<any>, any>[]>,
//   };
// };

