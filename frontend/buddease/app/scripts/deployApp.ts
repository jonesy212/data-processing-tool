// deployApp.ts
// scripts/deployApp.ts - A "big method" for deployment
class DeployAppScript {
  async execute(): Promise<void> {
    // These would be individual methods in normal code
    await this.validateEnvironment();      // ← Method
    await this.runTests();                // ← Method  
    await this.buildAssets();             // ← Method
    await this.deployToServer();          // ← Method
    await this.runMigrations();           // ← Method
    await this.verifyDeployment();        // ← Method
    await this.notifyTeam();              // ← Method
  }
}
// This script gets reused across: staging, production, different apps