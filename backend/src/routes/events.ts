import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';
import { addEventClient } from '../lib/events.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const token = typeof req.query.token === 'string' ? req.query.token : null;
  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  let userId: string;
  try {
    const { sub: clerkId } = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    userId = user.id;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ userId })}\n\n`);

  addEventClient(userId, res);
});

export default router;
