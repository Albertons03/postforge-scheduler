/**
 * Test Script: Streaming & Tool Calling
 * Tests the complete streaming + tool calling implementation
 */

import { generatePostWithToolsSequential } from '../src/lib/ai/claude-streaming';
import { executeTool } from '../src/lib/ai/tools';
import type { GeneratePostInput } from '../src/lib/ai/types';

/**
 * Test 1: Generate hashtags tool
 */
async function testHashtagGeneration() {
  console.log('\n=== Test 1: Hashtag Generation ===\n');

  try {
    const result = await executeTool('generateHashtags', {
      topic: 'AI in healthcare',
      tone: 'Professional',
      content_length: 'Medium',
      platform: 'linkedin',
      content: 'Artificial intelligence is transforming healthcare delivery and patient outcomes.',
    });

    console.log('✅ Hashtag generation successful');
    console.log('Hashtags:', result.output.hashtags);
    console.log('Reasoning:', result.output.reasoning);
  } catch (error) {
    console.error('❌ Hashtag generation failed:', error);
  }
}

/**
 * Test 2: Best time to post tool
 */
async function testBestTimeCalculation() {
  console.log('\n=== Test 2: Best Time to Post ===\n');

  try {
    const result = await executeTool('getBestTimeToPost', {
      platform: 'linkedin',
      timezone: 'America/New_York',
      day_of_week: 'Wednesday',
      target_audience: 'B2B professionals',
    });

    console.log('✅ Best time calculation successful');
    console.log('Optimal hour:', result.output.hour);
    console.log('Confidence:', result.output.confidence);
    console.log('Reason:', result.output.reason);
    console.log('Day:', result.output.dayOfWeek);
  } catch (error) {
    console.error('❌ Best time calculation failed:', error);
  }
}

/**
 * Test 3: Full post generation with tools
 */
async function testFullPostGeneration() {
  console.log('\n=== Test 3: Full Post Generation with Tools ===\n');

  const input: GeneratePostInput = {
    topic: 'The future of remote work',
    tone: 'Professional',
    length: 'Medium',
    platform: 'linkedin',
    timezone: 'America/New_York',
    targetAudience: 'B2B professionals',
  };

  console.log('Input:', input);
  console.log('\nGenerating post...\n');

  try {
    const startTime = Date.now();

    const result = await generatePostWithToolsSequential(input);

    const duration = Date.now() - startTime;

    console.log('✅ Post generation successful');
    console.log('\n--- Content ---');
    console.log(result.content);
    console.log('\n--- Hashtags ---');
    console.log(result.hashtags.join(', '));
    console.log('\n--- Best Time to Post ---');
    console.log(`Hour: ${result.bestTimeToPost.hour}`);
    console.log(`Confidence: ${(result.bestTimeToPost.confidence * 100).toFixed(0)}%`);
    console.log(`Reason: ${result.bestTimeToPost.reason}`);
    console.log(`\n--- Metadata ---`);
    console.log(`Tokens used: ${result.totalTokensUsed}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Generated at: ${result.metadata?.generatedAt}`);
  } catch (error) {
    console.error('❌ Post generation failed:', error);
  }
}

/**
 * Test 4: Edge cases
 */
async function testEdgeCases() {
  console.log('\n=== Test 4: Edge Cases ===\n');

  // Test with minimal input
  console.log('Test 4a: Minimal input');
  try {
    const result = await executeTool('generateHashtags', {
      topic: 'AI',
      tone: 'Casual',
      content_length: 'Short',
      platform: 'twitter',
    });
    console.log('✅ Minimal input handled:', result.output.hashtags.length, 'hashtags');
  } catch (error) {
    console.error('❌ Minimal input failed:', error);
  }

  // Test with weekend timing
  console.log('\nTest 4b: Weekend timing');
  try {
    const result = await executeTool('getBestTimeToPost', {
      platform: 'linkedin',
      day_of_week: 'Saturday',
    });
    console.log('✅ Weekend timing handled');
    console.log('   Confidence:', result.output.confidence);
    console.log('   Note:', result.output.reason);
  } catch (error) {
    console.error('❌ Weekend timing failed:', error);
  }

  // Test with different platforms
  console.log('\nTest 4c: Multiple platforms');
  const platforms = ['linkedin', 'twitter', 'facebook'];
  for (const platform of platforms) {
    try {
      const result = await executeTool('getBestTimeToPost', {
        platform,
      });
      console.log(`✅ ${platform}: Hour ${result.output.hour}, Confidence ${result.output.confidence.toFixed(2)}`);
    } catch (error) {
      console.error(`❌ ${platform} failed:`, error);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Streaming & Tool Calling Test Suite          ║');
  console.log('╚════════════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    await testHashtagGeneration();
    await testBestTimeCalculation();
    await testFullPostGeneration();
    await testEdgeCases();

    const totalDuration = Date.now() - startTime;

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  All Tests Complete                            ║');
    console.log(`║  Total Duration: ${totalDuration}ms                      ║`);
    console.log('╚════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, testHashtagGeneration, testBestTimeCalculation, testFullPostGeneration };
