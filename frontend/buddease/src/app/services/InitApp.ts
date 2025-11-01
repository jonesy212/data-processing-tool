import { configurationService } from "@/services/ConfigurationService";

async function initApp() {
  const config = await configurationService.getSnapshotConfig();
  console.log("Loaded snapshot config:", config.systemConfigs.apiUrl);

  // Later, if configs change:
  configurationService.resetConfigs();
}

export default initApp