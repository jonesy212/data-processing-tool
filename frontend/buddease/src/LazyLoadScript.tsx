import React, { ReactNode } from 'react';

interface LazyLoadScriptProps {
  loadScript: () => Promise<ReactNode>;
}

const LazyLoadScript: React.FC<LazyLoadScriptProps> = ({ loadScript }) => {
  const [script, setScript] = React.useState<ReactNode | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const loadedScript = await loadScript();
      setScript(loadedScript);
    };

    load();
  }, [loadScript]);

  return <>{script}</>;
};




export default LazyLoadScript;
