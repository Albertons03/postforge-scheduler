/**
 * API Route: Retrieve Stripe Checkout Session
 * GET /api/stripe/session/[sessionId]
 *
 * Retrieves details of a Stripe Checkout Session
 * Used by the success page to display purchase confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database.' },
        { status: 404 }
      );
    }

    // 3. Get session ID from params
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID parameter' },
        { status: 400 }
      );
    }

    // 4. Retrieve session from Stripe
    console.log(`[Stripe API] Retrieving session: ${sessionId}`);

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'customer'],
      });
    } catch (error) {
      console.error(`[Stripe API] Error retrieving session:`, error);
      return NextResponse.json(
        { error: 'Session not found or invalid' },
        { status: 404 }
      );
    }

    // 5. Verify that the session belongs to the current user
    const sessionUserId = session.metadata?.userId;

    if (sessionUserId !== user.id) {
      console.warn(
        `[Stripe API] User ${user.id} attempted to access session ${sessionId} belonging to user ${sessionUserId}`
      );
      return NextResponse.json(
        { error: 'Unauthorized. This session does not belong to you.' },
        { status: 403 }
      );
    }

    // 6. Get transaction details from database
    const stripeTransaction = await prisma.stripeTransaction.findUnique({
      where: { stripeSessionId: sessionId },
      select: {
        id: true,
        amount: true,
        currency: true,
        credits: true,
        status: true,
        metadata: true,
        createdAt: true,
      },
    });

    // 7. Prepare response data
    const responseData = {
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      customerName: session.customer_details?.name,
      metadata: session.metadata,
      created: session.created,
      // Include transaction data if available
      transaction: stripeTransaction
        ? {
            id: stripeTransaction.id,
            credits: stripeTransaction.credits,
            amount: stripeTransaction.amount,
            currency: stripeTransaction.currency,
            status: stripeTransaction.status,
            packageName: (stripeTransaction.metadata as any)?.packageName || 'Unknown',
            createdAt: stripeTransaction.createdAt,
          }
        : null,
      // Include current user balance
      currentBalance: user.credits,
    };

    console.log(`[Stripe API] Session ${sessionId} retrieved successfully`);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('[Stripe API] Error retrieving session:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving session' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  );
}
