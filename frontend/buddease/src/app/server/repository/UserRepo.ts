// UserRepo.ts
// server/repository/UserRepo.ts
import db from '@/app/server/repository/CacheDataRepository';
import { CacheData } from '@/app/generators/GenerateCache';
import { userToDatabase, userFromDatabase } from '@/app/server/repository/entityMapper';

export async function saveUserData(user: CacheData) {
  const dbObj = userToDatabase(user);
  await db.save(dbObj);
}

export async function loadUserData(id: string): Promise<CacheData> {
  const dbObj = await db.fetch(id);
  return userFromDatabase(dbObj);
}
