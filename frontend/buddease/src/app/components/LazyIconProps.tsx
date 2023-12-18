// LazyIcon.tsx
import LazyLoadScript from "@/LazyLoadScript";
import React, { ReactNode } from "react";

interface LazyIconProps {
  loadIcon: () => Promise<ReactNode>;
}

const LazyIcon: React.FC<LazyIconProps> = ({ loadIcon }) => {
  return <LazyLoadScript loadScript={loadIcon} />;
};

export default LazyIcon;
