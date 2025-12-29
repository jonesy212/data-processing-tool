// GenerateButtons.tsx
// ButtonGenerator.tsx
import { Label } from '@/core/branding/BrandingSettings';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/core/documents/RelatedProps";
import { LifecycleConfig } from '@/core/hooks/phases/lifecycles';
import {
    startVoiceRecognition
} from "@/core/intelligence/VoiceControl";
import { Phase } from "@/core/models/phases/Phase";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

startVoiceRecognition;
/**
 * useButtonGeneratorProps Hook
 *
 * Generates button properties with integrated lifecycle management and phase transitions.
 *
 * @hook
 * @example
 * // Basic usage
 * const { buttonProps, currentPhase, lifecycleManager } = useButtonGeneratorProps();
 *
 * @example
 * // Custom lifecycle configuration
 * const { buttonProps } = useButtonGeneratorProps({
 *   phases: [
 *     {
 *       name: 'upload',
 *       subPhases: ['selecting', 'processing', 'complete'],
 *       hooks: {
 *         canTransitionTo: (target) => target.name !== 'initial',
 *         handleTransitionTo: (target) => console.log(`Moving to ${target.name}`),
 *         condition: async (timeout) => false
 *       }
 *     }
 *   ],
 *   initialPhase: 'upload',
 *   onPhaseChange: (from, to) => console.log(`Phase changed: ${from?.name} → ${to.name}`),
 *   onTransitionError: (error) => console.error('Transition failed:', error)
 * });
 *
 * @param {LifecycleConfig} [lifecycleConfig] - Configuration for the lifecycle manager
 * @returns {Object} Hook return value
 * @returns {ButtonGeneratorProps} return.buttonProps - Button properties for ButtonGenerator
 * @returns {Phase} return.currentPhase - Current active phase
 * @returns {LifecycleManager} return.lifecycleManager - Lifecycle manager instance
 * @returns {Function} return.setCurrentPhase - Function to update current phase
 *
 * @see {@link ButtonGenerator} - Component that consumes the button props
 * @see {@link LifecycleManager} - Underlying phase management system
 *
 * @version 2.0.0
 * @since 2.0.0
 */

interface ButtonGeneratorProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K> {
  variant?: Record<string, string>; // Keep this as is for variant options
  date?: Date | string;
  timestamp?: string | Date;
  htmlType?: string;
  onSubmit?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onLogicalAnd?: () => void;
  onLogicalOr?: () => void;
  onStartPhase?: (phase: string) => void;
  onEndPhase?: (phase: string) => void;
  onRoutesLayout?: (phase: string) => void;
  onSwitchLayout?: (layout: string) => void;
  onOpenDashboard?: (dashboard: string) => void;
  onCanceVideoChannel?: () => void;

  onTransitionToPreviousPhase?: (
    setCurrentPhase: React.Dispatch<React.SetStateAction<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  onTransitionToNextPhase?: (
    setCurrentPhase: React.Dispatch<React.SetStateAction<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
    currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  label?: Label | string | Record<string, string> | null; // Allow Record<string, string> as well

  entity?: T; // The actual entity instance
  entityType?: string; // 'user', 'project', 'task', etc.
  // ... (other props)
}

// Define the default labels for each button type
const defaultLabels: Record<string, string> = {
  variant: "primary",
  submit: "Submit",
  reset: "Reset",
  cancel: "Cancel",
  "logical-and": "Logical And",
  "logical-or": "Logical Or",
  "start-phase": "Start Phase",
  "end-phase": "End Phase",
  "switch-layout": "Switch Layout",
  "open-dashboard": "Open Dashboard",
  // Add additional labels here
  "transition-to-previous-phase": "Transition To Previous Phase",
  "transition-to-next-phase": "Transition To Next Phase",
  "phase-management": "Enable Phase-Based Project Management",
  "task-tracking": "Enable Task Assignment and Tracking",
  "data-analysis": "Enable Data Analysis Tools",
  "file-upload": "Enable File Upload and Sharing",
  "task-prioritization": "Enable Task Prioritization and Sorting",
  "custom-templates": "Enable Customizable Project Templates",
  "time-tracking": "Enable Time Tracking and Reporting",

  "external-tools":
    "Enable Integration with External Tools (e.g., GitHub, Jira)",
  "deadline-reminders": "Enable Project Deadline Reminders",
  "team-availability": "Enable Team Member Availability Status",
  "dashboard-widgets": "Enable Customizable Dashboard Widgets",
  "automated-assignment": "Enable Automated Task Assignment",
  "access-control": "Enable Role-based Access Control",
  "progress-tracking": "Enable Progress Tracking and Visualization",
  "export-project-data": "Enable Exporting Project Data to CSV/PDF",
  "user-feedback": "Enable User Feedback and Suggestions",
  "notification-preferences": "Enable Customizable Notification Preferences",
  "document-version-control": "Enable Document Version Control",
  "milestone-management": "Enable Project Milestone Management",
  "calendar-integration": "Enable Integration with Calendar Services",
  "multi-language-support": "Enable Multi-language Support",
  "data-encryption": "Enable Data Encryption for Security",
  "offline-mode": "Enable Offline Mode for Working Without Internet Access",
};

const defaultVariants: Record<string, string> = {
  submit: "primary",
  reset: "default",
  cancel: "default",
  "logical-and": "default",
  "logical-or": "default",
  "start-phase": "default",
  "end-phase": "default",
  "switch-layout": "default",
  "open-dashboard": "default",
  // ... (other cases)
};


// Generic ButtonGenerator component
const ButtonGenerator = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  label = defaultLabels,
  variant = defaultVariants,
  onSubmit,
  onReset,
  onCancel,
  onLogicalAnd,
  onLogicalOr,
  onStartPhase,
  onEndPhase,
  onRoutesLayout,
  onSwitchLayout,
  onOpenDashboard,
  onCanceVideoChannel,
  onTransitionToPreviousPhase,
  onTransitionToNextPhase,
  date,
  timestamp,
  id,
  name,
  type,
  value,
  ...identifiers
}: ButtonGeneratorProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): React.ReactElement => {
  
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    {} as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  );

  // Create LifecycleManager instance
  const lifecycleManagerRef = useRef<LifecycleManager | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  // Initialize LifecycleManager
  useEffect(() => {
    const lifecycleConfig: LifecycleConfig = {
      phases: [
        // Define your phases here
        {
          name: 'initial',
          subPhases: ['setup', 'configuration'],
          hooks: {
            canTransitionTo: (targetPhase) => true,
            handleTransitionTo: (targetPhase) => console.log(`Transitioning from initial to ${targetPhase.name}`),
            condition: async (timeout) => false
          }
        },
        {
          name: 'processing', 
          subPhases: ['data-loading', 'validation'],
          hooks: {
            canTransitionTo: (targetPhase) => targetPhase.name !== 'initial',
            handleTransitionTo: (targetPhase) => console.log(`Transitioning from processing to ${targetPhase.name}`),
            condition: async (timeout) => false
          }
        },
        // Add more phases as needed
      ],
      initialPhase: 'initial',
      onPhaseChange: (fromPhase, toPhase) => {
        console.log(`Phase changed: ${fromPhase?.name} -> ${toPhase.name}`);
      },
      onTransitionError: (error) => {
        console.error('Phase transition error:', error);
      }
    };

    lifecycleManagerRef.current = new LifecycleManager(lifecycleConfig);
  }, []);

  // Mock implementations
  const { dynamicContent, dynamicConfig } = {
    dynamicContent: false,
    dynamicConfig: { document: { getTitle: () => "Untitled Document" } }
  };

  const userService = {
    fetchUserById: async (id: string) => "mock-user-id"
  };

  const initUserId = "";
  const [userId, setUserId] = useState<string>("");

  // Helper function to handle button clicks with proper typing
  const handleButtonClick = (action: string, callback?: () => void) => {
    return () => {
      console.log(`Button action: ${action}`, { date, timestamp, identifiers });
      callback?.();
    };
  };

  // Fetch userId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.fetchUserById(initUserId);
        setUserId(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [initUserId]);

  // Fetch eventId
  useEffect(() => {
    const fetchEventId = async () => {
      try {
        const eventData = await Promise.resolve([
          { id: String(id), name, type, eventId: 'event-123' }
        ]);
        
        const matchingEvent = eventData.find(
          (event) => event.id === id && event.name === name && event.type === type
        );

        if (matchingEvent) {
          setEventId(matchingEvent.eventId);
        }
      } catch (err) {
        setError('Failed to fetch eventId');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventId();
    }
  }, [id, name, type]);

  // Get button types from labels
  const getButtonTypes = (): string[] => {
    if (typeof label === 'string') return ['primary'];
    if (label && typeof label === 'object') return Object.keys(label);
    return Object.keys(defaultLabels);
  };

  const buttonTypes = getButtonTypes();
  const title = dynamicConfig.document?.getTitle() || "Untitled Document";

  // Render individual button
  const renderButton = (buttonType: string) => {
    const getButtonLabel = (): string => {
      if (typeof label === 'string') return label;
      if (label && typeof label === 'object' && buttonType in label) {
        return (label as Record<string, string>)[buttonType];
      }
      return defaultLabels[buttonType as keyof typeof defaultLabels] || buttonType;
    };

    const getButtonVariant = (): string => {
      if (variant && buttonType in variant) {
        return variant[buttonType];
      }
      return variant.primary || 'btn-primary';
    };

    const handleClick = () => {
      switch (buttonType) {
        case "submit":
          onSubmit?.();
          break;
        case "reset":
          onReset?.();
          break;
        case "cancel":
          onCancel?.();
          break;
        case "logical-and":
          onLogicalAnd?.();
          break;
        case "logical-or":
          onLogicalOr?.();
          break;
        case "start-phase":
          onStartPhase?.(buttonType);
          break;
        case "end-phase":
          onEndPhase?.(buttonType);
          break;
        case "switch-layout":
          onSwitchLayout?.(buttonType);
          break;
        case "open-dashboard":
          onOpenDashboard?.(buttonType);
          break;
        case "transition-to-previous-phase":
          onTransitionToPreviousPhase?.(setCurrentPhase, currentPhase);
          break;
        case "transition-to-next-phase":
          onTransitionToNextPhase?.(setCurrentPhase, currentPhase);
          break;
        default:
          console.log(`Unknown button type: ${buttonType}`);
          break;
      }
    };

    // Check if button should be disabled based on lifecycle state
    const isDisabled = () => {
      if (!lifecycleManagerRef.current) return false;
      
      switch (buttonType) {
        case "transition-to-previous-phase":
          return !lifecycleManagerRef.current.getPreviousPhase();
        case "transition-to-next-phase":
          return lifecycleManagerRef.current.getNextPossiblePhases().length === 0;
        default:
          return false;
      }
    };

    return (
      <button
        key={buttonType}
        className={getButtonVariant()}
        onClick={handleClick}
        disabled={isDisabled() || loading}
        title={isDisabled() ? `Cannot ${buttonType} in current state` : undefined}
      >
        {getButtonLabel()}
        {isDisabled() && ' (Disabled)'}
      </button>
    );
  };

  if (loading) {
    return <div>Loading buttons...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="button-generator">
      <h3>Naming Conventions: {dynamicContent ? "Dynamic" : "Static"}</h3>
      
      {/* Current Phase Display */}
      {lifecycleManagerRef.current && (
        <div className="current-phase">
          <strong>Current Phase:</strong> {lifecycleManagerRef.current.getCurrentPhase()?.name || 'None'}
        </div>
      )}
      
      <div className="button-group">
        {buttonTypes.map(renderButton)}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && lifecycleManagerRef.current && (
        <div className="debug-info">
          <p>Date: {date?.toString()}</p>
          <p>Timestamp: {timestamp?.toString()}</p>
          <p>Entity ID: {id}</p>
          <p>Current Phase: {lifecycleManagerRef.current.getCurrentPhase()?.name}</p>
          <p>Available Next Phases: {lifecycleManagerRef.current.getNextPossiblePhases().map(p => p.name).join(', ')}</p>
        </div>
      )}

      {/* RealtimeData component - uncomment when available */}
      {/* <RealtimeDataComponent
        id={id}
        name={name}
        type={type}
        eventId={eventId || ''}
        userId={userId}
        dispatch={dispatch}
        date={date}
        value={value}
        title={title}
        timestamp={timestamp}
      /> */}
    </div>
  );
};



// Define buttonGeneratorProps
// Updated buttonGeneratorProps with proper LifecycleManager integration
const createButtonGeneratorProps = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  lifecycleManager: LifecycleManager,
  setCurrentPhase: React.Dispatch<React.SetStateAction<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>
): ButtonGeneratorProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
  label: defaultLabels,
  variant: defaultVariants,
  onSubmit: () => console.log("Submit clicked"),
  onReset: () => console.log("Reset clicked"),
  onCancel: () => console.log("Cancel clicked"),
  onLogicalAnd: () => console.log("Logical And clicked"),
  onLogicalOr: () => console.log("Logical Or clicked"),
  onStartPhase: (phase) => {
    console.log(`Start Phase clicked: ${phase}`);
    // Use LifecycleManager for phase transitions
    lifecycleManager.transitionTo(phase).then(success => {
      if (success) {
        const newPhase = lifecycleManager.getCurrentPhase();
        if (newPhase) {
          setCurrentPhase(newPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
          console.log(`Successfully started phase: ${phase}`);
        }
      } else {
        console.warn(`Failed to start phase: ${phase}`);
      }
    });
  },
  onEndPhase: (phase) => {
    console.log(`End Phase clicked: ${phase}`);
    // Implement end phase logic using LifecycleManager
    const nextPhase = lifecycleManager.getNextPossiblePhases().find(p => p.name !== phase);
    if (nextPhase) {
      lifecycleManager.transitionTo(nextPhase.name);
    }
  },
  onSwitchLayout: (layout) => console.log(`Switch Layout clicked: ${layout}`),

  onTransitionToPreviousPhase: async (setCurrentPhase, currentPhase) => {
    try {
      console.log("Transitioning to previous phase...");
      
      const previousPhase = lifecycleManager.getPreviousPhase();
      if (!previousPhase) {
        console.warn("No previous phase available");
        return;
      }

      // Check if transition is allowed
      if (!lifecycleManager.canTransitionTo(previousPhase.name)) {
        console.warn(`Transition to previous phase '${previousPhase.name}' is not allowed`);
        return;
      }

      // Perform the transition
      const success = await lifecycleManager.transitionTo(previousPhase.name);
      if (success) {
        const newPhase = lifecycleManager.getCurrentPhase();
        if (newPhase) {
          setCurrentPhase(newPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
          console.log(`Successfully transitioned to previous phase: ${previousPhase.name}`);
        }
      } else {
        console.warn(`Failed to transition to previous phase: ${previousPhase.name}`);
      }
    } catch (error) {
      console.error('Error during transition to previous phase:', error);
    }
  },

  onTransitionToNextPhase: async (setCurrentPhase, currentPhase) => {
    try {
      console.log("Transitioning to next phase...");
      
      const nextPhases = lifecycleManager.getNextPossiblePhases();
      if (nextPhases.length === 0) {
        console.warn("No available next phases");
        return;
      }

      // Choose the next phase (you can implement custom logic here)
      const nextPhase = nextPhases[0]; // Or implement your selection logic
      
      // Perform the transition
      const success = await lifecycleManager.transitionTo(nextPhase.name);
      if (success) {
        const newPhase = lifecycleManager.getCurrentPhase();
        if (newPhase) {
          setCurrentPhase(newPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
          console.log(`Successfully transitioned to next phase: ${nextPhase.name}`);
        }
      } else {
        console.warn(`Failed to transition to next phase: ${nextPhase.name}`);
      }
    } catch (error) {
      console.error('Error during transition to next phase:', error);
    }
  },

  onOpenDashboard: (dashboard) => {
    console.log(`Open Dashboard clicked: ${dashboard}`);
    // Simple logging - move complex notification logic to parent component
  },
});



// Create buttonGeneratorProps with default configuration
const buttonGeneratorProps = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): ButtonGeneratorProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const defaultLifecycleManager = new LifecycleManager(getDefaultLifecycleConfig());
  const [_, setCurrentPhase] = useState<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    {} as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  );

  return createButtonGeneratorProps(defaultLifecycleManager, setCurrentPhase);
};





// Hook for easy usage
const useButtonGeneratorProps = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(lifecycleConfig?: LifecycleConfig) => {
  const [currentPhase, setCurrentPhase] = useState<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
    {} as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  );

  const lifecycleManager = useRef<LifecycleManager>(
    new LifecycleManager(lifecycleConfig || getDefaultLifecycleConfig())
  ).current;

  const buttonProps = createButtonGeneratorProps(lifecycleManager, setCurrentPhase);

  return {
    buttonProps,
    currentPhase,
    lifecycleManager,
    setCurrentPhase
  };
};

// Default lifecycle configuration
const getDefaultLifecycleConfig = (): LifecycleConfig => ({
  phases: [
    {
      name: 'initialization',
      subPhases: ['setup', 'configuration'],
      hooks: {
        canTransitionTo: (targetPhase) => 
          ['processing', 'validation'].includes(targetPhase.name),
        handleTransitionTo: (targetPhase) => 
          console.log(`Transitioning from initialization to ${targetPhase.name}`),
        condition: async (timeout) => false
      }
    },
    {
      name: 'processing',
      subPhases: ['data-loading', 'transformation'],
      hooks: {
        canTransitionTo: (targetPhase) => 
          ['validation', 'completion'].includes(targetPhase.name),
        handleTransitionTo: (targetPhase) => 
          console.log(`Transitioning from processing to ${targetPhase.name}`),
        condition: async (timeout) => false
      }
    },
    {
      name: 'validation',
      subPhases: ['checking', 'verification'],
      hooks: {
        canTransitionTo: (targetPhase) => 
          ['processing', 'completion'].includes(targetPhase.name),
        handleTransitionTo: (targetPhase) => 
          console.log(`Transitioning from validation to ${targetPhase.name}`),
        condition: async (timeout) => false
      }
    },
    {
      name: 'completion',
      subPhases: ['final', 'cleanup'],
      hooks: {
        canTransitionTo: () => false, // Final state
        handleTransitionTo: () => console.log('Process completed'),
        condition: async (timeout) => false
      }
    }
  ],
  initialPhase: 'initialization',
  onPhaseChange: (fromPhase, toPhase) => {
    console.log(`Phase changed: ${fromPhase?.name || 'none'} → ${toPhase.name}`);
  },
  onTransitionError: (error) => {
    console.error('Lifecycle transition error:', error.message);
  }
});


export { ButtonGenerator, buttonGeneratorProps, createButtonGeneratorProps, useButtonGeneratorProps };
export type { ButtonGeneratorProps };

