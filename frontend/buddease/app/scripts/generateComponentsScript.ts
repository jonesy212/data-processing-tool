// generateComponentsScript.ts
// scripts/generateComponentsScript.ts
import fs from 'fs';
import path from 'path';
import { PatternAnalyzer } from '@/app/scripts/generateComponentsScript'
import { ComponentPatternDetector } from '../../src/app/scripts/ComponentPatternDetector';
import { TemplateGenerator } from './TemplateGenerator';

class GenerateComponentsScript {
  private patternAnalyzer: PatternAnalyzer;
  private patternDetector: ComponentPatternDetector;
  private templateGenerator: TemplateGenerator;

  constructor() {
    this.patternAnalyzer = new PatternAnalyzer();
    this.patternDetector = new ComponentPatternDetector();
    this.templateGenerator = new TemplateGenerator();
  }

  async analyzeCodebase(): Promise<any> {
    console.log('Analyzing codebase patterns...');
    return await this.patternAnalyzer.analyze();
  }

  detectComponentPatterns(analysis: any): any[] {
    console.log('Detecting component patterns...');
    return this.patternDetector.detect(analysis);
  }

  generateTemplates(patterns: any[]): Map<string, string> {
    console.log('Generating component templates...');
    const templates = new Map<string, string>();
    
    patterns.forEach(pattern => {
      const template = this.templateGenerator.generate(pattern);
      templates.set(pattern.componentName, template);
    });
    
    return templates;
  }

  async writeComponents(templates: Map<string, string>, outputDir: string): Promise<void> {
    console.log(`Writing components to ${outputDir}...`);
    
    for (const [componentName, template] of templates) {
      const componentDir = path.join(outputDir, componentName);
      const componentPath = path.join(componentDir, `${componentName}.tsx`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
      }
      
      // Write component file
      fs.writeFileSync(componentPath, template);
      console.log(`✓ Created ${componentPath}`);
    }
  }

  async updateIndexFiles(): Promise<void> {
    console.log('Updating index files...');
    // Implementation for updating barrel exports
    // This would scan directories and update index.ts files
  }

  async execute(template: string, outputDir: string = './src/components/generated'): Promise<void> {
    try {
      console.log('Starting component generation script...');
      
      // Step 1: Analyze codebase
      const analysis = await this.analyzeCodebase();
      
      // Step 2: Detect patterns
      const patterns = this.detectComponentPatterns(analysis);
      
      // Step 3: Generate templates
      const templates = this.generateTemplates(patterns);
      
      // Step 4: Write components
      await this.writeComponents(templates, outputDir);
      
      // Step 5: Update index files
      await this.updateIndexFiles();
      
      console.log('Component generation completed successfully!');
    } catch (error) {
      console.error('Component generation failed:', error);
      throw error;
    }
  }
}

export default GenerateComponentsScript