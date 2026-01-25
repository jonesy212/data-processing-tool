// ComponentPatternAnalyzer.ts

import fs from 'fs';
import path from 'path';
import type { ComponentPatternAnalysis } from '@/core/shared/pattern-types';
import { ComponentPatternMetrics } from '@/core/shared/pattern-types';
  ComponentPatternAnalysis,
  ComponentPatternMetrics
} from '@/core/shared/pattern-types';

export class ComponentPatternAnalyzer {
  async analyzeProject(rootDir: string): Promise<ComponentPatternAnalysis> {
    const allFiles = await this.findAllTypeScriptFiles(rootDir);
    const analysis: ComponentPatternAnalysis = {
      totalComponents: 0,
      patterns: {
        destructuredProps: 0,
        typedProps: 0,
        reactFC: 0,
        regularFunction: 0,
        arrowFunction: 0,
        interfaceAbove: 0,
        inlineType: 0,
      }
    };

    for (const file of allFiles) {
      const fileAnalysis = this.analyzeFile(file);
      if (fileAnalysis.totalComponents) {
        analysis.totalComponents += fileAnalysis.totalComponents;
        Object.keys(analysis.patterns).forEach(key => {
          if (fileAnalysis.patterns?.[key as keyof ComponentPatternMetrics]) {
            analysis.patterns[key as keyof ComponentPatternMetrics]++;
          }
        });
      }
    }

    return analysis;
  }

  private analyzeFile(filePath: string): Partial<ComponentPatternAnalysis> {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const patterns = {
      destructuredProps: /const \w+: React\.FC<\w+Props> = \({/g.test(content),
      typedProps: /props: \w+Props/g.test(content),
      reactFC: /React\.FC/g.test(content),
      regularFunction: /function \w+\(/g.test(content),
      arrowFunction: /const \w+ = \(/g.test(content),
      interfaceAbove: /interface \w+Props/g.test(content),
      inlineType: /:\s*{/g.test(content),
    };

    const hasComponent = patterns.reactFC || patterns.arrowFunction || patterns.regularFunction;
    
    if (!hasComponent) return {};
    
    return {
      totalComponents: 1,
      patterns
    };
  }

  private async findAllTypeScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (!item.name.includes('node_modules') && 
            !item.name.startsWith('.') && 
            !item.name.includes('dist')) {
          files.push(...await this.findAllTypeScriptFiles(fullPath));
        }
      } else if (/\.(ts|tsx)$/.test(item.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateReport(analysis: ComponentPatternAnalysis): string {
    const lines = [
      '📊 Component Pattern Analysis',
      '===========================',
      '',
      `Total components found: ${analysis.totalComponents}`,
      '',
      'Pattern usage:',
      ...Object.entries(analysis.patterns).map(([pattern, count]) => {
        const percentage = analysis.totalComponents > 0 
          ? ((count / analysis.totalComponents) * 100).toFixed(1)
          : '0.0';
        return `  ${pattern}: ${count} (${percentage}%)`;
      }),
      '',
      'Recommendations:',
      ...this.generateRecommendations(analysis)
    ];

    return lines.join('\n');
  }

  private generateRecommendations(analysis: ComponentPatternAnalysis): string[] {
    const recs: string[] = [];
    
    if (analysis.patterns.interfaceAbove < analysis.totalComponents * 0.8) {
      recs.push('- Standardize prop types using interfaces above components');
    }
    
    if (analysis.patterns.destructuredProps < analysis.totalComponents * 0.5) {
      recs.push('- Increase use of destructured props for better readability');
    }
    
    return recs;
  }
}