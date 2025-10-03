// ProjectManagementSimulator.ts
import express, { Request, Response } from 'express';
const router = express.Router();

router.get('/simulateProject', (req: Request, res: Response) => {
  const numSteps = 100;
  const randomWalk: number[] = [0];

  for (let i = 0; i < numSteps; i++) {
    const step = randomWalk[randomWalk.length - 1];
    const dice = Math.floor(Math.random() * 6) + 1;

    let newStep;
    if (dice <= 2) {
      newStep = Math.max(0, step - 1);
    } else if (dice <= 5) {
      newStep = step + 1;
    } else {
      newStep = step + Math.floor(Math.random() * 6) + 1;
    }

    randomWalk.push(newStep);
  }

  res.json({ randomWalk });
});

export default router;
