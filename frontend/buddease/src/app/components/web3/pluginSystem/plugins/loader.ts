import { DAppPlugin } from "./PluginInterface";

const loadPlugins = async (): Promise<DAppPlugin[]> => {
  const plugins = ["fluence", "custom"]; // List of plugins to load

  interface Plugin extends DAppPlugin {
    name: string;
  }

  const loadedPlugins: Plugin[] = [];

  for (const pluginName of plugins) {
    const { initialize, enable, disable, updateConfig, updatePreferences, getInfo, loadPlugins } = await import(`./${pluginName}`);
    const plugin: Plugin = {
      name: pluginName,
      initialize,
      enable: function (): Promise<void> {
        if (enable) enable();
        else console.warn(`${pluginName} plugin does not have an enable method.`);
        return new Promise<void>((resolve) => resolve());
      },
      disable: function (): void {
        if (disable) disable();
        else console.warn(`${pluginName} plugin does not have a disable method.`);
      },
      updateConfig: function (config: Record<string, any>): void {
        if (updateConfig) updateConfig(config);
        else console.warn(`${pluginName} plugin does not have an updateConfig method.`);
      },
      updatePreferences: function (preferences: Record<string, any>): void {
        if (updatePreferences) updatePreferences(preferences);
        else console.warn(`${pluginName} plugin does not have an updatePreferences method.`);
      },
      getInfo: function (): Record<string, any> {
        if (getInfo) return getInfo();
        else {
          console.warn(`${pluginName} plugin does not have an getInfo method.`);
          return {};
        }
      },
      loadPlugins: function (): void {
        if (loadPlugins) loadPlugins();
        else console.warn(`${pluginName} plugin does not have a loadPlugins method.`);
      },
      enableRealtimeCollaboration: function (): void {
        if (this.enableRealtimeCollaboration) this.enableRealtimeCollaboration();
        else console.warn(`${pluginName} plugin does not have an enableRealtimeCollaboration method.`);
      },
      enableChatFunctionality: function (): void {
        if (this.enableChatFunctionality) this.enableChatFunctionality();
        else console.warn(`${pluginName} plugin does not have an enableChatFunctionality method.`);
      },
    };

    loadedPlugins.push(plugin);
  }

  return loadedPlugins;
};

export default loadPlugins;
