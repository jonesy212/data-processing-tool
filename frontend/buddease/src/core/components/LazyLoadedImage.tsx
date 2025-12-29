// LazyLoadedImage.tsx
import React, { useEffect, useRef } from 'react';

interface LazyLoadedImageProps {
  src: string;
  alt: string;
}

const LazyLoadedImage: React.FC<LazyLoadedImageProps> = ({ src, alt }) => {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement;
          lazyImage.src = src;
          imageObserver.unobserve(lazyImage);
        }
      });
    }, options);

    if (imageRef.current) {
      imageObserver.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        imageObserver.unobserve(imageRef.current);
      }
    };
  }, [src]);

  return <img ref={imageRef} data-src={src} alt={alt} />;
};

export default LazyLoadedImage;
