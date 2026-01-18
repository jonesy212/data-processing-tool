// FadeInAnimation.tsx
import React, { useEffect, useState } from 'react';

interface FadeInProps {
  duration: number;
}

const FadeInAnimation: React.FC<FadeInProps> = ({ duration }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [duration]);

  return <div style={{ opacity: isVisible ? 1 : 0, transition: `opacity ${duration / 1000}s` }}>Fade In Content</div>;
};

export default FadeInAnimation;
