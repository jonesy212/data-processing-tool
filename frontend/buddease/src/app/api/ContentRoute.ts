// ContentRoute.ts
// app/api/log-event/route.ts (or pages/api/log-event.ts if not using App Router)
import { NextRequest, NextResponse } from 'next/server';
import { ContentLogger } from '@/app/logging/ContentLogger';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { logType, message, fileName } = body;

  try {
    ContentLogger.logEventToFile(logType, message, fileName);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}
