export function generateIdeationWorkflow(): string {
  return `flowchart TD
    Start[🎯 Start Ideation] --> Brainstorm[🧠 Brainstorming Session]
    Brainstorm --> Ideas[💡 Generate Ideas]
    Ideas --> Categorize[📂 Categorize Ideas]
    Categorize --> Prioritize[⭐ Prioritize Ideas]
    Prioritize --> Draft[📝 Create Drafts]
    Draft --> Review[👁️ Team Review]
    Review --> Selection[✅ Select Final Ideas]
    Selection --> TeamFormation[👥 Team Formation]
    TeamFormation --> Planning[📋 Project Planning]
    
    classDef ideation fill:#e1f5fe,stroke:#0288d1
    class Start,Brainstorm,Ideas,Categorize,Prioritize ideation`;
}