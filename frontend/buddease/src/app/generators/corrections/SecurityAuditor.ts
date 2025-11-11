// SecurityAuditor.ts
import path from 'path';
import { useSecurityAudit } from '@/app/hooks/useSecurityAudit';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { ProjectStructure } from '@/app/scripts/generateRoadmaps'
import { ApiInfo, ComponentInfo, InterfaceInfo } from '@/app/generators/ApiCodeGenerator'
import fs from 'fs';
import SecureFieldManager from "@/app/server/security/SecureFieldManager";
import SecurityAPI from '@/app/api/SecurityAPI';
import ApiMethod from '@/app/generators/ApiCodeGenerator';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';

interface SecurityIssue extends Correction {
  id: string;
  type: 'sensitive_data' | 'missing_sanitization' | 'role_violation' | 'insecure_pattern';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  code: string;
  fix: string;
  category: 'security';
}

export class SecurityAuditor {
  private securityAudit: ReturnType<typeof useSecurityAudit>;
  private securityAPI: typeof SecurityAPI;

  constructor() {
    this.securityAudit = useSecurityAudit();
    this.securityAPI = SecurityAPI;
  }

  async auditSecurity(projectStructure: ProjectStructure): Promise<SecurityIssue[]> {
    console.log('🔒 Conducting security audit...');
    
    const issues: SecurityIssue[] = [];
    
    // Analyze for common security issues
    issues.push(...await this.analyzeSensitiveDataExposure(projectStructure));
    issues.push(...await this.analyzeMissingSanitization(projectStructure));
    issues.push(...await this.analyzeRoleViolations(projectStructure));
    issues.push(...await this.analyzeInsecurePatterns(projectStructure));
    
    return issues;
  }

  private async analyzeSensitiveDataExposure(projectStructure: ProjectStructure): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const { interfaces, components, apis } = projectStructure;

    // Check interfaces for sensitive field definitions
    interfaces.forEach(([name, iface]) => {
      if (iface.properties) {
        iface.properties.forEach(prop => {
          if (this.isSensitiveField(prop.name, prop.type)) {
            issues.push({
              id: `sensitive-data-${name}-${prop.name}`,
              type: 'sensitive_data',
              severity: 'high',
              file: iface.file,
              message: `Potential sensitive data exposure in interface '${name}' - field '${prop.name}'`,
              code: `interface ${name} {\n  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}\n}`,
              fix: `Use SecureFieldManager for sensitive field '${prop.name}':\nconst ${prop.name} = SecureFieldManager.createField(value, true);`,
              category: 'security'
            });
          }
        });
      }
    });

    // Check API methods for sensitive data handling
    apis.forEach(([file, api]) => {
      api.methods.forEach(method => {
        if (this.methodHandlesSensitiveData(method)) {
          issues.push({
            id: `sensitive-api-${method.name}`,
            type: 'sensitive_data',
            severity: 'critical',
            file: file,
            message: `API method '${method.name}' may handle sensitive data without proper protection`,
            code: `${method.isAsync ? 'async ' : ''}${method.name}(${method.parameters.join(', ')}): ${method.returnType}`,
            fix: `Implement proper data sanitization using useSecurityAudit().sanitizeMetadata()`,
            category: 'security'
          });
        }
      });
    });

    return issues;
  }

  private async analyzeMissingSanitization(projectStructure: ProjectStructure): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const { components, apis } = projectStructure;

    // Check components for missing sanitization
    components.forEach(([name, component]) => {
      if (this.componentNeedsSanitization(name, component)) {
        issues.push({
          id: `missing-sanitization-${name}`,
          type: 'missing_sanitization',
          severity: 'high',
          file: component.file,
          message: `Component '${name}' may need data sanitization for user input`,
          code: `const ${name} = (props: ${component.propsType}) => { ... }`,
          fix: `Implement input sanitization using SecureFieldManager.sanitizeMetadata()`,
          category: 'security'
        });
      }
    });

    // Check for missing security audit usage
    const filesWithSecurityIssues = this.findFilesMissingSecurityAudit(projectStructure);
    filesWithSecurityIssues.forEach(file => {
      issues.push({
        id: `missing-audit-${path.basename(file)}`,
        type: 'missing_sanitization',
        severity: 'medium',
        file: file,
        message: 'File may need security audit implementation',
        code: '// Missing security audit implementation',
        fix: `Import and use useSecurityAudit() or SecurityAudit class`,
        category: 'security'
      });
    });

    return issues;
  }

  private async analyzeRoleViolations(projectStructure: ProjectStructure): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const { interfaces, components } = projectStructure;

    // Check for hardcoded role checks that might be insecure
    components.forEach(([name, component]) => {
      if (this.hasHardcodedRoleChecks(component)) {
        issues.push({
          id: `role-violation-${name}`,
          type: 'role_violation',
          severity: 'critical',
          file: component.file,
          message: `Component '${name}' may have insecure role-based access control`,
          code: `// Hardcoded role checks found`,
          fix: `Use centralized role management and avoid hardcoded role strings`,
          category: 'security'
        });
      }
    });

    return issues;
  }

  private async analyzeInsecurePatterns(projectStructure: ProjectStructure): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const { apis } = projectStructure;

    // Check for API patterns that might be insecure
    apis.forEach(([file, api]) => {
      api.methods.forEach(method => {
        if (this.hasInsecureAPIPattern(method)) {
          issues.push({
            id: `insecure-pattern-${method.name}`,
            type: 'insecure_pattern',
            severity: 'high',
            file: file,
            message: `API method '${method.name}' uses potentially insecure patterns`,
            code: `${method.isAsync ? 'async ' : ''}${method.name}(${method.parameters.join(', ')}): ${method.returnType}`,
            fix: `Review and secure the API method implementation`,
            category: 'security'
          });
        }
      });
    });

    return issues;
  }

  private isSensitiveField(fieldName: string, fieldType: string): boolean {
    const sensitivePatterns = [
      /password/i, /secret/i, /key/i, /token/i, /auth/i, 
      /credit.?card/i, /ssn/i, /social.?security/i, /api.?key/i,
      /private/i, /confidential/i, /sensitive/i
    ];
    
    return sensitivePatterns.some(pattern => 
      pattern.test(fieldName) || pattern.test(fieldType)
    );
  }

  private methodHandlesSensitiveData(method: ApiMethod): boolean {
    const sensitiveKeywords = ['password', 'secret', 'key', 'token', 'auth', 'login', 'credential'];
    return sensitiveKeywords.some(keyword => 
      method.name.toLowerCase().includes(keyword) ||
      method.parameters.some(param => param.toLowerCase().includes(keyword)) ||
      method.returnType.toLowerCase().includes(keyword)
    );
  }

  private componentNeedsSanitization(componentName: string, component: ComponentInfo): boolean {
    const needsSanitizationPatterns = [
      /form/i, /input/i, /user.?input/i, /submit/i, /login/i, /register/i,
      /profile/i, /settings/i, /account/i
    ];
    
    return needsSanitizationPatterns.some(pattern => 
      pattern.test(componentName) ||
      (component.propsType && pattern.test(component.propsType))
    );
  }

  private findFilesMissingSecurityAudit(projectStructure: ProjectStructure): string[] {
    const files: string[] = [];
    const { components, apis } = projectStructure;

    // Check components that handle user data but don't use security utilities
    components.forEach(([name, component]) => {
      if (this.componentHandlesUserData(name) && !this.fileUsesSecurityUtils(component.file)) {
        files.push(component.file);
      }
    });

    // Check APIs that handle sensitive operations
    apis.forEach(([file, api]) => {
      if (this.apiHandlesSensitiveOperations(api) && !this.fileUsesSecurityUtils(file)) {
        files.push(file);
      }
    });

    return [...new Set(files)]; // Remove duplicates
  }

  private componentHandlesUserData(componentName: string): boolean {
    const userDataPatterns = [
      /user/i, /profile/i, /account/i, /settings/i, /preference/i,
      /data/i, /form/i, /input/i, /submit/i
    ];
    
    return userDataPatterns.some(pattern => pattern.test(componentName));
  }

  private apiHandlesSensitiveOperations(api: ApiInfo): boolean {
    const sensitiveOperations = ['create', 'update', 'delete', 'modify', 'change', 'set'];
    return api.methods.some(method => 
      sensitiveOperations.some(op => method.name.toLowerCase().startsWith(op))
    );
  }

  private fileUsesSecurityUtils(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const securityUtils = [
        'useSecurityAudit',
        'SecureFieldManager',
        'SecurityAudit',
        'sanitizeMetadata',
        'createField'
      ];
      
      return securityUtils.some(util => content.includes(util));
    } catch (error) {
      return false;
    }
  }

  private hasHardcodedRoleChecks(component: ComponentInfo): boolean {
    try {
      const content = fs.readFileSync(component.file, 'utf8');
      const hardcodedRolePatterns = [
        /role\s*===?\s*['"`]admin['"`]/i,
        /userRole\s*===?\s*['"`]admin['"`]/i,
        /isAdmin\s*===?\s*true/i,
        /if\s*\(\s*admin\s*\)/i
      ];
      
      return hardcodedRolePatterns.some(pattern => pattern.test(content));
    } catch (error) {
      return false;
    }
  }

  private hasInsecureAPIPattern(method: ApiMethod): boolean {
    const insecurePatterns = [
      /getAll/i, /getEverything/i, /fetchAll/i, 
      /deleteAll/i, /removeAll/i, /clearAll/i,
      /bypass/i, /override/i, /skip/i
    ];
    
    return insecurePatterns.some(pattern => pattern.test(method.name));
  }

  generateSecurityReport(issues: SecurityIssue[]): string {
    const lines: string[] = [];
    lines.push('# 🔒 Security Audit Report');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Security Issues:** ${issues.length}`);
    lines.push('');
    lines.push('> ⚠️ Security issues should be addressed immediately to prevent data breaches');
    lines.push('');

    if (issues.length === 0) {
      lines.push('🎉 **No security issues found!** Your codebase follows good security practices.');
      lines.push('');
      return lines.join('\n');
    }

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical');
    const high = issues.filter(i => i.severity === 'high');
    const medium = issues.filter(i => i.severity === 'medium');
    const low = issues.filter(i => i.severity === 'low');

    if (critical.length > 0) {
      lines.push('## 🚨 Critical Security Issues');
      lines.push('');
      lines.push('**IMMEDIATE ACTION REQUIRED** - These issues pose significant security risks:');
      lines.push('');
      
      critical.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.message}`);
        lines.push(`**File:** ${issue.file}`);
        lines.push(`**Type:** ${issue.type.replace('_', ' ')}`);
        lines.push('');
        lines.push('**Problem:**');
        lines.push('```typescript');
        lines.push(issue.code);
        lines.push('```');
        lines.push('');
        lines.push('**Fix:**');
        lines.push('```typescript');
        lines.push(issue.fix);
        lines.push('```');
        lines.push('---');
        lines.push('');
      });
    }

    // Add security recommendations
    lines.push('## 🛡️ Security Best Practices');
    lines.push('');
    lines.push('1. **Always use SecureFieldManager for sensitive data**');
    lines.push('2. **Implement proper role-based access control**');
    lines.push('3. **Sanitize all user inputs**');
    lines.push('4. **Use security audit hooks in components handling user data**');
    lines.push('5. **Avoid hardcoded credentials and role checks**');
    lines.push('6. **Regularly review security settings via SecurityAPI**');
    lines.push('');

    return lines.join('\n');
  }
}


export type { SecurityIssue }