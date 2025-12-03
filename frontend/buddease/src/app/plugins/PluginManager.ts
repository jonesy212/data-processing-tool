// PluginManager.ts
import { CallbackRegistry } from "@/app/libraries/eventSystem/callbackRegistry";
import loadPlugins from "@/utils/web3/pluginSystem/plugins/loader";
import { DAppPlugin } from "@/utils/web3/pluginSystem/plugins/PluginInterface";

import { PluginError } from "@/app/components/dapp/DAppAdapter"; // adjust import path if needed
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";

export interface PluginManagerOptions {
  autoDiscover?: boolean;
  sandbox?: boolean;
  loadTimeout?: number;
  maxLoadAttempts?: number;
  allowedOrigins?: string[];
}

export interface LoadedPlugin {
  id: string;
  instance: DAppPlugin;
}

export class PluginManager {
  private registry: CallbackRegistry;
  private plugins: Map<string, DAppPlugin> = new Map();
  private options: PluginManagerOptions;

  constructor(registry: CallbackRegistry, options: PluginManagerOptions = {}) {
    this.registry = registry;
    this.options = {
      autoDiscover: true,
      sandbox: false,
      loadTimeout: 5000,
      maxLoadAttempts: 3,
      allowedOrigins: ["*"],
      ...options
    };
  }

  /**
   * Loads and initializes all plugins
   */
  async loadAll(): Promise<void> {
    try {
      const loadedPlugins = await loadPlugins();
      const plugins = loadedPlugins as DAppPlugin[];

      for (const plugin of plugins) {
        await this.registerPlugin(plugin);
      }
    } catch (error) {
      console.error("[PluginManager] Global load error:", error);
    }
  }

  /**
   * Register and initialize a single plugin
   */
  async registerPlugin(plugin: DAppPlugin): Promise<string> {
    const id = plugin.name || UniqueIDGenerator.generateId("plugin");

    this.plugins.set(id, plugin);

    // Initialize if available
    if (plugin.initialize) {
      try {
        await plugin.initialize();
      } catch (e) {
        const pluginError: PluginError = {
          pluginId: id,
          error: e as Error,
          type: "load",
          timestamp: new Date()
        };
        console.error("[PluginManager] Plugin initialize error:", pluginError);
      }
    }

    return id;
  }

  /**
   * Remove / teardown plugin
   */
  unregisterPlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;

    if (plugin.destroy) {
      try {
        plugin.destroy();
      } catch (e) {
        console.error(`[PluginManager] Error destroying plugin ${id}:`, e);
      }
    }

    return this.plugins.delete(id);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): DAppPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Execute an action on a plugin
   */
  async executePluginAction(
    pluginId: string,
    action: string,
    payload: any = {}
  ): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.execute) return;

    try {
      return await plugin.execute(action, payload);
    } catch (error) {
      const pluginError: PluginError = {
        pluginId,
        error: error as Error,
        type: "runtime",
        timestamp: new Date()
      };
      console.error("[PluginManager] Plugin runtime error:", pluginError);
      return undefined;
    }
  }

  /**
   * Dispatch event to callback registry
   */
  async dispatch(eventType: string, eventData: any): Promise<void> {
    return this.registry.executeCallbacks(eventType, eventData);
  }

  /**
   * Get all loaded plugins
   */
  getAll(): LoadedPlugin[] {
    const result: LoadedPlugin[] = [];
    for (const [id, instance] of this.plugins.entries()) {
      result.push({ id, instance });
    }
    return result;
  }

  /**
   * Destroy all plugins
   */
  destroyAll(): void {
    for (const [id, plugin] of this.plugins.entries()) {
      if (plugin.destroy) {
        try {
          plugin.destroy();
        } catch (e) {
          console.error(`[PluginManager] Error destroying plugin ${id}:`, e);
        }
      }
    }
    this.plugins.clear();
  }
}

export default PluginManager;
