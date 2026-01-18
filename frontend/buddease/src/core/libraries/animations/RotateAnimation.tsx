// RotateAnimation.tsx
import React, { useEffect, useState } from 'react';

interface RotateProps {
  angle: number;
  duration: number;
}

const RotateAnimation: React.FC<RotateProps> = ({ angle, duration }) => {
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsRotated(true);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [duration]);

  return <div style={{ transform: `rotate(${isRotated ? angle : 0}deg)`, transition: `transform ${duration / 1000}s` }}>Rotated Content</div>;
};

export default RotateAnimation;
