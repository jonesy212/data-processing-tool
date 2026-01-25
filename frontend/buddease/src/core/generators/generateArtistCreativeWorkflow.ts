// generateArtistCreativeWorkflow.ts
#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateArtistCreativeWorkflow(): string {
  return `flowchart TD
    subgraph "🎨 Phase 1: Creative Inspiration"
        A[✨ Inspiration Gathering] --> B[📝 Concept Development]
        B --> C[🎯 Mood Board Creation]
        C --> D[📋 Creative Brief Definition]
    end
    
    subgraph "✍️ Phase 2: Artistic Creation"
        D --> E[🖼️ Sketching & Wireframing]
        E --> F[🎨 Digital Creation]
        F --> G[🎬 Animation & Motion Design]
        G --> H[🎵 Sound & Music Integration]
    end
    
    subgraph "🔧 Phase 3: Technical Implementation"
        H --> I[💻 Development Integration]
        I --> J[📱 Responsive Adaptation]
        J --> K[🎮 Interactive Elements]
    end
    
    subgraph "👁️ Phase 4: Review & Refinement"
        K --> L[👥 Peer Review Session]
        L --> M[🎭 User Testing]
        M --> N[✨ Artistic Polish]
    end
    
    subgraph "🚀 Phase 5: Launch & Promotion"
        N --> O[🌐 Portfolio Showcase]
        O --> P[📱 Social Media Launch]
        P --> Q[🎯 Target Audience Engagement]
        Q --> R[📈 Performance Analytics]
    end
    
    style A fill:#f3e5f5
    style B fill:#e1bee7
    style C fill:#ce93d8
    style E fill:#ba68c8
    style F fill:#ab47bc
    style H fill:#9c27b0
    style K fill:#8e24aa
    style L fill:#7b1fa2
    style O fill:#6a1b9a
    style R fill:#4a148c`;
}

function generateArtistCreativeHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artist Creative Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
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
            border-bottom: 2px solid #9c27b0;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
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
        .creative-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .tool-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #9c27b0;
        }
        .tool-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .portfolio-gallery {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .gallery-item {
            height: 150px;
            background: linear-gradient(135deg, #f3e5f5, #e1bee7);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Artist Creative Workflow</h1>
            <p class="subtitle">From inspiration to exhibition - the creative journey</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="creative-tools">
            <div class="tool-card">
                <div class="tool-title">
                    <span>✨</span>
                    <span>Inspiration Board</span>
                </div>
                <p>Collect and organize creative inspiration from various sources</p>
                <div class="command">pnpm artist:inspiration --save="nature-photos"</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🎨</span>
                    <span>Digital Canvas</span>
                </div>
                <p>Create digital artwork with integrated creative tools</p>
                <div class="command">pnpm artist:canvas --type="digital-painting"</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🎬</span>
                    <span>Animation Studio</span>
                </div>
                <p>Create motion graphics and animations</p>
                <div class="command">pnpm artist:animate --frames=60</div>
            </div>
            
            <div class="tool-card">
                <div class="tool-title">
                    <span>🌐</span>
                    <span>Portfolio Builder</span>
                </div>
                <p>Showcase your artwork with customizable galleries</p>
                <div class="command">pnpm artist:portfolio --theme="minimal"</div>
            </div>
        </div>
        
        <div class="portfolio-gallery">
            <h3>🖼️ Portfolio Showcase</h3>
            <div class="gallery-grid">
                <div class="gallery-item">🎨</div>
                <div class="gallery-item">🖼️</div>
                <div class="gallery-item">🎭</div>
                <div class="gallery-item">✨</div>
                <div class="gallery-item">🎵</div>
                <div class="gallery-item">🎬</div>
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
  
  const workflow = generateArtistCreativeWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'artist-creative.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateArtistCreativeHTML(workflow);
    const htmlPath = path.join(outputDir, 'artist-creative.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n🎨 Artist Creative Workflow Generated!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateArtistCreativeWorkflow, generateArtistCreativeHTML };