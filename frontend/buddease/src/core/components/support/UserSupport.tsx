UserSupport.tsx
import { loadDuckDuckGoIcon, loadLinkedInIcon, loadXIcon, loadYandexIcon } from '@/core/components/icons/IconLoader'; // Adjust the path accordingly
import LazyIcon from '@/core/components/LazyIconProps'; // Adjust the path accordingly
import { useStore } from '@/core/hooks/useStore';
import React, { useEffect } from 'react';

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
