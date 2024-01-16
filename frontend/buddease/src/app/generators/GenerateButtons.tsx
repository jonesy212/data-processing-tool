import React from "react";

interface ButtonGeneratorProps {
  buttonTypes: string[];
  onSubmit?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onLogicalAnd?: () => void;
  onLogicalOr?: () => void;
  onStartPhase?: (phase: string) => void;
  onEndPhase?: (phase: string) => void;
  onSwitchLayout?: (layout: string) => void;
  onOpenDashboard?: (dashboard: string) => void;
  buttonProps: Record<string, React.ButtonHTMLAttributes<HTMLButtonElement>>;
}

const ButtonGenerator: React.FC<ButtonGeneratorProps> = ({
  onSubmit,
  onReset,
  onCancel,
  onLogicalAnd,
  onLogicalOr,
  onStartPhase,
  onEndPhase,
  onSwitchLayout,
  onOpenDashboard,
  buttonProps,
  buttonTypes,
}) => {
  const renderButton = (type: string) => {
    const props = buttonProps[type];

    switch (type) {
      case "submit":
      case "reset":
      case "cancel":
      case "logical-and":
      case "logical-or":
      case "start-phase":
      case "end-phase":
      case "switch-layout":
      case "open-dashboard":
      case "ios-specific-button":
      case "android-specific-button":
      case "web-specific-button":
      case "shared-button-1":
      case "shared-button-2":
        return (
          <button key={type} onClick={props?.onClick} {...props}>
            {type}
          </button>
        );
      default:
        return null;
    }
  };

  return <div>{buttonTypes.map((type) => renderButton(type))}</div>;
};

export default ButtonGenerator;
