import { Router } from 'express';
import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { stripe, PLATFORM_FEE_RATE } from '../lib/stripe.js';
import { prisma } from '../lib/prisma.js';
import { syncStripeConnectStatus } from '../lib/connectStatus.js';

const router = Router();

const CreateSessionSchema = z.object({
  productId: z.string(),
  refCode: z.string().optional(),
});

// POST /api/checkout/create-session
// Called when buyer clicks "Buy Now" — no auth required
router.post('/create-session', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parsed = CreateSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { productId } = parsed.data;
  let refCode = parsed.data.refCode;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      merchant: {
        select: { id: true, stripeAccountId: true, stripeOnboardingComplete: true },
      },
    },
  });

  if (!product || product.status !== 'active') {
    res.status(404).json({ error: 'Product not found or unavailable' });
    return;
  }

  const connectStatus = product.merchant.stripeAccountId
    ? await syncStripeConnectStatus(product.merchant)
    : {
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        stripeAccountId: null,
      };

  if (!connectStatus.onboardingComplete || !connectStatus.stripeAccountId) {
    res.status(400).json({ error: 'Merchant payment account not ready' });
    return;
  }

  // Validate refCode exists if provided
  if (refCode) {
    const affiliateLink = await prisma.affiliateLink.findUnique({ where: { refCode } });
    if (!affiliateLink) {
      // Invalid ref — proceed as direct sale rather than error
      refCode = undefined;
    }
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const transferGroup = `product_${product.id}_${Date.now()}`;

  // client_reference_id encodes both refCode and productId for the webhook
  const clientReferenceId = refCode ? `${refCode}:${product.id}` : `direct:${product.id}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.title,
              description: product.description,
              ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        transferGroup,
        productId: product.id,
        refCode: refCode ?? 'direct',
      },
      payment_intent_data: {
        transfer_group: transferGroup,
        metadata: {
          productId: product.id,
          merchantId: product.merchantId,
          refCode: refCode ?? 'direct',
          transferGroup,
        },
      },
      client_reference_id: clientReferenceId,
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/p/${product.slug}?cancelled=1`,
      customer_creation: 'always',
    });

    // Log the click — associate checkout session with refCode for attribution
    if (refCode) {
      const affiliateLink = await prisma.affiliateLink.findUnique({ where: { refCode } });
      if (affiliateLink) {
        await prisma.click.create({
          data: {
            affiliateLinkId: affiliateLink.id,
            userAgent: req.headers['user-agent'] ?? null,
            country: (req.headers['cf-ipcountry'] as string) ?? null,
          },
        });
      }
    }

    res.json({ url: session.url });
  } catch (err) {
    const appError = err instanceof Error ? err : new Error('Could not create checkout session');
    appError.message = appError.message || 'Could not create checkout session';
    next(appError);
  }
});

// GET /api/checkout/session/:sessionId — buyer success-page summary
router.get('/session/:sessionId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = String(req.params.sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const clientRefId = session.client_reference_id;
    const productId = clientRefId?.split(':')[1] ?? String(session.metadata?.productId ?? '');

    const product = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
          include: { merchant: { select: { name: true, email: true } } },
        })
      : null;

    res.json({
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        buyerEmail: session.customer_details?.email ?? null,
      },
      product: product
        ? {
            title: product.title,
            slug: product.slug,
            merchantName: product.merchant.name,
            merchantEmail: product.merchant.email,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
