import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../lib/stripe.js';
import { prisma } from '../lib/prisma.js';
import { syncStripeConnectStatus } from '../lib/connectStatus.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/connect/onboard — initiate Stripe Express onboarding
router.post('/onboard', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const isAffiliate = user.role === 'affiliate';
    const requestedReturnPath = typeof req.body?.returnPath === 'string' ? req.body.returnPath : null;
    const returnPath =
      requestedReturnPath?.startsWith('/dashboard')
        ? requestedReturnPath
        : isAffiliate
        ? '/dashboard/discover?onboarding=true'
        : '/dashboard/ai-import?onboarding=true';

    let stripeAccountId = user.stripeAccountId;

    // Create Express account if not already created
    if (!stripeAccountId) {
      const shouldUseManualPayouts = ['affiliate', 'both'].includes(user.role);

      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { userId: user.id, role: user.role },
        // Affiliate commissions are held for 7 days to protect against refunds.
        // Funds sit in their Stripe balance (visible to them) but don't hit their bank
        // until released by the daily cron job after the hold period clears.
        ...(shouldUseManualPayouts && {
          settings: {
            payouts: { schedule: { interval: 'manual' } },
          },
        }),
      });
      stripeAccountId = account.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId },
      });
    }

    // Generate a fresh Account Link for the onboarding flow
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${frontendUrl}/dashboard/settings?onboarding=refresh`,
      return_url: `${frontendUrl}${returnPath}`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('[stripe-connect]', error);
    res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unable to start Stripe onboarding.',
    });
  }
});

// GET /api/connect/status — check onboarding status and sync with Stripe
router.get('/status', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  if (!user.stripeAccountId) {
    res.json({ onboardingComplete: false, chargesEnabled: false, payoutsEnabled: false });
    return;
  }

  res.json(await syncStripeConnectStatus(user));
});

export default router;
