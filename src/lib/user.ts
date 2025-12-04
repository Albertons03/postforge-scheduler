/**
 * User Management Utilities
 *
 * Handles automatic user creation and synchronization between Clerk and Prisma database.
 * Ensures that authenticated users always have a corresponding database record.
 */

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { User } from '@prisma/client';

/**
 * Get or create user in database
 *
 * This function ensures that every authenticated Clerk user has a corresponding
 * database record. If the user doesn't exist, it creates one with default credits.
 *
 * This is critical for scenarios where:
 * - User registered before webhook was set up
 * - Webhook failed or was delayed
 * - User data wasn't synced properly
 *
 * @returns {Promise<User>} User record from database
 * @throws {Error} If user is not authenticated
 * @throws {Error} If user email is missing from Clerk
 * @throws {Error} If database operations fail
 */
export async function getOrCreateUser(): Promise<User> {
  // Get authenticated user from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    console.error('[getOrCreateUser] User not authenticated');
    throw new Error('Not authenticated');
  }

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    console.error('[getOrCreateUser] No email found for Clerk user:', clerkId);
    throw new Error('User email not found in Clerk account');
  }

  console.log(`[getOrCreateUser] Processing user: ${clerkId} (${email})`);

  try {
    // Try to find existing user by Clerk ID
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (user) {
      console.log(`[getOrCreateUser] Found existing user: ${user.id}`);
      return user;
    }

    // User not found - create new user
    console.log(`[getOrCreateUser] User not found in database. Creating new user for: ${clerkId}`);

    try {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          credits: 10, // Default starting credits
        },
      });

      console.log(`[getOrCreateUser] Successfully created user: ${user.id} with ${user.credits} credits`);
      return user;
    } catch (createError: any) {
      // Handle unique constraint violations
      // This can happen if user was just created by webhook in parallel
      if (createError.code === 'P2002') {
        console.log('[getOrCreateUser] User was created concurrently. Fetching existing user...');

        // Try to fetch the user again
        const existingUser = await prisma.user.findUnique({
          where: { clerkId },
        });

        if (existingUser) {
          console.log(`[getOrCreateUser] Successfully retrieved concurrent user: ${existingUser.id}`);
          return existingUser;
        }

        // If still not found, try by email as fallback
        const userByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (userByEmail) {
          // User exists with same email but different clerkId (edge case)
          // This shouldn't happen but let's handle it gracefully
          console.warn(`[getOrCreateUser] Found user by email but clerkId mismatch. Updating clerkId...`);

          const updatedUser = await prisma.user.update({
            where: { email },
            data: { clerkId },
          });

          console.log(`[getOrCreateUser] Updated user clerkId: ${updatedUser.id}`);
          return updatedUser;
        }

        // Still not found - this is an error state
        console.error('[getOrCreateUser] User creation failed with P2002 but user not found');
        throw new Error('User creation failed due to concurrent modification');
      }

      // Other database errors
      console.error('[getOrCreateUser] Database error during user creation:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }
  } catch (error) {
    // Catch any errors from the outer try block
    if (error instanceof Error) {
      // Re-throw errors we've already handled
      if (error.message.includes('Failed to create user') ||
          error.message.includes('User creation failed') ||
          error.message.includes('Not authenticated') ||
          error.message.includes('User email not found')) {
        throw error;
      }

      // New unexpected error
      console.error('[getOrCreateUser] Unexpected error:', error);
      throw new Error(`Failed to get or create user: ${error.message}`);
    }

    // Non-Error object thrown
    console.error('[getOrCreateUser] Unknown error:', error);
    throw new Error('Failed to get or create user: Unknown error');
  }
}

/**
 * Get user by Clerk ID without creating
 *
 * Use this when you want to check if a user exists without creating them.
 *
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<User | null>} User record or null if not found
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    return user;
  } catch (error) {
    console.error('[getUserByClerkId] Error fetching user:', error);
    throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user with credits info
 *
 * Specialized function to get user with just the ID and credits.
 * Useful for credit checks.
 *
 * @returns {Promise<{id: string, credits: number}>} User ID and credits
 * @throws {Error} If user is not authenticated or not found
 */
export async function getUserCredits(): Promise<{ id: string; credits: number }> {
  const user = await getOrCreateUser();

  return {
    id: user.id,
    credits: user.credits,
  };
}
