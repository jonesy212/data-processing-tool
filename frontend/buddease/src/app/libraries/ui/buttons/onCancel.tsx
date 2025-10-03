// onCancel.ts
import React from 'react';

interface ButtonProps {
  onClick: () => void;
}

const onCancel: React.FC<ButtonProps> = ({ onClick }) => {
  const handleOnClick = () => {
    // Additional logic before onCancel action if needed
    console.log("Cancel button clicked!");
    // Call the provided onClick function
    onClick();
  }

  return (
    <button onClick={handleOnClick}>
      Cancel
    </button>
  );
}

export default onCancel;
export type { ButtonProps };
