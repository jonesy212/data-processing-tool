import React, { ReactNode } from 'react';

interface ConfirmationPageProps {
  title: string;
  message: string;
  onConfirm: () => void;
  children?: ReactNode; // Allow children prop
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ title, message, onConfirm, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      {children} {/* Render children */}
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
};

export default ConfirmationPage;
export type { ConfirmationPageProps };
