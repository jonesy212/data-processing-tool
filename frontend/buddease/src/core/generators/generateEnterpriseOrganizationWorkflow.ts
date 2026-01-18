// generateEnterpriseOrganizationWorkflow.ts
#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateEnterpriseOrganizationWorkflow(): string {
  return `flowchart TD
    subgraph "🏢 Phase 1: Strategic Planning"
        A[📊 Market Analysis] --> B[🎯 Business Case Development]
        B --> C[📋 Project Charter Creation]
        C --> D[👥 Executive Stakeholder Alignment]
        D --> E[💰 Budget & Resource Allocation]
    end
    
    subgraph "📋 Phase 2: Governance & Compliance"
        E --> F[⚖️ Legal & Compliance Review]
        F --> G[🔒 Security Requirements]
        G --> H[📜 Policy Development]
        H --> I[🎯 Risk Management Framework]
    end
    
    subgraph "👥 Phase 3: Organizational Structure"
        I --> J[🏗️ Department Structure Design]
        J --> K[👤 Role & Responsibility Mapping]
        K --> L[📋 Reporting Hierarchy]
        L --> M[🤝 Cross-functional Team Formation]
    end
    
    subgraph "🔄 Phase 4: Process Implementation"
        M --> N[⚙️ SOP Development]
        N --> O[📊 KPI & Metrics Definition]
        O --> P[🔄 Workflow Automation]
        P --> Q[🎯 Performance Management System]
    end
    
    subgraph "🚀 Phase 5: Rollout & Scale"
        Q --> R[🏢 Pilot Program Launch]
        R --> S[📈 Performance Monitoring]
        S --> T[🌐 Full-scale Deployment]
        T --> U[📚 Training & Onboarding]
        U --> V[🔄 Continuous Improvement]
    end
    
    subgraph "📈 Phase 6: Optimization & Growth"
        V --> W[📊 Data-driven Decision Making]
        W --> X[🎯 Strategic Optimization]
        X --> Y[🌐 Market Expansion]
        Y --> Z[🏆 Excellence & Innovation]
    end
    
    style A fill:#fce4ec
    style B fill:#f8bbd9
    style C fill:#f48fb1
    style D fill:#f06292
    style E fill:#ec407a
    style F fill:#e91e63
    style G fill:#d81b60
    style H fill:#c2185b
    style I fill:#ad1457
    style J fill:#880e4f
    style M fill:#6a1b9a
    style N fill:#5d1c78
    style Q fill:#4a126b
    style R fill:#38005f
    style T fill:#2a0049
    style V fill:#1e0038
    style Z fill:#120028`;
}

export function generateEnterpriseOrganizationHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Organization Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #e91e63 0%, #6a1b9a 100%);
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
            border-bottom: 2px solid #e91e63;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #e91e63 0%, #6a1b9a 100%);
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
            min-height: 1000px;
        }
        .enterprise-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e91e63;
        }
        .feature-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .department-structure {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .org-chart {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .department {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .dept-title {
            font-weight: bold;
            color: #e91e63;
            margin-bottom: 10px;
        }
        .command {
            font-family: 'Courier New', monospace;
            background: #fce4ec;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            margin-top: 10px;
            border-left: 3px solid #e91e63;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Enterprise Organization Workflow</h1>
            <p class="subtitle">Corporate strategy, governance, and organizational excellence</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="enterprise-features">
            <div class="feature-card">
                <div class="feature-title">
                    <span>📊</span>
                    <span>Strategic Planning</span>
                </div>
                <p>Market analysis, business case development, and executive alignment</p>
                <div class="command">pnpm enterprise:strategy --quarter=Q1</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>⚖️</span>
                    <span>Governance & Compliance</span>
                </div>
                <p>Legal compliance, security frameworks, and policy development</p>
                <div class="command">pnpm enterprise:compliance --audit=true</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>👥</span>
                    <span>Organizational Design</span>
                </div>
                <p>Department structure, role mapping, and reporting hierarchy</p>
                <div class="command">pnpm enterprise:org-design --type=matrix</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>📈</span>
                    <span>Performance Management</span>
                </div>
                <p>KPI definition, performance tracking, and optimization</p>
                <div class="command">pnpm enterprise:metrics --period=quarterly</div>
            </div>
        </div>
        
        <div class="department-structure">
            <h3>🏗️ Organizational Structure</h3>
            <div class="org-chart">
                <div class="department">
                    <div class="dept-title">Executive Leadership</div>
                    <div>CEO, CFO, CTO, COO</div>
                    <div class="command">pnpm org:executive --view=roles</div>
                </div>
                <div class="department">
                    <div class="dept-title">Operations</div>
                    <div>Project Management, HR, Finance</div>
                    <div class="command">pnpm org:operations --dept=all</div>
                </div>
                <div class="department">
                    <div class="dept-title">Technology</div>
                    <div>Development, IT, Security</div>
                    <div class="command">pnpm org:technology --team=dev</div>
                </div>
                <div class="department">
                    <div class="dept-title">Marketing & Sales</div>
                    <div>Branding, Sales, Customer Success</div>
                    <div class="command">pnpm org:marketing --campaign=active</div>
                </div>
                <div class="department">
                    <div class="dept-title">Product</div>
                    <div>Product Management, Design, UX</div>
                    <div class="command">pnpm org:product --roadmap=2024</div>
                </div>
                <div class="department">
                    <div class="dept-title">Compliance</div>
                    <div>Legal, Regulatory, Risk Management</div>
                    <div class="command">pnpm org:compliance --checklist=all</div>
                </div>
            </div>
        </div>
        
        <div class="enterprise-features" style="margin-top: 30px;">
            <div class="feature-card">
                <div class="feature-title">
                    <span>🌐</span>
                    <span>Global Operations</span>
                </div>
                <p>Multi-region deployment and international compliance</p>
                <div class="command">pnpm enterprise:global --region=eu</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>🔄</span>
                    <span>Process Automation</span>
                </div>
                <p>Workflow automation and efficiency optimization</p>
                <div class="command">pnpm enterprise:automate --process=approval</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>📚</span>
                    <span>Training & Development</span>
                </div>
                <p>Employee onboarding and professional development</p>
                <div class="command">pnpm enterprise:training --program=leadership</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>🏆</span>
                    <span>Innovation & Excellence</span>
                </div>
                <p>Continuous improvement and innovation programs</p>
                <div class="command">pnpm enterprise:innovate --initiative=R&D</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>🏢 Enterprise Dashboard</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0;">
                <div>
                    <div style="font-size: 2rem; color: #e91e63; font-weight: bold;">1.2K</div>
                    <div>Employees</div>
                </div>
                <div>
                    <div style="font-size: 2rem; color: #2196f3; font-weight: bold;">$245M</div>
                    <div>Annual Revenue</div>
                </div>
                <div>
                    <div style="font-size: 2rem; color: #4caf50; font-weight: bold;">94%</div>
                    <div>Customer Satisfaction</div>
                </div>
                <div>
                    <div style="font-size: 2rem; color: #ff9800; font-weight: bold;">28</div>
                    <div>Countries</div>
                </div>
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
  
  const workflow = generateEnterpriseOrganizationWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'enterprise-organization.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateEnterpriseOrganizationHTML(workflow);
    const htmlPath = path.join(outputDir, 'enterprise-organization.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n🏢 Enterprise Organization Workflow Generated!');
  console.log('📈 Designed for large-scale organizational management and corporate strategy!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateEnterpriseOrganizationWorkflow, generateEnterpriseOrganizationHTML };