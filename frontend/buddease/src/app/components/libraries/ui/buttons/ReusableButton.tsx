// ReusableButton.tsx
import { ChildComponentProps } from "@/app/components/hooks/ChildComponent";
import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import React from "react";

interface ButtonProps {
  variant?: string;
  color?: string; // Add color prop
  disabled?: boolean; // Add disabled prop
  style?: React.CSSProperties; // Add style prop
  label?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEvent?: (clickEvent: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  onConfirmation?: () => void;
  onHover?: () => void; // Event handler for when the button is hovered over
  onFocus?: () => void; // Event handler for when the button is focused
  onBlur?: () => void; // Event handler for when the button loses focus
  onMouseEnter?: () => void; // Event handler for when the mouse enters the button area
  onMouseLeave?: () => void; // Event handler for when the mouse leaves the button area
  // Add more event handlers as needed
  animationDuration?: number; // Duration of the animation in milliseconds
  animationType?: "fade" | "slide" | "scale"; // Type of animation
  animationEasing?: string; // Easing function for the animation
  children?: React.ReactNode; // Child content inside the button
  router: ChildComponentProps['router']; // Update the type to match ChildComponentProps
  brandingSettings: BrandingSettings; // Update with the appropriate type for brandingSettings
}

const ReusableButton: React.FC<ButtonProps> = ({
  label = "",
  variant,
  onClick,
  onEvent,
}) => {
  // Additional logic before button action if needed
  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`${label} button clicked!`);

    if (onEvent) {
      onEvent(event); // Call the custom event handler if provided
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button onClick={handleOnClick} className={variant}>
      {label.toString()}
    </button>
  );
};

export default ReusableButton;
export type { ButtonProps };
