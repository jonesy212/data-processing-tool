// analyzers/ThemeAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ThemeAnalyzer extends BaseAnalyzer {
  name = 'theme';
  filePatterns = ['**/theme/**/*.ts', '**/theme/**/*.tsx', '**/branding/**/*.ts', '**/*Theme*.ts', '**/*Branding*.ts'];

  private patterns = {
    themeContext: /ThemeContext|useTheme/,
    brandingImport: /from ['"]@\/core\/branding/,
    validateHexColor: /validateHexColor\(/,
    darkMode: /darkMode|isDarkMode/,
    themeConfig: /ThemeConfig|themeSettings/
  };

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    // Analyze theme configuration
    corrections.push(...await this.analyzeThemeConfiguration(files));
    
    // Check for consistent branding usage
    corrections.push(...await this.analyzeBrandingPatterns(files));
    
    // Validate theme integration in components
    corrections.push(...await this.analyzeComponentThemeUsage());
    
    return corrections;
  }

  private async analyzeThemeConfiguration(files: string[]): Promise<Correction[]> {
    const corrections: Correction[] = [];

    // Check for theme settings file
    const themeConfigFiles = files.filter(f => 
      f.includes('ThemeConfig.ts') || f.includes('ThemeConfig.tsx')
    );

    if (themeConfigFiles.length === 0) {
      corrections.push(this.createCorrection(
        `theme-config-missing-${this.hashPath('project')}`,
        'warning' as CorrectionType,
        'medium' as CorrectionSeverity,
        'Missing ThemeConfig.ts file',
        'src/core/libraries/ui/theme/ThemeConfig.ts',
        '// No ThemeConfig.ts found',
        'Create ThemeConfig.ts with theme settings and validation',
        'theme-structure' as CorrectionCategory,
        1,
        'ThemeConfig.ts defines available themes and validation rules'
      ));
    }

    // Analyze each theme config file
    for (const configFile of themeConfigFiles) {
      const content = await fs.readFile(configFile, 'utf8');
      
      // Check for validateHexColor usage
      if (!this.patterns.validateHexColor.test(content)) {
        corrections.push(this.createCorrection(
          `theme-validation-missing-${this.hashPath(configFile)}`,
          'warning' as CorrectionType,
          'high' as CorrectionSeverity,
          'Theme colors not validated',
          configFile,
          this.extractCodeSnippet(content, /primaryColor|themeColor/),
          'Wrap color values with validateHexColor()',
          'theme-safety' as CorrectionCategory,
          this.getLineNumber(content, 'primaryColor')
        ));
      }

      // Check for dark mode support
      if (!this.patterns.darkMode.test(content)) {
        corrections.push(this.createCorrection(
          `theme-darkmode-missing-${this.hashPath(configFile)}`,
          'suggestion' as CorrectionType,
          'low' as CorrectionSeverity,
          'Theme config lacks dark mode',
          configFile,
          '// Consider adding dark mode support',
          'Add darkModeBackground, darkModeText to theme config',
          'theme-feature' as CorrectionCategory
        ));
      }
    }

    return corrections;
  }

  private async analyzeBrandingPatterns(files: string[]): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const brandingFiles = files.filter(f => 
      f.includes('Branding.ts') || f.includes('BrandingConfig.ts')
    );

    for (const brandingFile of brandingFiles) {
      const content = await fs.readFile(brandingFile, 'utf8');

      // Check for BrandingSettings interface usage
      if (!content.includes('BrandingSettings')) {
        corrections.push(this.createCorrection(
          `branding-no-interface-${this.hashPath(brandingFile)}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          'Branding file should use BrandingSettings interface',
          brandingFile,
          this.extractCodeSnippet(content, /export const defaultBranding/),
          'Type branding with: export const defaultBranding: BrandingSettings = {...}',
          'branding-typing' as CorrectionCategory
        ));
      }

      // Check for defaultBrandingSettings
      if (!content.includes('defaultBrandingSettings')) {
        corrections.push(this.createCorrection(
          `branding-no-default-${this.hashPath(brandingFile)}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          'Missing defaultBrandingSettings',
          brandingFile,
          '// Should export defaultBrandingSettings',
          'Add defaultBrandingSettings with comprehensive branding values',
          'branding-completeness' as CorrectionCategory
        ));
      }
    }

    return corrections;
  }

  private async analyzeComponentThemeUsage(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const componentFiles = await this.getFiles(['**/*.tsx', '**/*.jsx']);
    
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf8');
      
      // Skip theme files themselves
      if (this.filePatterns.some(pattern => file.includes(pattern.replace('**/', '').replace('*.ts', '')))) {
        continue;
      }

      if (this.patterns.themeContext.test(content)) {
        corrections.push(...this.analyzeThemeContextUsage(file, content));
      }
    }

    return corrections;
  }

  private analyzeThemeContextUsage(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for proper theme null check (useTheme returns Theme | null)
    if (content.includes('useTheme()')) {
      const lines = content.split('\n');
      const themeLine = lines.findIndex(line => line.includes('useTheme()'));
      
      // Look ahead for null check
      const nextLines = lines.slice(themeLine + 1, themeLine + 5).join('\n');
      if (!nextLines.includes('if (!theme)') && !nextLines.includes('theme?.') && !nextLines.includes('theme &&')) {
        corrections.push(this.createCorrection(
          `theme-null-check-${this.hashPath(file)}`,
          'warning' as CorrectionType,
          'high' as CorrectionSeverity,
          'useTheme() return value not null-checked',
          file,
          this.extractCodeSnippet(content, 'useTheme()'),
          'Add null check: if (!theme) return null; or use optional chaining: theme?.',
          'theme-robustness' as CorrectionCategory,
          themeLine + 1
        ));
      }
    }

    // Check for BrandingSettings validation
    if (content.includes('defaultBranding') && !this.patterns.validateHexColor.test(content)) {
      corrections.push(this.createCorrection(
        `theme-unvalidated-colors-${this.hashPath(file)}`,
        'suggestion' as CorrectionType,
        'medium' as CorrectionSeverity,
        `Branding colors in ${file} should be validated`,
        file,
        this.extractCodeSnippet(content, 'defaultBranding'),
        'Use validateHexColor() for color values from branding',
        'theme-safety' as CorrectionCategory
      ));
    }

    return corrections;
  }

  // Utility methods
  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 2): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(search));
    return index === -1 ? 1 : index + 1;
  }

  private hashPath(filePath: string): string {
    return Buffer.from(filePath).toString('base64').slice(0, 10);
  }
}