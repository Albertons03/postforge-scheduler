/**
 * API Route: Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 *
 * Creates a Stripe Checkout session for credit purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';
import { CREDIT_PACKAGES } from '@/lib/constants/pricing';

export const runtime = 'nodejs';

interface CheckoutSessionRequest {
  priceId: string;
  credits: number;
  packageName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user with Clerk
    const { userId: clerkUserId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkUserId || !clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database. Please contact support.' },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    let body: CheckoutSessionRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { priceId, credits, packageName } = body;

    // 4. Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

    if (!credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid credits amount. Must be greater than 0.' },
        { status: 400 }
      );
    }

    // 5. Verify that the priceId exists in our pricing configuration
    const selectedPackage = CREDIT_PACKAGES.find(
      (pkg) => pkg.stripePriceId === priceId
    );

    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid price ID. Package not found.' },
        { status: 400 }
      );
    }

    // 6. Verify credits match the package
    if (selectedPackage.credits !== credits) {
      return NextResponse.json(
        {
          error: `Credit mismatch. Expected ${selectedPackage.credits} credits for this package, got ${credits}.`,
        },
        { status: 400 }
      );
    }

    // 7. Prepare success and cancel URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard/credits/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/dashboard/credits/purchase?canceled=true`;

    // 8. Create Stripe Checkout Session
    console.log(`[Stripe API] Creating checkout session for user ${user.id}`);
    console.log(`[Stripe API] Package: ${selectedPackage.name}, Credits: ${credits}, Price ID: ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment (not subscription)
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: user.id, // Our internal user ID
      metadata: {
        userId: user.id,
        credits: credits.toString(),
        packageName: packageName || selectedPackage.name,
        packageId: selectedPackage.id,
      },
      // Allow promotion codes (optional)
      allow_promotion_codes: true,
      // Billing address collection (optional)
      billing_address_collection: 'auto',
      // Customize the UI (optional)
      submit_type: 'pay',
    });

    console.log(`[Stripe API] Checkout session created: ${session.id}`);

    // 9. Return session details to client
    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Stripe API] Error creating checkout session:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error) {
      // Check if it's a Stripe error
      if ('type' in error && typeof error.type === 'string') {
        const stripeError = error as any;
        return NextResponse.json(
          {
            error: `Stripe error: ${stripeError.message}`,
            type: stripeError.type,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while creating checkout session' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
