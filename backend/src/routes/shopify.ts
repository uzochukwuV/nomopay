import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const anthropic = new Anthropic();

const PreviewSchema = z.object({
  shopUrl: z.string().min(1),
  storefrontToken: z.string().min(1),
});

const EnhanceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const ImportProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().int().min(100),
  commissionRate: z.number().min(0).max(80),
  imageUrl: z.string().url().optional(),
});

const ImportSchema = z.object({
  products: z.array(ImportProductSchema).min(1).max(50),
});

function normalizeShopUrl(input: string): string {
  const stripped = input.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (stripped.includes('.myshopify.com')) return stripped;
  return `${stripped}.myshopify.com`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

// POST /api/shopify/preview — fetch products from Shopify Storefront API
router.post('/preview', async (req: Request, res: Response): Promise<void> => {
  const parsed = PreviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { shopUrl, storefrontToken } = parsed.data;
  const shop = normalizeShopUrl(shopUrl);

  const query = `{
    products(first: 50) {
      edges {
        node {
          id
          title
          description
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }`;

  try {
    const response = await fetch(`https://${shop}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      res.status(400).json({ error: `Shopify returned ${response.status}: ${response.statusText}` });
      return;
    }

    type ShopifyNode = {
      id: string;
      title: string;
      description: string;
      featuredImage?: { url: string };
      priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    };
    type ShopifyResponse = {
      data?: { products?: { edges?: Array<{ node: ShopifyNode }> } };
      errors?: Array<{ message: string }>;
    };

    const data = (await response.json()) as ShopifyResponse;

    if (data.errors?.length) {
      res.status(400).json({ error: data.errors[0].message });
      return;
    }

    const products = (data.data?.products?.edges ?? []).map(({ node }) => ({
      shopifyId: node.id,
      title: node.title,
      description: node.description || node.title,
      imageUrl: node.featuredImage?.url ?? null,
      price: Math.round(parseFloat(node.priceRange.minVariantPrice.amount) * 100),
      currency: node.priceRange.minVariantPrice.currencyCode.toLowerCase(),
    }));

    res.json({ products });
  } catch (err) {
    console.error('[shopify/preview]', err);
    res.status(500).json({ error: 'Failed to connect to Shopify store. Check your shop URL and token.' });
  }
});

// POST /api/shopify/enhance — rewrite a description for affiliate marketing using Claude
router.post('/enhance', async (req: Request, res: Response): Promise<void> => {
  const parsed = EnhanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, description } = parsed.data;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are an expert affiliate marketing copywriter. Rewrite the following product description to be compelling, conversion-focused, and optimized for affiliate promoters sharing on social media, blogs, and newsletters. Keep it under 300 words. Be enthusiastic but honest — no false claims. Focus on benefits and outcomes, not just features. Return ONLY the rewritten description, nothing else.

Product: ${title}

Original description:
${description}`,
        },
      ],
    });

    const enhanced =
      message.content[0].type === 'text' ? message.content[0].text : description;
    res.json({ enhanced });
  } catch (err) {
    console.error('[shopify/enhance]', err);
    res.status(500).json({ error: 'AI enhancement failed. Please try again.' });
  }
});

// POST /api/shopify/import — bulk create products in SplitLink
router.post('/import', async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  if (!['merchant', 'both'].includes(user.role)) {
    res.status(403).json({ error: 'Only merchants can import products' });
    return;
  }

  const parsed = ImportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const results: Array<{ title: string; slug: string; success: boolean; error?: string }> = [];

  for (const product of parsed.data.products) {
    try {
      let base = slugify(product.title);
      let slug = base;
      let attempt = 1;

      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${base}-${attempt++}`;
      }

      await prisma.product.create({
        data: {
          title: product.title,
          description: product.description,
          price: product.price,
          currency: 'usd',
          commissionRate: product.commissionRate,
          imageUrl: product.imageUrl ?? null,
          slug,
          merchantId: user.id,
        },
      });

      results.push({ title: product.title, slug, success: true });
    } catch (err) {
      console.error('[shopify/import] product error:', err);
      results.push({ title: product.title, slug: '', success: false, error: 'Database error' });
    }
  }

  const imported = results.filter((r) => r.success).length;
  res.status(201).json({ imported, total: results.length, results });
});

export default router;
