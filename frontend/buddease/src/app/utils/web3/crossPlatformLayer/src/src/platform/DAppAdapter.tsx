// DAppAdapter.ts
import { DAppPlugin } from '@/app/utils/web3/pluginSystem/plugins/PluginInterface';
import loadPlugins from '@/app/utils/web3/pluginSystem/plugins/loader';
import { useEffect, useState } from 'react';
import React from "react";

export interface PluginManagerConfig {
  autoDiscover: boolean;
  loadTimeout: number;
  sandbox: boolean;
  maxLoadAttempts: number;
  allowedOrigins: string[];
}

export interface PluginError {
  pluginId: string;
  error: Error;
  type: 'load' | 'runtime' | 'dependency';
  timestamp: Date;
}

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
  onPluginLoaded: (plugins: AppPlugin[]) => void;
  onPluginError?: (error: PluginError) => void;
  onPluginInitialized?: (plugin: AppPlugin) => void;
  // Customization Props
  customComponent?: React.ReactNode;

  // Web3 Integration Props
  web3Provider: Web3Provider;
  accountAddress: string;

  // Plugin Configuration
  pluginConfig?: PluginManagerConfig;

  // Other Props
  additionalProp1?: string;
  additionalProp2?: number;
  // ... add more as needed
}



export const DAppAdapter: React.FC<DAppAdapterProps> = ({
  title,
  description,
  className = '',
  style,
  userId,
  userName,
  data,
  fetchData,
  onClick,
  onHover,
  enableFeatureA,
  enableFeatureB,
  onPluginLoaded,
  onPluginError,
  onPluginInitialized,
  customComponent,
  web3Provider,
  accountAddress,
  pluginConfig,
  additionalProp1,
  additionalProp2
}) => {
  const [plugins, setPlugins] = useState<DAppPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePlugins = async () => {
      try {
        setIsLoading(true);
        const loadedPlugins = await loadPlugins();
        const dappPlugins = loadedPlugins as unknown as DAppPlugin[];
        
        setPlugins(dappPlugins);

        // Convert to AppPlugin format for callback
        const appPlugins: AppPlugin[] = dappPlugins.map(plugin => ({
          id: plugin.name || 'unknown',
          name: plugin.name || 'Unknown Plugin',
          version: plugin.version || '1.0.0',
          enabled: true,
          config: plugin.config || {}
        }));

        // Notify parent about loaded plugins
        onPluginLoaded(appPlugins);

        // Initialize each plugin and notify parent
        dappPlugins.forEach((plugin) => {
          if (plugin.initialize) {
            plugin.initialize();
            
            // Notify parent about initialized plugin
            if (onPluginInitialized) {
              onPluginInitialized({
                id: plugin.name || 'unknown',
                name: plugin.name || 'Unknown Plugin',
                version: plugin.version || '1.0.0',
                enabled: true,
                config: plugin.config || {}
              });
            }
          }
        });

      } catch (error) {
        const pluginError: PluginError = {
          pluginId: 'global',
          error: error as Error,
          type: 'load',
          timestamp: new Date()
        };
        
        setError(`Failed to load plugins: ${(error as Error).message}`);
        
        // Notify parent about error
        if (onPluginError) {
          onPluginError(pluginError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePlugins();

    return () => {
      // Cleanup: call destroy on all plugins if available
      plugins.forEach(plugin => {
        if (plugin.destroy) {
          plugin.destroy();
        }
      });
    };
  }, [onPluginLoaded, onPluginError, onPluginInitialized]);

  const handlePluginAction = (pluginId: string, action: string) => {
    const plugin = plugins.find(p => p.name === pluginId);
    if (plugin && plugin.execute) {
      plugin.execute(action, { userId, accountAddress });
    }
  };

  if (isLoading) {
    return (
      <div className={`dapp-adapter loading ${className}`} style={style}>
        <div className="loading-spinner">
          <h2>Loading DApp Adapter...</h2>
          <p>Initializing plugins and services</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dapp-adapter error ${className}`} style={style}>
        <h2>Error Loading DApp Adapter</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div 
      className={`dapp-adapter ${className}`} 
      style={style}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Header Section */}
      <header className="dapp-header">
        <h1>{title}</h1>
        <p className="description">{description}</p>
        <div className="user-info">
          <span>User: {userName}</span>
          <span>Account: {accountAddress}</span>
        </div>
      </header>

      {/* Plugin Status Section */}
      <section className="plugins-section">
        <h2>Loaded Plugins ({plugins.length})</h2>
        <div className="plugins-grid">
          {plugins.map((plugin, index) => (
            <div key={index} className="plugin-card">
              <h3>{plugin.name || 'Unnamed Plugin'}</h3>
              <p>Version: {plugin.version || '1.0.0'}</p>
              {plugin.description && <p>{plugin.description}</p>}
              
              {plugin.actions && (
                <div className="plugin-actions">
                  {plugin.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => handlePluginAction(plugin.name || `plugin-${index}`, action)}
                      className="plugin-action-btn"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-list">
          {enableFeatureA && (
            <div className="feature-item">
              <h3>Feature A</h3>
              <p>Feature A is enabled and active</p>
            </div>
          )}
          {enableFeatureB && (
            <div className="feature-item">
              <h3>Feature B</h3>
              <p>Feature B is enabled and active</p>
            </div>
          )}
        </div>
      </section>

      {/* Data Section */}
      <section className="data-section">
        <h2>Data</h2>
        <button onClick={fetchData} className="fetch-data-btn">
          Refresh Data
        </button>
        <div className="data-grid">
          {data.map((item, index) => (
            <div key={index} className="data-item">
              {/* Render your data items here */}
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Component Section */}
      {customComponent && (
        <section className="custom-section">
          {customComponent}
        </section>
      )}

      {/* Additional Information */}
      <footer className="dapp-footer">
        <p>Additional Props: {additionalProp1} {additionalProp2}</p>
        <p>Total Plugins Loaded: {plugins.length}</p>
      </footer>
    </div>
  );
};

export default DAppAdapter