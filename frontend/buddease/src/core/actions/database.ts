// database.ts
'use server';

import { PostgresDatabaseService } from '@/core/server/database/PostgresDatabaseService';

export async function createDatabaseAction(config: DatabaseConfig) {
  'use server';
  const service = new PostgresDatabaseService(config);
  await service.createDatabase(config);
}


