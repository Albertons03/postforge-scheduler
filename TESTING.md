# PostForge Database Testing Guide

## Overview
This document outlines the testing procedures for validating the database schema, migrations, and user synchronization flow in PostForge.

## Database Configuration

### Models
- **User**: Core user model synced with Clerk authentication
- **Post**: LinkedIn posts with AI-generated content
- **CreditTransaction**: Credit usage and purchase tracking

### Key Features
- **VARCHAR(500) limit** on Post.content for performance
- **Cascade delete** on all foreign keys for data integrity
- **Optimized indexes** on frequently queried fields
- **Organization support** for future team features

---

## Testing Checklist

### 1. Schema Validation
```bash
cd D:\ai-linkedIn-scheduler
npx prisma validate
```
**Expected**: "The schema at prisma\schema.prisma is valid"

### 2. Migration Status
```bash
npx prisma migrate status
```
**Expected**: "Database schema is up to date!"

### 3. Prisma Client Generation
```bash
npm run prisma:generate
```
**Expected**: "Generated Prisma Client (v6.19.0)"

### 4. TypeScript Type Safety
```bash
npx tsc --noEmit
```
**Expected**: No errors

### 5. Prisma Studio
```bash
npm run db:studio
```
**Expected**: Opens at http://localhost:5555
**Action**: Browse User, Post, CreditTransaction tables

### 6. Database Seeding
```bash
npm run db:seed
```
**Expected**:
- 1 test user created (test@postforge.ai)
- 2 test posts
- 3 test credit transactions

### 7. Relationship Testing
```bash
npx tsx scripts/test-relationships.ts
```
**Expected**: All 6 relationship tests pass
- User -> Posts (OneToMany)
- User -> CreditTransactions (OneToMany)
- Post -> User (ManyToOne)
- CreditTransaction -> User (ManyToOne)
- Cascade delete verification
- Index verification

---

## Manual Sign-up Flow Testing

### Prerequisites
1. Dev server running on port 3001
```bash
npm run dev
```

2. Prisma Studio open in another terminal
```bash
npm run db:studio
```

### Test Procedure

#### Step 1: Navigate to Sign-Up
1. Open browser: `http://localhost:3001/sign-up`
2. Clerk sign-up form should appear

#### Step 2: Create New User
1. Enter email: `testuser@example.com`
2. Enter password: `TestPassword123!`
3. Complete sign-up form
4. Click "Sign Up"

#### Step 3: Verify Clerk Webhook Trigger
1. Watch terminal logs for webhook POST request
2. Expected log: `POST /api/webhooks/clerk 200`
3. Check for user creation logs

#### Step 4: Verify Database Record
1. Go to Prisma Studio (http://localhost:5555)
2. Click on "User" table
3. Verify new user record exists:
   - **email**: testuser@example.com
   - **clerkId**: starts with "user_"
   - **credits**: 10
   - **organizationId**: null
   - **createdAt**: recent timestamp

#### Step 5: Verify Dashboard Redirect
1. After sign-up, should redirect to `/dashboard`
2. User should be logged in
3. Credits should display: 10

### Expected Results
- ✅ User created in Clerk
- ✅ Webhook triggered successfully
- ✅ User record in database
- ✅ Initial credits = 10
- ✅ organizationId = null
- ✅ Redirect to dashboard
- ✅ User authenticated

### Troubleshooting

#### Webhook Not Triggering
- Check Clerk Dashboard webhook configuration
- Verify CLERK_WEBHOOK_SECRET in .env
- Check webhook endpoint: /api/webhooks/clerk
- Review terminal logs for errors

#### User Not Created in Database
- Check Prisma connection: `npm run db:studio`
- Verify DATABASE_URL in .env
- Check webhook handler logic
- Review error logs

#### Credits Not Initialized
- Verify User model default: `credits Int @default(10)`
- Check seed data
- Regenerate Prisma Client: `npm run prisma:generate`

---

## Database Scripts

### Check Database State
```bash
npx tsx scripts/check-db.ts
```
Shows:
- User count and details
- Post count
- Credit transaction count

### Test Relationships
```bash
npx tsx scripts/test-relationships.ts
```
Comprehensive relationship validation

### Seed Database
```bash
npm run db:seed
```
Creates test data for development

### Reset Database (CAUTION: Deletes All Data)
```bash
npx prisma migrate reset
```
Use only in development!

---

## Migration History

### 0_init
- Initial schema baseline
- User, Post, CreditTransaction tables
- All indexes and foreign keys

### 20251203171537_add_schema_optimizations
- Post.content VARCHAR(500) limit
- Added Post.status index
- Added CreditTransaction.type index

---

## Schema Optimizations Applied

### Post Model
- ✅ Content limited to 500 characters (VARCHAR(500))
- ✅ Status index for filtering drafts/published
- ✅ CreatedAt index for chronological queries
- ✅ UserId index for user-specific queries

### CreditTransaction Model
- ✅ Type index for transaction filtering
- ✅ CreatedAt index for transaction history
- ✅ UserId index for user transactions
- ✅ Amount validation enforced in application logic (MIN 1)

### User Model
- ✅ ClerkId unique index for auth lookups
- ✅ Email unique index for user queries
- ✅ OrganizationId index for team features
- ✅ All relations properly configured

---

## Next Steps

### After Step 3 Completion:
1. Test actual Clerk sign-up flow manually
2. Verify webhook integration in production-like env
3. Test organization assignment (when implemented)
4. Implement credit deduction logic
5. Add post generation with credit check
6. Set up Stripe integration for credit purchases

### Production Readiness:
- [ ] Add database connection pooling
- [ ] Set up database backups
- [ ] Configure read replicas (if needed)
- [ ] Add database monitoring
- [ ] Set up error tracking for failed webhooks
- [ ] Add rate limiting for credit operations
- [ ] Implement credit refund logic

---

## Support

For issues or questions:
1. Check terminal logs
2. Review Prisma Studio for data state
3. Verify .env configuration
4. Check Clerk Dashboard webhook logs
5. Run relationship tests: `npx tsx scripts/test-relationships.ts`

---

**Last Updated**: 2025-12-03
**Database Version**: PostgreSQL (Supabase)
**Prisma Version**: 6.19.0
