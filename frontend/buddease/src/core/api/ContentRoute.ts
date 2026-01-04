ContentRoute.ts
app/api/log-event/route.ts (or pages/api/log-event.ts if not using App Router)
import { ContentLoggerServer } from '@/core/server/ContentLoggerServer'; // Adjust the import path as needed
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { logType, message, fileName } = body;

  try {
    // Use ContentLoggerServer instead of ContentLogger
    ContentLoggerServer.logEventToFile(logType, message, fileName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write log:', error);
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}