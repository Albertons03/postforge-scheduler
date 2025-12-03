/**
 * API Route: Streaming Post Generation
 * Server-Sent Events (SSE) endpoint for real-time post generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamPostGeneration } from '@/lib/ai/claude-streaming';
import { hasEnoughCredits, deductCredits } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import type { GeneratePostInput } from '@/lib/ai/types';

/**
 * POST /api/ai/generate-post-stream
 * Streams post generation with tool calling
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check credits
    const hasCredits = await hasEnoughCredits(user.id, 2);
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', remainingCredits: user.credits },
        { status: 402 }
      );
    }

    // Parse request body
    const body = await request.json();
    const input: GeneratePostInput = {
      topic: body.topic,
      tone: body.tone,
      length: body.length,
      platform: body.platform || 'linkedin',
      timezone: body.timezone,
      targetAudience: body.targetAudience,
    };

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log('[StreamAPI] Starting streaming for user:', user.id);
    console.log('[StreamAPI] Input:', input);

    // Create readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'start' })}\n\n`
            )
          );

          let fullContent = '';
          let hashtags: string[] = [];
          let bestTimeToPost: any = null;

          // Stream generation with tools
          for await (const chunk of streamPostGeneration(input)) {
            const data = JSON.parse(chunk);

            // Accumulate content
            if (data.type === 'content' && data.delta) {
              fullContent += data.delta;
            }

            // Store tool results
            if (data.type === 'tool_result') {
              if (data.tool.name === 'generateHashtags') {
                hashtags = data.tool.result.hashtags || [];
              } else if (data.tool.name === 'getBestTimeToPost') {
                bestTimeToPost = data.tool.result;
              }
            }

            // Send chunk to client
            controller.enqueue(
              encoder.encode(`data: ${chunk}\n`)
            );
          }

          // Deduct credits after successful generation
          await deductCredits(
            user.id,
            2,
            `Streamed post generation: "${input.topic}"`
          );

          // Save to database (optional - can be done on client side)
          if (fullContent) {
            try {
              await prisma.post.create({
                data: {
                  userId: user.id,
                  content: fullContent.substring(0, 500),
                  platform: input.platform || 'linkedin',
                  status: 'draft',
                  metadata: {
                    topic: input.topic,
                    tone: input.tone,
                    length: input.length,
                    hashtags,
                    bestTimeToPost: bestTimeToPost || undefined,
                    generatedAt: new Date().toISOString(),
                    streamGenerated: true,
                  } as any,
                },
              });

              console.log('[StreamAPI] Post saved to database');
            } catch (error) {
              console.error('[StreamAPI] Error saving post:', error);
            }
          }

          console.log('[StreamAPI] Streaming complete');
          controller.close();
        } catch (error) {
          console.error('[StreamAPI] Streaming error:', error);

          // Send error event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Streaming failed',
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[StreamAPI] Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Validate input parameters
 */
function validateInput(input: GeneratePostInput): { valid: boolean; error?: string } {
  if (!input.topic || typeof input.topic !== 'string') {
    return { valid: false, error: 'Topic is required' };
  }

  if (input.topic.length < 3 || input.topic.length > 200) {
    return { valid: false, error: 'Topic must be between 3 and 200 characters' };
  }

  const validTones = ['Professional', 'Casual', 'Inspirational'];
  if (!validTones.includes(input.tone)) {
    return { valid: false, error: 'Invalid tone' };
  }

  const validLengths = ['Short', 'Medium', 'Long'];
  if (!validLengths.includes(input.length)) {
    return { valid: false, error: 'Invalid length' };
  }

  return { valid: true };
}
