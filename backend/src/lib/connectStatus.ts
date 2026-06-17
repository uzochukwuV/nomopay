import { prisma } from './prisma.js';
import { stripe } from './stripe.js';

export async function syncStripeConnectStatus(user: {
  id: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
}) {
  if (!user.stripeAccountId) {
    return {
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      stripeAccountId: null,
    };
  }

  const account = await stripe.accounts.retrieve(user.stripeAccountId);
  const onboardingComplete = Boolean(account.charges_enabled && account.payouts_enabled);

  if (onboardingComplete !== user.stripeOnboardingComplete) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeOnboardingComplete: onboardingComplete },
    });
  }

  return {
    onboardingComplete,
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    stripeAccountId: user.stripeAccountId,
  };
}
