import React from "react";

// ReusableButton.tsx

interface ButtonProps {
  onClick?: () => void;
  label: string;
  variant: string
}

const ReusableButton: React.FC<ButtonProps> = ({ onClick, label, variant }) => {
  const handleOnClick = () => {
    // Additional logic before button action if needed
    console.log(`${label} button clicked!`);
    // Call the provided onClick function
    if (onClick) {
      onClick();
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
