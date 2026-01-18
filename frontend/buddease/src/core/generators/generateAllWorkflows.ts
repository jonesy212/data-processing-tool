#!/usr/bin/env tsx
// generateAllWorkflows.ts
// Generates all workflow diagrams at once

import { generateProjectPhaseWorkflow, generateProjectPhaseHTML } from './generateProjectPhaseWorkflow';
import { generateTeamCollaborationWorkflow, generateTeamCollaborationHTML } from './generateTeamCollaborationWorkflow';
import { generateCryptoWorkflow, generateCryptoHTML } from './generateCryptoWorkflow';
import { generateCollaborativeWorkflow, generateCollaborativeHTML } from './generateCollaborativeWorkflow';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateAllWorkflows(outputDir: string = './workflow-diagrams'): Promise<void> {
  console.log('🚀 Generating All Workflow Diagrams');
  console.log('='.repeat(50));
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create index.html that links to all workflows
  const indexHTML = generateIndexHTML();
  const indexPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(indexPath, indexHTML, 'utf8');
  
  // Generate each workflow
  const workflows = [
    {
        name: 'Project Phase Workflow',
        mermaid: generateProjectPhaseWorkflow(),
        html: generateProjectPhaseHTML(generateProjectPhaseWorkflow()),
        filename: 'project-phase'
    },
    {
        name: 'Team Collaboration Workflow',
        mermaid: generateTeamCollaborationWorkflow(),
        html: generateTeamCollaborationHTML(generateTeamCollaborationWorkflow()),
        filename: 'team-collaboration'
    },
    {
        name: 'Crypto Portfolio Workflow',
        mermaid: generateCryptoWorkflow(),
        html: generateCryptoHTML(generateCryptoWorkflow()),
        filename: 'crypto'
    },
    {
        name: 'Collaborative Workflow',
        mermaid: generateCollaborativeWorkflow(),
        html: generateCollaborativeHTML(generateCollaborativeWorkflow()),
        filename: 'collaborative'
    },
    {
        name: 'Community Project Workflow',
        mermaid: generateCommunityProjectWorkflow(),
        html: generateCommunityProjectHTML(generateCommunityProjectWorkflow()),
        filename: 'community-project'
    },
    {
        name: 'Artist Creative Workflow',
        mermaid: generateArtistCreativeWorkflow(),
        html: generateArtistCreativeHTML(generateArtistCreativeWorkflow()),
        filename: 'artist-creative'
    },
    {
    name: 'Artist Creative Workflow',
    mermaid: generateArtistCreativeWorkflow(),
    html: generateArtistCreativeHTML(generateArtistCreativeWorkflow()),
    filename: 'artist-creative'
    },
    {
    name: 'Developer Technical Workflow',
    mermaid: generateDeveloperTechnicalWorkflow(),
    html: generateDeveloperTechnicalHTML(generateDeveloperTechnicalWorkflow()),
    filename: 'developer-technical'
    },
    {
    name: 'Enterprise Organization Workflow',
    mermaid: generateEnterpriseOrganizationWorkflow(),
    html: generateEnterpriseOrganizationHTML(generateEnterpriseOrganizationWorkflow()),
    filename: 'enterprise-organization'
    },
    {
    name: 'UX Research Workflow',
    mermaid: generateUXResearchWorkflow(),
    html: generateUXResearchHTML(generateUXResearchWorkflow()),
    filename: 'ux-research'
    },
    {
    name: 'UI Design Workflow',
    mermaid: generateUIDesignWorkflow(),
    html: generateUIDesignHTML(generateUIDesignWorkflow()),
    filename: 'ui-design'
    },
    {
    name: 'UX/UI Orchestrator Workflow',
    mermaid: generateUXUIOrchestratorWorkflow(),
    html: generateUXUIOrchestratorHTML(generateUXUIOrchestratorWorkflow()),
    filename: 'ux-ui-orchestrator'
    }
  ];
  
  let count = 0;
  
  for (const workflow of workflows) {
    // Save Mermaid file
    const mermaidPath = path.join(outputDir, `${workflow.filename}.mmd`);
    fs.writeFileSync(mermaidPath, workflow.mermaid, 'utf8');
    
    // Save HTML file
    const htmlPath = path.join(outputDir, `${workflow.filename}.html`);
    fs.writeFileSync(htmlPath, workflow.html, 'utf8');
    
    count++;
    console.log(`✅ ${workflow.name}`);
  }
  
  console.log(`\n🎉 Generated ${count} workflow diagrams in: ${outputDir}`);
  console.log('\n🌐 Open in browser:');
  console.log(`   ${path.join(outputDir, 'index.html')}`);
  console.log('\n📊 Individual workflows:');
  workflows.forEach(wf => {
    console.log(`   • ${wf.name}: ${path.join(outputDir, wf.filename + '.html')}`);
  });
  console.log('\n💡 Share with your team for better collaboration!');
}

function generateIndexHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Diagrams Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .workflow-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }
        .workflow-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
            text-decoration: none;
            color: inherit;
        }
        .workflow-card:hover {
            transform: translateY(-10px);
        }
        .card-header {
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
        }
        .project-phase {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }
        .team-collab {
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        }
        .crypto {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }
        .collaborative {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }
        .card-content {
            padding: 20px;
        }
        .card-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .card-description {
            color: #666;
            margin-bottom: 15px;
        }
        .card-commands {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: white;
            opacity: 0.8;
        }
        .generate-button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .generate-button:hover {
            background: #667eea;
            color: white;
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🚀 Workflow Diagrams</h1>
            <p class="subtitle">Visual guides for your project management lifecycle</p>
            <button class="generate-button" onclick="location.reload()">
                🔄 Regenerate All Diagrams
            </button>
        </div>
        
        <div class="workflow-grid">
            <a href="project-phase.html" class="workflow-card">
                <div class="card-header project-phase">
                    🗺️
                </div>
                <div class="card-content">
                    <div class="card-title">Project Phase Workflow</div>
                    <div class="card-description">Structured approach to managing type imports through project phases</div>
                    <div class="card-commands">pnpm workflow:analyze</div>
                </div>
            </a>
            
            <a href="team-collaboration.html" class="workflow-card">
                <div class="card-header team-collab">
                    👥
                </div>
                <div class="card-content">
                    <div class="card-title">Team Collaboration Workflow</div>
                    <div class="card-description">Cross-functional team coordination with specialized roles</div>
                    <div class="card-commands">pnpm team:sync</div>
                </div>
            </a>
            
            <a href="crypto.html" class="workflow-card">
                <div class="card-header crypto">
                    💎
                </div>
                <div class="card-content">
                    <div class="card-title">Crypto Portfolio Workflow</div>
                    <div class="card-description">Manage type imports like a crypto portfolio with risk management</div>
                    <div class="card-commands">pnpm crypto:integrate</div>
                </div>
            </a>
            
            <a href="collaborative.html" class="workflow-card">
                <div class="card-header collaborative">
                    🤝
                </div>
                <div class="card-content">
                    <div class="card-title">Collaborative Workflow</div>
                    <div class="card-description">Audio, video, and text collaboration throughout the process</div>
                    <div class="card-commands">pnpm collaborate:all</div>
                </div>
            </a>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Part of your Project Management & Crypto App 🚀💎</p>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || './workflow-diagrams';
  
  await generateAllWorkflows(outputDir);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateAllWorkflows };