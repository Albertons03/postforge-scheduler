'use server';

/**
 * Server Action: Generate Post with Tool Calling
 * Handles post generation with hashtags and best time calculation
 */

import { auth } from '@clerk/nextjs/server';
import { generatePostWithToolsSequential } from '@/lib/ai/claude-streaming';
import { deductCredits, hasEnoughCredits } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import type { GeneratePostInput, GeneratePostWithToolsResponse } from '@/lib/ai/types';

/**
 * Extended response type for server action
 */
export interface GeneratePostWithToolsActionResponse {
  success: boolean;
  post?: {
    id: string;
    content: string;
    hashtags: string[];
    bestTimeToPost: {
      hour: number;
      confidence: number;
      reason: string;
      dayOfWeek?: string;
    };
    platform: string;
    status: string;
    remainingCredits: number;
    generatedAt: string;
    totalTokensUsed: number;
  };
  error?: string;
  remainingCredits?: number;
}

/**
 * Generate post with AI tools (hashtags + best time)
 * Uses streaming with tool calling for enhanced content
 */
export async function generatePostWithToolsAction(
  input: GeneratePostInput
): Promise<GeneratePostWithToolsActionResponse> {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      console.error('[GeneratePostWithTools] User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        credits: true,
      },
    });

    if (!user) {
      console.error(`[GeneratePostWithTools] User not found: ${userId}`);
      return {
        success: false,
        error: 'User not found in database',
      };
    }

    const dbUserId = user.id;

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      console.warn(`[GeneratePostWithTools] Invalid input: ${validation.error}`);
      return {
        success: false,
        error: validation.error,
        remainingCredits: user.credits,
      };
    }

    // Check if user has enough credits (2 credits for enhanced generation)
    const creditsRequired = 2;
    const hasCredits = await hasEnoughCredits(dbUserId, creditsRequired);
    if (!hasCredits) {
      console.warn(
        `[GeneratePostWithTools] Insufficient credits for user ${dbUserId}`
      );
      return {
        success: false,
        error: `Insufficient credits. This feature requires ${creditsRequired} credits. Please purchase more.`,
        remainingCredits: user.credits,
      };
    }

    console.log(
      `[GeneratePostWithTools] Starting generation for user ${dbUserId}: "${input.topic}" (${input.tone}, ${input.length})`
    );

    // Generate post with tools
    let result: GeneratePostWithToolsResponse;
    try {
      result = await generatePostWithToolsSequential(input);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[GeneratePostWithTools] AI error: ${errorMsg}`);

      return {
        success: false,
        error: `Failed to generate post: ${errorMsg}`,
        remainingCredits: user.credits,
      };
    }

    // Validate generated content
    if (!result.content || result.content.length === 0) {
      console.error('[GeneratePostWithTools] Generated content is empty');
      return {
        success: false,
        error: 'Generated post is empty',
        remainingCredits: user.credits,
      };
    }

    // Truncate content to 500 characters (LinkedIn limit)
    const contentToStore = result.content.substring(0, 500);

    // Create post in database
    let post;
    try {
      post = await prisma.post.create({
        data: {
          userId: dbUserId,
          content: contentToStore,
          platform: input.platform || 'linkedin',
          status: 'draft',
          metadata: {
            topic: input.topic,
            tone: input.tone,
            length: input.length,
            hashtags: result.hashtags,
            bestTimeToPost: {
              hour: result.bestTimeToPost.hour,
              confidence: result.bestTimeToPost.confidence,
              reason: result.bestTimeToPost.reason,
              dayOfWeek: result.bestTimeToPost.dayOfWeek || undefined,
            },
            totalTokensUsed: result.totalTokensUsed,
            generatedAt: new Date().toISOString(),
            generatedWithTools: true,
          } as any,
        },
        select: {
          id: true,
          content: true,
          platform: true,
          status: true,
          createdAt: true,
          metadata: true,
        },
      });

      console.log(
        `[GeneratePostWithTools] Post created: ${post.id} for user ${dbUserId}`
      );
    } catch (error) {
      console.error('[GeneratePostWithTools] Error creating post:', error);
      return {
        success: false,
        error: 'Failed to save generated post',
        remainingCredits: user.credits,
      };
    }

    // Deduct credits
    const deductionResult = await deductCredits(
      dbUserId,
      creditsRequired,
      `Generated enhanced post with tools: "${input.topic}"`
    );

    if (!deductionResult.success) {
      // Revert post creation if credit deduction fails
      try {
        await prisma.post.delete({
          where: { id: post.id },
        });
      } catch (e) {
        console.error('[GeneratePostWithTools] Error reverting post:', e);
      }

      return {
        success: false,
        error: deductionResult.error || 'Failed to deduct credits',
        remainingCredits: user.credits,
      };
    }

    const duration = Date.now() - startTime;

    console.log(
      `[GeneratePostWithTools] Success! Generated in ${duration}ms. Tokens: ${result.totalTokensUsed}. Remaining credits: ${deductionResult.remainingCredits}`
    );

    return {
      success: true,
      post: {
        id: post.id,
        content: post.content,
        hashtags: result.hashtags,
        bestTimeToPost: result.bestTimeToPost,
        platform: post.platform,
        status: post.status,
        remainingCredits: deductionResult.remainingCredits,
        generatedAt: post.createdAt.toISOString(),
        totalTokensUsed: result.totalTokensUsed,
      },
      remainingCredits: deductionResult.remainingCredits,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GeneratePostWithTools] Unexpected error:', errorMsg);

    return {
      success: false,
      error: `Unexpected error: ${errorMsg}`,
    };
  }
}

/**
 * Validate input parameters
 */
function validateInput(input: GeneratePostInput): { valid: boolean; error?: string } {
  // Check topic
  if (!input.topic || typeof input.topic !== 'string') {
    return { valid: false, error: 'Topic is required and must be a string' };
  }

  if (input.topic.length < 3 || input.topic.length > 200) {
    return {
      valid: false,
      error: 'Topic must be between 3 and 200 characters',
    };
  }

  // Check tone
  const validTones = ['Professional', 'Casual', 'Inspirational'];
  if (!validTones.includes(input.tone)) {
    return {
      valid: false,
      error: `Tone must be one of: ${validTones.join(', ')}`,
    };
  }

  // Check length
  const validLengths = ['Short', 'Medium', 'Long'];
  if (!validLengths.includes(input.length)) {
    return {
      valid: false,
      error: `Length must be one of: ${validLengths.join(', ')}`,
    };
  }

  // Check platform
  if (input.platform && typeof input.platform !== 'string') {
    return { valid: false, error: 'Platform must be a string' };
  }

  const validPlatforms = ['linkedin', 'twitter', 'facebook'];
  if (input.platform && !validPlatforms.includes(input.platform)) {
    return {
      valid: false,
      error: `Platform must be one of: ${validPlatforms.join(', ')}`,
    };
  }

  return { valid: true };
}
