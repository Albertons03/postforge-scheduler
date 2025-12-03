import { auth } from '@clerk/nextjs/server';
import { generatePost as generatePostWithClaude, logApiCall } from '@/lib/ai/claude';
import { deductCredits, hasEnoughCredits } from '@/lib/credits';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai/generate-post
 * Generates a LinkedIn post using Claude AI
 * Requires authentication and available credits
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[API] Invalid JSON in request body');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body. Must be valid JSON.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { topic, tone, length, platform } = body;

    // Validate required fields
    if (!topic || !tone || !length) {
      console.error('[API] Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: topic, tone, length',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      console.error('[API] User not authenticated');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User not authenticated',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      console.error(`[API] User not found in database: ${userId}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User not found in database',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dbUserId = user.id;

    // Validate input parameters
    const validation = validateInput({ topic, tone, length, platform });
    if (!validation.valid) {
      console.warn(`[API] Invalid input: ${validation.error}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error,
          remainingCredits: user.credits,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(dbUserId, 1);
    if (!hasCredits) {
      console.warn(`[API] Insufficient credits for user ${dbUserId}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient credits. Please purchase more credits.',
          remainingCredits: user.credits,
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(
      `[API] Starting post generation for user ${dbUserId}: "${topic}" (${tone}, ${length})`
    );

    // Generate post with Claude
    let generatedContent: string;
    try {
      generatedContent = await generatePostWithClaude(
        topic,
        tone as 'Professional' | 'Casual' | 'Inspirational',
        length as 'Short' | 'Medium' | 'Long',
        platform || 'linkedin'
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[API] Claude API error: ${errorMsg}`);
      logApiCall('API_GeneratePost', { error: errorMsg }, Date.now() - startTime);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to generate post: ${errorMsg}`,
          remainingCredits: user.credits,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate generated content
    if (!generatedContent || generatedContent.length === 0) {
      console.error('[API] Generated content is empty');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Generated post is empty',
          remainingCredits: user.credits,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Truncate content to 500 characters
    const contentToStore = generatedContent.substring(0, 500);

    // Create post in database
    let post;
    try {
      post = await prisma.post.create({
        data: {
          userId: dbUserId,
          content: contentToStore,
          platform: platform || 'linkedin',
          status: 'draft',
          metadata: {
            topic,
            tone,
            length,
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

      console.log(`[API] Post created: ${post.id} for user ${dbUserId}`);
    } catch (error) {
      console.error('[API] Error creating post in database:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save generated post',
          remainingCredits: user.credits,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Deduct credits
    const deductionResult = await deductCredits(
      dbUserId,
      1,
      `Generated post: "${topic}"`
    );

    if (!deductionResult.success) {
      // Revert post creation if credit deduction fails
      try {
        await prisma.post.delete({
          where: { id: post.id },
        });
      } catch (e) {
        console.error('[API] Error reverting post creation:', e);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: deductionResult.error || 'Failed to deduct credits',
          remainingCredits: user.credits,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall(
      'API_GeneratePost',
      {
        userId: dbUserId,
        topic,
        tone,
        length,
        postId: post.id,
        remainingCredits: deductionResult.remainingCredits,
      },
      duration
    );

    console.log(
      `[API] Success! Post generated in ${duration}ms. Remaining credits: ${deductionResult.remainingCredits}`
    );

    return new Response(
      JSON.stringify({
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
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Unexpected error:', errorMsg);
    logApiCall('API_GeneratePost', { error: errorMsg }, Date.now() - startTime);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Unexpected error: ${errorMsg}`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Validate input parameters
 */
function validateInput(input: any): { valid: boolean; error?: string } {
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
