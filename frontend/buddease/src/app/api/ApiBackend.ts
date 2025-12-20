// ApiBackend.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { backendStructure } from '@/app/server/database/BackendStructure'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Your server-side code to get backend structure
    const backendStructure = await getBackendStructureFromDB();
    res.status(200).json(backendStructure);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backend structure' });
  }
}