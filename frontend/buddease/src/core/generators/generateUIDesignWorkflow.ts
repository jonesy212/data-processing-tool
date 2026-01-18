#!/usr/bin/env tsx
// generateUIDesignWorkflow.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateUIDesignWorkflow(): string {
  return `flowchart TD
    subgraph "🎨 Phase 1: Design Foundation"
        A[📋 UX Research Handoff] --> B[🎨 Design System Review]
        B --> C[🎯 Brand Guidelines Integration]
        C --> D[🌈 Color Palette Definition]
        D --> E[🔤 Typography System]
        E --> F[🎭 Component Library Setup]
    end
    
    subgraph "✏️ Phase 2: Wireframing"
        F --> G[📱 Low-fidelity Wireframes]
        G --> H[🔄 User Flow Validation]
        H --> I[🎯 Information Architecture]
        I --> J[📊 Content Structure]
        J --> K[🤝 Stakeholder Review]
    end
    
    subgraph "🎨 Phase 3: Visual Design"
        K --> L[🌈 High-fidelity Mockups]
        L --> M[🎭 Visual Hierarchy]
        M --> N[✨ Micro-interactions]
        N --> O[📱 Responsive Design]
        O --> P[🎨 Accessibility Compliance]
    end
    
    subgraph "🔄 Phase 4: Prototyping"
        P --> Q[🎬 Interactive Prototypes]
        Q --> R[📱 Device Testing]
        R --> S[🎯 Usability Refinement]
        S --> T[📊 Performance Optimization]
        T --> U[🔗 Design Handoff Prep]
    end
    
    subgraph "🚀 Phase 5: Development Handoff"
        U --> V[🎨 Design Specs Export]
        V --> W[📝 Developer Documentation]
        W --> X[🎯 Quality Assurance]
        X --> Y[🔄 Design Review & Sign-off]
        Y --> Z[🚀 Development Kickoff]
    end
    
    style A fill:#fce4ec
    style B fill:#f8bbd9
    style C fill:#f48fb1
    style D fill:#f06292
    style E fill:#ec407a
    style G fill:#e91e63
    style H fill:#d81b60
    type I fill:#c2185b
    style J fill:#ad1457
    style L fill:#880e4f
    style M fill:#6a1b9a
    style O fill:#5d1c78
    style Q fill:#4a126b
    style S fill:#38005f
    style U fill:#2a0049
    style W fill:#1e0038
    style Z fill:#120028`;
}

export function generateUIDesignHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Design Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
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
            background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%);
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
        .design-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .tool-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e91e63;
        }
        .tool-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .design-system {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .component-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
        }
        .sync-section {
            background: linear-gradient(135deg, #2196f3 0%, #0d47a1 100%);
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            color: white;
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
            <h1>🎨 UI Design Workflow</h1>
            <p class="subtitle">Visual design, prototyping, and development handoff</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="design-tools">
            <div class="tool-card">
                <div class="tool-title">
                    <span>🎨</span>
                    <span>Design Systems</span>
                </div>
                <p>Create and maintain consistent design components</p>
                <div class="command">pnpm ui:design-system --update=colors</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🎬</span>
                    <span>Interactive Prototyping</span>
                </div>
                <p>Create clickable prototypes for user testing</p>
                <div class="command">pnpm ui:prototype --fidelity=high</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🎯</span>
                    <span>Accessibility Design</span>
                </div>
                <p>Ensure designs meet WCAG accessibility standards</p>
                <div class="command">pnpm ui:accessibility --check=contrast</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🚀</span>
                    <span>Developer Handoff</span>
                </div>
                <p>Export design specs and assets for development</p>
                <div class="command">pnpm ui:handoff --format=react</div>
            </div>
        </div>
        
        <div class="design-system">
            <h3>🏗️ Design System Components</h3>
            <div class="component-grid">
                <div class="component-item">
                    <div style="font-weight: bold; color: #e91e63;">Buttons</div>
                    <div style="font-size: 0.9rem; color: #666;">Primary, Secondary</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #2196f3;">Forms</div>
                    <div style="font-size: 0.9rem; color: #666;">Inputs, Selects</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #4caf50;">Navigation</div>
                    <div style="font-size: 0.9rem; color: #666;">Menus, Breadcrumbs</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #ff9800;">Cards</div>
                    <div style="font-size: 0.9rem; color: #666;">Content containers</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #9c27b0;">Modals</div>
                    <div style="font-size: 0.9rem; color: #666;">Dialogs, Popups</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #607d8b;">Typography</div>
                    <div style="font-size: 0.9rem; color: #666;">Headings, Body text</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #795548;">Icons</div>
                    <div style="font-size: 0.9rem; color: #666;">SVG icon sets</div>
                </div>
                <div class="component-item">
                    <div style="font-weight: bold; color: #3f51b5;">Grid System</div>
                    <div style="font-size: 0.9rem; color: #666;">Layout structure</div>
                </div>
            </div>
        </div>
        
        <div class="sync-section">
            <h3 style="color: white;">🔄 Connected Workflows</h3>
            <p style="color: white; opacity: 0.9;">This UI design workflow connects to:</p>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem;">⬅️</div>
                        <div style="font-weight: bold;">UX Research</div>
                        <div class="command" style="background: rgba(255,255,255,0.3); color: white; margin-top: 5px;">
                            pnpm workflow:back ux-research
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem;">⬆️</div>
                        <div style="font-weight: bold;">Frontend Dev</div>
                        <div class="command" style="background: rgba(255,255,255,0.3); color: white; margin-top: 5px;">
                            pnpm workflow:forward frontend
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem;">🔄</div>
                        <div style="font-weight: bold;">Sync All</div>
                        <div class="command" style="background: rgba(255,255,255,0.3); color: white; margin-top: 5px;">
                            pnpm workflow:sync ux-ui-dev
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}