// LazyLoadScript.tsx
import React, { ReactNode } from 'react';

interface LazyLoadScriptProps {
  loadScript: () => Promise<ReactNode>;
}

const LazyLoadScript: React.FC<LazyLoadScriptProps> = ({ loadScript }) => {
  const [script, setScript] = React.useState<ReactNode | null>(null);
  const [error, setError] = React.useState<string | null>(null); // Add state to store error

  React.useEffect(() => {
    const load = async () => {
      try {
        const loadedScript = await loadScript();
        setScript(loadedScript);
      } catch (error) {
        console.error('Error loading script:', error);
        // Handle error loading script
        setError('An error occurred while loading the script. Please try again later.');
      }
    };

    load();
  }, [loadScript]);

  return (
    <>
      {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        // Render the loaded script or a loading indicator
        <div>{script || 'Loading script...'}</div>
      )}
    </>
  );
};

export default LazyLoadScript;
