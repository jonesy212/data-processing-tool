// WelcomePage.tsx
import DynamicNamingConventions from '@/app/components/DynamicNamingConventions';
import React from 'react';

const WelcomePage: React.FC = () => {
  // Implementation for welcome page
  return (
    <div>
      <h1>Welcome Page</h1>
      <DynamicNamingConventions dynamicContent={true} />
      {/* Add welcome page content */}
    </div>
  );
};

export default WelcomePage;
