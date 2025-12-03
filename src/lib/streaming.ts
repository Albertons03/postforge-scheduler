/**
 * Streaming Client Utilities
 * Helper functions for consuming streaming API endpoints
 */

import type { GeneratePostInput, GeneratePostWithToolsResponse } from './ai/types';

/**
 * Stream event types
 */
export interface StreamEvent {
  type: 'start' | 'content' | 'tool_call' | 'tool_result' | 'end' | 'error';
  delta?: string;
  tool?: {
    name: string;
    input?: any;
    result?: any;
  };
  error?: string;
}

/**
 * Stream callbacks
 */
export interface StreamCallbacks {
  onStart?: () => void;
  onContent?: (delta: string, accumulated: string) => void;
  onToolCall?: (toolName: string, input: any) => void;
  onToolResult?: (toolName: string, result: any) => void;
  onComplete?: (result: GeneratePostWithToolsResponse) => void;
  onError?: (error: string) => void;
}

/**
 * Consume a streaming endpoint
 * Processes Server-Sent Events and invokes callbacks
 */
export async function consumeStream(
  url: string,
  input: GeneratePostInput,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Stream request failed');
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Process stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let accumulatedContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk
      buffer += decoder.decode(value, { stream: true });

      // Process complete events (separated by \n\n in SSE)
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const eventText of events) {
        if (!eventText.trim()) continue;

        // Parse SSE format: "data: {...}"
        const dataMatch = eventText.match(/^data: (.+)$/);
        if (!dataMatch) continue;

        try {
          const event: StreamEvent = JSON.parse(dataMatch[1]);

          // Handle different event types
          switch (event.type) {
            case 'start':
              callbacks.onStart?.();
              break;

            case 'content':
              if (event.delta) {
                accumulatedContent += event.delta;
                callbacks.onContent?.(event.delta, accumulatedContent);
              }
              break;

            case 'tool_call':
              if (event.tool) {
                callbacks.onToolCall?.(event.tool.name, event.tool.input);
              }
              break;

            case 'tool_result':
              if (event.tool) {
                callbacks.onToolResult?.(event.tool.name, event.tool.result);
              }
              break;

            case 'end':
              // Stream complete
              break;

            case 'error':
              callbacks.onError?.(event.error || 'Unknown error');
              break;
          }
        } catch (parseError) {
          console.error('[Stream] Error parsing event:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('[Stream] Error:', error);
    callbacks.onError?.(error instanceof Error ? error.message : 'Stream failed');
  }
}

/**
 * Simplified streaming function that returns accumulated result
 */
export async function streamPostGeneration(
  input: GeneratePostInput,
  onProgress?: (content: string) => void
): Promise<GeneratePostWithToolsResponse> {
  return new Promise((resolve, reject) => {
    let content = '';
    let hashtags: string[] = [];
    let bestTimeToPost: any = null;

    consumeStream('/api/ai/generate-post-stream', input, {
      onContent: (delta, accumulated) => {
        content = accumulated;
        onProgress?.(accumulated);
      },
      onToolResult: (toolName, result) => {
        if (toolName === 'generateHashtags') {
          hashtags = result.hashtags || [];
        } else if (toolName === 'getBestTimeToPost') {
          bestTimeToPost = result;
        }
      },
      onComplete: () => {
        resolve({
          content,
          hashtags,
          bestTimeToPost: bestTimeToPost || {
            hour: 9,
            confidence: 0.5,
            reason: 'Default time',
          },
          totalTokensUsed: 0,
        });
      },
      onError: (error) => {
        reject(new Error(error));
      },
    });
  });
}

/**
 * Process a ReadableStream directly
 */
export async function processReadableStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let accumulatedContent = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const event: StreamEvent = JSON.parse(line);

          switch (event.type) {
            case 'start':
              callbacks.onStart?.();
              break;

            case 'content':
              if (event.delta) {
                accumulatedContent += event.delta;
                callbacks.onContent?.(event.delta, accumulatedContent);
              }
              break;

            case 'tool_call':
              if (event.tool) {
                callbacks.onToolCall?.(event.tool.name, event.tool.input);
              }
              break;

            case 'tool_result':
              if (event.tool) {
                callbacks.onToolResult?.(event.tool.name, event.tool.result);
              }
              break;

            case 'end':
              callbacks.onComplete?.({
                content: accumulatedContent,
                hashtags: [],
                bestTimeToPost: { hour: 9, confidence: 0.5, reason: 'Default' },
                totalTokensUsed: 0,
              });
              break;

            case 'error':
              callbacks.onError?.(event.error || 'Unknown error');
              break;
          }
        } catch (parseError) {
          console.error('[Stream] Parse error:', parseError);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Create an abort controller for canceling streams
 */
export function createStreamController(): {
  signal: AbortSignal;
  abort: () => void;
} {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}

/**
 * Utility: Chunk text into smaller pieces for simulated streaming
 */
export function* chunkText(text: string, chunkSize: number = 10): Generator<string> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    yield chunk + (i + chunkSize < words.length ? ' ' : '');
  }
}
