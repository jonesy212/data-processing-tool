#!/usr/bin/env tsx
// generateUXResearchWorkflow.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateUXResearchWorkflow(): string {
  return `flowchart TD
    subgraph "🔍 Phase 1: Research Planning"
        A[📋 Project Brief Review] --> B[👥 Stakeholder Interviews]
        B --> C[🎯 Research Goals Definition]
        C --> D[📊 Methodology Selection]
        D --> E[📅 Research Timeline Planning]
    end
    
    subgraph "👥 Phase 2: User Discovery"
        E --> F[🔍 User Recruitment]
        F --> G[📝 Interview Protocol Development]
        G --> H[🎤 User Interviews & Observations]
        H --> I[📋 Contextual Inquiry]
        I --> J[📊 Surveys & Questionnaires]
    end
    
    subgraph "📈 Phase 3: Data Analysis"
        J --> K[🎯 Data Collection & Organization]
        K --> L[🧮 Affinity Diagramming]
        L --> M[👤 Persona Development]
        M --> N[💡 Journey Mapping]
        N --> O[🎯 Pain Point Identification]
    end
    
    subgraph "🗺️ Phase 4: Strategy Development"
        O --> P[📋 User Story Creation]
        P --> Q[🎯 Problem Statement Definition]
        Q --> R[💡 Solution Ideation]
        R --> S[📊 Prioritization Matrix]
        S --> T[🎯 Design Principles Definition]
    end
    
    subgraph "🎨 Phase 5: Design Handoff"
        T --> U[✏️ Wireframe Creation]
        U --> V[📋 Information Architecture]
        V --> W[🔄 User Flow Diagrams]
        W --> X[📝 Design Specifications]
        X --> Y[🤝 Stakeholder Presentation]
    end
    
    style A fill:#e3f2fd
    style B fill:#bbdefb
    style C fill:#90caf9
    style D fill:#64b5f6
    style F fill:#42a5f5
    style H fill:#2196f3
    style J fill:#1e88e5
    style L fill:#1976d2
    style M fill:#1565c0
    style O fill:#0d47a1
    style Q fill:#08306b
    style S fill:#061f4a
    style U fill:#040c16
    style Y fill:#020408`;
}

export function generateUXResearchHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UX Research Workflow</title>
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
        .ux-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .method-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .method-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .research-tools {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .tool-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
        }
        .sync-section {
            background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            color: white;
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
            <h1>🔍 UX Research Workflow</h1>
            <p class="subtitle">User-centered research and strategy development</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="ux-methods">
            <div class="method-card">
                <div class="method-title">
                    <span>👥</span>
                    <span>User Interviews</span>
                </div>
                <p>In-depth conversations with target users to understand needs</p>
                <div class="command">pnpm ux:interviews --participants=10</div>
            </div>
            
            <div class="method-card">
                <div class="method-title">
                    <span>📊</span>
                    <span>Usability Testing</span>
                </div>
                <p>Observe users interacting with prototypes or products</p>
                <div class="command">pnpm ux:testing --tasks=5</div>
            </div>
            
            <div class="method-card">
                <div class="method-title">
                    <span>🗺️</span>
                    <span>Journey Mapping</span>
                </div>
                <p>Visualize user experiences across touchpoints</p>
                <div class="command">pnpm ux:journey --persona=primary</div>
            </div>
            
            <div class="method-card">
                <div class="method-title">
                    <span>🧮</span>
                    <span>Affinity Diagramming</span>
                </div>
                <p>Organize research findings into themes and patterns</p>
                <div class="command">pnpm ux:affinity --session=2hrs</div>
            </div>
        </div>
        
        <div class="research-tools">
            <h3>🛠️ UX Research Tools</h3>
            <div class="tool-grid">
                <div class="tool-item">
                    <div style="font-weight: bold; color: #2196f3;">Miro</div>
                    <div style="font-size: 0.9rem; color: #666;">Collaboration</div>
                </div>
                <div class="tool-item">
                    <div style="font-weight: bold; color: #4caf50;">UserTesting</div>
                    <div style="font-size: 0.9rem; color: #666;">Remote Testing</div>
                </div>
                <div class="tool-item">
                    <div style="font-weight: bold; color: #ff9800;">Dovetail</div>
                    <div style="font-size: 0.9rem; color: #666;">Analysis</div>
                </div>
                <div class="tool-item">
                    <div style="font-weight: bold; color: #9c27b0;">Optimal Workshop</div>
                    <div style="font-size: 0.9rem; color: #666;">Information Arch</div>
                </div>
                <div class="tool-item">
                    <div style="font-weight: bold; color: #f44336;">Hotjar</div>
                    <div style="font-size: 0.9rem; color: #666;">Heatmaps</div>
                </div>
                <div class="tool-item">
                    <div style="font-weight: bold; color: #607d8b;">Google Analytics</div>
                    <div style="font-size: 0.9rem; color: #666;">Behavior Data</div>
                </div>
            </div>
        </div>
        
        <div class="sync-section">
            <h3 style="color: white;">🔄 Sync with UI Design Workflow</h3>
            <p style="color: white; opacity: 0.9;">This UX research workflow feeds directly into the UI design workflow. When research is complete, sync the findings:</p>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <div class="command" style="background: rgba(255,255,255,0.3); color: white; border-left: 3px solid white;">
                    pnpm ux:sync --to=ui-design --research-id=RES123
                </div>
                <div class="command" style="background: rgba(255,255,255,0.3); color: white; border-left: 3px solid white;">
                    pnpm workflow:connect ux-research ui-design
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}