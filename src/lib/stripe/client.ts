/**
 * Stripe Client Configuration
 * Initializes and exports the Stripe instance for server-side operations
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is not defined in environment variables. Please add it to .env file.'
  );
}

/**
 * Stripe client instance
 * Configure with API version and TypeScript support
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
  appInfo: {
    name: 'PostForge LinkedIn AI Scheduler',
    version: '1.0.0',
  },
});

/**
 * Stripe webhook secret for signature verification
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn(
    '[Stripe] STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification will fail.'
  );
}
