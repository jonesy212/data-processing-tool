// GenerateComponentComponent.tsx
components/generator/GenerateComponentComponent.tsx
"use client";

import React, { useState } from 'react';

interface GenerateComponentComponentProps {
  // Add any props needed for component generation
  onComponentGenerated?: (componentName: string) => void;
}

const GenerateComponentComponent: React.FC<GenerateComponentComponentProps> = ({
  onComponentGenerated
}) => {
  const [componentName, setComponentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateComponent = async () => {
    if (!componentName.trim()) {
      alert('Please enter a component name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ componentName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Component generated successfully:', data);
        onComponentGenerated?.(componentName);
        setComponentName('');
      }
    } catch (error) {
      console.error('Failed to generate component:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-component-component">
      <h3>Generate Component</h3>
      <div className="input-group">
        <input
          type="text"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          placeholder="Enter component name"
          className="form-control"
        />
        <button 
          onClick={handleGenerateComponent}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Component'}
        </button>
      </div>
      <p className="description">
        Enter a component name to generate a new React component with proper structure.
      </p>
    </div>
  );
};

export default GenerateComponentComponent;
