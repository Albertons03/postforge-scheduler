/**
 * Pricing constants for credit packages
 * Used across the application for displaying and processing credit purchases
 */

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    priceInCents: 999,
    price: '$9.99',
    pricePerCredit: '$0.20',
    savings: null,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || '',
    popular: false,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 150,
    priceInCents: 2499,
    price: '$24.99',
    pricePerCredit: '$0.17',
    savings: '15%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POPULAR || '',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    priceInCents: 6999,
    price: '$69.99',
    pricePerCredit: '$0.14',
    savings: '30%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    priceInCents: 11999,
    price: '$119.99',
    pricePerCredit: '$0.12',
    savings: '40%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE || '',
    popular: false,
  },
] as const;

export const CREDIT_COSTS = {
  STANDARD_GENERATION: 1,
  ENHANCED_GENERATION: 2,
} as const;

export type CreditPackageId = typeof CREDIT_PACKAGES[number]['id'];
export type CreditPackage = typeof CREDIT_PACKAGES[number];
