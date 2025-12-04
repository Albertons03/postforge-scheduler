/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 *
 * Receives and processes Stripe webhook events
 * IMPORTANT: This endpoint must receive the raw body (not parsed JSON)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/client';
import {
  handleCheckoutCompleted,
  handleCheckoutExpired,
  handleChargeRefunded,
} from '@/lib/stripe/webhook-handlers';

export const runtime = 'nodejs';

/**
 * Process incoming Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get the raw body as text (required for signature verification)
    const body = await request.text();

    // 2. Get the Stripe signature from headers
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 3. Verify webhook signature to ensure it came from Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('[Stripe Webhook] Signature verification failed:', error);
      return NextResponse.json(
        {
          error: 'Webhook signature verification failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // 4. Log the received event
    console.log(`[Stripe Webhook] Received event: ${event.type} (ID: ${event.id})`);

    // 5. Process the event based on type
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(
            `[Stripe Webhook] Processing checkout.session.completed for session ${session.id}`
          );
          await handleCheckoutCompleted(session);
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(
            `[Stripe Webhook] Processing checkout.session.expired for session ${session.id}`
          );
          await handleCheckoutExpired(session);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          console.log(
            `[Stripe Webhook] Processing charge.refunded for charge ${charge.id}`
          );
          await handleChargeRefunded(charge);
          break;
        }

        // Additional events we might want to handle in the future
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(
            `[Stripe Webhook] Payment intent succeeded: ${paymentIntent.id}`
          );
          // Currently handled by checkout.session.completed
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(
            `[Stripe Webhook] Payment intent failed: ${paymentIntent.id}`
          );
          // Could send notification to user
          break;
        }

        default: {
          console.log(
            `[Stripe Webhook] Unhandled event type: ${event.type}`
          );
        }
      }

      // 6. Return success response to Stripe
      console.log(
        `[Stripe Webhook] Successfully processed event ${event.id} (${event.type})`
      );
      return NextResponse.json(
        { received: true, eventId: event.id },
        { status: 200 }
      );
    } catch (handlerError) {
      // 7. Handle errors in event processing
      console.error(
        `[Stripe Webhook] Error processing event ${event.id}:`,
        handlerError
      );

      // Return 500 to tell Stripe to retry the webhook
      return NextResponse.json(
        {
          error: 'Error processing webhook event',
          eventId: event.id,
          eventType: event.type,
          details:
            handlerError instanceof Error
              ? handlerError.message
              : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Stripe Webhook] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Unexpected error processing webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests from Stripe.' },
    { status: 405 }
  );
}
