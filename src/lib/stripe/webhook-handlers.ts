/**
 * Stripe Webhook Event Handlers
 * Contains business logic for processing different webhook events
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { addCredits } from '@/lib/credits';

/**
 * Handle successful checkout session completion
 * This is called when a customer successfully completes payment
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  try {
    console.log(
      `[Stripe Webhook] Processing checkout.session.completed for session: ${session.id}`
    );

    // Extract metadata
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0', 10);
    const packageName = session.metadata?.packageName || 'Unknown Package';

    // Validate required data
    if (!userId) {
      throw new Error('Missing userId in session metadata');
    }

    if (!credits || credits <= 0) {
      throw new Error('Invalid credits amount in session metadata');
    }

    // Check if this session has already been processed (idempotency)
    const existingTransaction = await prisma.stripeTransaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingTransaction) {
      console.log(
        `[Stripe Webhook] Session ${session.id} already processed. Skipping.`
      );
      return;
    }

    // Extract payment information
    const amountTotal = session.amount_total || 0;
    const currency = session.currency || 'usd';
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Create StripeTransaction record
      await tx.stripeTransaction.create({
        data: {
          userId,
          stripeSessionId: session.id,
          stripePaymentId: paymentIntentId,
          amount: amountTotal,
          currency,
          credits,
          status: 'completed',
          metadata: {
            packageName,
            customerEmail: session.customer_email,
            customerName: session.customer_details?.name,
            paymentStatus: session.payment_status,
          },
        },
      });

      // 2. Add credits to user account
      // Note: addCredits uses its own transaction internally, but since we're in a
      // larger transaction context, we need to use tx instead
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, credits: true },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
        select: { credits: true },
      });

      // Create credit transaction record
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          type: 'purchase',
          description: `Purchased ${packageName} (${credits} credits)`,
          balanceAfter: updatedUser.credits,
          metadata: {
            stripeSessionId: session.id,
            packageName,
            amountPaid: amountTotal / 100, // Convert cents to dollars
            currency,
          },
        },
      });

      console.log(
        `[Stripe Webhook] Successfully processed checkout for user ${userId}. Added ${credits} credits. New balance: ${updatedUser.credits}`
      );
    });

    console.log(
      `[Stripe Webhook] Checkout completed successfully for session ${session.id}`
    );
  } catch (error) {
    console.error(
      `[Stripe Webhook] Error processing checkout.session.completed:`,
      error
    );
    throw error; // Re-throw to mark webhook as failed
  }
}

/**
 * Handle expired checkout session
 * This is called when a checkout session expires without payment
 */
export async function handleCheckoutExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  try {
    console.log(
      `[Stripe Webhook] Processing checkout.session.expired for session: ${session.id}`
    );

    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0', 10);

    if (!userId) {
      console.warn(
        `[Stripe Webhook] No userId in expired session ${session.id}. Skipping.`
      );
      return;
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.stripeTransaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingTransaction) {
      console.log(
        `[Stripe Webhook] Session ${session.id} already recorded. Skipping.`
      );
      return;
    }

    // Log the expired session for analytics
    await prisma.stripeTransaction.create({
      data: {
        userId,
        stripeSessionId: session.id,
        stripePaymentId: null,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        credits,
        status: 'failed',
        metadata: {
          reason: 'Session expired',
          packageName: session.metadata?.packageName,
          customerEmail: session.customer_email,
        },
      },
    });

    console.log(
      `[Stripe Webhook] Logged expired session ${session.id} for user ${userId}`
    );
  } catch (error) {
    console.error(
      `[Stripe Webhook] Error processing checkout.session.expired:`,
      error
    );
    // Don't throw - expired sessions are informational
  }
}

/**
 * Handle charge refund
 * This is called when a payment is refunded
 */
export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  try {
    console.log(
      `[Stripe Webhook] Processing charge.refunded for charge: ${charge.id}`
    );

    // Find the associated payment intent
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.warn(
        `[Stripe Webhook] No payment intent for refunded charge ${charge.id}. Skipping.`
      );
      return;
    }

    // Find the original transaction
    const stripeTransaction = await prisma.stripeTransaction.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
        status: 'completed',
      },
      include: {
        user: {
          select: {
            id: true,
            credits: true,
          },
        },
      },
    });

    if (!stripeTransaction) {
      console.warn(
        `[Stripe Webhook] No completed transaction found for payment ${paymentIntentId}. Skipping refund.`
      );
      return;
    }

    // Check if already refunded
    if (stripeTransaction.status === 'refunded') {
      console.log(
        `[Stripe Webhook] Transaction ${stripeTransaction.id} already refunded. Skipping.`
      );
      return;
    }

    const userId = stripeTransaction.userId;
    const creditsToDeduct = stripeTransaction.credits;
    const currentUserCredits = stripeTransaction.user.credits;

    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Update StripeTransaction status
      await tx.stripeTransaction.update({
        where: { id: stripeTransaction.id },
        data: {
          status: 'refunded',
          metadata: {
            ...(stripeTransaction.metadata as object),
            refundedAt: new Date().toISOString(),
            refundChargeId: charge.id,
          },
        },
      });

      // 2. Deduct credits from user (only if they have enough)
      // If user has insufficient credits, set to 0
      const creditsAfterDeduction = Math.max(0, currentUserCredits - creditsToDeduct);
      const actualDeduction = currentUserCredits - creditsAfterDeduction;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: creditsAfterDeduction,
        },
        select: { credits: true },
      });

      // 3. Create refund credit transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -actualDeduction,
          type: 'refund',
          description: `Refund: ${(stripeTransaction.metadata as any)?.packageName || 'Credit purchase'} (${actualDeduction} credits deducted)`,
          balanceAfter: updatedUser.credits,
          metadata: {
            stripeSessionId: stripeTransaction.stripeSessionId,
            chargeId: charge.id,
            refundAmount: charge.amount_refunded,
            originalCredits: creditsToDeduct,
          },
        },
      });

      console.log(
        `[Stripe Webhook] Refund processed for user ${userId}. Deducted ${actualDeduction} credits. New balance: ${updatedUser.credits}`
      );

      if (actualDeduction < creditsToDeduct) {
        console.warn(
          `[Stripe Webhook] User ${userId} had insufficient credits for full refund. Wanted to deduct ${creditsToDeduct}, only deducted ${actualDeduction}`
        );
      }
    });

    console.log(
      `[Stripe Webhook] Charge refund processed successfully for charge ${charge.id}`
    );
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing charge.refunded:`, error);
    throw error; // Re-throw to mark webhook as failed
  }
}
