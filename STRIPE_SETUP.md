# Stripe Integration Setup Guide

This guide will help you set up the Stripe payment integration for the PostForge LinkedIn AI Scheduler credit purchase system.

## Overview

The Stripe integration enables users to purchase credits through a secure checkout process. The system supports:
- One-time credit purchases (not subscriptions)
- Multiple credit packages with different pricing tiers
- Webhook-based fulfillment for instant credit delivery
- Refund handling with automatic credit deduction
- Comprehensive transaction logging

## Architecture

### Components

1. **Stripe Client** (`src/lib/stripe/client.ts`)
   - Initializes Stripe SDK with API credentials
   - Exports configured Stripe instance

2. **Webhook Handlers** (`src/lib/stripe/webhook-handlers.ts`)
   - `handleCheckoutCompleted()` - Processes successful payments
   - `handleCheckoutExpired()` - Logs abandoned checkouts
   - `handleChargeRefunded()` - Handles refunds

3. **API Endpoints**
   - `POST /api/stripe/create-checkout-session` - Creates checkout sessions
   - `POST /api/stripe/webhook` - Receives Stripe webhook events
   - `GET /api/stripe/session/[sessionId]` - Retrieves session details

4. **UI Pages**
   - `/dashboard/credits/purchase` - Credit package selection
   - `/dashboard/credits/success` - Purchase confirmation

## Setup Instructions

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Activate your account and complete business verification
3. Switch to Test Mode for development

### 2. Get API Keys

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add to `.env`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### 3. Create Products and Prices

Create products and prices in the Stripe Dashboard that match your credit packages:

#### Starter Pack
- **Product Name**: Starter Pack
- **Price**: $9.99 USD
- **Type**: One-time payment
- **Description**: 50 credits for AI post generation

#### Popular Pack
- **Product Name**: Popular Pack
- **Price**: $24.99 USD
- **Type**: One-time payment
- **Description**: 150 credits for AI post generation

#### Pro Pack
- **Product Name**: Pro Pack
- **Price**: $69.99 USD
- **Type**: One-time payment
- **Description**: 500 credits for AI post generation

#### Enterprise Pack
- **Product Name**: Enterprise Pack
- **Price**: $119.99 USD
- **Type**: One-time payment
- **Description**: 1000 credits for AI post generation

After creating each price, copy the **Price ID** (starts with `price_`) and add to `.env`:

```bash
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_POPULAR=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=price_xxx
```

### 4. Set Up Webhooks

#### For Local Development (Using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) from the CLI output
5. Add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

#### For Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to production environment variables

### 5. Configure App URL

Set your application URL in `.env`:

```bash
# For development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 6. Test the Integration

#### Test Credit Purchase

1. Start your development server: `npm run dev`
2. Navigate to `/dashboard/credits/purchase`
3. Click "Purchase Now" on any package
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code
5. Complete checkout
6. Verify:
   - Redirected to success page
   - Credits added to account
   - Transaction logged in database

#### Test Webhook Locally

With Stripe CLI running:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Complete a test purchase and verify webhook events are received.

#### Test Refunds

1. Go to Stripe Dashboard → Payments
2. Find a test payment
3. Click "Refund"
4. Verify:
   - Credits deducted from user account
   - Transaction marked as refunded
   - Credit transaction created

## Database Schema

The integration uses these database models:

### StripeTransaction
- Stores all Stripe checkout sessions
- Tracks payment status (pending, completed, failed, refunded)
- Links to User via userId
- Indexed by stripeSessionId for webhook lookups

### CreditTransaction
- Logs all credit movements
- Positive amounts = credits added
- Negative amounts = credits deducted
- Stores metadata including Stripe session IDs

## Security Considerations

### Webhook Signature Verification
All webhook requests are verified using the `stripe-signature` header and `STRIPE_WEBHOOK_SECRET`. Never skip this verification in production.

### Idempotency
The webhook handler checks if a session has already been processed before adding credits, preventing duplicate credit grants from webhook retries.

### User Authorization
- Checkout sessions include user metadata
- Session retrieval verifies ownership before returning data
- All endpoints require Clerk authentication

### Rate Limiting
Consider adding rate limiting to checkout session creation to prevent abuse:
- Per-user limits (e.g., 10 sessions per hour)
- Per-IP limits for anonymous users

## Error Handling

### Webhook Failures
If a webhook handler throws an error, Stripe will automatically retry the webhook:
- Immediate retry
- Retries with exponential backoff up to 3 days
- Check webhook logs in Stripe Dashboard

### Race Conditions
The system uses Prisma transactions to ensure atomicity:
- Credits and transactions are created/updated together
- Rollback on any error

### Insufficient Credits on Refund
If a user has spent credits before a refund is processed, the system:
- Deducts available credits (may result in 0 balance)
- Logs actual deduction in transaction metadata
- Sends warning to logs

## Monitoring

### Key Metrics to Track
- Checkout session creation success rate
- Webhook processing time
- Failed webhook events (check Stripe Dashboard)
- Refund rate
- Average transaction value

### Logging
The system logs all key events:
- `[Stripe API]` - API endpoint operations
- `[Stripe Webhook]` - Webhook event processing
- `[Credits]` - Credit operations

Check application logs for debugging.

## Testing Checklist

- [ ] Checkout session creation
- [ ] Successful payment flow
- [ ] Credit addition on purchase
- [ ] Transaction logging
- [ ] Success page display
- [ ] Canceled checkout handling
- [ ] Webhook signature verification
- [ ] Duplicate webhook handling (idempotency)
- [ ] Refund processing
- [ ] Credit deduction on refund
- [ ] Expired session handling
- [ ] Error handling and logging

## Stripe Test Cards

Use these test cards in development:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Payment declined (insufficient funds) |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 0069 | Expired card |

Use any future expiry date, any 3-digit CVC, and any postal code.

## Troubleshooting

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- For local development, use Stripe CLI webhook secret
- For production, use endpoint-specific secret from Dashboard

### "Session not found or invalid"
- Verify session ID is correct
- Check if session belongs to the authenticated user
- Ensure Stripe keys match the environment (test vs live)

### Credits not added after payment
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is receiving events
- Check application logs for handler errors
- Ensure webhook secret is configured

### Duplicate credit grants
- Check for duplicate webhook event processing
- Verify idempotency check is working (stripeSessionId uniqueness)

## Going Live

Before deploying to production:

1. Switch from Test Mode to Live Mode in Stripe Dashboard
2. Update environment variables with live API keys
3. Set up production webhook endpoint
4. Configure production app URL
5. Test with small live transactions first
6. Monitor webhook delivery closely
7. Set up alerts for failed webhooks

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check application logs
- Review webhook event logs in Stripe Dashboard
- Verify database transaction records
