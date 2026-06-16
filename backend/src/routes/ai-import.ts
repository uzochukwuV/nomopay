import { Router } from 'express';
import type { Request, Response } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { slugify } from '../lib/utils.js';

const router = Router();
const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://apekey.ai/v1',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported'));
    }
  },
});

const DraftProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  price: z.number().nullable().default(null),
  imageUrl: z.string().url().nullable().default(null),
  currency: z.string().default('usd'),
});

const ExtractUrlSchema = z.object({
  url: z.string().url(),
});

const ImportProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().int().min(100),
  commissionRate: z.number().min(0).max(80),
  imageUrl: z.string().url().optional().nullable(),
  currency: z.string().default('usd'),
});

const ImportSchema = z.object({
  products: z.array(ImportProductSchema).min(1).max(50),
});

const SYSTEM_PROMPT = `You are a product catalog extraction assistant. Given content (web page or document), extract all products or services being sold.

Return ONLY a valid JSON array — no markdown code fences, no explanation, no preamble. Each element must have exactly these fields:
- title: string (product name)
- description: string (1–3 sentences describing what it is and its benefits; write one if not found)
- price: number in cents (integer) or null if price not found
- imageUrl: string (full absolute URL) or null
- currency: string (default "usd")

If no products are found, return an empty array [].`;

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style|nav|footer|head|header)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 12000);
}

function parseClaudeJson(text: string): unknown[] {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return [];
      }
    }
    return [];
  }
}

async function extractWithClaude(content: string, hint: string) {
  const completion = await ai.chat.completions.create({
    model: 'auto',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extract all products from this ${hint}:\n\n${content}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? '';
  const raw = parseClaudeJson(text);
  return raw
    .map((item) => DraftProductSchema.safeParse(item))
    .filter((r) => r.success)
    .map((r) => (r as { success: true; data: z.infer<typeof DraftProductSchema> }).data);
}

// POST /api/ai-import/extract-url
router.post('/extract-url', async (req: Request, res: Response): Promise<void> => {
  const parsed = ExtractUrlSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  let html: string;
  try {
    const response = await axios.get(parsed.data.url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      maxContentLength: 5 * 1024 * 1024,
    });
    html = String(response.data);
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err)
        ? `Could not fetch URL: ${err.message}`
        : 'Could not fetch URL';
    res.status(400).json({ error: message });
    return;
  }

  const content = stripHtml(html);
  const products = await extractWithClaude(`URL: ${parsed.data.url}\n\nPAGE CONTENT:\n${content}`, 'web page');
  res.json({ products });
});

// POST /api/ai-import/extract-document
router.post(
  '/extract-document',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    let text: string;
    try {
      const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
      const result = await parser.getText();
      await parser.destroy();
      text = result.text.slice(0, 15000);
    } catch {
      res.status(400).json({ error: 'Could not parse PDF. Make sure it contains text (not scanned images).' });
      return;
    }

    if (!text.trim()) {
      res.status(400).json({ error: 'PDF appears to be empty or contains only images. Please try a text-based PDF.' });
      return;
    }

    const products = await extractWithClaude(text, 'document text');
    res.json({ products });
  }
);

// POST /api/ai-import/import
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

  const results = [];
  let imported = 0;

  for (const product of parsed.data.products) {
    try {
      let slug = slugify(product.title);
      let attempt = 0;
      while (await prisma.product.findUnique({ where: { slug } })) {
        attempt++;
        slug = `${slugify(product.title)}-${attempt}`;
      }

      await prisma.product.create({
        data: {
          merchantId: user.id,
          title: product.title,
          description: product.description,
          price: product.price,
          commissionRate: product.commissionRate,
          imageUrl: product.imageUrl ?? null,
          currency: product.currency,
          slug,
        },
      });

      imported++;
      results.push({ title: product.title, slug, success: true });
    } catch (err) {
      results.push({ title: product.title, success: false, error: String(err) });
    }
  }

  res.json({ imported, total: parsed.data.products.length, results });
});

export default router;
