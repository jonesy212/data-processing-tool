// UserSupport.tsx
import React, { useEffect } from 'react';
import LazyIcon from '../LazyIconProps'; // Adjust the path accordingly
import { useStore } from '../hooks/useStore';
import { loadDuckDuckGoIcon, loadLinkedInIcon, loadXIcon, loadYandexIcon } from '../icons/IconLoader'; // Adjust the path accordingly

const UserSupport: React.FC = () => {
  const store = useStore();

  useEffect(() => {
    store.iconStore.loadIcon(loadDuckDuckGoIcon);
    store.iconStore.loadIcon(loadLinkedInIcon);
    store.iconStore.loadIcon(loadXIcon);
    store.iconStore.loadIcon(loadYandexIcon);
  }, [store.iconStore]);

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
