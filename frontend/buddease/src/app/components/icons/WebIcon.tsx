// WebIcon.tsx

import React from 'react';


interface WebIconProps  {
  src: string;
}


const WebIcon: React.FC<WebIconProps> = ({src}) => {
  // Implement the SVG or icon component for the Web platform icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M14 16v-4a4 4 0 0 0-4-4s-1.5.5-1.5 4v4"></path>
    </svg>
  );
};

export default WebIcon;
