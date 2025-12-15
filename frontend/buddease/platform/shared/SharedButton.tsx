// platform/shared/SharedButton.tsx
import React from "react";
import { Label } from '@/app/branding/BrandingSettings';

export interface BaseButtonProps {
  label: string | Label;
  variant?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEvent?: (clickEvent: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  children?: React.ReactNode;
  // Platform-agnostic props only
}

export const SharedButton: React.FC<BaseButtonProps> = ({
  label = "",
  variant,
  onClick,
  onEvent,
  disabled = false,
  style,
  children
}) => {
  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    console.log(`${label} button clicked!`);

    if (onEvent) {
      onEvent(event);
    } else if (onClick) {
      onClick(event);
    }
  };

  return (
    <button 
      onClick={handleOnClick} 
      className={variant}
      disabled={disabled}
      style={style}
    >
      {children || label.toString()}
    </button>
  );
};