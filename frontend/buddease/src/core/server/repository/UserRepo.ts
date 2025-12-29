// UserRepo.ts
// server/repository/UserRepo.ts
import { CacheData } from '@/core/generators/GenerateCache';
import db from '@/core/server/repository/CacheDataRepository';
import { userFromDatabase, userToDatabase } from '@/core/server/repository/entityMapper';

export async function saveUserData(user: CacheData) {
  const dbObj = userToDatabase(user);
  await db.save(dbObj);
}

export async function loadUserData(id: string): Promise<CacheData> {
  const dbObj = await db.fetch(id);
  return userFromDatabase(dbObj);
}
