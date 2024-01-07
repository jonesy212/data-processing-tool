import React from 'react';

interface ButtonGeneratorProps {
  buttonTypes: string[];
  onSubmit?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
}

const ButtonGenerator: React.FC<ButtonGeneratorProps> = ({
  buttonTypes,
  onSubmit,
  onReset,
  onCancel,
}) => {
  const renderButton = (type: string) => {
    switch (type) {
      case 'submit':
        return <button key={type} onClick={onSubmit}>Submit</button>;
      case 'reset':
        return <button key={type} onClick={onReset}>Reset</button>;
      case 'cancel':
        return <button key={type} onClick={onCancel}>Cancel</button>;
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
