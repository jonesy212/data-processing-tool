// DAppAdapter.ts
import { DAppPlugin } from '@/app/components/web3/pluginSystem/plugins/PluginInterface';
import loadPlugins from '@/app/components/web3/pluginSystem/plugins/loader';
import { useEffect, useState } from 'react';

import React from "react";

export interface DAppAdapterProps {
  // General Props
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;

  // User-related Props
  userId: string;
  userName: string;

  // Data Props
  data: any[]; // Replace 'any' with the actual data type
  fetchData: () => void;

  // Event Props
  onClick: () => void;
  onHover: (isHovered: boolean) => void;

  // Configuration Props
  enableFeatureA: boolean;
  enableFeatureB: boolean;

  // Callback Props
  onPluginLoaded: (plugins: Plugin[]) => void;

  // Customization Props
  customComponent?: React.ReactNode;

  // Web3 Integration Props
  web3Provider: Web3Provider;
  accountAddress: string;

  // Other Props
  additionalProp1?: string;
  additionalProp2?: number;
  // ... add more as needed
}


export const DAppAdapter: React.FC<DAppAdapterProps> = () => {
  const [plugins, setPlugins] = useState<DAppPlugin[]>([]);

  useEffect(() => {
    // Load and initialize plugins when the component mounts
    const initializePlugins = async () => {
      try {
        const loadedPlugins = await loadPlugins();
        setPlugins(loadedPlugins as unknown as DAppPlugin[]);
      } catch (error) {
        console.error("Error loading plugins:", error);
      }
    };

    initializePlugins();

    // Cleanup logic if needed
    return () => {
      // Any cleanup logic can go here
    };
  }, []);

  useEffect(() => {
    // Initialize plugins when the plugins state changes
    plugins.forEach((plugin) => {
      if (plugin.initialize) {
        plugin.initialize();
      }
    });

    // Cleanup logic if needed
    return () => {
      // Any cleanup logic can go here
    };
  }, [plugins]);

  // Your DAppAdapter component logic here

  return (
    <div>
      <h1>DAppAdapter</h1>
      {/* Render other components or UI related to the DAppAdapter */}
    </div>
  );
};

  


export default  {DAppAdapter};
