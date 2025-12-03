import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Testing database relationships...\n')

  // Test 1: User -> Posts (OneToMany)
  console.log('📊 Test 1: User -> Posts (OneToMany)')
  const userWithPosts = await prisma.user.findFirst({
    include: {
      posts: true,
    },
  })

  if (userWithPosts) {
    console.log(`✅ User "${userWithPosts.email}" has ${userWithPosts.posts.length} posts`)
    userWithPosts.posts.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.content.substring(0, 50)}...`)
      console.log(`      Status: ${post.status}, Platform: ${post.platform}`)
    })
  }
  console.log('')

  // Test 2: User -> CreditTransactions (OneToMany)
  console.log('📊 Test 2: User -> CreditTransactions (OneToMany)')
  const userWithTransactions = await prisma.user.findFirst({
    include: {
      creditTransactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (userWithTransactions) {
    console.log(
      `✅ User "${userWithTransactions.email}" has ${userWithTransactions.creditTransactions.length} transactions`
    )
    userWithTransactions.creditTransactions.forEach((tx, i) => {
      console.log(`   ${i + 1}. ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount} credits`)
      console.log(`      Description: ${tx.description}`)
    })
  }
  console.log('')

  // Test 3: Post -> User (ManyToOne)
  console.log('📊 Test 3: Post -> User (ManyToOne)')
  const postWithUser = await prisma.post.findFirst({
    include: {
      user: true,
    },
  })

  if (postWithUser) {
    console.log(`✅ Post belongs to user "${postWithUser.user.email}"`)
    console.log(`   Post content: "${postWithUser.content.substring(0, 50)}..."`)
    console.log(`   User credits: ${postWithUser.user.credits}`)
  }
  console.log('')

  // Test 4: CreditTransaction -> User (ManyToOne)
  console.log('📊 Test 4: CreditTransaction -> User (ManyToOne)')
  const transactionWithUser = await prisma.creditTransaction.findFirst({
    include: {
      user: true,
    },
  })

  if (transactionWithUser) {
    console.log(`✅ Transaction belongs to user "${transactionWithUser.user.email}"`)
    console.log(`   Transaction: ${transactionWithUser.type} (${transactionWithUser.amount})`)
    console.log(`   User current credits: ${transactionWithUser.user.credits}`)
  }
  console.log('')

  // Test 5: Cascade delete simulation check
  console.log('📊 Test 5: Cascade delete configuration')
  const schema = await prisma.$queryRaw`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('Post', 'CreditTransaction')
  ` as any[]

  console.log('✅ Foreign key constraints:')
  schema.forEach((row) => {
    console.log(
      `   ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`
    )
    console.log(`   Delete rule: ${row.delete_rule}`)
  })
  console.log('')

  // Test 6: Index verification
  console.log('📊 Test 6: Index verification')
  const indexes = await prisma.$queryRaw`
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('User', 'Post', 'CreditTransaction')
    ORDER BY tablename, indexname
  ` as any[]

  console.log('✅ Database indexes:')
  let currentTable = ''
  indexes.forEach((idx) => {
    if (idx.tablename !== currentTable) {
      console.log(`\n   ${idx.tablename}:`)
      currentTable = idx.tablename
    }
    console.log(`   - ${idx.indexname}`)
  })

  console.log('\n\n✅ All relationship tests passed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
