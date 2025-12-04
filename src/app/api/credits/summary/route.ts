import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserCreditsInfo } from '@/lib/credits';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/credits/summary
 * Get comprehensive credit information for the current user
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get comprehensive credit info
    const creditsInfo = await getUserCreditsInfo(user.id);

    if (!creditsInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit information' },
        { status: 500 }
      );
    }

    // Calculate additional metrics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        amount: true,
        type: true,
      },
    });

    let spentThisMonth = 0;
    for (const tx of monthTransactions) {
      if (tx.amount < 0) {
        spentThisMonth += Math.abs(tx.amount);
      }
    }

    // Calculate free vs purchased credits
    const freeCreditsRemaining = Math.min(user.credits, 10); // Assuming 10 free credits on signup
    const purchasedCreditsRemaining = Math.max(0, user.credits - 10);

    return NextResponse.json({
      success: true,
      data: {
        currentBalance: creditsInfo.currentCredits,
        totalPurchased: creditsInfo.totalPurchased,
        totalSpent: creditsInfo.totalSpent,
        spentThisMonth,
        freeCreditsRemaining,
        purchasedCreditsRemaining,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching credit summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
