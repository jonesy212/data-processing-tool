// ButtonGenerator.tsx
import React from "react";
import { useDynamicComponents } from "../components/DynamicComponentsContext";
import ReusableButton from "../components/libraries/ui/buttons/ReusableButton";

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
interface ButtonGeneratorProps {
  variant?: Record<string, string>;
  label?: Record<string, string>;
  onSubmit?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onLogicalAnd?: () => void;
  onLogicalOr?: () => void;
  onStartPhase?: (phase: string) => void;
  onEndPhase?: (phase: string) => void;
  onSwitchLayout?: (layout: string) => void;
  onOpenDashboard?: (dashboard: string) => void;
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
  // ... (other cases)
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

const ButtonGenerator: React.FC<ButtonGeneratorProps> = ({
  label = defaultLabels, // Use the provided label or default to the defaultLabels
  variant = defaultVariants,
  onSubmit,
  onReset,
  onCancel,
  onLogicalAnd,
  onLogicalOr,
  onStartPhase,
  onEndPhase,
  onSwitchLayout,
  onOpenDashboard,
  // ... (other props)
}) => {
  const buttonTypes = Object.keys(label);
  const { dynamicContent } = useDynamicComponents(); // Access the dynamicContent flag from the naming convention context

  const renderButton = (type: string) => {
    return (
      <ReusableButton
        key={type}
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
            // ... (other cases)
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
      {buttonTypes.map((type) => renderButton(type))}
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
  onOpenDashboard: (dashboard) => console.log(`Open Dashboard clicked: ${dashboard}`),
  // ... (other props)
};

export { ButtonGenerator, buttonGeneratorProps };
