import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude AI client utility with retry logic and error handling
 * Handles timeout, rate limiting, and connection errors
 */

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 30000;
const RATE_LIMIT_DELAY_MS = 2000;

// Model configuration - use environment variable or fallback to default
const MODEL_NAME = process.env.ANTHROPIC_MODEL || 'claude-opus-4-1-20250805';

// Initialize Claude client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: TIMEOUT_MS,
});

/**
 * Generate a LinkedIn post using Claude API
 * With retry logic, error handling, and timeout protection
 */
export async function generatePost(
  topic: string,
  tone: 'Professional' | 'Casual' | 'Inspirational',
  length: 'Short' | 'Medium' | 'Long',
  platform: string = 'linkedin'
): Promise<string> {
  const prompt = buildPrompt(topic, tone, length, platform);

  // Retry logic for API calls
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`[Claude AI] Generating post (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      console.log(`[Claude AI] Topic: ${topic}, Tone: ${tone}, Length: ${length}`);

      // Create message with timeout
      const message = (await Promise.race([
        anthropic.messages.create({
          model: MODEL_NAME,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API request timeout')), TIMEOUT_MS)
        ),
      ])) as any;

      // Extract text from response
      const generatedText =
        message.content[0]?.type === 'text' ? message.content[0].text : '';

      if (!generatedText) {
        throw new Error('No text generated from Claude API');
      }

      console.log('[Claude AI] Post generated successfully');
      return generatedText;
    } catch (error) {
      const err = error as any;

      // Handle rate limiting with exponential backoff
      if (
        err.status === 429 ||
        err.message?.includes('rate_limit')
      ) {
        const delayMs = RATE_LIMIT_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[Claude AI] Rate limited. Retrying in ${delayMs}ms (attempt ${attempt}/${RETRY_ATTEMPTS})`
        );

        if (attempt < RETRY_ATTEMPTS) {
          await sleep(delayMs);
          continue;
        }
      }

      // Handle authentication errors (should not retry)
      if (err.status === 401) {
        console.error('[Claude AI] Authentication error: Invalid API key');
        throw new Error('Claude API authentication failed');
      }

      // Handle timeout (retry)
      if (
        err.message?.includes('timeout') ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNABORTED'
      ) {
        console.warn(
          `[Claude AI] Timeout occurred. Retrying (attempt ${attempt}/${RETRY_ATTEMPTS})`
        );

        if (attempt < RETRY_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
      }

      // Log error and throw if last attempt
      console.error(
        `[Claude AI] Error generating post (attempt ${attempt}/${RETRY_ATTEMPTS}):`,
        err.message || err
      );

      if (attempt === RETRY_ATTEMPTS) {
        throw new Error(
          `Failed to generate post after ${RETRY_ATTEMPTS} attempts: ${err.message || 'Unknown error'}`
        );
      }

      // Wait before retry
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error('Failed to generate post: All retry attempts failed');
}

/**
 * Build optimized prompt for LinkedIn post generation
 */
function buildPrompt(
  topic: string,
  tone: 'Professional' | 'Casual' | 'Inspirational',
  length: 'Short' | 'Medium' | 'Long',
  platform: string
): string {
  // Define tone characteristics
  const toneGuides = {
    Professional:
      'Use formal, industry-appropriate language. Include relevant insights and professional terminology. Maintain a respectful and authoritative tone.',
    Casual:
      'Use conversational, friendly language. Include personal anecdotes or relatable examples. Keep it light and engaging.',
    Inspirational:
      'Use motivational and uplifting language. Include powerful phrases and emotional connection. Inspire action and positive thinking.',
  };

  // Define length constraints
  const lengthGuides = {
    Short: '50-100 characters',
    Medium: '150-250 characters',
    Long: '300-500 characters',
  };

  // Define platform-specific rules
  const platformGuides = {
    linkedin:
      'LinkedIn best practices: Use emojis strategically (2-3 max), add line breaks for readability, include a clear call-to-action, focus on professional insights or career growth.',
    twitter:
      'Twitter/X best practices: Keep it concise, use hashtags (2-3 max), include engaging hook at the beginning.',
    facebook:
      'Facebook best practices: More personal tone allowed, longer format acceptable, use storytelling, encourage engagement.',
  };

  const toneGuide = toneGuides[tone];
  const lengthGuide = lengthGuides[length];
  const platformGuide = platformGuides[platform as keyof typeof platformGuides] || platformGuides.linkedin;

  return `Generate a ${platform} post about "${topic}".

Requirements:
1. Tone: ${tone}
   ${toneGuide}

2. Length: ${lengthGuide}

3. Platform Guidelines: ${platformGuide}

4. General Rules:
   - Must be under 500 characters (LinkedIn limit)
   - No hashtags at the end (integrate naturally if needed)
   - Clear, professional, and engaging
   - Ready to post immediately
   - Do not include "Here's a post:" or similar prefixes

Please generate ONLY the post content, nothing else.`;
}

/**
 * Helper function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log API call details for monitoring
 */
export function logApiCall(
  action: string,
  details: Record<string, any>,
  duration?: number
): void {
  const timestamp = new Date().toISOString();
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(
    `[Claude API] ${timestamp} | ${action} | ${JSON.stringify(details)}${durationStr}`
  );
}
