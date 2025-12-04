import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { deleteAccountSchema } from '@/lib/validations/user';

/**
 * DELETE /api/user/account
 * Permanently delete user account and all associated data
 *
 * This endpoint:
 * 1. Validates the confirmation text
 * 2. Deletes the user from Clerk (which triggers a webhook)
 * 3. The webhook will handle Prisma deletion via cascade
 *
 * Security: Requires exact "DELETE" confirmation text
 */
export async function DELETE(request: Request) {
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
    const validation = deleteAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid confirmation text. Please type DELETE to confirm.',
          code: 'INVALID_CONFIRMATION',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Get user from database for audit logging
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 4. Log deletion event for audit trail
    console.log(`[AUDIT] Account deletion initiated: ${user.email} (${user.id})`);

    // 5. Delete from Clerk first (will trigger webhook for Prisma deletion)
    const clerk = await clerkClient();
    await clerk.users.deleteUser(clerkId);

    console.log(`[AUDIT] User deleted from Clerk: ${user.email} (${user.id})`);

    // Note: The Clerk webhook handler should handle Prisma cascade deletion
    // If webhook is not set up, we can delete directly here:
    // await prisma.user.delete({ where: { clerkId } });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting user account:', error);

    // Handle specific Clerk errors
    if (error instanceof Error && 'status' in error) {
      const clerkError = error as any;
      if (clerkError.status === 404) {
        return NextResponse.json(
          { success: false, error: 'User not found in authentication system', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
