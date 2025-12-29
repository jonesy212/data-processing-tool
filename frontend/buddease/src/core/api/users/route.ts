// route.ts
import { PostgresDatabaseService } from '@/core/server/database/PostgresDatabaseService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');

    const dbConfig = { /* your database config */ };
    const dbService = new PostgresDatabaseService(dbConfig);

    if (taskId) {
      // Fetch user IDs for task
      const userIds = await dbService.query(
        'SELECT user_id FROM task_users WHERE task_id = $1',
        [taskId]
      );
      return NextResponse.json({ userIds });
    }

    if (userId) {
      // Fetch user details
      const user = await dbService.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      return NextResponse.json(user[0] || null);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}