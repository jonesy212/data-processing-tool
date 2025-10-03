import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/lib/server/DatabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { teamId, projectId, assignedDate } = await request.json();
    
    const dbClient = new DatabaseClient(databaseConfig);
    await dbClient.connect();
    
    // Database logic for assigning project
    await dbClient.update("teams", teamId, { 
      $push: { projects: projectId } 
    });
    
    await dbClient.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign project' }, { status: 500 });
  }
}


