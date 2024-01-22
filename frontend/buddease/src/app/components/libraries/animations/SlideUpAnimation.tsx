// SlideUpAnimation.tsx
import React, { useEffect, useState } from 'react';

interface SlideUpProps {
  duration: number;
}

const SlideUpAnimation: React.FC<SlideUpProps> = ({ duration }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [duration]);

  return <div style={{ transform: `translateY(${isVisible ? 0 : '100%'})`, transition: `transform ${duration / 1000}s` }}>Slide Up Content</div>;
};

export default SlideUpAnimation;
