# Stripe Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Stripe Keys (2 min)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** → Add to `.env` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → Add to `.env` as `STRIPE_SECRET_KEY`

### Step 2: Create Products (2 min)
1. Go to https://dashboard.stripe.com/test/products
2. Create 4 products with one-time prices:
   - **Starter Pack**: $9.99 (50 credits)
   - **Popular Pack**: $24.99 (150 credits)
   - **Pro Pack**: $69.99 (500 credits)
   - **Enterprise Pack**: $119.99 (1000 credits)
3. Copy each Price ID → Add to `.env`:
   ```bash
   NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID_POPULAR=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=price_xxx
   ```

### Step 3: Setup Webhooks (1 min)
```bash
# Install Stripe CLI (if not already installed)
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret (whsec_xxx) → Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 4: Test It! (30 sec)
```bash
# Terminal 1: Keep Stripe CLI running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 2: Start dev server
npm run dev
```

Go to: http://localhost:3000/dashboard/credits/purchase

Use test card: **4242 4242 4242 4242**

## That's It!

Your Stripe integration is ready. Users can now purchase credits!

## Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires 3D Secure |

Use any future expiry, any CVC, any postal code.

## Verify Setup

```bash
npx tsx scripts/test-stripe-setup.ts
```

## Going Live

When ready for production:
1. Switch to **Live Mode** in Stripe Dashboard
2. Get live API keys → Update `.env`
3. Create webhook endpoint → Add production URL
4. Update `NEXT_PUBLIC_APP_URL` to production domain
5. Test with small live purchase first!

## Need Help?

- Full docs: `STRIPE_SETUP.md`
- Implementation details: `STRIPE_IMPLEMENTATION_SUMMARY.md`
- Stripe docs: https://stripe.com/docs
