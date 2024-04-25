// components/DynamicIconsAndImages.tsx
import React from 'react';
import LazyIcon from '../LazyIconProps';

interface IconProps {
  name: string;
}

interface ImageProps {
  src: string;
  alt: string;
}

interface DynamicIconsAndImagesProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicIconsAndImages: React.FC<DynamicIconsAndImagesProps> = ({ dynamicContent }) => {
  // Dynamic examples for icons and images
  const iconExamples: IconProps[] = [
    { name: 'heart' },
    { name: 'star' },
    // Add more icon examples as needed
  ];

  const imageExamples: ImageProps[] = [
    { src: 'path/to/image1.jpg', alt: 'Image 1' },
    { src: 'path/to/image2.jpg', alt: 'Image 2' },
    // Add more image examples as needed
  ];

  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Icons and Images</h2>
      {dynamicContent ? renderDynamicContent(iconExamples, imageExamples) : renderStaticContent(iconExamples, imageExamples)}
    </div>
  );
};

const renderStaticContent = (iconExamples: IconProps[], imageExamples: ImageProps[]) => {
  return (
    <div>
      <h3>Static Icons</h3>
      {iconExamples.map((icon, index) => (
        <StaticIcon key={index} {...icon} />
      ))}
      <h3>Static Images</h3>
      {imageExamples.map((image, index) => (
        <StaticImage key={index} {...image} />
      ))}
    </div>
  );
};

const renderDynamicContent = (iconExamples: IconProps[], imageExamples: ImageProps[]) => {
  return (
    <div>
      <h3>Dynamic Icons</h3>
      {iconExamples.map((icon, index) => (
        <LazyIcon key={index} loadIcon={() => import(`./../../components/icons/${icon.name}.svg`)} />
      ))}
      <h3>Dynamic Images</h3>
      {imageExamples.map((image, index) => (
        <Image key={index} {...image} />
      ))}
    </div>
  );
};

// Static Icon component
const StaticIcon: React.FC<IconProps> = ({ name }) => {
  return <span>{name}</span>;
};

// Static Image component
const StaticImage: React.FC<ImageProps> = ({ src, alt }) => {
  return <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
};

// Dynamic Icon component
const Icon: React.FC<IconProps> = ({ name }) => {
  return <span>{name}</span>;
};

// Dynamic Image component
const Image: React.FC<ImageProps> = ({ src, alt }) => {
  return <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
};

export default DynamicIconsAndImages;
