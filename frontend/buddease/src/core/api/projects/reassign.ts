// reassign.ts
// /src/app/api/projects/reassign/route.ts
import DatabaseClient from '@/core/api/DatabaseClient';
import { databaseConnection } from '@/core/config/databaseConnection';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { newTeam, newProject, previousTeam, reassignmentDate } = await request.json();
    
    const dbClient = new DatabaseClient(databaseConnection);
    await dbClient.connect();
    
    // Step 1: Update project's current team assignment
    await dbClient.update("projects", newProject.id, { currentTeam: newTeam });

    // Step 2: Record the reassignment in reassignedProjects array
    const reassignmentRecord = {
      projectId: newProject.id,
      project: newProject,
      projectName: newProject.name,
      previousTeam: previousTeam,
      reassignmentDate: reassignmentDate,
    };

    await dbClient.pushToArray("projects", newProject.id, "reassignedProjects", reassignmentRecord);

    // Step 3: Log the reassignment
    console.log(`Project "${newProject.name}" reassigned from "${previousTeam.teamName}" to "${newTeam.teamName}" on ${reassignmentDate}`);

    await dbClient.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reassign project error:', error);
    return NextResponse.json({ error: 'Failed to reassign project' }, { status: 500 });
  }
}