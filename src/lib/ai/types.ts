/**
 * Type definitions for AI streaming and tool calling functionality
 */

import type Anthropic from '@anthropic-ai/sdk';

/**
 * Tool definition for Claude API
 */
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Streaming chunk types
 */
export type StreamChunkType = 'content' | 'tool_call' | 'tool_result' | 'end' | 'error';

/**
 * Streaming chunk interface
 */
export interface StreamChunk {
  type: StreamChunkType;
  content?: string;
  tool?: {
    name: string;
    input: any;
    id?: string;
  };
  result?: any;
  delta?: string;
  error?: string;
}

/**
 * Post generation input
 */
export interface GeneratePostInput {
  topic: string;
  tone: 'Professional' | 'Casual' | 'Inspirational';
  length: 'Short' | 'Medium' | 'Long';
  platform?: string;
  timezone?: string;
  targetAudience?: string;
}

/**
 * Best time to post result
 */
export interface BestTimeToPostResult {
  hour: number;
  confidence: number;
  reason: string;
  dayOfWeek?: string;
}

/**
 * Generate post response with tools
 */
export interface GeneratePostWithToolsResponse {
  content: string;
  hashtags: string[];
  bestTimeToPost: BestTimeToPostResult;
  totalTokensUsed: number;
  metadata?: {
    topic: string;
    tone: string;
    length: string;
    platform: string;
    generatedAt: string;
  };
}

/**
 * Tool execution result
 */
export interface ToolResult {
  name: string;
  input: any;
  output: any;
  error?: string;
}

/**
 * Stream event handlers
 */
export interface StreamHandlers {
  onStart?: () => void;
  onContentDelta?: (delta: string) => void;
  onToolCall?: (toolName: string, toolInput: any) => void;
  onToolResult?: (toolName: string, result: any) => void;
  onComplete?: (result: GeneratePostWithToolsResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Anthropic message content types
 */
export type MessageContent =
  | Anthropic.TextBlock
  | Anthropic.ToolUseBlock;

/**
 * Stream processing state
 */
export interface StreamState {
  content: string;
  toolCalls: ToolResult[];
  totalTokens: number;
  isComplete: boolean;
}
