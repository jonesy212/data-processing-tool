import React from 'react';

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
}

const ButtonGenerator: React.FC<ButtonGeneratorProps> = ({
  buttonTypes,
  onSubmit,
  onReset,
  onCancel,
  onLogicalAnd,
  onLogicalOr,
  onStartPhase,
  onEndPhase,
  onSwitchLayout,
  onOpenDashboard,
}) => {
  const renderButton = (type: string) => {
    switch (type) {
      case 'submit':
        return <button key={type} onClick={onSubmit}>Submit</button>;
      case 'reset':
        return <button key={type} onClick={onReset}>Reset</button>;
      case 'cancel':
        return <button key={type} onClick={onCancel}>Cancel</button>;
      case 'logical-and':
        return <button key={type} onClick={onLogicalAnd}>Logical AND</button>;
      case 'logical-or':
        return <button key={type} onClick={onLogicalOr}>Logical OR</button>;
        case 'start-phase':
          return <button key={type} onClick={() => onStartPhase && onStartPhase('yourPhase')}>Start Phase</button>;
        case 'end-phase':
          return <button key={type} onClick={() => onEndPhase && onEndPhase('yourPhase')}>End Phase</button>;
        case 'switch-layout':
          return <button key={type} onClick={() => onSwitchLayout && onSwitchLayout('yourLayout')}>Switch Layout</button>;
        case 'open-dashboard':
          return <button key={type} onClick={() => onOpenDashboard && onOpenDashboard('yourDashboard')}>Open Dashboard</button>;
        default:
        return null;
    }
  };

  return (
    <div>
      {buttonTypes.map((type) => renderButton(type))}
    </div>
  );
};

export default ButtonGenerator;
