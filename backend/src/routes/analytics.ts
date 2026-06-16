import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

function normalizeReferrer(raw: string | undefined): string {
  if (!raw) return 'direct';
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '');
    if (/instagram\.com|l\.instagram\.com/.test(host)) return 'instagram';
    if (/twitter\.com|t\.co|x\.com/.test(host)) return 'twitter';
    if (/facebook\.com|m\.facebook\.com/.test(host)) return 'facebook';
    if (/tiktok\.com/.test(host)) return 'tiktok';
    if (/youtube\.com|youtu\.be/.test(host)) return 'youtube';
    return 'other';
  } catch {
    return 'direct';
  }
}

// POST /api/analytics/click — record a click when buyer visits /p/:slug?ref=...
router.post('/click', async (req: Request, res: Response): Promise<void> => {
  const { refCode, country, referrer } = req.body as {
    refCode?: string;
    country?: string;
    referrer?: string;
  };

  if (!refCode) {
    res.status(400).json({ error: 'refCode required' });
    return;
  }

  const affiliateLink = await prisma.affiliateLink.findUnique({ where: { refCode } });
  if (!affiliateLink) {
    res.status(404).json({ error: 'Invalid ref code' });
    return;
  }

  // Deduplicate by hashing (affiliateLinkId + IP + day) — raw IP never stored
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    ?? req.socket.remoteAddress
    ?? 'unknown';
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const clickHash = crypto
    .createHash('sha256')
    .update(`${affiliateLink.id}:${ip}:${day}`)
    .digest('hex');

  const duplicate = await prisma.click.findFirst({
    where: { clickHash, affiliateLinkId: affiliateLink.id },
  });

  if (!duplicate) {
    await prisma.click.create({
      data: {
        affiliateLinkId: affiliateLink.id,
        userAgent: req.headers['user-agent'] ?? null,
        country: country ?? (req.headers['cf-ipcountry'] as string) ?? null,
        referrer: normalizeReferrer(referrer),
        clickHash,
      },
    });
  }

  res.json({ recorded: !duplicate });
});

// GET /api/analytics/merchant — merchant dashboard stats
router.get('/merchant', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  const [products, transactions] = await Promise.all([
    prisma.product.findMany({
      where: { merchantId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { affiliateLinks: true, transactions: true } },
      },
    }),
    prisma.transaction.findMany({
      where: { merchantId: user.id, status: 'paid' },
      select: {
        grossAmount: true,
        merchantPayout: true,
        affiliateCommission: true,
        platformFee: true,
        currency: true,
        createdAt: true,
      },
    }),
  ]);

  const totalRevenue = transactions.reduce((s, t) => s + t.grossAmount, 0);
  const totalMerchantPayout = transactions.reduce((s, t) => s + t.merchantPayout, 0);
  const totalCommissionsPaid = transactions.reduce((s, t) => s + t.affiliateCommission, 0);
  const totalPlatformFees = transactions.reduce((s, t) => s + t.platformFee, 0);

  res.json({
    products,
    totalRevenue,
    totalMerchantPayout,
    totalCommissionsPaid,
    totalPlatformFees,
    transactionCount: transactions.length,
  });
});

// GET /api/analytics/affiliate — affiliate dashboard stats
router.get('/affiliate', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  const links = await prisma.affiliateLink.findMany({
    where: { affiliateId: user.id },
    include: {
      product: { select: { title: true, slug: true, commissionRate: true, currency: true } },
      _count: { select: { clicks: true, transactions: true } },
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: { affiliateId: user.id, status: 'paid' },
    select: { affiliateCommission: true, createdAt: true, currency: true },
  });

  const totalEarned = transactions.reduce((s, t) => s + t.affiliateCommission, 0);
  const totalClicks = links.reduce((s, l) => s + l._count.clicks, 0);
  const totalConversions = links.reduce((s, l) => s + l._count.transactions, 0);
  const conversionRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';

  res.json({
    links,
    totalEarned,
    totalClicks,
    totalConversions,
    conversionRate,
    transactionCount: transactions.length,
  });
});

// GET /api/analytics/transactions — paginated transaction history (merchant or affiliate)
router.get('/transactions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { cursor, limit = '20', role } = req.query as Record<string, string>;
  const pageSize = Math.min(parseInt(limit, 10) || 20, 100);

  const isMerchantView = role !== 'affiliate';

  const transactions = await prisma.transaction.findMany({
    where: isMerchantView ? { merchantId: user.id } : { affiliateId: user.id },
    include: {
      product: { select: { title: true, slug: true } },
      affiliateLink: { select: { refCode: true, customLabel: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  res.json({
    transactions,
    nextCursor: transactions.length === pageSize ? transactions.at(-1)?.id : null,
  });
});

// GET /api/analytics/link-breakdown/:linkId — per-link click breakdown (heatmap + referrer)
router.get('/link-breakdown/:linkId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const linkId = String(req.params.linkId);

  const link = await prisma.affiliateLink.findUnique({ where: { id: linkId } });
  if (!link || link.affiliateId !== user.id) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }

  const clicks = await prisma.click.findMany({
    where: { affiliateLinkId: linkId },
    select: { timestamp: true, referrer: true },
  });

  // Clicks by hour of day (0–23)
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: clicks.filter((c) => new Date(c.timestamp).getUTCHours() === h).length,
  }));

  // Clicks by day of week (0=Sun … 6=Sat)
  const byDay = Array.from({ length: 7 }, (_, d) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
    count: clicks.filter((c) => new Date(c.timestamp).getUTCDay() === d).length,
  }));

  // Referrer breakdown
  const referrerCounts: Record<string, number> = {};
  for (const c of clicks) {
    const r = c.referrer ?? 'direct';
    referrerCounts[r] = (referrerCounts[r] ?? 0) + 1;
  }

  res.json({ total: clicks.length, byHour, byDay, referrerCounts });
});

export default router;
