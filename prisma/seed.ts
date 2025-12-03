import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...\n')

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@postforge.ai' },
    update: {},
    create: {
      clerkId: 'seed_test_user_clerk_id',
      email: 'test@postforge.ai',
      credits: 10,
      organizationId: null,
    },
  })

  console.log(`✅ Created test user: ${testUser.email}`)
  console.log(`   Credits: ${testUser.credits}`)
  console.log(`   ClerkId: ${testUser.clerkId}\n`)

  // Create test posts
  const post1 = await prisma.post.create({
    data: {
      userId: testUser.id,
      content: 'This is my first AI-generated LinkedIn post! Excited to share my journey. #AI #PostForge',
      platform: 'linkedin',
      status: 'draft',
      metadata: {
        tone: 'professional',
        generatedAt: new Date().toISOString(),
      },
    },
  })

  const post2 = await prisma.post.create({
    data: {
      userId: testUser.id,
      content: '5 key lessons I learned from building an AI startup:\n\n1. Start small\n2. Listen to users\n3. Iterate fast\n4. Focus on value\n5. Never give up\n\n#Startup #AI #Entrepreneurship',
      platform: 'linkedin',
      status: 'published',
      metadata: {
        tone: 'inspirational',
        generatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    },
  })

  console.log(`✅ Created ${2} test posts for ${testUser.email}\n`)

  // Create test credit transactions
  const transaction1 = await prisma.creditTransaction.create({
    data: {
      userId: testUser.id,
      amount: 10,
      type: 'bonus',
      description: 'Welcome bonus - initial credits',
    },
  })

  const transaction2 = await prisma.creditTransaction.create({
    data: {
      userId: testUser.id,
      amount: -1,
      type: 'generation',
      description: 'Generated post: "This is my first AI-generated..."',
    },
  })

  const transaction3 = await prisma.creditTransaction.create({
    data: {
      userId: testUser.id,
      amount: -1,
      type: 'generation',
      description: 'Generated post: "5 key lessons I learned..."',
    },
  })

  console.log(`✅ Created ${3} test credit transactions\n`)

  // Summary
  const userCount = await prisma.user.count()
  const postCount = await prisma.post.count()
  const transactionCount = await prisma.creditTransaction.count()

  console.log('📊 Database seeding summary:')
  console.log(`   Users: ${userCount}`)
  console.log(`   Posts: ${postCount}`)
  console.log(`   Transactions: ${transactionCount}`)
  console.log('\n✅ Database seeding completed!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
