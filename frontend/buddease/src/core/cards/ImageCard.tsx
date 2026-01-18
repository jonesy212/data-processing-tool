// ImageCard.tsx
import Image from 'next/image';
import React from 'react';

interface ImageCardProps {
  id: number;
  label: string;
  imageSrc: string;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ id, label, imageSrc, onClick }) => {
  return (
    <div>
      <h3>{label}</h3>
      <Image src={imageSrc} alt={`Image ${id}`} onClick={onClick} />
    </div>
  );
};

export default ImageCard;
