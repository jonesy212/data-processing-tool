// contentManagementPage.js

import React from 'react';

// Define the content management page generator function
const contentManagementPage = (Component) => {
  // Return a functional component that wraps the provided component with content management features
  return () => {
    return (
      <div>
        {/* You can add any additional content management features here */}
        <Component />
      </div>
    );
  };
};

export default contentManagementPage;
