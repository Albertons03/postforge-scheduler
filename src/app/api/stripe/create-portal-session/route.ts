import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/stripe/create-portal-session
 * Generate a Stripe Customer Portal session URL for subscription management
 *
 * Features available in the portal:
 * - Update payment method
 * - View billing history and download invoices
 * - Cancel or resume subscription
 * - Update billing information
 */
export async function POST() {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 3. Check if user has Stripe customer ID, create one if not
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: clerkId,
        },
      });

      customerId = customer.id;

      // Update user with new customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });

      console.log(`[Stripe] Created customer for user ${user.id}: ${customerId}`);
    }

    // 4. Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const returnUrl = `${appUrl}/dashboard/settings?portal_return=true`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`[Stripe] Portal session created for customer ${customerId}`);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe API] Error creating portal session:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as any;
      return NextResponse.json(
        {
          success: false,
          error: `Stripe error: ${stripeError.message}`,
          code: 'STRIPE_ERROR',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
