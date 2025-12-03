/**
 * Tool: Best Time to Post Calculation
 * Calculates the optimal time to post based on platform, timezone, and audience
 */

import type { Tool, BestTimeToPostResult } from '../types';

/**
 * Best time to post input schema
 */
export interface GetBestTimeToPostInput {
  platform: string;
  timezone?: string;
  day_of_week?: string;
  target_audience?: string;
}

/**
 * Tool definition for Claude API
 */
export const getBestTimeToPostTool: Tool = {
  name: 'getBestTimeToPost',
  description:
    'Calculate the best time to post on social media based on platform algorithms, timezone, day of week, and target audience. Returns the optimal hour (0-23), confidence score (0-1), and reasoning.',
  input_schema: {
    type: 'object',
    properties: {
      platform: {
        type: 'string',
        enum: ['linkedin', 'twitter', 'facebook'],
        description: 'The social media platform',
      },
      timezone: {
        type: 'string',
        description:
          'User timezone (e.g., "America/New_York", "Europe/London", "UTC"). Defaults to UTC if not provided.',
      },
      day_of_week: {
        type: 'string',
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        description: 'Day of the week for posting. Defaults to current day.',
      },
      target_audience: {
        type: 'string',
        description:
          'Target audience type (e.g., "B2B professionals", "consumers", "students", "general"). Defaults to "general".',
      },
    },
    required: ['platform'],
  },
};

/**
 * Execute best time to post calculation
 */
export async function executeGetBestTimeToPost(
  input: GetBestTimeToPostInput
): Promise<BestTimeToPostResult> {
  try {
    console.log('[GetBestTimeToPost] Calculating best time for:', input);

    const platform = input.platform;
    const timezone = input.timezone || 'UTC';
    const dayOfWeek = input.day_of_week || getCurrentDayOfWeek();
    const targetAudience = input.target_audience || 'general';

    // Get platform-specific optimal times
    const platformData = getPlatformOptimalTimes(platform);

    // Adjust for day of week
    const dayAdjustment = getDayOfWeekAdjustment(platform, dayOfWeek);

    // Adjust for target audience
    const audienceAdjustment = getAudienceAdjustment(targetAudience);

    // Calculate optimal hour
    const baseHour = platformData.optimalHours[0];
    const adjustedHour = (baseHour + dayAdjustment + audienceAdjustment) % 24;

    // Calculate confidence based on data quality
    const confidence = calculateConfidence(platform, dayOfWeek, targetAudience);

    // Generate reasoning
    const reason = generateReasoning(
      platform,
      adjustedHour,
      dayOfWeek,
      targetAudience,
      confidence
    );

    const result: BestTimeToPostResult = {
      hour: adjustedHour,
      confidence,
      reason,
      dayOfWeek,
    };

    console.log('[GetBestTimeToPost] Result:', result);

    return result;
  } catch (error) {
    console.error('[GetBestTimeToPost] Error:', error);

    // Fallback to safe default
    return {
      hour: 9,
      confidence: 0.5,
      reason: 'Default recommendation: 9 AM is generally a safe time for most platforms',
      dayOfWeek: input.day_of_week || getCurrentDayOfWeek(),
    };
  }
}

/**
 * Platform-specific optimal posting times based on research
 */
interface PlatformTimeData {
  optimalHours: number[];
  worstHours: number[];
  peakDays: string[];
  description: string;
}

function getPlatformOptimalTimes(platform: string): PlatformTimeData {
  const platformData: Record<string, PlatformTimeData> = {
    linkedin: {
      optimalHours: [9, 10, 12, 17], // Business hours, lunch, end of day
      worstHours: [0, 1, 2, 3, 4, 5, 6, 22, 23],
      peakDays: ['Tuesday', 'Wednesday', 'Thursday'],
      description: 'B2B professionals are most active during business hours',
    },
    twitter: {
      optimalHours: [8, 12, 15, 17, 20], // Morning commute, lunch, afternoon, evening
      worstHours: [2, 3, 4, 5, 6],
      peakDays: ['Monday', 'Tuesday', 'Wednesday'],
      description: 'High engagement during commute times and breaks',
    },
    facebook: {
      optimalHours: [13, 15, 19, 20], // Lunch, afternoon break, evening
      worstHours: [1, 2, 3, 4, 5, 6, 7],
      peakDays: ['Wednesday', 'Thursday', 'Friday'],
      description: 'Users browse during breaks and leisure time',
    },
  };

  return platformData[platform] || platformData.linkedin;
}

/**
 * Adjust posting time based on day of week
 */
function getDayOfWeekAdjustment(platform: string, dayOfWeek: string): number {
  // Weekends: post later (people sleep in)
  if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
    return platform === 'linkedin' ? -12 : 2; // LinkedIn is dead on weekends
  }

  // Monday: slightly earlier (people catching up)
  if (dayOfWeek === 'Monday') {
    return -1;
  }

  // Friday: slightly earlier (people leave early)
  if (dayOfWeek === 'Friday') {
    return -1;
  }

  return 0;
}

/**
 * Adjust posting time based on target audience
 */
function getAudienceAdjustment(targetAudience: string): number {
  const audience = targetAudience.toLowerCase();

  // B2B professionals: peak during business hours
  if (audience.includes('b2b') || audience.includes('professional')) {
    return 1; // Slightly later in morning
  }

  // Students: peak afternoon/evening
  if (audience.includes('student')) {
    return 3;
  }

  // Consumers: peak lunch and evening
  if (audience.includes('consumer')) {
    return 0;
  }

  return 0;
}

/**
 * Calculate confidence score based on data availability
 */
function calculateConfidence(
  platform: string,
  dayOfWeek: string,
  targetAudience: string
): number {
  let confidence = 0.85; // Base confidence

  // LinkedIn has most predictable patterns
  if (platform === 'linkedin') {
    confidence += 0.05;
  }

  // Peak days increase confidence
  const platformData = getPlatformOptimalTimes(platform);
  if (platformData.peakDays.includes(dayOfWeek)) {
    confidence += 0.05;
  }

  // Weekend decreases confidence
  if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
    confidence -= 0.15;
  }

  // Specific audience increases confidence
  if (targetAudience && targetAudience !== 'general') {
    confidence += 0.05;
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  platform: string,
  hour: number,
  dayOfWeek: string,
  targetAudience: string,
  confidence: number
): string {
  const platformData = getPlatformOptimalTimes(platform);
  const timeOfDay = getTimeOfDayLabel(hour);

  let reason = `Best time for ${platform}: ${formatHour(hour)} (${timeOfDay})`;

  // Add day-specific reasoning
  if (platformData.peakDays.includes(dayOfWeek)) {
    reason += `. ${dayOfWeek} is a peak engagement day.`;
  } else if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
    reason += `. Note: Weekend engagement is typically lower on ${platform}.`;
  }

  // Add audience-specific reasoning
  if (targetAudience && targetAudience !== 'general') {
    if (targetAudience.toLowerCase().includes('b2b')) {
      reason += ' B2B audience is most active during business hours.';
    } else if (targetAudience.toLowerCase().includes('student')) {
      reason += ' Students are most active in afternoon/evening.';
    }
  }

  // Add confidence qualifier
  if (confidence >= 0.9) {
    reason += ' High confidence based on platform analytics.';
  } else if (confidence < 0.7) {
    reason += ' Lower confidence due to off-peak timing.';
  }

  return reason;
}

/**
 * Get current day of week
 */
function getCurrentDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

/**
 * Get time of day label
 */
function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

/**
 * Format hour as 12-hour time
 */
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}
