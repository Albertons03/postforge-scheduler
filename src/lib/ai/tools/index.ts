/**
 * Tool Registry
 * Central export for all Claude AI tools
 */

import {
  generateHashtagsTool,
  executeGenerateHashtags,
  type GenerateHashtagsInput,
  type GenerateHashtagsOutput,
} from './generateHashtags';

import {
  getBestTimeToPostTool,
  executeGetBestTimeToPost,
  type GetBestTimeToPostInput,
} from './getBestTimeToPost';

import type { Tool, ToolResult, BestTimeToPostResult } from '../types';

/**
 * All available tools for Claude API
 */
export const TOOLS: Tool[] = [generateHashtagsTool, getBestTimeToPostTool];

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  toolInput: any
): Promise<ToolResult> {
  console.log(`[ToolExecutor] Executing tool: ${toolName}`);
  console.log(`[ToolExecutor] Input:`, toolInput);

  try {
    let output: any;

    switch (toolName) {
      case 'generateHashtags':
        output = await executeGenerateHashtags(toolInput as GenerateHashtagsInput);
        break;

      case 'getBestTimeToPost':
        output = await executeGetBestTimeToPost(toolInput as GetBestTimeToPostInput);
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    console.log(`[ToolExecutor] Success for ${toolName}:`, output);

    return {
      name: toolName,
      input: toolInput,
      output,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ToolExecutor] Error executing ${toolName}:`, errorMsg);

    return {
      name: toolName,
      input: toolInput,
      output: null,
      error: errorMsg,
    };
  }
}

/**
 * Re-export tool definitions and executors
 */
export {
  generateHashtagsTool,
  executeGenerateHashtags,
  getBestTimeToPostTool,
  executeGetBestTimeToPost,
  type GenerateHashtagsInput,
  type GenerateHashtagsOutput,
  type GetBestTimeToPostInput,
  type BestTimeToPostResult,
};
