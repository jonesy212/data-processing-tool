// CorrectionMessageGenerator.ts
// utils/CorrectionMessageGenerator.ts
import path from 'path';

export class CorrectionMessageGenerator {
  private static messageTemplates: Record<string, (context: any) => string> = {
    // Structure Validator Messages
    'missing-directory': (ctx) => `Expected directory not found: ${ctx.directoryPath}`,
    'package-json-missing-react-native-reanimated': () => 'React Native Reanimated dependency missing in package.json',
    'package-json-missing-build': () => 'Build scripts missing in package.json',
    
    // Pattern Analyzer Messages  
    'date-creation-render': (ctx) => `Avoid creating Date objects in render: ${ctx.context}`,
    'inline-styles': (ctx) => `Use CSS classes instead of inline styles for: ${ctx.component || ctx.file}`,
    'inline-render-function': (ctx) => `Avoid inline render functions in ${ctx.component || ctx.file} - extract to methods for better performance`,
    'console-statement': (ctx) => `Remove console statement in ${ctx.fileType} file: ${ctx.context}`,
    'console-in-production': () => 'Remove console statements from production code',
    'timer-without-cleanup': (ctx) => `Timer without cleanup in: ${ctx.functionName}`,
    
    // Security Auditor Messages
    'unsafe-json-parse': (ctx) => `Unsafe JSON parsing without error handling in: ${ctx.context}`,
    'sensitive-data': (ctx) => `Potential sensitive data exposure: ${ctx.fieldName} in ${ctx.interfaceName}`,
    'missing-sanitization': (ctx) => `Missing input sanitization in: ${ctx.componentName}`,
    'role-violation': (ctx) => `Insecure role-based access control in: ${ctx.componentName}`,
    'insecure-pattern': (ctx) => `Insecure API pattern detected: ${ctx.methodName}`,
    
    // Error Analyzer Messages
    'tsconfig-module-resolution': () => 'TypeScript module resolution may cause React Native compatibility issues',
    'compilation-error': (ctx) => `Compilation error: ${ctx.errorMessage}`,
    
    // Default fallback
    'default': (ctx) => `Issue detected in ${ctx.file || 'unknown file'}`
  };

  static generateMessage(correctionId: string, context: any = {}): string {
    console.log('🔍 [MessageGenerator] START - Input:', {
      correctionId: correctionId || 'EMPTY_ID',
      contextKeys: Object.keys(context),
      contextValues: JSON.stringify(context, null, 2)
    });

    // Extract the main pattern from ID
    const pattern = this.extractMessagePattern(correctionId);
    console.log('🔍 [MessageGenerator] Extracted pattern:', pattern);

    // Get the appropriate template
    const template = this.messageTemplates[pattern] || this.messageTemplates['default'];
    console.log('🔍 [MessageGenerator] Template found:', !!template);
    console.log('🔍 [MessageGenerator] Template function exists:', typeof template === 'function');
    
    if (!template || typeof template !== 'function') {
      console.error('❌ [MessageGenerator] NO VALID TEMPLATE FOUND for pattern:', pattern);
      console.error('❌ [MessageGenerator] Available templates:', Object.keys(this.messageTemplates));
    }

    // Generate the message with context
    const enrichedContext = {
      ...context,
      file: context.file || this.extractFileName(correctionId),
      pattern
    };
    
    console.log('🔍 [MessageGenerator] Enriched context:', enrichedContext);

    let message;
    try {
      message = template(enrichedContext);
      console.log('🔍 [MessageGenerator] Template executed successfully');
    } catch (error) {
      console.error('❌ [MessageGenerator] TEMPLATE EXECUTION ERROR:', error);
      message = `Error generating message for pattern: ${pattern}`;
    }

    console.log('🔍 [MessageGenerator] FINAL message:', message);
    console.log('🔍 [MessageGenerator] Message type:', typeof message);
    console.log('🔍 [MessageGenerator] Message is undefined:', message === undefined);
    console.log('🔍 [MessageGenerator] Message is null:', message === null);
    console.log('🔍 [MessageGenerator] Message is empty string:', message === '');
    console.log('🔍 [MessageGenerator] --- END ---\n');

    // Final validation
    if (!message || message === 'undefined' || message === 'null') {
      console.warn('⚠️ [MessageGenerator] FINAL MESSAGE IS INVALID, using fallback');
      message = `Performance issue in ${enrichedContext.file || 'unknown file'}`;
    }

    return message;
  }

  private static extractMessagePattern(id: string): string {
    console.log('🔍 [extractMessagePattern] Input ID:', id || 'EMPTY_ID');
    
    if (!id) {
      console.warn('⚠️ [extractMessagePattern] Empty ID provided');
      return 'default';
    }
    
    // Extract pattern before timestamp
    const match = id.match(/^([a-z-]+)(?=-\d+)/);
    console.log('🔍 [extractMessagePattern] Regex match:', match ? match[1] : 'NO_MATCH');
    
    const basePattern = match ? match[1] : 'default';
    console.log('🔍 [extractMessagePattern] Base pattern:', basePattern);
    
    // Map to template keys
    const patternMap: Record<string, string> = {
      'missing-directory': 'missing-directory',
      'package-json-missing-react-native-reanimated': 'package-json-missing-react-native-reanimated',
      'package-json-missing-build': 'package-json-missing-build',
      'date-creation-render': 'date-creation-render',
      'inline-styles': 'inline-styles',
      'inline-render-function': 'inline-render-function',
      'console-statement': 'console-statement',
      'console-in-production': 'console-in-production',
      'timer-without-cleanup': 'timer-without-cleanup',
      'unsafe-json-parse': 'unsafe-json-parse',
      'sensitive-data': 'sensitive-data',
      'missing-sanitization': 'missing-sanitization',
      'role-violation': 'role-violation',
      'insecure-pattern': 'insecure-pattern',
      'tsconfig-module-resolution': 'tsconfig-module-resolution',
      'compilation-error': 'compilation-error'
    };
    
    const finalPattern = patternMap[basePattern] || basePattern;
    console.log('🔍 [extractMessagePattern] Final pattern:', finalPattern);
    console.log('🔍 [extractMessagePattern] Pattern exists in templates:', finalPattern in this.messageTemplates);
    
    return finalPattern;
  }

  private static extractFileName(id: string): string {
    if (!id) return 'unknown';
    
    const match = id.match(/[^-]+(\.[a-z]+)(?=-\d+)/);
    const fileName = match ? match[0] : 'unknown';
    
    console.log('🔍 [extractFileName] Extracted file name:', fileName);
    return fileName;
  }

  // Debug method to check all available templates
  static debugTemplates(): void {
    console.log('🔍 [debugTemplates] Available message templates:');
    Object.keys(this.messageTemplates).forEach(key => {
      console.log(`  - ${key}: ${typeof this.messageTemplates[key]}`);
    });
  }
}