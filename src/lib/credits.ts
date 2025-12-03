import { prisma } from './prisma';

/**
 * Credit system utilities for managing user credits
 * Handles credit deduction, checking balance, and transaction logging
 */

export interface CreditDeductionResult {
  success: boolean;
  remainingCredits: number;
  transactionId?: string;
  error?: string;
}

export interface UserCreditsInfo {
  userId: string;
  currentCredits: number;
  totalSpent: number;
  totalPurchased: number;
}

/**
 * Check if user has sufficient credits for an operation
 */
export async function hasEnoughCredits(
  userId: string,
  requiredCredits: number = 1
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      console.warn(`[Credits] User not found: ${userId}`);
      return false;
    }

    const hasEnough = user.credits >= requiredCredits;
    console.log(
      `[Credits] Check balance for ${userId}: ${user.credits} credits (need ${requiredCredits}): ${hasEnough ? 'OK' : 'INSUFFICIENT'}`
    );

    return hasEnough;
  } catch (error) {
    console.error('[Credits] Error checking credits:', error);
    throw new Error('Failed to check user credits');
  }
}

/**
 * Deduct credits from user account
 * Creates a credit transaction record for tracking
 */
export async function deductCredits(
  userId: string,
  amount: number = 1,
  description: string = 'Post generation'
): Promise<CreditDeductionResult> {
  try {
    // Validate amount
    if (amount < 1) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'Credit deduction amount must be at least 1',
      };
    }

    // Check if user exists and has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      console.error(`[Credits] User not found: ${userId}`);
      return {
        success: false,
        remainingCredits: 0,
        error: 'User not found',
      };
    }

    if (user.credits < amount) {
      console.warn(
        `[Credits] Insufficient credits for ${userId}: ${user.credits} available, ${amount} required`
      );
      return {
        success: false,
        remainingCredits: user.credits,
        error: `Insufficient credits. You have ${user.credits} but need ${amount}`,
      };
    }

    // Start transaction to deduct credits and log transaction
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
      select: { credits: true },
    });

    // Create transaction record
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: userId,
        amount: -amount, // Negative for deduction
        type: 'generation',
        description: description,
      },
      select: { id: true },
    });

    console.log(
      `[Credits] Deducted ${amount} credits from ${userId}. Remaining: ${updatedUser.credits}. Transaction: ${transaction.id}`
    );

    return {
      success: true,
      remainingCredits: updatedUser.credits,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('[Credits] Error deducting credits:', error);
    return {
      success: false,
      remainingCredits: 0,
      error: 'Failed to deduct credits',
    };
  }
}

/**
 * Add credits to user account (for purchases or bonuses)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'refund' | 'bonus' = 'bonus',
  description: string = 'Credit purchase'
): Promise<CreditDeductionResult> {
  try {
    // Validate amount
    if (amount < 1) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'Credit amount must be at least 1',
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      console.error(`[Credits] User not found: ${userId}`);
      return {
        success: false,
        remainingCredits: 0,
        error: 'User not found',
      };
    }

    // Add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
      select: { credits: true },
    });

    // Create transaction record
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: userId,
        amount: amount, // Positive for addition
        type: type,
        description: description,
      },
      select: { id: true },
    });

    console.log(
      `[Credits] Added ${amount} credits to ${userId} (${type}). Total: ${updatedUser.credits}. Transaction: ${transaction.id}`
    );

    return {
      success: true,
      remainingCredits: updatedUser.credits,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('[Credits] Error adding credits:', error);
    return {
      success: false,
      remainingCredits: 0,
      error: 'Failed to add credits',
    };
  }
}

/**
 * Get user's credit information
 */
export async function getUserCreditsInfo(
  userId: string
): Promise<UserCreditsInfo | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true,
        creditTransactions: {
          select: { amount: true, type: true },
        },
      },
    });

    if (!user) {
      console.warn(`[Credits] User not found: ${userId}`);
      return null;
    }

    // Calculate totals from transactions
    let totalSpent = 0;
    let totalPurchased = 0;

    for (const tx of user.creditTransactions) {
      if (tx.amount < 0) {
        totalSpent += Math.abs(tx.amount);
      } else if (tx.type === 'purchase') {
        totalPurchased += tx.amount;
      }
    }

    return {
      userId: user.id,
      currentCredits: user.credits,
      totalSpent,
      totalPurchased,
    };
  } catch (error) {
    console.error('[Credits] Error getting user credits info:', error);
    return null;
  }
}

/**
 * Get credit transaction history for a user
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 10
) {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    return transactions;
  } catch (error) {
    console.error('[Credits] Error getting transaction history:', error);
    return [];
  }
}

/**
 * Refund credits (for failed generations)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string = 'Generation failed'
): Promise<CreditDeductionResult> {
  return addCredits(userId, amount, 'refund', reason);
}
