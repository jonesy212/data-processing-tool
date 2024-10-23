// AndroidIcon.js
import React from 'react';
import { Image } from 'react-native';

const AndroidIcon = () => {
  return (
    <Image
      source={require('./android-icon.png')} // Adjust the path to your Android icon image
      style={{ width: 50, height: 50 }} // Adjust the size of the icon as needed
    />  
  );
};

export default AndroidIcon;
