// UserRepo.ts
// server/repository/UserRepo.ts
import db from './db';
import { CacheData } from '@/app/models/data/CacheData';
import { userToDatabase, userFromDatabase } from './userMapper';

export async function saveUserData(user: CacheData) {
  const dbObj = userToDatabase(user);
  await db.save(dbObj);
}

export async function loadUserData(id: string): Promise<CacheData> {
  const dbObj = await db.fetch(id);
  return userFromDatabase(dbObj);
}
