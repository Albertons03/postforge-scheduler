/**
 * Test script for Claude AI integration and post generation
 * Tests the complete flow: auth, credit checking, API call, post creation, credit deduction
 *
 * Usage: npx tsx tests/generate-post.test.ts
 */

import { PrismaClient } from '@prisma/client';
import { generatePost as generatePostWithClaude, logApiCall } from '../src/lib/ai/claude';
import { hasEnoughCredits, deductCredits, addCredits, getUserCreditsInfo } from '../src/lib/credits';

const prisma = new PrismaClient();

// Test configuration
const TEST_USER_EMAIL = 'test-step4@postforge.ai';
const TEST_USER_CLERK_ID = 'test-step4-clerk-id';
const TEST_TOPICS = [
  'The future of AI in business',
  'How to stay productive while working remotely',
  'Building a strong personal brand on LinkedIn',
];

/**
 * Initialize test by creating or getting test user
 */
async function initializeTestUser(): Promise<string> {
  console.log('\n--- Step 1: Initialize Test User ---');

  try {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { email: TEST_USER_EMAIL },
    });

    if (user) {
      console.log(`✓ Test user already exists: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Credits: ${user.credits}`);
      return user.id;
    }

    // Create new test user
    user = await prisma.user.create({
      data: {
        clerkId: TEST_USER_CLERK_ID,
        email: TEST_USER_EMAIL,
        credits: 10, // Default starting credits
      },
    });

    console.log('✓ Test user created successfully');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Initial Credits: ${user.credits}`);

    return user.id;
  } catch (error) {
    console.error('✗ Error initializing test user:', error);
    throw error;
  }
}

/**
 * Test Claude API integration
 */
async function testClaudeApiIntegration(): Promise<void> {
  console.log('\n--- Step 2: Test Claude AI Integration ---');

  const testCases = [
    {
      topic: 'Remote work productivity tips',
      tone: 'Professional' as const,
      length: 'Medium' as const,
      platform: 'linkedin',
    },
    {
      topic: 'Why AI will change everything',
      tone: 'Inspirational' as const,
      length: 'Long' as const,
      platform: 'linkedin',
    },
    {
      topic: 'Quick coding productivity hack',
      tone: 'Casual' as const,
      length: 'Short' as const,
      platform: 'linkedin',
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n  Testing: ${testCase.topic} (${testCase.tone}, ${testCase.length})`);

      const startTime = Date.now();
      const generatedPost = await generatePostWithClaude(
        testCase.topic,
        testCase.tone,
        testCase.length,
        testCase.platform
      );
      const duration = Date.now() - startTime;

      console.log(`  ✓ Generated in ${duration}ms`);
      console.log(`    Length: ${generatedPost.length} characters`);
      console.log(`    Preview: ${generatedPost.substring(0, 100)}...`);

      if (generatedPost.length > 500) {
        console.warn(`    WARNING: Post exceeds 500 chars (${generatedPost.length})`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Error: ${errorMsg}`);
    }
  }
}

/**
 * Test credit system
 */
async function testCreditSystem(userId: string): Promise<void> {
  console.log('\n--- Step 3: Test Credit System ---');

  try {
    // Get initial credits
    const initialInfo = await getUserCreditsInfo(userId);
    console.log(`✓ Initial credits: ${initialInfo?.currentCredits}`);

    // Test: Check if user has enough credits
    const hasEnough = await hasEnoughCredits(userId, 1);
    console.log(`✓ Has enough credits for 1 generation: ${hasEnough}`);

    // Test: Add credits (simulate purchase)
    console.log('\n  Testing credit addition (purchase)...');
    const addResult = await addCredits(userId, 5, 'purchase', 'Test purchase');
    if (addResult.success) {
      console.log(`  ✓ Added 5 credits. Remaining: ${addResult.remainingCredits}`);
    } else {
      console.error(`  ✗ Failed to add credits: ${addResult.error}`);
    }

    // Test: Deduct credits (simulate generation)
    console.log('\n  Testing credit deduction (generation)...');
    const deductResult = await deductCredits(userId, 1, 'Test post generation');
    if (deductResult.success) {
      console.log(`  ✓ Deducted 1 credit. Remaining: ${deductResult.remainingCredits}`);
      console.log(`    Transaction ID: ${deductResult.transactionId}`);
    } else {
      console.error(`  ✗ Failed to deduct credits: ${deductResult.error}`);
    }

    // Check final balance
    const finalInfo = await getUserCreditsInfo(userId);
    console.log(`\n✓ Final credits: ${finalInfo?.currentCredits}`);
    console.log(`  Total spent: ${finalInfo?.totalSpent}`);
    console.log(`  Total purchased: ${finalInfo?.totalPurchased}`);
  } catch (error) {
    console.error('✗ Error testing credit system:', error);
    throw error;
  }
}

/**
 * Test complete post generation flow
 */
async function testCompletePostGenerationFlow(userId: string): Promise<void> {
  console.log('\n--- Step 4: Test Complete Post Generation Flow ---');

  try {
    const topic = TEST_TOPICS[0];

    // Check initial credits
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    console.log(`  Initial credits: ${userBefore?.credits}`);

    // Check if has enough credits
    const hasCredits = await hasEnoughCredits(userId, 1);
    if (!hasCredits) {
      console.warn('  ✗ Not enough credits for test. Adding 5 credits...');
      await addCredits(userId, 5, 'bonus', 'Test bonus');
    }

    // Generate post
    console.log(`  Generating post about: "${topic}"`);
    const generatedContent = await generatePostWithClaude(
      topic,
      'Professional',
      'Medium',
      'linkedin'
    );
    console.log(`  ✓ Generated: ${generatedContent.length} characters`);

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId,
        content: generatedContent.substring(0, 500),
        platform: 'linkedin',
        status: 'draft',
        metadata: {
          topic,
          tone: 'Professional',
          length: 'Medium',
          generatedAt: new Date().toISOString(),
        },
      },
    });
    console.log(`  ✓ Post created in database: ${post.id}`);

    // Deduct credits
    const deductResult = await deductCredits(
      userId,
      1,
      `Generated post: "${topic}"`
    );

    if (deductResult.success) {
      console.log(`  ✓ Credits deducted. Remaining: ${deductResult.remainingCredits}`);

      // Verify post is linked to user
      const userPosts = await prisma.post.findMany({
        where: { userId },
        select: { id: true, status: true, content: true },
      });
      console.log(`  ✓ User has ${userPosts.length} post(s)`);
    } else {
      console.error(`  ✗ Failed to deduct credits: ${deductResult.error}`);
      // Clean up post if deduction failed
      await prisma.post.delete({ where: { id: post.id } });
    }
  } catch (error) {
    console.error('✗ Error in complete flow test:', error);
    throw error;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling(userId: string): Promise<void> {
  console.log('\n--- Step 5: Test Error Handling ---');

  try {
    // Test: Invalid topic (too short)
    console.log('  Testing invalid topic (too short)...');
    try {
      await generatePostWithClaude('AI', 'Professional', 'Medium', 'linkedin');
      console.warn('  ✗ Should have failed for short topic');
    } catch (error) {
      console.log('  ✓ Correctly rejected short topic');
    }

    // Test: Invalid tone
    console.log('  Testing invalid tone...');
    try {
      // @ts-ignore - intentionally invalid
      await generatePostWithClaude('Test topic', 'InvalidTone', 'Medium', 'linkedin');
      console.warn('  ✗ Should have failed for invalid tone');
    } catch (error) {
      console.log('  ✓ Correctly rejected invalid tone');
    }

    // Test: Insufficient credits
    console.log('  Testing insufficient credits...');

    // Set user credits to 0
    await prisma.user.update({
      where: { id: userId },
      data: { credits: 0 },
    });

    const hasCredits = await hasEnoughCredits(userId, 1);
    if (!hasCredits) {
      console.log('  ✓ Correctly detected insufficient credits');
    } else {
      console.warn('  ✗ Should have detected insufficient credits');
    }

    // Restore credits for cleanup
    await addCredits(userId, 10, 'bonus', 'Test restore');
  } catch (error) {
    console.error('✗ Error in error handling test:', error);
  }
}

/**
 * Cleanup test data
 */
async function cleanup(userId: string): Promise<void> {
  console.log('\n--- Cleanup ---');

  try {
    // Get and display final state
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: { select: { id: true, status: true } },
        creditTransactions: { select: { id: true, type: true, amount: true } },
      },
    });

    if (user) {
      console.log(`✓ Final user state:`);
      console.log(`  Credits: ${user.credits}`);
      console.log(`  Posts created: ${user.posts.length}`);
      console.log(`  Transactions: ${user.creditTransactions.length}`);

      // Show transaction summary
      if (user.creditTransactions.length > 0) {
        console.log('  Recent transactions:');
        user.creditTransactions.slice(-3).forEach((tx) => {
          console.log(`    - ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount}`);
        });
      }
    }

    console.log('\n✓ Test completed successfully!');
  } catch (error) {
    console.error('✗ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('========================================');
  console.log('  Claude AI Integration Test Suite');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Test User Email: ${TEST_USER_EMAIL}`);

  try {
    // Step 1: Initialize test user
    const userId = await initializeTestUser();

    // Step 2: Test Claude API
    await testClaudeApiIntegration();

    // Step 3: Test credit system
    await testCreditSystem(userId);

    // Step 4: Test complete flow
    await testCompletePostGenerationFlow(userId);

    // Step 5: Test error handling
    await testErrorHandling(userId);

    // Cleanup
    await cleanup(userId);
  } catch (error) {
    console.error('\n========================================');
    console.error('  TEST FAILED');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
