// onLogicalAnd.ts
import React from 'react';

interface ButtonProps {
  onClick: () => void;
}

const onLogicalAnd: React.FC<ButtonProps> = ({ onClick }) => {
  const handleOnClick = () => {
    // Additional logic before onLogicalAnd action if needed
    console.log("Logical AND button clicked!");
    // Call the provided onClick function
    onClick();
  }

  return (
    <button onClick={handleOnClick}>
      Logical AND
    </button>
  );
}

export default onLogicalAnd;
