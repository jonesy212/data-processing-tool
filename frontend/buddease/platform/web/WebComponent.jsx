// WebComponent.jsx

import SharedButton from '@/shared/SharedButton'; // Import the shared button component

// Import the CSS file for platform-specific styles
if (typeof window !== 'undefined') {
  import('@/WebComponent.css');
}

const WebComponent = () => {
  return (
    <div className="web-component-container">
      <h1>Web Component</h1>

      {/* Utilize shared components */}
      <SharedButton text="Click me" />

      {/* Additional platform-specific content */}
      <p>This is a web-specific paragraph.</p>
    </div>
  );
};

export default WebComponent;












