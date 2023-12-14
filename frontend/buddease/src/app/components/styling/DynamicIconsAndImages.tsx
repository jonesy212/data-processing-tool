// components/IconsAndImages.js
import React from 'react';

const IconsAndImages = () => {
  return (
    <div>
      <h2>Icons and Images</h2>
      {/* Include examples of icons and images */}
      <Icon name="heart" />
      <Image src="path/to/image.jpg" alt="Example Image" />
      {/* Add more icon and image examples */}
    </div>
  );
};

// Dummy Icon component
const Icon = ({ name }) => {
  // You can use a library like react-icons for real icons
  return <span>{name}</span>;
};

// Dummy Image component
const Image = ({ src, alt }) => {
  return <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
};

export default IconsAndImages;
