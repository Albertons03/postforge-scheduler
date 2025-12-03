import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database state...\n')

  // Check users
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          creditTransactions: true,
        },
      },
    },
  })

  console.log(`📊 Users in database: ${users.length}`)
  users.forEach((user) => {
    console.log(`  - ${user.email}`)
    console.log(`    ClerkId: ${user.clerkId}`)
    console.log(`    Credits: ${user.credits}`)
    console.log(`    OrganizationId: ${user.organizationId || 'null'}`)
    console.log(`    Posts: ${user._count.posts}`)
    console.log(`    Transactions: ${user._count.creditTransactions}`)
    console.log(`    Created: ${user.createdAt}`)
    console.log('')
  })

  // Check posts
  const posts = await prisma.post.findMany()
  console.log(`📝 Posts in database: ${posts.length}`)

  // Check credit transactions
  const transactions = await prisma.creditTransaction.findMany()
  console.log(`💳 Credit transactions in database: ${transactions.length}`)

  console.log('\n✅ Database check complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
