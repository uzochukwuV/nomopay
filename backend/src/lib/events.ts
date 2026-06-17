import type { Response } from 'express';

type DashboardEvent =
  | { type: 'transaction.created'; merchantId: string; affiliateId?: string | null; transactionId: string }
  | { type: 'transaction.refunded'; merchantId: string; affiliateId?: string | null; transactionId: string }
  | { type: 'transaction.shipped'; merchantId: string; transactionId: string }
  | { type: 'product.updated'; merchantId: string; productId: string };

const clients = new Map<string, Set<Response>>();

export function addEventClient(userId: string, res: Response) {
  let set = clients.get(userId);
  if (!set) {
    set = new Set();
    clients.set(userId, set);
  }
  set.add(res);
  res.on('close', () => {
    set?.delete(res);
    if (set?.size === 0) clients.delete(userId);
  });
}

export function publishDashboardEvent(event: DashboardEvent) {
  const targets = new Set<string>();
  if ('merchantId' in event) targets.add(event.merchantId);
  if ('affiliateId' in event && event.affiliateId) targets.add(event.affiliateId);

  for (const userId of targets) {
    for (const res of clients.get(userId) ?? []) {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }
}

