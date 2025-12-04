/**
 * Stripe Setup Verification Script
 * Run this to verify your Stripe integration is configured correctly
 *
 * Usage: npx tsx scripts/test-stripe-setup.ts
 */

import { stripe } from '../src/lib/stripe/client';
import { CREDIT_PACKAGES } from '../src/lib/constants/pricing';

async function testStripeSetup() {
  console.log('🔍 Testing Stripe Integration Setup...\n');

  let errors = 0;
  let warnings = 0;

  // Test 1: Stripe API Key
  console.log('1️⃣  Testing Stripe API connection...');
  try {
    const balance = await stripe.balance.retrieve();
    console.log('   ✅ Connected to Stripe API');
    console.log(`   💰 Account balance: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'usd'}`);
  } catch (error) {
    console.error('   ❌ Failed to connect to Stripe API');
    console.error('   Error:', error instanceof Error ? error.message : error);
    errors++;
  }

  console.log('');

  // Test 2: Webhook Secret
  console.log('2️⃣  Checking webhook secret...');
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      console.log('   ✅ Webhook secret is configured');
    } else {
      console.log('   ⚠️  Webhook secret format may be incorrect (should start with whsec_)');
      warnings++;
    }
  } else {
    console.log('   ❌ Webhook secret is not configured');
    console.log('   Set STRIPE_WEBHOOK_SECRET in your .env file');
    errors++;
  }

  console.log('');

  // Test 3: Price IDs
  console.log('3️⃣  Verifying credit package price IDs...');
  for (const pkg of CREDIT_PACKAGES) {
    if (!pkg.stripePriceId) {
      console.log(`   ❌ ${pkg.name}: Missing price ID`);
      errors++;
      continue;
    }

    if (pkg.stripePriceId.includes('undefined') || pkg.stripePriceId.length === 0) {
      console.log(`   ❌ ${pkg.name}: Price ID not configured in environment`);
      errors++;
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(pkg.stripePriceId);
      const amount = price.unit_amount ? price.unit_amount / 100 : 0;
      const expectedAmount = pkg.priceInCents / 100;

      if (amount === expectedAmount) {
        console.log(`   ✅ ${pkg.name}: Valid (${pkg.credits} credits - $${amount})`);
      } else {
        console.log(`   ⚠️  ${pkg.name}: Price mismatch (Expected $${expectedAmount}, got $${amount})`);
        warnings++;
      }
    } catch (error) {
      console.log(`   ❌ ${pkg.name}: Invalid price ID`);
      console.log(`      Price ID: ${pkg.stripePriceId}`);
      if (error instanceof Error) {
        console.log(`      Error: ${error.message}`);
      }
      errors++;
    }
  }

  console.log('');

  // Test 4: App URL
  console.log('4️⃣  Checking app URL configuration...');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    console.log(`   ✅ App URL configured: ${appUrl}`);
  } else {
    console.log('   ⚠️  NEXT_PUBLIC_APP_URL not set (will default to http://localhost:3000)');
    warnings++;
  }

  console.log('');

  // Test 5: Webhook Endpoint
  console.log('5️⃣  Checking webhook endpoints...');
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    const relevantEndpoints = endpoints.data.filter(
      (ep) => ep.url.includes('/api/stripe/webhook')
    );

    if (relevantEndpoints.length > 0) {
      console.log(`   ✅ Found ${relevantEndpoints.length} webhook endpoint(s):`);
      relevantEndpoints.forEach((ep) => {
        console.log(`      - ${ep.url}`);
        console.log(`        Status: ${ep.status}`);
        console.log(`        Events: ${ep.enabled_events.join(', ')}`);
      });
    } else {
      console.log('   ⚠️  No webhook endpoints found for /api/stripe/webhook');
      console.log('      For local testing, use: stripe listen --forward-to localhost:3000/api/stripe/webhook');
      console.log('      For production, create endpoint in Stripe Dashboard');
      warnings++;
    }
  } catch (error) {
    console.log('   ⚠️  Could not list webhook endpoints (API key may not have permission)');
    warnings++;
  }

  console.log('');

  // Summary
  console.log('━'.repeat(60));
  console.log('📊 Summary\n');

  if (errors === 0 && warnings === 0) {
    console.log('   ✅ All checks passed! Your Stripe integration is ready.');
  } else {
    if (errors > 0) {
      console.log(`   ❌ ${errors} error(s) found - please fix these before going live`);
    }
    if (warnings > 0) {
      console.log(`   ⚠️  ${warnings} warning(s) - review these for optimal setup`);
    }
  }

  console.log('');
  console.log('Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Start Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');
  console.log('3. Test purchase flow: http://localhost:3000/dashboard/credits/purchase');
  console.log('4. Use test card: 4242 4242 4242 4242');
  console.log('');
  console.log('For more details, see: STRIPE_SETUP.md');
  console.log('━'.repeat(60));

  process.exit(errors > 0 ? 1 : 0);
}

// Run the tests
testStripeSetup().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
