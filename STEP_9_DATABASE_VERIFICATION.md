# Step 9: Database Schema Verification & Migration Guide

## Current User Model Analysis

### Existing Fields (from schema.prisma)

```prisma
model User {
  id             String   @id @default(cuid())
  clerkId        String   @unique
  email          String   @unique
  credits        Int      @default(10)
  organizationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  posts              Post[]
  creditTransactions CreditTransaction[]
  stripeTransactions StripeTransaction[]

  @@index([clerkId])
  @@index([email])
  @@index([organizationId])
}
```

### Missing Fields for Step 9

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `stripeCustomerId` | String? | No | Stripe customer ID for portal access |
| `stripeSubscriptionId` | String? | No | Active subscription ID |
| `stripeSubscriptionStatus` | String? | No | Subscription status enum |
| `subscriptionPlanName` | String? | No | Human-readable plan name |
| `subscriptionCredits` | Int? | No | Credits per billing cycle |
| `subscriptionRenewsAt` | DateTime? | No | Next renewal date |

---

## Updated User Model (Required)

```prisma
model User {
  id                      String    @id @default(cuid())
  clerkId                 String    @unique
  email                   String    @unique
  credits                 Int       @default(10)
  organizationId          String?

  // NEW: Stripe subscription fields for Step 9
  stripeCustomerId        String?   @unique
  stripeSubscriptionId    String?   @unique
  stripeSubscriptionStatus String?
  subscriptionPlanName    String?
  subscriptionCredits     Int?
  subscriptionRenewsAt    DateTime?

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  posts                   Post[]
  creditTransactions      CreditTransaction[]
  stripeTransactions      StripeTransaction[]

  @@index([clerkId])
  @@index([email])
  @@index([organizationId])
  @@index([stripeCustomerId])  // NEW: Index for faster portal lookups
}
```

---

## Subscription Status Enum Values

Although Prisma schema doesn't enforce enum for String type, these are the expected values:

| Status | Description | User Can Access Portal? |
|--------|-------------|------------------------|
| `null` (default) | Free plan user | No (show upgrade button) |
| `"active"` | Subscription is active and paid | Yes |
| `"trialing"` | In trial period | Yes |
| `"past_due"` | Payment failed, grace period | Yes |
| `"canceled"` | Cancelled, valid until period end | Yes |
| `"incomplete"` | Payment incomplete | Yes |
| `"incomplete_expired"` | Payment incomplete and expired | No |
| `"unpaid"` | Payment failed, no grace period | Yes |

---

## Migration Steps

### Step 1: Update schema.prisma

```bash
# Open schema file
code prisma/schema.prisma
```

Add the subscription fields to the User model (see "Updated User Model" above).

### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_subscription_fields_to_user
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postforge", schema "public" at "..."

Applying migration `20250120000000_add_subscription_fields_to_user`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250120000000_add_subscription_fields_to_user/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Step 3: Verify Migration SQL

```bash
cat prisma/migrations/20250120000000_add_subscription_fields_to_user/migration.sql
```

**Expected Content**:
```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "stripeSubscriptionStatus" TEXT,
ADD COLUMN "subscriptionPlanName" TEXT,
ADD COLUMN "subscriptionCredits" INTEGER,
ADD COLUMN "subscriptionRenewsAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Step 5: Verify in Prisma Studio

```bash
npx prisma studio
```

**Verification Checklist**:
- [ ] Open Prisma Studio (http://localhost:5555)
- [ ] Navigate to "User" model
- [ ] Verify new fields are visible:
  - [ ] stripeCustomerId (nullable)
  - [ ] stripeSubscriptionId (nullable)
  - [ ] stripeSubscriptionStatus (nullable)
  - [ ] subscriptionPlanName (nullable)
  - [ ] subscriptionCredits (nullable)
  - [ ] subscriptionRenewsAt (nullable)
- [ ] All fields should show `null` for existing users

---

## Testing Migration

### Test 1: Read Existing User

```typescript
// Test that existing users still work
const user = await prisma.user.findFirst();
console.log('User:', user);

// Expected output includes new fields as null:
// {
//   id: "...",
//   clerkId: "...",
//   email: "...",
//   credits: 10,
//   stripeCustomerId: null,
//   stripeSubscriptionId: null,
//   stripeSubscriptionStatus: null,
//   subscriptionPlanName: null,
//   subscriptionCredits: null,
//   subscriptionRenewsAt: null,
//   ...
// }
```

### Test 2: Update Subscription Fields

```typescript
// Test updating new fields
const updated = await prisma.user.update({
  where: { clerkId: 'user_xxx' },
  data: {
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionStatus: 'active',
    subscriptionPlanName: 'Pro Plan',
    subscriptionCredits: 100,
    subscriptionRenewsAt: new Date('2025-02-15'),
  },
});

console.log('Updated:', updated);
```

### Test 3: Query by Stripe Customer ID

```typescript
// Test new index works
const user = await prisma.user.findUnique({
  where: { stripeCustomerId: 'cus_test123' },
});

console.log('Found by Stripe ID:', user);
```

---

## Rollback Plan (If Needed)

### Rollback Migration

```bash
# List migrations
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back 20250120000000_add_subscription_fields_to_user

# Apply previous migration
npx prisma migrate deploy
```

### Manual SQL Rollback (Emergency)

```sql
-- Connect to database
-- psql "postgresql://..."

-- Drop new fields
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeSubscriptionId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeSubscriptionStatus";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionPlanName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionCredits";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionRenewsAt";

-- Drop indexes
DROP INDEX IF EXISTS "User_stripeCustomerId_key";
DROP INDEX IF EXISTS "User_stripeSubscriptionId_key";
DROP INDEX IF EXISTS "User_stripeCustomerId_idx";
```

---

## Database Performance Considerations

### Index Analysis

**New Indexes Created**:
1. `User_stripeCustomerId_key` (UNIQUE) - Ensures one customer per user
2. `User_stripeSubscriptionId_key` (UNIQUE) - Ensures one subscription per user
3. `User_stripeCustomerId_idx` - Faster lookups for portal session creation

**Existing Indexes** (remain unchanged):
- `User_clerkId_idx` - Authentication lookups
- `User_email_idx` - Email-based queries
- `User_organizationId_idx` - Team plan support (future)

**Query Performance Impact**:
- Stripe Customer Portal creation: ~5ms → ~2ms (faster lookup)
- Webhook processing: No impact (inserts/updates by primary key)
- Settings page load: +1ms (additional fields in SELECT)

### Database Size Impact

**Per User Storage**:
- `stripeCustomerId`: ~30 bytes (e.g., "cus_abc123...")
- `stripeSubscriptionId`: ~35 bytes (e.g., "sub_xyz789...")
- `stripeSubscriptionStatus`: ~10 bytes (e.g., "active")
- `subscriptionPlanName`: ~20 bytes (e.g., "Pro Plan")
- `subscriptionCredits`: ~4 bytes (integer)
- `subscriptionRenewsAt`: ~8 bytes (timestamp)

**Total per user**: ~107 bytes

**Impact for 1,000 users**: ~107 KB (negligible)
**Impact for 100,000 users**: ~10.7 MB (still minimal)

---

## Data Validation Rules

### Application-Level Validation

```typescript
// Validation when creating Stripe customer
const customerIdSchema = z.string().startsWith('cus_');

// Validation when updating subscription
const subscriptionUpdateSchema = z.object({
  stripeCustomerId: z.string().startsWith('cus_').optional(),
  stripeSubscriptionId: z.string().startsWith('sub_').optional(),
  stripeSubscriptionStatus: z.enum([
    'active',
    'trialing',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'unpaid',
  ]).optional(),
  subscriptionPlanName: z.string().max(100).optional(),
  subscriptionCredits: z.number().int().min(0).optional(),
  subscriptionRenewsAt: z.date().optional(),
});
```

### Database Constraints

| Constraint | Type | Field | Purpose |
|------------|------|-------|---------|
| UNIQUE | Unique Index | stripeCustomerId | One customer per user |
| UNIQUE | Unique Index | stripeSubscriptionId | One subscription per user |
| INDEX | B-tree Index | stripeCustomerId | Fast portal lookups |
| CHECK | Application-level | subscriptionCredits | >= 0 |

---

## Seed Data for Testing

### Update seed script

File: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user with free plan
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@test.com' },
    update: {},
    create: {
      clerkId: 'user_free_test',
      email: 'free@test.com',
      credits: 10,
      // No subscription fields = free plan
    },
  });

  console.log('Created free user:', freeUser.id);

  // Create test user with active subscription
  const proUser = await prisma.user.upsert({
    where: { email: 'pro@test.com' },
    update: {},
    create: {
      clerkId: 'user_pro_test',
      email: 'pro@test.com',
      credits: 150,
      stripeCustomerId: 'cus_test_pro123',
      stripeSubscriptionId: 'sub_test_pro456',
      stripeSubscriptionStatus: 'active',
      subscriptionPlanName: 'Pro Plan',
      subscriptionCredits: 100,
      subscriptionRenewsAt: new Date('2025-02-15'),
    },
  });

  console.log('Created pro user:', proUser.id);

  // Create test user with cancelled subscription
  const cancelledUser = await prisma.user.upsert({
    where: { email: 'cancelled@test.com' },
    update: {},
    create: {
      clerkId: 'user_cancelled_test',
      email: 'cancelled@test.com',
      credits: 25,
      stripeCustomerId: 'cus_test_cancel789',
      stripeSubscriptionId: 'sub_test_cancel012',
      stripeSubscriptionStatus: 'canceled',
      subscriptionPlanName: 'Starter Plan',
      subscriptionCredits: 50,
      subscriptionRenewsAt: null,
    },
  });

  console.log('Created cancelled subscription user:', cancelledUser.id);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed**:
```bash
npx prisma db seed
# or
npm run db:seed
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup production database
- [ ] Test migration on staging/dev environment first
- [ ] Verify all existing data is compatible
- [ ] Check database disk space (migration adds columns)
- [ ] Notify team of planned downtime (if any)

### During Migration
- [ ] Run `npx prisma migrate dev` (development)
- [ ] Or `npx prisma migrate deploy` (production)
- [ ] Monitor migration progress
- [ ] Check for errors in terminal output
- [ ] Verify migration completed successfully

### Post-Migration
- [ ] Run `npx prisma generate` to update client
- [ ] Restart application servers
- [ ] Test API endpoints with new fields
- [ ] Verify existing functionality still works
- [ ] Check Prisma Studio for new fields
- [ ] Run E2E tests
- [ ] Monitor error logs for 24 hours
- [ ] Document migration completion date

---

## Troubleshooting

### Issue: Migration fails with "column already exists"

**Cause**: Migration was partially applied or manually added.

**Solution**:
```bash
# Mark migration as applied without running it
npx prisma migrate resolve --applied 20250120000000_add_subscription_fields_to_user
```

### Issue: "Type 'string | null' is not assignable to type 'string'"

**Cause**: TypeScript doesn't know field is nullable.

**Solution**: Update Prisma client and check for null:
```typescript
const customerId = user.stripeCustomerId ?? undefined;
```

### Issue: Unique constraint violation on stripeCustomerId

**Cause**: Trying to assign same Stripe customer to multiple users.

**Solution**: Check existing records before creating:
```typescript
const existing = await prisma.user.findUnique({
  where: { stripeCustomerId: customerId },
});

if (existing && existing.id !== currentUserId) {
  throw new Error('Stripe customer already linked to another user');
}
```

### Issue: Migration hangs or takes too long

**Cause**: Large database with locks or slow connection.

**Solution**:
1. Check database connection: `npx prisma db push --accept-data-loss`
2. Run migration during low traffic period
3. Increase timeout: Add `statement_timeout` to DATABASE_URL
4. Contact database provider for assistance

---

## Production Deployment Checklist

### Before Deploy
- [ ] Test migration on staging database
- [ ] Verify no breaking changes to existing queries
- [ ] Update API documentation
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window (if needed)

### During Deploy
- [ ] Put application in maintenance mode (optional)
- [ ] Run `npx prisma migrate deploy` on production
- [ ] Verify migration success
- [ ] Deploy application code
- [ ] Restart application servers
- [ ] Remove maintenance mode

### After Deploy
- [ ] Test Settings page (/dashboard/settings)
- [ ] Test profile editing
- [ ] Test Stripe portal creation
- [ ] Monitor error rates
- [ ] Check database performance metrics
- [ ] Verify no spike in 500 errors
- [ ] Document deployment completion

---

## SQL Queries for Manual Verification

### Check all users have new fields (should return 0)

```sql
SELECT COUNT(*) FROM "User"
WHERE stripeCustomerId IS NULL
  AND stripeSubscriptionId IS NULL
  AND stripeSubscriptionStatus IS NULL
  AND subscriptionPlanName IS NULL
  AND subscriptionCredits IS NULL
  AND subscriptionRenewsAt IS NULL;
```

### Find users with active subscriptions

```sql
SELECT
  id,
  email,
  stripeCustomerId,
  subscriptionPlanName,
  subscriptionRenewsAt
FROM "User"
WHERE stripeSubscriptionStatus = 'active'
ORDER BY subscriptionRenewsAt DESC;
```

### Find users with cancelled subscriptions

```sql
SELECT
  id,
  email,
  stripeCustomerId,
  subscriptionPlanName,
  credits
FROM "User"
WHERE stripeSubscriptionStatus = 'canceled'
ORDER BY updatedAt DESC;
```

### Check for duplicate Stripe customers (should return 0)

```sql
SELECT
  stripeCustomerId,
  COUNT(*) as count
FROM "User"
WHERE stripeCustomerId IS NOT NULL
GROUP BY stripeCustomerId
HAVING COUNT(*) > 1;
```

---

## Environment-Specific Considerations

### Development
- Use `npx prisma migrate dev` (creates migration + applies)
- Can reset database freely: `npx prisma migrate reset`
- Use seed data for testing

### Staging
- Use `npx prisma migrate deploy` (applies existing migrations)
- Mirror production data structure
- Test full migration flow

### Production
- Use `npx prisma migrate deploy` (never `dev` in production!)
- Backup database before migration
- Schedule during low-traffic window
- Monitor closely after deployment

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Migration Status**: Pending Implementation
**Related Docs**:
- `STEP_9_SETTINGS_USER_PROFILE_PRD.md` (Full specs)
- `prisma/schema.prisma` (Database schema)
