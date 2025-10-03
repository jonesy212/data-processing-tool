// Server-side only
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/lib/server/DatabaseClient'; // Server version
import { DatabaseConfig } from '@/app/configs/DatabaseConfig';

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

