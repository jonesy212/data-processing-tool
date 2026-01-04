scripts/ApplicationSetupScript.ts
import { DatabaseSetupScript } from '@/core/actions/database';
import { ConfigurationGenerationScript } from '@/core/api/config';
import { ProjectConfig } from '@/core/config/ProjectConfig';
import { DependencyInstallationScript } from '@/core/scripts/DependencyInstallationScript';
import { CodeScaffoldingScript } from '../../../app/scripts/CodeScaffoldingScript';
import { QualityChecksScript } from '../../../app/scripts/QualityChecksScript';

export class ApplicationSetupScript {
  private dependencyScript: DependencyInstallationScript;
  private databaseScript: DatabaseSetupScript;
  private configScript: ConfigurationGenerationScript;
  private scaffoldingScript: CodeScaffoldingScript;
  private qualityScript: QualityChecksScript;

  constructor() {
    this.dependencyScript = new DependencyInstallationScript();
    this.databaseScript = new DatabaseSetupScript();
    this.configScript = new ConfigurationGenerationScript();
    this.scaffoldingScript = new CodeScaffoldingScript();
    this.qualityScript = new QualityChecksScript();
  }

  async setupNewProject(projectConfig: ProjectConfig): Promise<void> {
    console.log('🎯 Starting application setup process...');
    console.log(`Project: ${projectConfig.projectName}`);
    console.log(`Path: ${projectConfig.projectPath}`);
    console.log('=' .repeat(50));

    try {
      // Step 1: Install dependencies
      await this.dependencyScript.execute(projectConfig);
      
      // Step 2: Setup database
      await this.databaseScript.execute(projectConfig);
      
      // Step 3: Generate configurations
      await this.configScript.execute(projectConfig);
      
      // Step 4: Scaffold code structure
      await this.scaffoldingScript.execute(projectConfig);
      
      // Step 5: Run quality checks
      await this.qualityScript.execute(projectConfig);
      
      console.log('=' .repeat(50));
      console.log('🎉 Application setup completed successfully!');
      console.log(`📁 Project location: ${projectConfig.projectPath}`);
      console.log('🚀 Next steps:');
      console.log('   cd ' + projectConfig.projectName);
      console.log('   npm run dev');
      
    } catch (error) {
      console.error('💥 Application setup failed!');
      throw error;
    }
  }
}