/**
 * FRONTEND INTEGRATION EXAMPLE
 *
 * This file shows how to integrate the Streaming + Tool Calling features
 * into your existing PostForge dashboard/generate page.
 *
 * Copy and adapt these examples to your components.
 */

'use client';

import { useState } from 'react';
import { generatePostWithToolsAction } from '@/app/actions/generatePostWithTools';
import { consumeStream } from '@/lib/streaming';
import type { GeneratePostInput } from '@/lib/ai/types';

// ============================================================================
// EXAMPLE 1: Simple Server Action (Recommended for beginners)
// ============================================================================

export function EnhancedPostGenerator() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Casual' | 'Inspirational'>('Professional');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generatePostWithToolsAction({
        topic,
        tone,
        length,
        platform: 'linkedin',
      });

      if (response.success) {
        setResult(response.post);
      } else {
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Enhanced Post Generation</h2>
      <p className="text-sm text-gray-600">
        Generates a post with AI-powered hashtags and best time to post (2 credits)
      </p>

      {/* Input Fields */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Topic (e.g., AI in healthcare)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Inspirational">Inspirational</option>
        </select>

        <select
          value={length}
          onChange={(e) => setLength(e.target.value as any)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="Short">Short</option>
          <option value="Medium">Medium</option>
          <option value="Long">Long</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate with AI Tools (2 credits)'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-4 p-6 border rounded bg-gray-50">
          <div>
            <h3 className="font-semibold mb-2">Generated Post:</h3>
            <p className="whitespace-pre-wrap">{result.content}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Hashtags:</h3>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Best Time to Post:</h3>
            <p className="text-gray-700">
              <strong>{result.bestTimeToPost.hour}:00</strong>
              {' '}(Confidence: {(result.bestTimeToPost.confidence * 100).toFixed(0)}%)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {result.bestTimeToPost.reason}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Tokens used: {result.totalTokensUsed}</p>
            <p>Remaining credits: {result.remainingCredits}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Streaming with Real-time Updates
// ============================================================================

export function StreamingPostGenerator() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Casual' | 'Inspirational'>('Professional');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');

  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [bestTime, setBestTime] = useState<any>(null);
  const [toolStatus, setToolStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleStreamGenerate = async () => {
    setIsStreaming(true);
    setError(null);
    setContent('');
    setHashtags([]);
    setBestTime(null);
    setToolStatus('');

    try {
      await consumeStream('/api/ai/generate-post-stream', {
        topic,
        tone,
        length,
        platform: 'linkedin',
      }, {
        onStart: () => {
          setToolStatus('Starting generation...');
        },
        onContent: (delta, accumulated) => {
          setContent(accumulated);
          setToolStatus('Generating content...');
        },
        onToolCall: (toolName) => {
          setToolStatus(`Calling tool: ${toolName}...`);
        },
        onToolResult: (toolName, result) => {
          if (toolName === 'generateHashtags') {
            setHashtags(result.hashtags || []);
            setToolStatus('Hashtags generated');
          } else if (toolName === 'getBestTimeToPost') {
            setBestTime(result);
            setToolStatus('Best time calculated');
          }
        },
        onComplete: () => {
          setToolStatus('Complete!');
          setIsStreaming(false);
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Streaming failed');
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Streaming Post Generation</h2>
      <p className="text-sm text-gray-600">
        Watch your post being generated in real-time with AI tools (2 credits)
      </p>

      {/* Input Fields - Same as above */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          disabled={isStreaming}
        />

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          className="w-full px-4 py-2 border rounded"
          disabled={isStreaming}
        >
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Inspirational">Inspirational</option>
        </select>

        <select
          value={length}
          onChange={(e) => setLength(e.target.value as any)}
          className="w-full px-4 py-2 border rounded"
          disabled={isStreaming}
        >
          <option value="Short">Short</option>
          <option value="Medium">Medium</option>
          <option value="Long">Long</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleStreamGenerate}
        disabled={isStreaming || !topic}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {isStreaming ? 'Streaming...' : 'Stream Generate (2 credits)'}
      </button>

      {/* Status Display */}
      {toolStatus && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">
          {toolStatus}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Real-time Content Display */}
      <div className="space-y-4">
        {content && (
          <div className="p-4 border rounded bg-white min-h-[100px]">
            <h3 className="font-semibold mb-2">Content (streaming):</h3>
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {hashtags.length > 0 && (
          <div className="p-4 border rounded bg-white">
            <h3 className="font-semibold mb-2">Hashtags:</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {bestTime && (
          <div className="p-4 border rounded bg-white">
            <h3 className="font-semibold mb-2">Best Time to Post:</h3>
            <p className="text-gray-700">
              <strong>{bestTime.hour}:00</strong>
              {' '}(Confidence: {(bestTime.confidence * 100).toFixed(0)}%)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {bestTime.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Comparison Component (Standard vs Enhanced)
// ============================================================================

export function PostGeneratorComparison() {
  const [mode, setMode] = useState<'standard' | 'enhanced'>('standard');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Post Generation</h2>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('standard')}
          className={`px-4 py-2 rounded ${
            mode === 'standard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Standard (1 credit)
        </button>
        <button
          onClick={() => setMode('enhanced')}
          className={`px-4 py-2 rounded ${
            mode === 'enhanced'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Enhanced with AI Tools (2 credits)
        </button>
      </div>

      {/* Feature Comparison */}
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">
          {mode === 'standard' ? 'Standard Features' : 'Enhanced Features'}
        </h3>
        <ul className="space-y-1 text-sm">
          <li>✓ AI-generated post content</li>
          <li>✓ Tone and length customization</li>
          {mode === 'enhanced' && (
            <>
              <li className="text-purple-600 font-semibold">
                ✓ AI-generated hashtags (5-10)
              </li>
              <li className="text-purple-600 font-semibold">
                ✓ Best time to post calculation
              </li>
              <li className="text-purple-600 font-semibold">
                ✓ Platform-optimized suggestions
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Generator Component */}
      {mode === 'standard' ? (
        <div className="text-gray-600">
          {/* Your existing standard generator component */}
          <p>Use your existing generatePost component here</p>
        </div>
      ) : (
        <EnhancedPostGenerator />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Hashtag and Time Display Component (Reusable)
// ============================================================================

interface PostResultDisplayProps {
  content: string;
  hashtags?: string[];
  bestTime?: {
    hour: number;
    confidence: number;
    reason: string;
    dayOfWeek?: string;
  };
}

export function PostResultDisplay({ content, hashtags, bestTime }: PostResultDisplayProps) {
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Generated Post</h3>
        <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
          {content}
        </div>
      </div>

      {/* Hashtags (if available) */}
      {hashtags && hashtags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Suggested Hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  alert(`Copied: ${tag}`);
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to copy individual hashtags
          </p>
        </div>
      )}

      {/* Best Time (if available) */}
      {bestTime && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Best Time to Post</h3>
          <div className="p-4 bg-green-50 rounded">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {bestTime.hour}:00
                </p>
                {bestTime.dayOfWeek && (
                  <p className="text-sm text-gray-600">
                    {bestTime.dayOfWeek}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-xl font-bold text-green-700">
                  {(bestTime.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {bestTime.reason}
            </p>
          </div>
        </div>
      )}

      {/* Copy All Button */}
      <button
        onClick={() => {
          const fullText = [
            content,
            hashtags?.join(' '),
          ].filter(Boolean).join('\n\n');

          navigator.clipboard.writeText(fullText);
          alert('Post copied to clipboard!');
        }}
        className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        Copy Post with Hashtags
      </button>
    </div>
  );
}

// ============================================================================
// INTEGRATION TIPS
// ============================================================================

/*

1. Add to your existing dashboard page:
   - Import EnhancedPostGenerator
   - Add it alongside your existing generator
   - Add a toggle or separate page for enhanced features

2. Credit display:
   - Update your credit counter to show cost (1 vs 2 credits)
   - Add tooltip explaining enhanced features
   - Disable button if user has < 2 credits

3. Styling:
   - Adapt the className props to match your design system
   - Use your existing components (Button, Input, Card, etc.)
   - Add loading states and animations

4. Error handling:
   - Show user-friendly error messages
   - Add retry button for failed generations
   - Log errors for debugging

5. Analytics:
   - Track which mode users prefer (standard vs enhanced)
   - Monitor error rates
   - Measure user satisfaction

*/
