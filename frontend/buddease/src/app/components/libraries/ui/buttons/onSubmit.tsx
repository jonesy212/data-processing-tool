// onSubmit.ts
import React from 'react';

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}


// Example of a button component using ButtonProps
const SubmitButton: React.FC<ButtonProps> = ({ onClick }) => {
  return <button onClick={onClick}>Submit</button>;
};


const onSubmit: React.FC<ButtonProps> = ({ onClick }) => {
  const handleOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // Additional logic before onSubmit action if needed
    console.log("Submit button clicked!");
    // Call the provided onClick function
    onClick(event);
  };

  return (
    <button onClick={handleOnClick}>
      Submit
    </button>
  );
}

export default onSubmit;
export type {ButtonProps}