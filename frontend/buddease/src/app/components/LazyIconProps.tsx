// LazyIcon.tsx
import React, { ReactNode } from 'react';

interface LazyIconProps {
  loadIcon: () => Promise<ReactNode>;
}

const LazyIcon: React.FC<LazyIconProps> = ({ loadIcon }) => {
  const [icon, setIcon] = React.useState<ReactNode | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const loadedIcon = await loadIcon();
      setIcon(loadedIcon);
    };

    load();
  }, [loadIcon]);

  return <>{icon}</>;
};

export default LazyIcon;
