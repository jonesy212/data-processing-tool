import { useEffect, useState } from 'react';

const useCameraAccess = () => {
  const [isCameraAccessible, setIsCameraAccessible] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setIsCameraAccessible(true))
      .catch(() => setIsCameraAccessible(null));
  }, []);

  return {
    isCameraAccessible,
  };
};

export default useCameraAccess;
