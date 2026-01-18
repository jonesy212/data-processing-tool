// LazyIconProps.tsx
LazyIcon.tsx
import LazyLoadScript from "@/LazyLoadScript";
import type { ReactNode } from 'react';
import React from 'react';

interface LazyIconProps {
  loadIcon: () => Promise<ReactNode>;
}

const LazyIcon: React.FC<LazyIconProps> = ({ loadIcon }) => {
  return <LazyLoadScript loadScript={loadIcon} />;
};

export default LazyIcon;
