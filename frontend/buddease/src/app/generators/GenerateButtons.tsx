// ButtonGenerator.tsx
import { fetchEventData } from '@/app/api/ApiEvent';
import userService from "@/app/api/ApiUser";
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { useDynamicComponents } from "@/app/components/DynamicComponentsContext";
import {
    startVoiceRecognition,
    stopVoiceRecognition,
} from "@/app/components/intelligence/VoiceControl";
import ReusableButton from "@/app/libraries/ui/buttons/ReusableButton";
import { RealtimeDataComponent } from "@/app/components/models/realtime/RealtimeData";
import useNotificationManagerService from "@/app/services/NotificationService";
import { Phase } from "@/app/components/phases/Phase";
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { brandingSettings } from "@/app/libraries/theme/BrandingService";
import {
    nextPhase,
    previousPhase,
} from "@/app/models/phases/PhaseTransitions";
import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { Router, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { BaseData } from "./data/Data";

startVoiceRecognition;
/**
 * ButtonGenerator Component
 *
 * This component generates a set of buttons based on the provided button types
 * and their corresponding click handlers. It utilizes the ReusableButton component.
 *
 * @component
 * @example
 * // Import ButtonGenerator and its props
 * import { ButtonGenerator, ButtonGeneratorProps } from "./path/to/ButtonGenerator";
 *
 * import NotificationManager from '@/app/support/NotificationManager';
 * import NotificationManager from '../components/notifications/NotificationManager';
 * import { buttonGeneratorProps } from '@/app/generators/GenerateButtons';
import { Router } from 'react-router-dom';

 * // Define buttonGeneratorProps
 * const buttonGeneratorProps: ButtonGeneratorProps = {
 *   onSubmit: () => console.log("Submit clicked"),
 *   onReset: () => console.log("Reset clicked"),
 *   onCancel: () => console.log("Cancel clicked"),
 *   onLogicalAnd: () => console.log("Logical And clicked"),
 *   onLogicalOr: () => console.log("Logical Or clicked"),
 *   onStartPhase: (phase) => console.log(`Start Phase clicked: ${phase}`),
 *   onEndPhase: (phase) => console.log(`End Phase clicked: ${phase}`),
 *   onSwitchLayout: (layout) => console.log(`Switch Layout clicked: ${layout}`),
 *   onOpenDashboard: (dashboard) => console.log(`Open Dashboard clicked: ${dashboard}`),
 *   // ... (other props)
 * };
 *
 * // Render the ButtonGenerator component with the defined props
 * const App = () => {
 *   return <ButtonGenerator {...buttonGeneratorProps} />;
 * };
 *
 * @param {ButtonGeneratorProps} props - The properties of the ButtonGenerator component.
 * @param {Record<string, string>} [props.label] - Labels for each button type. Defaults to predefined labels.
 * @param {() => void} [props.onSubmit] - Handler for the "submit" button click event.
 * @param {() => void} [props.onReset] - Handler for the "reset" button click event.
 * @param {() => void} [props.onCancel] - Handler for the "cancel" button click event.
 * @param {() => void} [props.onLogicalAnd] - Handler for the "logical-and" button click event.
 * @param {() => void} [props.onLogicalOr] - Handler for the "logical-or" button click event.
 * @param {(phase: string) => void} [props.onStartPhase] - Handler for the "start-phase" button click event.
 * @param {(phase: string) => void} [props.onEndPhase] - Handler for the "end-phase" button click event.
 * @param {(layout: string) => void} [props.onSwitchLayout] - Handler for the "switch-layout" button click event.
 * @param {(dashboard: string) => void} [props.onOpenDashboard] - Handler for the "open-dashboard" button click event.
 * @returns {JSX.Element} - The rendered ButtonGenerator component.
 */

interface ButtonGeneratorProps<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, ExcludedFields> {
  variant?: Record<string, string>; // Keep this as is for variant options
  date?: Date | string;
  timestamp?: string | Date;
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
    setCurrentPhase: React.Dispatch<React.SetStateAction<Phase>>,
    currentPhase: Phase
  ) => void;

  onTransitionToNextPhase?: (
    setCurrentPhase: React.Dispatch<React.SetStateAction<Phase>>,
    currentPhase: Phase
  ) => void;
  label?: Label | string | Record<string, string> | null; // Allow Record<string, string> as well

  // generateButtonDispatch?: React.Dispatch<React.SetStateAction<any>>;
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

const ButtonGenerator: React.FC<ButtonGeneratorProps> = async ({
  label = defaultLabels, // Use the provided label or default to the defaultLabels
  variant = defaultVariants,
  onSubmit,
  onReset,
  onCanceVideoChannel,
  onCancel,
  onLogicalAnd,
  onLogicalOr,
  onStartPhase,
  onEndPhase,
  onSwitchLayout,
  onOpenDashboard,
  onTransitionToPreviousPhase,
  onTransitionToNextPhase,
  id,
  name,
  type,
  date,
  value,
  timestamp,
  // generateButtonDispatch
  // ... (other props)
}) => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const buttonTypes = Object.keys(label);
  const { dynamicContent, dynamicConfig } = useDynamicComponents(); // Access the dynamicContent flag from the naming convention context
  const initUserId = ""
  const router = useRouter(); // Get the router object using useRouter hook

  const userId = await userService.fetchUserById(initUserId)
  const dispatch = useDispatch()
  const title = dynamicConfig.document?.getTitle() || "Untitled Document";
  
  // generateButtonDispatch({
  //   onSubmit,
  //   onReset,
  //   onCancel,
  //   onLogicalAnd,
  //   onLogicalOr,
  //   onStartPhase,
  //   onEndPhase,
  //   onSwitchLayout,
  //   onOpenDashboard,
  // })

   // Fetch eventId on component mount
   useEffect(() => {
    const fetchEventId = async () => {
      try {
        const eventData = await fetchEventData(String(id));
        const matchingEvent = eventData.find(
          (event) => event.id === id && event.name === name && event.type === type
        );

        if (!matchingEvent) {
          throw new Error('Event not found');
        }

        setEventId(matchingEvent.eventId);
      } catch (err) {
        setError('Failed to fetch eventId');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventId();
  }, [id, name, type]);

  const handleVoiceControl = () => {
    const recognition = startVoiceRecognition((result: string) => {
      console.log("Speech Recognition Result:", result);
      // Handle speech recognition result here
    });

    if (recognition) {
      stopVoiceRecognition(recognition);
    }
  };

  const renderButton = (
    type: string,
    setCurrentPhase: any,
    currentPhase: any
  ) => {
    return (
      <ReusableButton
        key={type}
        router={router as ExtendedRouter & Router}
        brandingSettings={brandingSettings}
        onClick={() => {
          // Call the corresponding function when the button is clicked
          switch (type) {
            case "submit":
              onSubmit && onSubmit();
              break;
            case "reset":
              onReset && onReset();
              break;
            case "cancel":
              onCancel && onCancel();
              break;
            case "logical-and":
              onLogicalAnd && onLogicalAnd();
              break;
            case "logical-or":
              onLogicalOr && onLogicalOr();
              break;
            case "start-phase":
              onStartPhase && onStartPhase(type);
              break;
            case "end-phase":
              onEndPhase && onEndPhase(type);
              break;
            case "switch-layout":
              onSwitchLayout && onSwitchLayout(type);
              break;
            case "open-dashboard":
              onOpenDashboard && onOpenDashboard(type);
              break;
            case "transition-to-previous-phase":
              onTransitionToPreviousPhase &&
                onTransitionToPreviousPhase(setCurrentPhase, currentPhase);
              break;
            case "transition-to-next-phase":
              onTransitionToNextPhase &&
                onTransitionToNextPhase(setCurrentPhase, currentPhase);
              break; // ... (other cases)
            default:
              break;
          }
        }}
        label={label[type]}
        variant={variant[type]}
      />
    );
  };

    return (
    <div>
      <h3>Naming Conventions: {dynamicContent ? "Dynamic" : "Static"}</h3>
      {buttonTypes.map((type, setCurrentPhase, currentPhase) =>
        renderButton(type, setCurrentPhase, currentPhase)  
      )}
      {/* <ButtonGenerator {...buttonGeneratorProps}>{children}</ButtonGenerator>; */}
      <button
        type={"submit"} // Changed to a valid button type
        onSubmit={buttonGeneratorProps.onSubmit} 
      >
      </button>
      ;{/* New voiceControlButton */}
      <button id="voiceControlButton" onClick={handleVoiceControl}>
        Activate Voice Control
      </button>
      {/* Include RealtimeData component */}
      <RealtimeDataComponent
        id={id}
        name={name}
        type={type}
        eventId={eventId || ''} // Pass the fetched eventId
       
        userId={userId}
        dispatch={dispatch}
        date={date}
        value={value}
        title={title}
        timestamp={timestamp}
      />
    </div>
  );

};

// Define buttonGeneratorProps
const buttonGeneratorProps: ButtonGeneratorProps = {
  label: defaultLabels,
  variant: defaultVariants,
  onSubmit: () => console.log("Submit clicked"),
  onReset: () => console.log("Reset clicked"),
  onCancel: () => console.log("Cancel clicked"),
  onLogicalAnd: () => console.log("Logical And clicked"),
  onLogicalOr: () => console.log("Logical Or clicked"),
  onStartPhase: (phase) => console.log(`Start Phase clicked: ${phase}`),
  onEndPhase: (phase) => console.log(`End Phase clicked: ${phase}`),
  onSwitchLayout: (layout) => console.log(`Switch Layout clicked: ${layout}`),
  // generateButtonDispatch: (dispatch) => {
  //   // Send push notification
  //   const message = `Generated Buttons: ${JSON.stringify(dispatch)}`;
  //   const sender = "User";
  //   // Send push notification
  //   useNotificationManagerService().sendPushNotification(message, sender);
  //   // Additional logic if needed
  //   console.log(`Generated Buttons: ${JSON.stringify(dispatch)}`);
  // },

  onTransitionToPreviousPhase: (setCurrentPhase, currentPhase) => {
    // Implement transition to previous phase logic
    console.log("Transition to previous phase logic here");
    // Example: setCurrentPhase to previous phase
    setCurrentPhase(previousPhase);
  },
  onTransitionToNextPhase: (setCurrentPhase, currentPhase) => {
    // Implement transition to next phase logic
    console.log("Transition to next phase logic here");
    // Example: setCurrentPhase to next phase
    setCurrentPhase(nextPhase);
  },
  onOpenDashboard: (dashboard) => {
    // Send push notification
    const message = `Opened Dashboard: ${dashboard}`;
    const sender = "User";
    // Send push notification
    useNotificationManagerService().sendPushNotification(message, sender);
    // Additional logic if needed
    console.log(`Open Dashboard clicked: ${dashboard}`);
  },
};

export { ButtonGenerator, buttonGeneratorProps };
export type { ButtonGeneratorProps };

