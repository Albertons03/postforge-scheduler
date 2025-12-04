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

    // Start transaction to deduct credits and log transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount,
          },
        },
        select: { credits: true },
      });

      // Create transaction record with balanceAfter
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: userId,
          amount: -amount, // Negative for deduction
          type: 'generation',
          description: description,
          balanceAfter: updatedUser.credits,
          metadata: {},
        },
        select: { id: true },
      });

      return { updatedUser, transaction };
    });

    const { updatedUser, transaction } = result;

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

    // Add credits to user atomically with transaction record
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
        select: { credits: true },
      });

      // Create transaction record with balanceAfter
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: userId,
          amount: amount, // Positive for addition
          type: type,
          description: description,
          balanceAfter: updatedUser.credits,
          metadata: {},
        },
        select: { id: true },
      });

      return { updatedUser, transaction };
    });

    const { updatedUser, transaction } = result;

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
 * Get credit transaction history for a user with pagination and filtering
 */
export async function getTransactionHistory(
  userId: string,
  options: {
    limit?: number;
    page?: number;
    type?: string;
    search?: string;
  } = {}
) {
  try {
    const { limit = 20, page = 1, type, search } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get total count for pagination
    const total = await prisma.creditTransaction.count({ where });

    // Get transactions
    const transactions = await prisma.creditTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        balanceAfter: true,
        metadata: true,
        createdAt: true,
      },
    });

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[Credits] Error getting transaction history:', error);
    return {
      transactions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
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
