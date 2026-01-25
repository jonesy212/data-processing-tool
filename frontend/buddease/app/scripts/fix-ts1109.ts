#!/usr/bin/env tsx
// fix-ts1109.ts
// Fix TS1109: Expression expected errors

import fs from 'fs';
import path from 'path';

async function fixTS1109(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Fixing TS1109 error in: ${filePath}\n`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const originalLines = [...lines];
  
  // Common fixes for TS1109
  let fixedLines = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    let newLine = line;
    
    // Fix 1: Missing closing tag or brace before JSX comment
    if (line.includes('// Your component JSX')) {
      console.log(`📍 Line ${lineNum}: Found "// Your component JSX" comment`);
      
      // Check if previous line ends with an opening tag
      if (i > 0) {
        const prevLine = lines[i - 1];
        
        // Fix case where there's an unclosed opening tag
        if (prevLine.includes('return (') && !prevLine.includes(')')) {
          console.log(`⚠️  Line ${lineNum - 1}: return statement missing closing parenthesis`);
          // The fix depends on the full context
        }
        
        // Check if we need to add JSX content
        if (lineNum === 20) {
          console.log(`⚠️  Line ${lineNum}: Empty JSX comment at error location`);
          console.log(`   This comment might be where JSX is expected`);
          
          // Replace with valid JSX
          newLine = '    <div>Team Manager Component</div>';
          lines[i] = newLine;
          fixedLines++;
          
          console.log(`   Fixed to: ${newLine}`);
        }
      }
    }
    
    // Fix 2: Unclosed JSX tags
    const openTags = (line.match(/<(\w+)[^>]*$/g) || []).length;
    if (openTags > 0 && !line.includes('/>')) {
      console.log(`⚠️  Line ${lineNum}: Possible unclosed JSX tag`);
      
      // Check next few lines for closing tag
      let foundClosing = false;
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes(`</`)) {
          foundClosing = true;
          break;
        }
      }
      
      if (!foundClosing) {
        console.log(`   No closing tag found in next 10 lines`);
      }
    }
    
    // Fix 3: Missing semicolons or commas in object literals
    if (line.includes('const') && line.includes('=') && !line.includes(';') && 
        lineNum < lines.length && !lines[i + 1]?.match(/^\s*(?:const|let|var|function|return)/)) {
      
      const nextLine = lines[i + 1] || '';
      if (nextLine.trim().startsWith('const') || nextLine.trim().startsWith('return')) {
        console.log(`⚠️  Line ${lineNum}: Missing semicolon`);
        newLine = line.trim().endsWith(';') ? line : line + ';';
        lines[i] = newLine;
        fixedLines++;
        console.log(`   Added semicolon`);
      }
    }
  }
  
  // Check if we found and fixed the issue
  if (fixedLines > 0) {
    const newContent = lines.join('\n');
    
    // Create backup
    const backupPath = fullPath + '.backup';
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`\n📁 Backup created: ${backupPath}`);
    
    // Write fixed file
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ Fixed ${fixedLines} issues in ${filePath}`);
    
    // Show diff
    console.log('\n📝 Changes made:');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== originalLines[i]) {
        console.log(`Line ${i + 1}:`);
        console.log(`  Before: ${originalLines[i]}`);
        console.log(`  After:  ${lines[i]}`);
      }
    }
  } else {
    console.log('ℹ️  No automatic fixes applied');
    console.log('\n💡 Manual fixes to try:');
    console.log('   1. Replace "// Your component JSX" with actual JSX');
    console.log('   2. Ensure return statement has proper parentheses:');
    console.log('      return (');
    console.log('        <div>Content</div>');
    console.log('      );');
    console.log('   3. Check for unclosed tags or brackets');
  }
}

function createTeamManagerTemplate() {
  return `// TeamManager.tsx
import React, { useState } from 'react';
import { TeamFull, createDefaultTeam } from '@/app/typings/teamTypes';

interface TeamManagerProps {
  initialTeams?: TeamFull[];
}

const TeamManager: React.FC<TeamManagerProps> = ({ initialTeams = [] }) => {
  const [currentTeam, setCurrentTeam] = useState<TeamFull>(createDefaultTeam());
  const [teams, setTeams] = useState<TeamFull[]>(initialTeams);

  const createNewTeam = (name: string, ownerId: string) => {
    const newTeam = createDefaultTeam({ 
      name, 
      ownerId,
      members: [ownerId]
    });
    setTeams(prev => [...prev, newTeam]);
    setCurrentTeam(newTeam);
  };

  const updateTeam = (teamId: string, updates: Partial<TeamFull>) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ));
    
    if (currentTeam.id === teamId) {
      setCurrentTeam(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    
    if (currentTeam.id === teamId) {
      setCurrentTeam(createDefaultTeam());
    }
  };

  return (
    <div className="team-manager">
      <h1>Team Manager</h1>
      
      <div className="team-list">
        <h2>Teams ({teams.length})</h2>
        {teams.length === 0 ? (
          <p>No teams created yet.</p>
        ) : (
          <ul>
            {teams.map(team => (
              <li key={team.id}>
                <strong>{team.name}</strong>
                <span> - {team.members.length} members</span>
                <button onClick={() => setCurrentTeam(team)}>Select</button>
                <button onClick={() => deleteTeam(team.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="team-editor">
        <h2>Current Team</h2>
        {currentTeam.id ? (
          <div>
            <h3>{currentTeam.name}</h3>
            <p>ID: {currentTeam.id}</p>
            <p>Owner: {currentTeam.ownerId}</p>
            <p>Members: {currentTeam.members.length}</p>
            <button onClick={() => setCurrentTeam(createDefaultTeam())}>Create New Team</button>
          </div>
        ) : (
          <div>
            <h3>Create New Team</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('teamName') as HTMLInputElement).value;
              const ownerId = 'user-123'; // In real app, get from auth
              createNewTeam(name, ownerId);
            }}>
              <input 
                type="text" 
                name="teamName" 
                placeholder="Team name" 
                required 
              />
              <button type="submit">Create Team</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager;

// Helper function for API calls
export const fetchTeam = async (teamId: string): Promise<TeamFull> => {
  // In a real app, this would be an API call
  const response = await fetch(\`/api/teams/\${teamId}\`);
  const data = await response.json();
  return createDefaultTeam(data);
};

export const saveTeam = async (team: TeamFull): Promise<TeamFull> => {
  // In a real app, this would be an API call
  const response = await fetch(\`/api/teams/\${team.id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team)
  });
  const data = await response.json();
  return createDefaultTeam(data);
};`;
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: pnpm run fix-ts1109 <file-path>');
    console.log('\nOr create a new TeamManager.tsx template:');
    console.log(createTeamManagerTemplate());
    process.exit(1);
  }
  
  if (filePath === '--template') {
    console.log(createTeamManagerTemplate());
  } else {
    fixTS1109(filePath).catch(console.error);
  }
}