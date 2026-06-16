import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendInviteEmail } from '../lib/email.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const InviteSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// POST /api/invites/send
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  if (!['merchant', 'both'].includes(user.role)) {
    res.status(403).json({ error: 'Only merchants can send invites' });
    return;
  }

  const parsed = InviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const signUpUrl = `${frontendUrl}/sign-up?role=affiliate&invitedBy=${encodeURIComponent(user.slug)}&inviterName=${encodeURIComponent(user.name)}`;

  await sendInviteEmail({
    toEmail: parsed.data.email,
    toName: parsed.data.name,
    inviterName: user.name,
    signUpUrl,
  });

  res.json({ success: true });
});

export default router;
