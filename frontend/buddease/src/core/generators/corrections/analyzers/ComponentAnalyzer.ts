// analyzers/ComponentAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentPatternAnalyzer } from '@/core/generators/corrections/analyzers/ComponentPatternAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ComponentAnalyzer extends BaseAnalyzer {
  name = 'component';
  private patternAnalyzer = new ComponentPatternAnalyzer();
  
  // Patterns to detect different component types
  private patterns = {
    hasJSX: /return\s*<|return\s*\(|import\s+React|React\.(FC|Component)/,
    isComplex: /useEffect|useCallback|useMemo|className.*=/,
    needsErrorBoundary: /fetch\(|axios\.|socket|WebSocket/
  };

  /**
   * Main analysis function - integrates ComponentPatternAnalyzer
   */
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(['**/*.tsx', '**/*.jsx']);
    
    // Run pattern analyzer to get component statistics
    const patternAnalysis = await this.patternAnalyzer.analyzeProject(this.projectRoot);
    
    // Generate high-level component architecture suggestions
    corrections.push(...this.generateArchitectureSuggestions(patternAnalysis));
    
    // Analyze individual files for component-specific issues
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const fileCorrections = await this.analyzeComponent(file, content, patternAnalysis);
      corrections.push(...fileCorrections);
    }
    
    return corrections;
  }

  private generateArchitectureSuggestions(
    patternAnalysis: ComponentPatternAnalysis
  ): Correction[] {
    const suggestions: Correction[] = [];
    
    if (patternAnalysis.totalComponents === 0) return suggestions;

    // Check for inconsistent component patterns
    const fcUsage = patternAnalysis.patterns.reactFC;
    const arrowUsage = patternAnalysis.patterns.arrowFunction;
    const regularUsage = patternAnalysis.patterns.regularFunction;

    if (fcUsage === 0 && arrowUsage > 0) {
      suggestions.push(this.createCorrection(
        `component-pattern-fc-${this.hashPath('project')}`,
        'suggestion' as CorrectionType,
        'low' as CorrectionSeverity,
        'Consider using React.FC for type safety',
        'project',
        `// Arrow functions: ${arrowUsage}, React.FC: 0`,
        'Convert components to React.FC<Props> pattern for better type inference',
        'component-pattern' as CorrectionCategory,
        1,
        'React.FC provides built-in children typing and better IDE support'
      ));
    }

    // Check for missing destructured props
    const destructuredRatio = patternAnalysis.patterns.destructuredProps / patternAnalysis.totalComponents;
    if (destructuredRatio < 0.5) {
      suggestions.push(this.createCorrection(
        `component-pattern-destructure-${this.hashPath('project')}`,
        'suggestion' as CorrectionType,
        'medium' as CorrectionSeverity,
        'Increase use of destructured props',
        'project',
        `// Only ${Math.round(destructuredRatio * 100)}% of components use destructured props`,
        'Destructure props in function signature for better readability',
        'component-pattern' as CorrectionCategory
      ));
    }

    return suggestions;
  }

  private async analyzeComponent(
    file: string,
    content: string,
    patternAnalysis: ComponentPatternAnalysis
  ): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const filename = path.basename(file, path.extname(file));
    const dirname = path.dirname(file);

    // 1. Check for missing error boundaries in complex components
    if (this.patterns.needsErrorBoundary.test(content) && 
        !content.includes('ErrorBoundary')) {
      corrections.push(this.createCorrection(
        `component-error-boundary-${this.hashPath(file)}`,
        'warning' as CorrectionType,
        'high' as CorrectionSeverity,
        `Complex component should have error boundary: ${filename}`,
        file,
        this.extractCodeSnippet(content, /fetch\(|WebSocket/),
        'Wrap component with ErrorBoundary for graceful error handling',
        'component-stability' as CorrectionCategory,
        this.getLineNumber(content, 'return'),
        'Components with async operations should have error boundaries'
      ));
    }

    // 2. Check for consistent props typing based on pattern analysis
    if (content.includes('interface') && !content.includes('React.FC')) {
      const interfaceMatch = content.match(/interface (\w+Props)/);
      if (interfaceMatch && !content.includes(`React.FC<${interfaceMatch[1]}>`)) {
        corrections.push(this.createCorrection(
          `component-typing-${this.hashPath(file)}`,
          'suggestion' as CorrectionType,
          'medium' as CorrectionSeverity,
          `Use React.FC with interface: ${interfaceMatch[1]}`,
          file,
          `interface ${interfaceMatch[1]} { ... }`,
          `Convert to: const ${filename}: React.FC<${interfaceMatch[1]}> = ({...})`,
          'component-pattern' as CorrectionCategory,
          this.getLineNumber(content, 'interface ' + interfaceMatch[1])
        ));
      }
    }

    // 3. Check for missing CSS files (connects with CSSAnalyzer logic)
    if (this.patterns.isComplex.test(content)) {
      const hasCSS = await this.checkForCSSFile(file);
      if (!hasCSS) {
        corrections.push(this.createCorrection(
          `component-missing-css-${this.hashPath(file)}`,
          'suggestion' as CorrectionType,
          'low' as CorrectionSeverity,
          `Component lacks CSS file: ${filename}`,
          file,
          this.extractCodeSnippet(content, 'className'),
          `Create ${this.suggestCSSFilename(file)} for component styling`,
          'css' as CorrectionCategory,
          this.getLineNumber(content, 'className')
        ));
      }
    }

    // 4. Check for WebSocket usage in components (like Component.tsx)
    if (content.includes('socket.io') || content.includes('WebSocket')) {
      corrections.push(...this.analyzeWebSocketUsage(file, content));
    }

    // 5. Check for prop drilling (count props passed through multiple levels)
    corrections.push(...this.analyzePropDrilling(file, content));

    // 6. Check for theme consistency (based on theme-related files)
    if (content.includes('useTheme') || content.includes('ThemeContext')) {
      corrections.push(...this.analyzeThemeUsage(file, content));
    }

    return corrections;
  }

  private analyzeWebSocketUsage(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    const hasCleanup = content.includes('disconnect') || 
                      content.includes('return () =>') || 
                      content.includes('cleanup');

    if (!hasCleanup) {
      corrections.push(this.createCorrection(
        `component-websocket-cleanup-${this.hashPath(file)}`,
        'error' as CorrectionType,
        'critical' as CorrectionSeverity,
        'WebSocket connection missing cleanup',
        file,
        this.extractCodeSnippet(content, /new Socket|io\(/),
        'Add cleanup function to disconnect WebSocket on unmount',
        'component-cleanup' as CorrectionCategory,
        this.getLineNumber(content, 'useEffect'),
        'WebSocket connections must be cleaned up to prevent memory leaks'
      ));
    }

    return corrections;
  }

  private analyzePropDrilling(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    const propsMatches = content.match(/props\./g);
    const depth = propsMatches ? propsMatches.length : 0;

    if (depth > 5) {
      corrections.push(this.createCorrection(
        `component-prop-drilling-${this.hashPath(file)}`,
        'warning' as CorrectionType,
        'medium' as CorrectionSeverity,
        `Heavy prop drilling detected: ${depth} levels`,
        file,
        this.extractCodeSnippet(content, /props\.[a-zA-Z.]+\./),
        'Consider using Context API or state management library',
        'component-architecture' as CorrectionCategory,
        this.getLineNumber(content, 'props.')
      ));
    }

    return corrections;
  }

  private analyzeThemeUsage(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for proper theme typing
    if (content.includes('useTheme()') && !content.includes('Theme | null')) {
      corrections.push(this.createCorrection(
        `component-theme-typing-${this.hashPath(file)}`,
        'warning' as CorrectionType,
        'low' as CorrectionSeverity,
        'Theme usage missing null check',
        file,
        'const theme = useTheme();',
        'Use: const theme = useTheme(); if (!theme) return null;',
        'component-robustness' as CorrectionCategory,
        this.getLineNumber(content, 'useTheme()')
      ));
    }

    // Check for BrandingSettings integration
    if (content.includes('BrandingSettings') && !content.includes('validateHexColor')) {
      corrections.push(this.createCorrection(
        `component-branding-validation-${this.hashPath(file)}`,
        'suggestion' as CorrectionType,
        'low' as CorrectionSeverity,
        'Branding colors should be validated',
        file,
        'color: branding.themeColor',
        'Wrap with validateHexColor: color: validateHexColor(branding.themeColor)',
        'component-safety' as CorrectionCategory
      ));
    }

    return corrections;
  }

  // Utility methods
  private async checkForCSSFile(file: string): Promise<boolean> {
    const basePath = file.replace(/\.(tsx|jsx)$/, '');
    const extensions = ['.css', '.scss', '.module.css', '.module.scss'];
    
    for (const ext of extensions) {
      try {
        await fs.access(basePath + ext);
        return true;
      } catch {
        // Continue to next extension
      }
    }
    return false;
  }

  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 3): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(search));
    return index + 1;
  }

  private suggestCSSFilename(file: string): string {
    const baseName = path.basename(file, path.extname(file));
    const dir = path.dirname(file);
    return `${dir}/${baseName}.module.css`;
  }
}