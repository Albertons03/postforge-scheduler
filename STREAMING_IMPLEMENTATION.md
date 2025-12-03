# Streaming + Tool Calling Implementation

## Overview

This enhancement adds **real-time streaming** and **AI tool calling** capabilities to PostForge, enabling:
- Real-time post generation with chunked content delivery
- Automatic hashtag generation using AI
- Intelligent best-time-to-post calculation
- Server-Sent Events (SSE) for live updates

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Application                   │
└────────────┬────────────────────────────────────────────┘
             │
             ├─► Server Action: generatePostWithToolsAction()
             │   (For non-streaming requests)
             │
             └─► API Endpoint: /api/ai/generate-post-stream
                 (For streaming requests)
                 │
                 ├─► Streaming Client: claude-streaming.ts
                 │   │
                 │   ├─► Tool: generateHashtags
                 │   │   └─► Context-aware hashtag generation
                 │   │
                 │   └─► Tool: getBestTimeToPost
                 │       └─► Platform-optimized timing
                 │
                 └─► Claude API (Anthropic)
```

## Files Created

### 1. Type Definitions
**`/src/lib/ai/types.ts`**
- All TypeScript interfaces and types
- Tool definitions, streaming chunks, responses

### 2. Tool Implementations
**`/src/lib/ai/tools/generateHashtags.ts`**
- Generates 5-10 relevant hashtags
- Platform-specific strategies
- Content analysis and keyword extraction

**`/src/lib/ai/tools/getBestTimeToPost.ts`**
- Calculates optimal posting time
- Platform-specific peak hours
- Audience and timezone adjustments
- Confidence scoring

**`/src/lib/ai/tools/index.ts`**
- Tool registry and executor
- Central tool management

### 3. Streaming Client
**`/src/lib/ai/claude-streaming.ts`**
- Real-time streaming with Claude API
- Tool calling integration
- Event handling and buffering
- Two modes:
  - `generatePostWithStreaming()`: Real-time streaming with tool calls
  - `generatePostWithToolsSequential()`: Sequential generation + tools
  - `streamPostGeneration()`: Generator for API endpoints

### 4. Server Action
**`/src/app/actions/generatePostWithTools.ts`**
- Enhanced post generation with tools
- Credit management (2 credits per enhanced post)
- Database persistence with tool results
- Full error handling and rollback

### 5. Streaming API Endpoint
**`/src/app/api/ai/generate-post-stream/route.ts`**
- Server-Sent Events (SSE) endpoint
- Real-time content streaming
- Tool execution and result streaming
- Automatic post saving

### 6. Frontend Utilities
**`/src/lib/streaming.ts`**
- Client-side streaming helpers
- SSE event processing
- Stream callbacks and progress tracking
- Abort controller support

### 7. Test Suite
**`/tests/test-streaming.ts`**
- Comprehensive test coverage
- Individual tool testing
- Full integration tests
- Edge case validation

## Usage

### Option 1: Server Action (No Streaming)

```typescript
import { generatePostWithToolsAction } from '@/app/actions/generatePostWithTools';

const result = await generatePostWithToolsAction({
  topic: 'AI in healthcare',
  tone: 'Professional',
  length: 'Medium',
  platform: 'linkedin',
  timezone: 'America/New_York',
  targetAudience: 'B2B professionals',
});

if (result.success) {
  console.log('Content:', result.post.content);
  console.log('Hashtags:', result.post.hashtags);
  console.log('Best time:', result.post.bestTimeToPost.hour);
}
```

### Option 2: Streaming API (Real-time Updates)

```typescript
import { consumeStream } from '@/lib/streaming';

await consumeStream('/api/ai/generate-post-stream', {
  topic: 'Remote work trends',
  tone: 'Casual',
  length: 'Short',
  platform: 'linkedin',
}, {
  onStart: () => console.log('Starting...'),
  onContent: (delta, accumulated) => {
    console.log('Delta:', delta);
    // Update UI with accumulated content
  },
  onToolCall: (name, input) => {
    console.log(`Tool called: ${name}`);
  },
  onToolResult: (name, result) => {
    console.log(`Tool result: ${name}`, result);
  },
  onError: (error) => console.error(error),
});
```

### Option 3: Direct Tool Execution

```typescript
import { executeTool } from '@/lib/ai/tools';

// Generate hashtags
const hashtagResult = await executeTool('generateHashtags', {
  topic: 'Productivity tips',
  tone: 'Inspirational',
  content_length: 'Short',
  platform: 'linkedin',
});

console.log(hashtagResult.output.hashtags);

// Calculate best time
const timeResult = await executeTool('getBestTimeToPost', {
  platform: 'linkedin',
  timezone: 'Europe/London',
  day_of_week: 'Wednesday',
  target_audience: 'B2B professionals',
});

console.log(timeResult.output.hour, timeResult.output.reason);
```

## Testing

### Run Test Suite

```bash
# Run all tests
npx tsx tests/test-streaming.ts

# Test individual tools
npx tsx -e "import('./tests/test-streaming').then(m => m.testHashtagGeneration())"
npx tsx -e "import('./tests/test-streaming').then(m => m.testBestTimeCalculation())"
```

### Test Streaming Endpoint

Using curl:
```bash
curl -X POST http://localhost:3001/api/ai/generate-post-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": "AI in healthcare",
    "tone": "Professional",
    "length": "Medium",
    "platform": "linkedin"
  }'
```

Using JavaScript:
```javascript
const response = await fetch('/api/ai/generate-post-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Future of work',
    tone: 'Casual',
    length: 'Short',
    platform: 'linkedin',
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

## Tool Specifications

### Tool 1: generateHashtags

**Input:**
```typescript
{
  topic: string;           // Main topic
  tone: string;            // Professional | Casual | Inspirational
  content_length: string;  // Short | Medium | Long
  platform: string;        // linkedin | twitter | facebook
  content?: string;        // Optional: actual post content
}
```

**Output:**
```typescript
{
  hashtags: string[];      // Array of 5-10 hashtags with # prefix
  reasoning?: string;      // Explanation of hashtag selection
}
```

**Example:**
```json
{
  "hashtags": ["#AI", "#Innovation", "#Technology", "#Business", "#Future"],
  "reasoning": "Generated 5 hashtags optimized for linkedin with professional tone."
}
```

### Tool 2: getBestTimeToPost

**Input:**
```typescript
{
  platform: string;         // linkedin | twitter | facebook
  timezone?: string;        // IANA timezone (default: UTC)
  day_of_week?: string;     // Monday-Sunday (default: current day)
  target_audience?: string; // Audience type (default: general)
}
```

**Output:**
```typescript
{
  hour: number;            // 0-23 (24-hour format)
  confidence: number;      // 0-1 confidence score
  reason: string;          // Human-readable explanation
  dayOfWeek?: string;      // Day of week
}
```

**Example:**
```json
{
  "hour": 9,
  "confidence": 0.92,
  "reason": "Best time for linkedin: 9:00 AM (Morning). Wednesday is a peak engagement day. B2B audience is most active during business hours.",
  "dayOfWeek": "Wednesday"
}
```

## Platform-Specific Optimizations

### LinkedIn
- **Optimal Hours:** 9 AM, 10 AM, 12 PM, 5 PM
- **Peak Days:** Tuesday, Wednesday, Thursday
- **Hashtags:** 3-5 professional hashtags
- **Tone:** Professional, industry-focused

### Twitter/X
- **Optimal Hours:** 8 AM, 12 PM, 3 PM, 5 PM, 8 PM
- **Peak Days:** Monday, Tuesday, Wednesday
- **Hashtags:** 2-3 concise hashtags
- **Tone:** Conversational, engaging

### Facebook
- **Optimal Hours:** 1 PM, 3 PM, 7 PM, 8 PM
- **Peak Days:** Wednesday, Thursday, Friday
- **Hashtags:** 5-7 engaging hashtags
- **Tone:** Personal, storytelling

## Credit System

- **Standard Post Generation:** 1 credit
- **Enhanced Generation (with tools):** 2 credits

## Error Handling

All functions include comprehensive error handling:
- Retry logic with exponential backoff
- Fallback values for tool failures
- Transaction rollback on credit deduction failure
- Detailed error logging

## Performance

- **Streaming latency:** ~100-500ms for first chunk
- **Full generation:** 3-8 seconds (depending on length)
- **Tool execution:** ~50-200ms per tool
- **Token usage:** 1000-2000 tokens per enhanced post

## Security

- User authentication via Clerk
- Credit validation before generation
- Input sanitization and validation
- Rate limiting (via Anthropic API)
- No sensitive data in logs

## Future Enhancements

Potential improvements:
1. **Image generation tool** for post visuals
2. **Engagement prediction tool** based on content analysis
3. **Competitor analysis tool** for trending topics
4. **Post scheduling optimization** based on historical data
5. **Multi-language support** for international audiences
6. **A/B testing suggestions** for post variations

## Troubleshooting

### Streaming not working
- Check `ANTHROPIC_API_KEY` environment variable
- Verify user has sufficient credits
- Check network/proxy settings for SSE

### Tools not executing
- Verify tool definitions in `TOOLS` array
- Check console logs for tool execution errors
- Validate input schema matches tool requirements

### Empty responses
- Check API key permissions
- Verify model name is correct
- Check for rate limiting (429 errors)

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review test suite output
3. Verify environment variables are set
4. Check Anthropic API status

## License

Part of PostForge AI - LinkedIn Scheduler project
