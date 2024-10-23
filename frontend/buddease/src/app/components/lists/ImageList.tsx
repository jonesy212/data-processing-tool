import React from 'react';
import ClickableList from '../actions/ClickableList';

const ImageList: React.FC = () => {
  const items = [
    { id: 1, label: 'Image 1', imageSrc: '/path/to/image1.jpg', onClick: () => console.log('Clicked Image 1') },
    { id: 2, label: 'Image 2', imageSrc: '/path/to/image2.jpg', onClick: () => console.log('Clicked Image 2') },
    // Add more items as needed
  ];

  return <ClickableList items={items} />;
};

export default ImageList;
