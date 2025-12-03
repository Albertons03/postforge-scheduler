/**
 * Tool: Auto-Hashtag Generation
 * Generates relevant hashtags based on post content and parameters
 */

import type { Tool } from '../types';

/**
 * Hashtag generation input schema
 */
export interface GenerateHashtagsInput {
  topic: string;
  tone: string;
  content_length: string;
  platform: string;
  content?: string;
}

/**
 * Hashtag generation output
 */
export interface GenerateHashtagsOutput {
  hashtags: string[];
  reasoning?: string;
}

/**
 * Tool definition for Claude API
 */
export const generateHashtagsTool: Tool = {
  name: 'generateHashtags',
  description:
    'Generate 5-10 relevant hashtags for a social media post based on the topic, tone, and platform. Returns an array of hashtags (with # prefix) that are trending, relevant, and appropriate for the content.',
  input_schema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        description: 'The main topic or subject of the post',
      },
      tone: {
        type: 'string',
        enum: ['Professional', 'Casual', 'Inspirational'],
        description: 'The tone of the post',
      },
      content_length: {
        type: 'string',
        enum: ['Short', 'Medium', 'Long'],
        description: 'The length of the post content',
      },
      platform: {
        type: 'string',
        enum: ['linkedin', 'twitter', 'facebook'],
        description: 'The social media platform where the post will be published',
      },
      content: {
        type: 'string',
        description: 'Optional: The actual post content to analyze for more accurate hashtags',
      },
    },
    required: ['topic', 'tone', 'content_length', 'platform'],
  },
};

/**
 * Execute hashtag generation
 * This function processes the tool call and generates hashtags
 */
export async function executeGenerateHashtags(
  input: GenerateHashtagsInput
): Promise<GenerateHashtagsOutput> {
  try {
    console.log('[GenerateHashtags] Generating hashtags for:', input.topic);

    // Define platform-specific hashtag strategies
    const platformStrategies = {
      linkedin: {
        maxHashtags: 5,
        style: 'professional',
        examples: ['#Innovation', '#Leadership', '#CareerGrowth', '#Business', '#Technology'],
      },
      twitter: {
        maxHashtags: 3,
        style: 'concise',
        examples: ['#Tech', '#AI', '#Startup'],
      },
      facebook: {
        maxHashtags: 7,
        style: 'engaging',
        examples: ['#Community', '#Inspiration', '#Success'],
      },
    };

    const strategy = platformStrategies[input.platform as keyof typeof platformStrategies] || platformStrategies.linkedin;

    // Generate hashtags based on topic analysis
    const hashtags = generateContextualHashtags(
      input.topic,
      input.tone,
      input.platform,
      strategy.maxHashtags,
      input.content
    );

    const reasoning = `Generated ${hashtags.length} hashtags optimized for ${input.platform} with ${input.tone.toLowerCase()} tone.`;

    console.log('[GenerateHashtags] Generated:', hashtags);

    return {
      hashtags,
      reasoning,
    };
  } catch (error) {
    console.error('[GenerateHashtags] Error:', error);

    // Fallback: return generic hashtags
    return {
      hashtags: ['#LinkedIn', '#Professional', '#Content'],
      reasoning: 'Fallback hashtags due to error in generation',
    };
  }
}

/**
 * Generate contextual hashtags based on topic and parameters
 */
function generateContextualHashtags(
  topic: string,
  tone: string,
  platform: string,
  maxHashtags: number,
  content?: string
): string[] {
  const hashtags: string[] = [];

  // Keyword extraction from topic
  const topicWords = extractKeywords(topic);

  // Add topic-based hashtags
  topicWords.slice(0, 3).forEach((word) => {
    if (word.length > 2) {
      hashtags.push(`#${capitalize(word)}`);
    }
  });

  // Add tone-specific hashtags
  const toneHashtags = getToneBasedHashtags(tone);
  hashtags.push(...toneHashtags.slice(0, 2));

  // Add platform-specific hashtags
  const platformHashtags = getPlatformSpecificHashtags(platform);
  hashtags.push(...platformHashtags.slice(0, 2));

  // Add content-based hashtags if content is provided
  if (content) {
    const contentKeywords = extractKeywords(content);
    contentKeywords.slice(0, 2).forEach((word) => {
      if (word.length > 3 && !hashtags.some(h => h.toLowerCase().includes(word.toLowerCase()))) {
        hashtags.push(`#${capitalize(word)}`);
      }
    });
  }

  // Remove duplicates and limit to maxHashtags
  const uniqueHashtags = Array.from(new Set(hashtags));

  return uniqueHashtags.slice(0, maxHashtags);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  ]);

  // Extract words, filter stop words, and sort by relevance
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates

  return words;
}

/**
 * Get tone-based hashtags
 */
function getToneBasedHashtags(tone: string): string[] {
  const toneHashtags: Record<string, string[]> = {
    Professional: ['#Leadership', '#Business', '#Career', '#Success', '#Innovation'],
    Casual: ['#LifeStyle', '#Community', '#Thoughts', '#Daily', '#Real'],
    Inspirational: ['#Motivation', '#Inspiration', '#Growth', '#Mindset', '#Goals'],
  };

  return toneHashtags[tone] || toneHashtags.Professional;
}

/**
 * Get platform-specific hashtags
 */
function getPlatformSpecificHashtags(platform: string): string[] {
  const platformHashtags: Record<string, string[]> = {
    linkedin: ['#LinkedIn', '#Professional', '#Networking', '#B2B', '#Industry'],
    twitter: ['#TechTwitter', '#Trending', '#Thread', '#X'],
    facebook: ['#SocialMedia', '#Community', '#Engagement', '#Facebook'],
  };

  return platformHashtags[platform] || platformHashtags.linkedin;
}

/**
 * Capitalize first letter of word
 */
function capitalize(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
