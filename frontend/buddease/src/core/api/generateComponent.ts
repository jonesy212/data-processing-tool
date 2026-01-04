generateComponent.ts
import generateComponent from '@/core/api/generateComponent';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      componentName,
      category,
      properties,
      brand,
      nestedCategory,
    } = req.body;

    const reactCode = generateComponent(
      componentName,
      category,
      properties,
      brand,
      nestedCategory
    );

    res.status(200).json({ success: true, reactCode });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}


