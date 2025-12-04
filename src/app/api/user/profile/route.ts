import { NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/user';

/**
 * GET /api/user/profile
 * Fetch user profile information including credits and subscription details
 */
export async function GET() {
  try {
    // 1. Authenticate with Clerk
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkId || !clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Fetch user from database with subscription info
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        credits: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        subscriptionPlanName: true,
        subscriptionCredits: true,
        subscriptionRenewsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 3. Calculate credit statistics
    const creditStats = await prisma.creditTransaction.aggregate({
      where: { userId: user.id },
      _sum: {
        amount: true,
      },
    });

    const purchaseStats = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        type: 'purchase',
      },
      _sum: {
        amount: true,
      },
    });

    const spendStats = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        type: 'generation',
      },
      _sum: {
        amount: true,
      },
    });

    // Get current month's spending
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySpend = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        type: 'generation',
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 4. Combine Clerk and Prisma data
    const response = {
      success: true,
      data: {
        profile: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          imageUrl: clerkUser.imageUrl,
          createdAt: user.createdAt.toISOString(),
        },
        credits: {
          currentBalance: user.credits,
          totalPurchased: purchaseStats._sum.amount || 0,
          totalSpent: Math.abs(spendStats._sum.amount || 0),
          spentThisMonth: Math.abs(monthlySpend._sum.amount || 0),
        },
        subscription: {
          status: user.stripeSubscriptionStatus || 'free',
          planName: user.subscriptionPlanName,
          renewsAt: user.subscriptionRenewsAt?.toISOString() || null,
          customerId: user.stripeCustomerId,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update user profile information (firstName, lastName)
 */
export async function PUT(request: Request) {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName } = validation.data;

    // 3. Update Clerk user (source of truth for profile data)
    const clerk = await clerkClient();
    await clerk.users.updateUser(clerkId, {
      firstName,
      lastName: lastName || undefined,
    });

    // 4. Verify user exists in Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 5. Optionally update name in Prisma for consistency
    await prisma.user.update({
      where: { clerkId },
      data: {
        name: lastName ? `${firstName} ${lastName}` : firstName
      },
    });

    // 6. Return success
    return NextResponse.json({
      success: true,
      data: { firstName, lastName },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[API] Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
