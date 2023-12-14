// UserSupport.tsx
import React from 'react';
import LazyIcon from '../LazyIconProps'; // Adjust the path accordingly
import { loadDuckDuckGoIcon, loadLinkedInIcon, loadXIcon, loadYandexIcon } from '../actions/IconLoader'; // Adjust the path accordingly

const UserSupport: React.FC = () => {
  return (
    <div>
      {/* Your existing content */}
      <LazyIcon loadIcon={loadDuckDuckGoIcon} />
      <LazyIcon loadIcon={loadLinkedInIcon} />
      <LazyIcon loadIcon={loadXIcon} />
      <LazyIcon loadIcon={loadYandexIcon} />
    </div>
  );
};

export default UserSupport;
