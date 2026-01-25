// utils/suggestionEngine.ts

export class PathSuggestionEngine {
  private rules: PathRule[] = [
    // **PHASE 1: Foundation**
    {
      pattern: /\/config\//,
      phase: 'foundation',
      category: 'config',
      suggestions: [
        {
          match: /import.*Config.*from/,
          text: 'Config imports should use import type',
          commandTemplate: 'fix:interface-imports:core-types --pattern Config --path-pattern {filePath}',
          priority: 'high',
          condition: (line) => !line.includes('import type')
        }
      ]
    },
    
    // **PHASE 2: State Management**
    {
      pattern: /\/state\/stores\/|\/redux\/slices\//,
      phase: 'state',
      category: 'mobx-redux',
      suggestions: [
        {
          match: /import.*Store.*from/,
          text: 'Store interfaces should be imported as types',
          command: 'fix:interface-imports:core-types --pattern Store',
          priority: 'high'
        },
        {
          match: /dispatch\({type:/,
          text: 'Consider using typed action creators',
          command: 'analyze:redux:actions {filePath}',
          priority: 'medium'
        }
      ]
    },
    
    // **PHASE 3: API Layer**
    {
      pattern: /\/api\//,
      phase: 'data',
      category: 'api',
      suggestions: [
        {
          match: /fetch\(|axios\(/,
          text: 'API calls should be wrapped in try/catch or use error boundaries',
          command: 'add:error-handling {lineNumber} {filePath}',
          priority: 'high'
        },
        {
          match: /interface.*Api/,
          text: 'API interfaces should be in @/types/api',
          command: 'move:interface-to-types {filePath}',
          priority: 'medium'
        }
      ]
    },
    
    // **PHASE 4: UI Components**
    {
      pattern: /\/components\//,
      phase: 'ui',
      category: 'component',
      suggestions: [
        {
          match: /import.*Props.*from/,
          text: 'Props interfaces should be imported as type',
          command: 'fix:interface-imports:core-types --pattern Props --path-pattern components',
          priority: 'high'
        },
        {
          match: /React\.FC|React\.FunctionComponent/,
          text: 'Consider using explicit return types instead of React.FC',
          command: 'fix:component-types {filePath}',
          priority: 'low'
        }
      ]
    }
  ];
  
  generateFor(filePath: string, line: number, content: string): EnhancedSuggestion[] {
    const applicable = this.rules.filter(rule => rule.pattern.test(filePath));
    const suggestions: EnhancedSuggestion[] = [];
    
    for (const rule of applicable) {
      for (const suggestion of rule.suggestions) {
        if (suggestion.match.test(content)) {
          // Use your cache mechanism for performance
          const cacheKey = `${filePath}:${line}:${suggestion.match.source}`;
          if (this.cache.has(cacheKey)) {
            suggestions.push(this.cache.get(cacheKey)!);
            continue;
          }
          
          const enhanced = {
            ...suggestion,
            phase: rule.phase,
            category: rule.category,
            filePath,
            line,
            command: this.renderCommand(suggestion.command, { filePath, line }),
            confidence: this.calculateConfidence(rule, filePath, content)
          };
          
          this.cache.set(cacheKey, enhanced);
          suggestions.push(enhanced);
        }
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }
}