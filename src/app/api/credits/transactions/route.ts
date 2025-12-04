import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTransactionHistory } from '@/lib/credits';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/credits/transactions
 * Get credit transaction history with pagination and filtering
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - type: string (optional: 'generation' | 'purchase' | 'refund' | 'bonus' | 'all')
 * - search: string (optional)
 */
export async function GET(request: Request) {
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';

    // Get transaction history
    const result = await getTransactionHistory(user.id, {
      page,
      limit,
      type,
      search,
    });

    // Format transactions for frontend
    const formattedTransactions = result.transactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      balanceAfter: tx.balanceAfter,
      metadata: tx.metadata,
      createdAt: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching credit transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
