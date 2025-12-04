'use server';

import { generatePost as generatePostWithClaude, logApiCall } from '@/lib/ai/claude';
import { deductCredits, hasEnoughCredits } from '@/lib/credits';
import { getOrCreateUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';

/**
 * Input validation type for post generation
 */
export interface GeneratePostInput {
  topic: string;
  tone: 'Professional' | 'Casual' | 'Inspirational';
  length: 'Short' | 'Medium' | 'Long';
  platform?: string;
}

/**
 * Response type for post generation
 */
export interface GeneratePostResponse {
  success: boolean;
  post?: {
    id: string;
    content: string;
    platform: string;
    status: string;
    remainingCredits: number;
    generatedAt: string;
  };
  error?: string;
  remainingCredits?: number;
}

/**
 * Server action to generate a LinkedIn post using Claude AI
 * Handles credit deduction, post creation, and error handling
 */
export async function generatePostAction(
  input: GeneratePostInput
): Promise<GeneratePostResponse> {
  const startTime = Date.now();

  try {
    // Get or create user in database
    // This ensures the user exists even if webhook didn't fire
    let user;
    try {
      user = await getOrCreateUser();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[GeneratePost] User authentication error:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const dbUserId = user.id;

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      console.warn(`[GeneratePost] Invalid input: ${validation.error}`);
      return {
        success: false,
        error: validation.error,
        remainingCredits: user.credits,
      };
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(dbUserId, 1);
    if (!hasCredits) {
      console.warn(
        `[GeneratePost] Insufficient credits for user ${dbUserId}`
      );
      return {
        success: false,
        error: 'Insufficient credits. Please purchase more credits.',
        remainingCredits: user.credits,
      };
    }

    console.log(
      `[GeneratePost] Starting generation for user ${dbUserId}: "${input.topic}" (${input.tone}, ${input.length})`
    );

    // Generate post with Claude
    let generatedContent: string;
    try {
      generatedContent = await generatePostWithClaude(
        input.topic,
        input.tone,
        input.length,
        input.platform || 'linkedin'
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[GeneratePost] Claude API error: ${errorMsg}`);
      logApiCall('GeneratePost', { error: errorMsg }, Date.now() - startTime);

      return {
        success: false,
        error: `Failed to generate post: ${errorMsg}`,
        remainingCredits: user.credits,
      };
    }

    // Validate generated content
    if (!generatedContent || generatedContent.length === 0) {
      console.error('[GeneratePost] Generated content is empty');
      return {
        success: false,
        error: 'Generated post is empty',
        remainingCredits: user.credits,
      };
    }

    // Truncate content to 500 characters (LinkedIn limit)
    const contentToStore = generatedContent.substring(0, 500);

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
            generatedAt: new Date().toISOString(),
          },
        },
        select: {
          id: true,
          content: true,
          platform: true,
          status: true,
          createdAt: true,
        },
      });

      console.log(
        `[GeneratePost] Post created: ${post.id} for user ${dbUserId}`
      );
    } catch (error) {
      console.error('[GeneratePost] Error creating post in database:', error);
      return {
        success: false,
        error: 'Failed to save generated post',
        remainingCredits: user.credits,
      };
    }

    // Deduct credits
    const deductionResult = await deductCredits(
      dbUserId,
      1,
      `Generated post: "${input.topic}"`
    );

    if (!deductionResult.success) {
      // Revert post creation if credit deduction fails
      try {
        await prisma.post.delete({
          where: { id: post.id },
        });
      } catch (e) {
        console.error('[GeneratePost] Error reverting post creation:', e);
      }

      return {
        success: false,
        error: deductionResult.error || 'Failed to deduct credits',
        remainingCredits: user.credits,
      };
    }

    const duration = Date.now() - startTime;
    logApiCall(
      'GeneratePost',
      {
        userId: dbUserId,
        topic: input.topic,
        tone: input.tone,
        length: input.length,
        postId: post.id,
        remainingCredits: deductionResult.remainingCredits,
      },
      duration
    );

    console.log(
      `[GeneratePost] Success! Post generated in ${duration}ms. Remaining credits: ${deductionResult.remainingCredits}`
    );

    return {
      success: true,
      post: {
        id: post.id,
        content: post.content,
        platform: post.platform,
        status: post.status,
        remainingCredits: deductionResult.remainingCredits,
        generatedAt: post.createdAt.toISOString(),
      },
      remainingCredits: deductionResult.remainingCredits,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GeneratePost] Unexpected error:', errorMsg);
    logApiCall('GeneratePost', { error: errorMsg }, Date.now() - startTime);

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
