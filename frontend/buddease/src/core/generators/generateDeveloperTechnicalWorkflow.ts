#!/usr/bin/env tsx
// generateDeveloperTechnicalWorkflow.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateDeveloperTechnicalWorkflow(): string {
  return `flowchart TD
    subgraph "💻 Phase 1: Technical Discovery"
        A[🔍 Requirements Analysis] --> B[📋 Technical Specifications]
        B --> C[🏗️ Architecture Design]
        C --> D[🔧 Technology Stack Selection]
    end
    
    subgraph "⚙️ Phase 2: Development Setup"
        D --> E[📦 Environment Configuration]
        E --> F[🔗 CI/CD Pipeline Setup]
        F --> G[🧪 Test Framework Implementation]
        G --> H[📚 Documentation Setup]
    end
    
    subgraph "🚀 Phase 3: Agile Development"
        H --> I[📝 Sprint Planning]
        I --> J[💻 Feature Development]
        J --> K[🧪 Unit Testing]
        K --> L[🔄 Code Review]
        L --> M[📦 Integration Testing]
    end
    
    subgraph "🔒 Phase 4: Quality Assurance"
        M --> N[🔍 Security Audit]
        N --> O[📊 Performance Testing]
        O --> P[📱 Cross-platform Testing]
        P --> Q[🧪 User Acceptance Testing]
    end
    
    subgraph "🚢 Phase 5: Deployment & Maintenance"
        Q --> R[🚀 Production Deployment]
        R --> S[📈 Monitoring & Analytics]
        S --> T[🔧 Bug Fixes & Updates]
        T --> U[📚 Technical Documentation]
        U --> V[🎯 Feature Roadmap Planning]
    end
    
    style A fill:#e3f2fd
    style B fill:#bbdefb
    style C fill:#90caf9
    style D fill:#64b5f6
    style E fill:#42a5f5
    style G fill:#2196f3
    style I fill:#1e88e5
    style J fill:#1976d2
    style L fill:#1565c0
    style M fill:#0d47a1
    style Q fill:#0a3d91
    style R fill:#08306b
    style V fill:#061f4a`;
}

export function generateDeveloperTechnicalHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Technical Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #2196f3 0%, #0d47a1 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2196f3;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #2196f3 0%, #0d47a1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin-top: 10px;
        }
        .workflow-container {
            margin: 20px 0;
            min-height: 800px;
        }
        .dev-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .tool-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .tool-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .tech-stack {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .tech-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
            transition: transform 0.3s ease;
        }
        .tech-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.2);
        }
        .command {
            font-family: 'Courier New', monospace;
            background: #e3f2fd;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            margin-top: 10px;
            border-left: 3px solid #2196f3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💻 Developer Technical Workflow</h1>
            <p class="subtitle">From code to production - the technical development lifecycle</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="dev-tools">
            <div class="tool-card">
                <div class="tool-title">
                    <span>⚙️</span>
                    <span>Development Environment</span>
                </div>
                <p>Configure local development environment with all dependencies</p>
                <div class="command">pnpm dev:setup --env=development</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🔗</span>
                    <span>CI/CD Pipeline</span>
                </div>
                <p>Automated build, test, and deployment pipeline</p>
                <div class="command">pnpm ci:deploy --stage=staging</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🧪</span>
                    <span>Testing Suite</span>
                </div>
                <p>Comprehensive testing framework with coverage reporting</p>
                <div class="command">pnpm test:coverage --threshold=80</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>📊</span>
                    <span>Performance Monitoring</span>
                </div>
                <p>Real-time performance metrics and error tracking</p>
                <div class="command">pnpm monitor:performance --interval=5s</div>
            </div>
        </div>
        
        <div class="tech-stack">
            <h3>🛠️ Technology Stack</h3>
            <div class="tech-grid">
                <div class="tech-item">
                    <div style="font-weight: bold; color: #3178c6;">TypeScript</div>
                    <div style="font-size: 0.9rem; color: #666;">Static typing</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #61dafb;">React</div>
                    <div style="font-size: 0.9rem; color: #666;">UI Framework</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #764abc;">Redux</div>
                    <div style="font-size: 0.9rem; color: #666;">State Management</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #339933;">Node.js</div>
                    <div style="font-size: 0.9rem; color: #666;">Backend Runtime</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #4479a1;">PostgreSQL</div>
                    <div style="font-size: 0.9rem; color: #666;">Database</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #f05032;">Git</div>
                    <div style="font-size: 0.9rem; color: #666;">Version Control</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #2088ff;">GitHub Actions</div>
                    <div style="font-size: 0.9rem; color: #666;">CI/CD</div>
                </div>
                <div class="tech-item">
                    <div style="font-weight: bold; color: #ff6b35;">Docker</div>
                    <div style="font-size: 0.9rem; color: #666;">Containerization</div>
                </div>
            </div>
        </div>
        
        <div class="dev-tools" style="margin-top: 30px;">
            <div class="tool-card">
                <div class="tool-title">
                    <span>🔧</span>
                    <span>API Development</span>
                </div>
                <p>RESTful API design and implementation</p>
                <div class="command">pnpm api:generate --type=rest</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🔐</span>
                    <span>Security Implementation</span>
                </div>
                <p>Authentication, authorization, and security best practices</p>
                <div class="command">pnpm security:audit --level=high</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>📱</span>
                    <span>Mobile Development</span>
                </div>
                <p>Cross-platform mobile app development</p>
                <div class="command">pnpm mobile:build --platform=ios</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🤖</span>
                    <span>DevOps Automation</span>
                </div>
                <p>Infrastructure as Code and automation scripts</p>
                <div class="command">pnpm ops:deploy --environment=production</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || './workflow-diagrams';
  const format = args[1] || 'html';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const workflow = generateDeveloperTechnicalWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'developer-technical.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateDeveloperTechnicalHTML(workflow);
    const htmlPath = path.join(outputDir, 'developer-technical.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n💻 Developer Technical Workflow Generated!');
  console.log('⚙️ Perfect for software development teams and technical projects!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateDeveloperTechnicalWorkflow, generateDeveloperTechnicalHTML };