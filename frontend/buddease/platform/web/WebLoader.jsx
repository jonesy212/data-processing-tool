// WebLoader.jsx
import React from 'react';


if (typeof window !== 'undefined') {
  import('@/WebLoader.css');
}

const WebLoader = () => {
  return <div className="web-loader">Web Loader</div>;
};

export default WebLoader;
