/**
 * STEP 3 VALIDATION SCRIPT
 *
 * Runs all validation checks for Database Schema & Core Models
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CheckResult {
  name: string
  status: 'PASS' | 'FAIL'
  message: string
}

const results: CheckResult[] = []

async function runChecks() {
  console.log('🔍 STEP 3 VALIDATION - Database Schema & Core Models\n')
  console.log('=' .repeat(60))
  console.log('')

  // Check 1: Database Connection
  try {
    await prisma.$connect()
    results.push({
      name: 'Database Connection',
      status: 'PASS',
      message: 'Connected to database successfully',
    })
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'FAIL',
      message: `Failed to connect: ${error}`,
    })
  }

  // Check 2: User Model
  try {
    const userCount = await prisma.user.count()
    results.push({
      name: 'User Model',
      status: 'PASS',
      message: `User table accessible (${userCount} records)`,
    })
  } catch (error) {
    results.push({
      name: 'User Model',
      status: 'FAIL',
      message: `User table error: ${error}`,
    })
  }

  // Check 3: Post Model
  try {
    const postCount = await prisma.post.count()
    results.push({
      name: 'Post Model',
      status: 'PASS',
      message: `Post table accessible (${postCount} records)`,
    })
  } catch (error) {
    results.push({
      name: 'Post Model',
      status: 'FAIL',
      message: `Post table error: ${error}`,
    })
  }

  // Check 4: CreditTransaction Model
  try {
    const txCount = await prisma.creditTransaction.count()
    results.push({
      name: 'CreditTransaction Model',
      status: 'PASS',
      message: `CreditTransaction table accessible (${txCount} records)`,
    })
  } catch (error) {
    results.push({
      name: 'CreditTransaction Model',
      status: 'FAIL',
      message: `CreditTransaction table error: ${error}`,
    })
  }

  // Check 5: User -> Posts Relationship
  try {
    const userWithPosts = await prisma.user.findFirst({
      include: { posts: true },
    })
    if (userWithPosts) {
      results.push({
        name: 'User -> Posts Relationship',
        status: 'PASS',
        message: `OneToMany working (${userWithPosts.posts.length} posts)`,
      })
    } else {
      results.push({
        name: 'User -> Posts Relationship',
        status: 'PASS',
        message: 'OneToMany structure valid (no data)',
      })
    }
  } catch (error) {
    results.push({
      name: 'User -> Posts Relationship',
      status: 'FAIL',
      message: `Relationship error: ${error}`,
    })
  }

  // Check 6: User -> CreditTransactions Relationship
  try {
    const userWithTx = await prisma.user.findFirst({
      include: { creditTransactions: true },
    })
    if (userWithTx) {
      results.push({
        name: 'User -> CreditTransactions Relationship',
        status: 'PASS',
        message: `OneToMany working (${userWithTx.creditTransactions.length} transactions)`,
      })
    } else {
      results.push({
        name: 'User -> CreditTransactions Relationship',
        status: 'PASS',
        message: 'OneToMany structure valid (no data)',
      })
    }
  } catch (error) {
    results.push({
      name: 'User -> CreditTransactions Relationship',
      status: 'FAIL',
      message: `Relationship error: ${error}`,
    })
  }

  // Check 7: Post -> User Relationship
  try {
    const postWithUser = await prisma.post.findFirst({
      include: { user: true },
    })
    if (postWithUser) {
      results.push({
        name: 'Post -> User Relationship',
        status: 'PASS',
        message: `ManyToOne working (user: ${postWithUser.user.email})`,
      })
    } else {
      results.push({
        name: 'Post -> User Relationship',
        status: 'PASS',
        message: 'ManyToOne structure valid (no data)',
      })
    }
  } catch (error) {
    results.push({
      name: 'Post -> User Relationship',
      status: 'FAIL',
      message: `Relationship error: ${error}`,
    })
  }

  // Check 8: CreditTransaction -> User Relationship
  try {
    const txWithUser = await prisma.creditTransaction.findFirst({
      include: { user: true },
    })
    if (txWithUser) {
      results.push({
        name: 'CreditTransaction -> User Relationship',
        status: 'PASS',
        message: `ManyToOne working (user: ${txWithUser.user.email})`,
      })
    } else {
      results.push({
        name: 'CreditTransaction -> User Relationship',
        status: 'PASS',
        message: 'ManyToOne structure valid (no data)',
      })
    }
  } catch (error) {
    results.push({
      name: 'CreditTransaction -> User Relationship',
      status: 'FAIL',
      message: `Relationship error: ${error}`,
    })
  }

  // Check 9: Indexes
  try {
    const indexes = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('User', 'Post', 'CreditTransaction')
    ` as any[]

    const indexCount = parseInt(indexes[0]?.count || '0')
    if (indexCount >= 14) {
      results.push({
        name: 'Database Indexes',
        status: 'PASS',
        message: `All indexes present (${indexCount} total)`,
      })
    } else {
      results.push({
        name: 'Database Indexes',
        status: 'FAIL',
        message: `Expected 14+ indexes, found ${indexCount}`,
      })
    }
  } catch (error) {
    results.push({
      name: 'Database Indexes',
      status: 'FAIL',
      message: `Index check error: ${error}`,
    })
  }

  // Check 10: Foreign Key Constraints
  try {
    const fkCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_name IN ('Post', 'CreditTransaction')
    ` as any[]

    const fkTotal = parseInt(fkCount[0]?.count || '0')
    if (fkTotal === 2) {
      results.push({
        name: 'Foreign Key Constraints',
        status: 'PASS',
        message: `All foreign keys present (${fkTotal} total)`,
      })
    } else {
      results.push({
        name: 'Foreign Key Constraints',
        status: 'FAIL',
        message: `Expected 2 foreign keys, found ${fkTotal}`,
      })
    }
  } catch (error) {
    results.push({
      name: 'Foreign Key Constraints',
      status: 'FAIL',
      message: `FK check error: ${error}`,
    })
  }

  // Check 11: Seed Data
  const userCount = await prisma.user.count()
  const postCount = await prisma.post.count()
  const txCount = await prisma.creditTransaction.count()

  if (userCount >= 1 && postCount >= 2 && txCount >= 3) {
    results.push({
      name: 'Seed Data',
      status: 'PASS',
      message: `Test data present (${userCount} users, ${postCount} posts, ${txCount} transactions)`,
    })
  } else {
    results.push({
      name: 'Seed Data',
      status: 'FAIL',
      message: `Insufficient seed data (${userCount} users, ${postCount} posts, ${txCount} transactions)`,
    })
  }

  // Print Results
  console.log('')
  console.log('📊 VALIDATION RESULTS')
  console.log('=' .repeat(60))
  console.log('')

  let passCount = 0
  let failCount = 0

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌'
    const status = result.status === 'PASS' ? 'PASS' : 'FAIL'
    console.log(`${icon} ${status.padEnd(6)} ${result.name}`)
    console.log(`   ${result.message}`)
    console.log('')

    if (result.status === 'PASS') passCount++
    else failCount++
  })

  console.log('=' .repeat(60))
  console.log('')
  console.log(`📈 SUMMARY: ${passCount} passed, ${failCount} failed`)
  console.log('')

  if (failCount === 0) {
    console.log('🎉 ALL CHECKS PASSED - STEP 3 COMPLETE!')
    console.log('')
    console.log('✅ Schema validated')
    console.log('✅ Migrations applied')
    console.log('✅ Prisma Client generated')
    console.log('✅ Relationships working')
    console.log('✅ Indexes optimized')
    console.log('✅ Seed data created')
    console.log('')
    console.log('👉 Ready for STEP 4: AI Integration')
  } else {
    console.log('⚠️  SOME CHECKS FAILED - REVIEW REQUIRED')
    console.log('')
    console.log('Please review the failed checks above and fix any issues.')
  }

  console.log('')
}

async function main() {
  try {
    await runChecks()
  } catch (error) {
    console.error('❌ Validation script error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
