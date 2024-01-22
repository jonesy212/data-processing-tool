// onSubmit.ts
import React from 'react';

interface ButtonProps {
  onClick: () => void;
}

const onSubmit: React.FC<ButtonProps> = ({ onClick }) => {
  const handleOnClick = () => {
    // Additional logic before onSubmit action if needed
    console.log("Submit button clicked!");
    // Call the provided onClick function
    onClick();
  }

  return (
    <button onClick={handleOnClick}>
      Submit
    </button>
  );
}

export default onSubmit;
