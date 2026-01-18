// PackageRecommendationGenerator.ts
import { ProjectStructure } from '@/core/scripts/generateRoadmaps';

interface PackageRecommendation {
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'dev-tools' | 'existing' | 'missing';
  essential: boolean;
  status: 'installed' | 'missing' | 'suggested';
  alternatives?: string[];
  usage: string;
  installCommand: string;
}

interface PackageRecommendations {
  frontend: PackageRecommendation[];
  backend: PackageRecommendation[];
  devTools: PackageRecommendation[];
}



class PackageRecommendationGenerator {
  static generateFromProjectStructure(projectStructure: ProjectStructure, existingDependencies: Set<string>): PackageRecommendations {
    const { interfaces, components, apis } = projectStructure;
    
    const recommendations: PackageRecommendations = {
      frontend: [],
      backend: [],
      devTools: []
    };

    // Check what you already have
    const hasReact = existingDependencies.has('react');
    const hasTypeScript = existingDependencies.has('typescript');
    const hasRedux = existingDependencies.has('@reduxjs/toolkit') || existingDependencies.has('redux');
    const hasMobX = existingDependencies.has('mobx');
    const hasAntd = existingDependencies.has('antd');
    const hasStyledComponents = existingDependencies.has('styled-components');
    const hasJest = existingDependencies.has('jest');
    const hasExpress = existingDependencies.has('express');
    const hasAxios = existingDependencies.has('axios');

    // Frontend packages based on your actual setup
    if (components.length > 0) {
      if (!hasReact) {
        recommendations.frontend.push({
          name: 'react',
          description: 'Library for building user interfaces',
          category: 'frontend',
          essential: true,
          status: 'missing',
          usage: 'Core framework for all React components',
          installCommand: 'pnpm add react'
        });
      }

      if (!hasTypeScript) {
        recommendations.frontend.push({
          name: 'typescript',
          description: 'Typed superset of JavaScript',
          category: 'frontend',
          essential: true,
          status: 'missing',
          usage: 'Type safety for components and interfaces',
          installCommand: 'pnpm add -D typescript'
        });
      }

      // You already have Ant Design, so don't suggest Tailwind
      if (!hasAntd && !hasStyledComponents) {
        recommendations.frontend.push({
          name: 'antd',
          description: 'Enterprise-class UI design language',
          category: 'frontend',
          essential: false,
          status: 'suggested',
          alternatives: ['tailwindcss', 'styled-components'],
          usage: 'Comprehensive UI component library',
          installCommand: 'pnpm add antd'
        });
      }
    }

    // State management - you already have Redux + MobX, no need for Zustand
    const hasStateInterfaces = interfaces.some(([name]) =>
      name.match(/state|store|context/i)
    );
    if (hasStateInterfaces && !hasRedux && !hasMobX) {
      recommendations.frontend.push({
        name: '@reduxjs/toolkit',
        description: 'Official, opinionated Redux setup',
        category: 'frontend',
        essential: false,
        status: 'suggested',
        alternatives: ['mobx', 'zustand'],
        usage: 'State management based on state-related interfaces',
        installCommand: 'pnpm add @reduxjs/toolkit react-redux'
      });
    }

    // Form handling
    const hasFormInterfaces = interfaces.some(([name]) => 
      name.match(/form|props|input/i)
    );
    if (hasFormInterfaces && !existingDependencies.has('react-hook-form')) {
      recommendations.frontend.push({
        name: 'react-hook-form',
        description: 'Performant forms with easy-to-use validation',
        category: 'frontend',
        essential: false,
        status: 'suggested',
        alternatives: ['formik'],
        usage: 'Form handling based on form-related interfaces',
        installCommand: 'pnpm add react-hook-form'
      });
    }

    // Backend packages
    if (apis.length > 0) {
      if (!hasExpress) {
        recommendations.backend.push({
          name: 'express',
          description: 'Web framework for Node.js',
          category: 'backend',
          essential: true,
          status: 'missing',
          usage: 'API server for endpoints',
          installCommand: 'pnpm add express'
        });
      }

      if (!hasAxios) {
        recommendations.backend.push({
          name: 'axios',
          description: 'HTTP client for making requests',
          category: 'backend',
          essential: true,
          status: 'missing',
          usage: 'API service methods',
          installCommand: 'pnpm add axios'
        });
      }

      // CORS for API development
      if (!existingDependencies.has('cors')) {
        recommendations.backend.push({
          name: 'cors',
          description: 'CORS middleware for Express',
          category: 'backend',
          essential: false,
          status: 'suggested',
          usage: 'Cross-origin requests for APIs',
          installCommand: 'pnpm add cors'
        });
      }
    }

    // Dev tools
    if (!existingDependencies.has('eslint')) {
      recommendations.devTools.push({
        name: 'eslint',
        description: 'Static code analysis tool',
        category: 'dev-tools',
        essential: true,
        status: 'missing',
        usage: 'Code quality and consistency',
        installCommand: 'pnpm add -D eslint'
      });
    }

    if (!existingDependencies.has('prettier')) {
      recommendations.devTools.push({
        name: 'prettier',
        description: 'Code formatter',
        category: 'dev-tools',
        essential: true,
        status: 'missing',
        usage: 'Automatic code formatting',
        installCommand: 'pnpm add -D prettier'
      });
    }

    // Testing - you already have Jest!
    if (!hasJest) {
      recommendations.devTools.push({
        name: 'jest',
        description: 'JavaScript testing framework',
        category: 'dev-tools',
        essential: false,
        status: 'suggested',
        alternatives: ['vitest'],
        usage: 'Unit testing for components and services',
        installCommand: 'pnpm add -D jest @types/jest'
      });
    }

    return recommendations;
  }

  static generateFrontendPackageFile(recommendations: PackageRecommendations, existingDependencies: Set<string>): string {
    const frontendPackages = [...recommendations.frontend, ...recommendations.devTools];
    
    const lines: string[] = [];
    lines.push('# Frontend Package Recommendations');
    lines.push(`🕒 Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('> 📦 Based on your project analysis and existing dependencies');
    lines.push('');

    // Show existing key packages
    const keyExistingPackages = ['react', 'typescript', 'antd', '@reduxjs/toolkit', 'mobx', 'jest', 'eslint'];
    const existing = keyExistingPackages.filter(pkg => existingDependencies.has(pkg));
    
    if (existing.length > 0) {
      lines.push('## ✅ Already Installed');
      lines.push('');
      existing.forEach(pkg => {
        lines.push(`- **${pkg}** - Already in your project`);
      });
      lines.push('');
    }

    // Essential packages (missing)
    const essential = frontendPackages.filter(pkg => pkg.essential && pkg.status === 'missing');
    if (essential.length > 0) {
      lines.push('## 🚨 Essential Packages (Missing)');
      lines.push('');
      essential.forEach(pkg => {
        lines.push(`### ${pkg.name}`);
        lines.push(`**Description:** ${pkg.description}`);
        lines.push(`**Usage:** ${pkg.usage}`);
        lines.push(`**Install:** \`${pkg.installCommand}\``);
        lines.push('');
      });
    }

    // Suggested packages
    const suggested = frontendPackages.filter(pkg => !pkg.essential || pkg.status === 'suggested');
    if (suggested.length > 0) {
      lines.push('## 💡 Recommended Packages');
      lines.push('');
      suggested.forEach(pkg => {
        lines.push(`### ${pkg.name}`);
        lines.push(`**Description:** ${pkg.description}`);
        lines.push(`**Usage:** ${pkg.usage}`);
        if (pkg.alternatives) {
          lines.push(`**Alternatives:** ${pkg.alternatives.join(', ')}`);
        }
        lines.push(`**Install:** \`${pkg.installCommand}\``);
        lines.push('');
      });
    }

    // Installation commands
    const allToInstall = frontendPackages.filter(pkg => pkg.status !== 'installed');
    if (allToInstall.length > 0) {
      lines.push('## 🛠️ Quick Installation');
      lines.push('');
      lines.push('```zsh');
      
      const deps = allToInstall.filter(pkg => pkg.category === 'frontend').map(pkg => pkg.name);
      const devDeps = allToInstall.filter(pkg => pkg.category === 'dev-tools').map(pkg => pkg.name);
      
      if (deps.length > 0) {
        lines.push(`# Dependencies`);
        lines.push(`pnpm add ${deps.join(' ')}`);
      }
      
      if (devDeps.length > 0) {
        lines.push(`# Dev Dependencies`);
        lines.push(`pnpm add -D ${devDeps.join(' ')}`);
      }
      
      lines.push('```');
    }

    return lines.join('\n');
  }

static generateBackendPackageFile(recommendations: PackageRecommendations, existingDependencies: Set<string>): string {
    const lines: string[] = [];
    lines.push('# Backend Package Recommendations');
    lines.push(`🕒 Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('> 📦 Based on your project analysis and existing dependencies');
    lines.push('');

    // Show existing backend packages
    const existingBackend = ['express', 'axios', 'socket.io'].filter(pkg => existingDependencies.has(pkg));
    if (existingBackend.length > 0) {
        lines.push('## ✅ Already Installed');
        lines.push('');
        existingBackend.forEach(pkg => {
        lines.push(`- **${pkg}** - Ready to use`);
        });
        lines.push('');
    }

    const essential = recommendations.backend.filter(pkg => pkg.essential && pkg.status === 'missing');
    if (essential.length > 0) {
        lines.push('## 🚨 Essential Packages (Missing)');
        lines.push('');
        essential.forEach(pkg => {
        lines.push(`### ${pkg.name}`);
        lines.push(`**Description:** ${pkg.description}`);
        lines.push(`**Usage:** ${pkg.usage}`);
        lines.push(`**Install:** \`${pkg.installCommand}\``);
        lines.push('');
        });
    }

    const suggested = recommendations.backend.filter(pkg => !pkg.essential);
    if (suggested.length > 0) {
        lines.push('## 💡 Recommended Packages');
        lines.push('');
        suggested.forEach(pkg => {
        lines.push(`### ${pkg.name}`);
        lines.push(`**Description:** ${pkg.description}`);
        lines.push(`**Usage:** ${pkg.usage}`);
        if (pkg.alternatives) {
            lines.push(`**Alternatives:** ${pkg.alternatives.join(', ')}`);
        }
        lines.push(`**Install:** \`${pkg.installCommand}\``);
        lines.push('');
        });
    }

    // Add zsh installation commands for all backend packages
    const allBackendPackages = [...recommendations.backend];
    if (allBackendPackages.length > 0) {
        lines.push('## 🛠️ Quick Installation');
        lines.push('');
        lines.push('```zsh');
        
        const essentialPackages = allBackendPackages.filter(pkg => pkg.essential).map(pkg => pkg.name);
        const suggestedPackages = allBackendPackages.filter(pkg => !pkg.essential).map(pkg => pkg.name);
        
        if (essentialPackages.length > 0) {
        lines.push('# Essential backend packages');
        lines.push(`pnpm add ${essentialPackages.join(' ')}`);
        lines.push('');
        }
        
        if (suggestedPackages.length > 0) {
        lines.push('# Optional backend packages');
        lines.push(`pnpm add ${suggestedPackages.join(' ')}`);
        }
        
        lines.push('```');
        lines.push('');
    }

    return lines.join('\n');
    }
}

export default PackageRecommendationGenerator