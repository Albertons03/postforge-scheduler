/**
 * Claude AI Streaming Client
 * Handles real-time streaming with tool calling support
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  GeneratePostInput,
  GeneratePostWithToolsResponse,
  StreamHandlers,
  MessageContent,
  BestTimeToPostResult,
} from './types';
import { TOOLS, executeTool } from './tools';

// Configuration
const MODEL_NAME = process.env.ANTHROPIC_MODEL || 'claude-opus-4-1-20250805';
const MAX_TOKENS = 2048;
const TIMEOUT_MS = 60000;

// Initialize Claude client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: TIMEOUT_MS,
});

/**
 * Generate a post with streaming and tool calling
 */
export async function generatePostWithStreaming(
  input: GeneratePostInput,
  handlers?: StreamHandlers
): Promise<GeneratePostWithToolsResponse> {
  console.log('[Streaming] Starting post generation with tools');
  handlers?.onStart?.();

  const prompt = buildPrompt(input);

  let fullContent = '';
  let hashtags: string[] = [];
  let bestTimeToPost: BestTimeToPostResult = {
    hour: 9,
    confidence: 0.5,
    reason: 'Default time',
  };
  let totalTokens = 0;

  try {
    // Create streaming message with tools
    const stream = await anthropic.messages.stream({
      model: MODEL_NAME,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: TOOLS,
    });

    // Process stream events
    for await (const event of stream) {
      // Content delta events
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          const delta = event.delta.text;
          fullContent += delta;
          handlers?.onContentDelta?.(delta);
        }
      }

      // Tool use events
      if (event.type === 'content_block_start') {
        const content = event.content_block;
        if (content.type === 'tool_use') {
          console.log(`[Streaming] Tool call: ${content.name}`);
          handlers?.onToolCall?.(content.name, content.input);

          // Execute tool
          const toolResult = await executeTool(content.name, content.input);

          if (toolResult.error) {
            console.error(`[Streaming] Tool error: ${toolResult.error}`);
          } else {
            console.log(`[Streaming] Tool result:`, toolResult.output);
            handlers?.onToolResult?.(content.name, toolResult.output);

            // Store tool results
            if (content.name === 'generateHashtags') {
              hashtags = toolResult.output.hashtags || [];
            } else if (content.name === 'getBestTimeToPost') {
              bestTimeToPost = toolResult.output;
            }
          }
        }
      }

      // Message complete
      if (event.type === 'message_stop') {
        console.log('[Streaming] Message complete');
      }
    }

    // Get final message and token usage
    const finalMessage = await stream.finalMessage();
    totalTokens = finalMessage.usage?.input_tokens + finalMessage.usage?.output_tokens || 0;

    console.log(`[Streaming] Total tokens used: ${totalTokens}`);

    const response: GeneratePostWithToolsResponse = {
      content: fullContent.trim(),
      hashtags,
      bestTimeToPost,
      totalTokensUsed: totalTokens,
      metadata: {
        topic: input.topic,
        tone: input.tone,
        length: input.length,
        platform: input.platform || 'linkedin',
        generatedAt: new Date().toISOString(),
      },
    };

    handlers?.onComplete?.(response);

    return response;
  } catch (error) {
    console.error('[Streaming] Error:', error);
    const err = error instanceof Error ? error : new Error('Unknown streaming error');
    handlers?.onError?.(err);
    throw err;
  }
}

/**
 * Generate post with streaming and manual tool execution
 * This version processes tools after content generation
 */
export async function generatePostWithToolsSequential(
  input: GeneratePostInput
): Promise<GeneratePostWithToolsResponse> {
  console.log('[Streaming] Starting sequential generation');

  const prompt = buildPrompt(input);

  try {
    // Step 1: Generate content with streaming
    let fullContent = '';

    const contentStream = await anthropic.messages.stream({
      model: MODEL_NAME,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    for await (const event of contentStream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text;
      }
    }

    const finalMessage = await contentStream.finalMessage();
    const contentTokens = finalMessage.usage?.input_tokens + finalMessage.usage?.output_tokens || 0;

    console.log('[Streaming] Content generated:', fullContent.substring(0, 100) + '...');

    // Step 2: Generate hashtags
    console.log('[Streaming] Generating hashtags...');
    const hashtagResult = await executeTool('generateHashtags', {
      topic: input.topic,
      tone: input.tone,
      content_length: input.length,
      platform: input.platform || 'linkedin',
      content: fullContent,
    });

    const hashtags = hashtagResult.output?.hashtags || [];

    // Step 3: Calculate best time to post
    console.log('[Streaming] Calculating best time...');
    const timeResult = await executeTool('getBestTimeToPost', {
      platform: input.platform || 'linkedin',
      timezone: input.timezone,
      target_audience: input.targetAudience,
    });

    const bestTimeToPost: BestTimeToPostResult = timeResult.output || {
      hour: 9,
      confidence: 0.5,
      reason: 'Default time',
    };

    const response: GeneratePostWithToolsResponse = {
      content: fullContent.trim(),
      hashtags,
      bestTimeToPost,
      totalTokensUsed: contentTokens,
      metadata: {
        topic: input.topic,
        tone: input.tone,
        length: input.length,
        platform: input.platform || 'linkedin',
        generatedAt: new Date().toISOString(),
      },
    };

    console.log('[Streaming] Sequential generation complete');

    return response;
  } catch (error) {
    console.error('[Streaming] Error:', error);
    throw error;
  }
}

/**
 * Build optimized prompt for post generation
 */
function buildPrompt(input: GeneratePostInput): string {
  const { topic, tone, length, platform = 'linkedin' } = input;

  // Tone characteristics
  const toneGuides = {
    Professional:
      'Use formal, industry-appropriate language with relevant insights and professional terminology.',
    Casual:
      'Use conversational, friendly language with personal anecdotes or relatable examples.',
    Inspirational:
      'Use motivational and uplifting language that inspires action and positive thinking.',
  };

  // Length constraints
  const lengthGuides = {
    Short: '50-100 words',
    Medium: '150-250 words',
    Long: '300-500 words',
  };

  // Platform-specific rules
  const platformGuides = {
    linkedin:
      'LinkedIn best practices: Professional tone, use emojis strategically (2-3 max), add line breaks for readability, include a clear call-to-action, focus on professional insights or career growth.',
    twitter:
      'Twitter/X best practices: Keep it concise, engaging hook at the beginning, conversational tone.',
    facebook:
      'Facebook best practices: More personal tone, storytelling approach, encourage engagement.',
  };

  const toneGuide = toneGuides[tone];
  const lengthGuide = lengthGuides[length];
  const platformGuide =
    platformGuides[platform as keyof typeof platformGuides] || platformGuides.linkedin;

  return `Generate a ${platform} post about "${topic}".

Requirements:
1. Tone: ${tone}
   ${toneGuide}

2. Length: ${lengthGuide}

3. Platform Guidelines: ${platformGuide}

4. General Rules:
   - Must be engaging and ready to post immediately
   - No hashtags in the content (they will be added separately)
   - No introductory phrases like "Here's a post:"
   - Use proper formatting with line breaks for readability
   - Include a clear message or call-to-action

Please generate ONLY the post content, nothing else.`;
}

/**
 * Process stream in real-time (for API endpoints)
 */
export async function* streamPostGeneration(
  input: GeneratePostInput
): AsyncGenerator<string, void, unknown> {
  const prompt = buildPrompt(input);

  try {
    const stream = await anthropic.messages.stream({
      model: MODEL_NAME,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: TOOLS,
    });

    for await (const event of stream) {
      // Send content deltas
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield JSON.stringify({
          type: 'content',
          delta: event.delta.text,
        }) + '\n';
      }

      // Send tool calls
      if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
        const tool = event.content_block;
        yield JSON.stringify({
          type: 'tool_call',
          tool: {
            name: tool.name,
            input: tool.input,
          },
        }) + '\n';

        // Execute tool
        const result = await executeTool(tool.name, tool.input);
        yield JSON.stringify({
          type: 'tool_result',
          tool: {
            name: tool.name,
            result: result.output,
          },
        }) + '\n';
      }

      // Send completion
      if (event.type === 'message_stop') {
        yield JSON.stringify({
          type: 'end',
        }) + '\n';
      }
    }
  } catch (error) {
    yield JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }) + '\n';
  }
}
