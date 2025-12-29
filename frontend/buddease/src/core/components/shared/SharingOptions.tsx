// SharingOptions.tsx
import React from 'react';

interface SharingOptionsProps {
  onShareEmail: () => void;
  onShareLink: () => void;
  onShareSocialMedia: () => void;
}

const SharingOptions: React.FC<SharingOptionsProps> = ({
  onShareEmail,
  onShareLink,
  onShareSocialMedia,
}) => {
  return (
    <div>
      <h3>Sharing Options</h3>
      <button onClick={onShareEmail}>Share via Email</button>
      <button onClick={onShareLink}>Generate Shareable Link</button>
      <button onClick={onShareSocialMedia}>Share on Social Media</button>
      {/* Add more sharing options as needed */}
    </div>
  );
};

export default SharingOptions;
