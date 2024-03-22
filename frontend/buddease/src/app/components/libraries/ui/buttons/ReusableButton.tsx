// ReusableButton.tsx
import { ChildComponentProps } from "@/app/components/hooks/ChildComponent";
import React from "react";



interface ButtonProps {
variant?: string
color?: string; // Add color prop
disabled?: boolean; // Add disabled prop
style?: React.CSSProperties; // Add style prop
label: string;
onClick?: () => void;
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
animationType?: 'fade' | 'slide' | 'scale'; // Type of animation
animationEasing?: string; // Easing function for the animation
  children?: React.ReactNode; // Child content inside the button
  router: ChildComponentProps["router"];
  brandingSettings: ChildComponentProps["brandingSettings"];

}



const ReusableButton: React.FC<ButtonProps> = ({
label,
variant,
onClick,
onSubmit,
onCancel,
onConfirmation,
}) => {
// Additional logic before button action if needed
  const handleOnClick = () => {
    // Additional logic before button action if needed
    console.log(`${label} button clicked!`);

    // Call the appropriate event handler
    if (onClick) {
      onClick();
    } else if (onCancel) {
      onCancel();
    } else if (onSubmit) {
      onSubmit();
    } else if (onConfirmation) {
      onConfirmation();
    }
};

return (
<button onClick={handleOnClick} className={variant}>
  {label}
  </button>
)
};

export default ReusableButton;
export type { ButtonProps };
