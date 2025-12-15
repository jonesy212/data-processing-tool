// route.ts
// Server-side only
import DatabaseClient from '@/app/api/DatabaseClient'; // Server version
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { snapshotData, config, snapshotId, operationType } = await request.json();
    
    const dbClient = new DatabaseClient(config);
    await dbClient.connect();
    
    // Perform database operation
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", snapshotData);
    } else {
      await dbClient.insertData("snapshots", snapshotData);
    }
    
    await dbClient.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to persist snapshot' }, { status: 500 });
  }
}

