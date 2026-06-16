const PLATFORM_FEE_RATE = 0.02;

export type FeeBreakdown = {
  gross: number;
  platformFee: number;
  affiliateCommission: number;
  merchantPayout: number;
  platformFeeRate: number;
  commissionRate: number;
};

export function computeFeeBreakdown(priceInCents: number, commissionRate: number): FeeBreakdown {
  const gross = priceInCents;
  const platformFee = Math.round(gross * PLATFORM_FEE_RATE);
  const affiliateCommission = Math.round(gross * (commissionRate / 100));
  const merchantPayout = gross - platformFee - affiliateCommission;
  return { gross, platformFee, affiliateCommission, merchantPayout, platformFeeRate: PLATFORM_FEE_RATE, commissionRate };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
