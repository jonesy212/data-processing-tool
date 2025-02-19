import { useState, useEffect } from "react";

export interface DeviceDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const getDeviceDimensions = (): DeviceDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024,
  };
};

const useDeviceDimensions = (): DeviceDimensions => {
  const [dimensions, setDimensions] = useState<DeviceDimensions>(getDeviceDimensions());

  useEffect(() => {
    const handleResize = () => setDimensions(getDeviceDimensions());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

export default useDeviceDimensions;
