# Step 9: Settings & User Profile - Technical Requirements Document

## Executive Summary

This document outlines the complete technical specifications for implementing a production-ready Settings & User Profile page for the PostForge AI LinkedIn Scheduler. The implementation will provide users with comprehensive account management capabilities, including profile editing, billing management, usage tracking, and account operations.

### Project Context
- **Application**: PostForge - AI Social Media Scheduler
- **Current Phase**: Step 9 of MVP development
- **Previous Steps Completed**: Authentication (Clerk), Database (Prisma), AI Integration (Claude), Credit System, Stripe Payments, UI/UX Polish
- **Technology Stack**: Next.js 16 + Turbopack, React 19, TypeScript, Tailwind CSS 3.4.17, Prisma ORM, PostgreSQL, Clerk Auth, Stripe Payments

### Business Objectives
1. Enable users to manage their profile and account settings independently
2. Provide transparent visibility into credit usage and billing information
3. Streamline billing operations through Stripe Customer Portal integration
4. Ensure data privacy and security with proper account deletion workflows
5. Enhance user trust through transparent data handling

---

## User Personas

### Primary Persona: Sarah - Content Marketing Manager
- **Age**: 32
- **Role**: Marketing professional managing LinkedIn presence for her company
- **Technical Comfort**: Medium (familiar with SaaS tools, not a developer)
- **Goals**:
  - Update profile information when email changes
  - Monitor credit usage to stay within budget
  - Upgrade subscription when needed
  - Download data for compliance purposes
- **Pain Points**:
  - Needs quick access to billing information
  - Wants transparency on credit consumption
  - Requires easy upgrade path without contacting support
  - Concerned about data privacy and account security

### Secondary Persona: Mike - Freelance LinkedIn Consultant
- **Age**: 28
- **Role**: Freelancer managing multiple client accounts
- **Technical Comfort**: High (comfortable with APIs and technical tools)
- **Goals**:
  - Track detailed credit history for client billing
  - Manage subscription efficiently
  - Understand usage patterns to optimize costs
- **Pain Points**:
  - Needs granular transaction history
  - Wants to pause/cancel subscription easily
  - Requires clear visibility into remaining credits

---

## User Stories & Acceptance Criteria

### Epic 1: Profile Management

#### US-1.1: View Profile Information
**Story**: As a user, I want to view my profile information (name, email, avatar) so that I can verify my account details are correct.

**Acceptance Criteria**:
- Given I am logged in
- When I navigate to /dashboard/settings
- Then I see my current profile information including:
  - Profile picture from Clerk
  - Full name
  - Email address
  - Account creation date
- And all information is loaded from Clerk authentication provider
- And loading states are displayed while fetching data

**Technical Requirements**:
- Use Clerk's `useUser()` hook for client-side data
- Use `auth()` and `currentUser()` for server-side data
- Display avatar with fallback to initials
- Show creation date in user-friendly format (e.g., "Member since January 2025")

#### US-1.2: Edit Profile Information
**Story**: As a user, I want to edit my profile name so that I can keep my account information up to date.

**Acceptance Criteria**:
- Given I am on the settings page
- When I click "Edit Profile" button
- Then a form appears with editable fields for:
  - First name
  - Last name (optional)
- And I can save changes via "Save" button
- And I can cancel changes via "Cancel" button
- When I save valid changes
- Then the profile updates in both Clerk and Prisma database
- And I see a success toast notification
- And the form returns to read-only mode
- When I submit invalid data (e.g., empty name)
- Then I see inline validation errors
- And the form does not submit

**Technical Requirements**:
- Form validation using Zod schema
- API endpoint: `PUT /api/user/profile`
- Update Clerk user metadata via Clerk API
- Update Prisma User record (keep email synced)
- Optimistic UI updates with rollback on error
- Error handling for network failures

**Validation Rules**:
```typescript
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
});
```

---

### Epic 2: Billing Management

#### US-2.1: View Subscription Status
**Story**: As a user, I want to see my current subscription status so that I know if I have an active paid plan.

**Acceptance Criteria**:
- Given I am on the settings page
- When I view the Billing section
- Then I see my subscription status:
  - "Free Plan" if no active subscription
  - "Pro Plan - Active" if subscription is active
  - "Pro Plan - Cancelled" if subscription is cancelled but still valid
  - "Pro Plan - Expired" if subscription has expired
- And I see the next billing date (if applicable)
- And I see the subscription amount

**Technical Requirements**:
- Query User model for Stripe subscription fields:
  - `stripeCustomerId`
  - `stripeSubscriptionId`
  - `stripeSubscriptionStatus`
- Fetch subscription details from Stripe API (cached, not on every page load)
- Display subscription tier based on credit package purchased

**Database Schema Enhancement Needed**:
```prisma
model User {
  id                      String   @id @default(cuid())
  clerkId                 String   @unique
  email                   String   @unique
  credits                 Int      @default(10)
  organizationId          String?

  // Add these fields for subscription tracking
  stripeCustomerId        String?  @unique
  stripeSubscriptionId    String?  @unique
  stripeSubscriptionStatus String? // "active", "canceled", "past_due", "trialing"
  subscriptionPlanName    String?  // "Starter", "Popular", "Pro"
  subscriptionCredits     Int?     // Credits per billing cycle
  subscriptionRenewsAt    DateTime?

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  posts                   Post[]
  creditTransactions      CreditTransaction[]
  stripeTransactions      StripeTransaction[]

  @@index([clerkId])
  @@index([email])
  @@index([stripeCustomerId])
}
```

#### US-2.2: Upgrade Subscription
**Story**: As a free user, I want to upgrade to a paid plan so that I can get more credits.

**Acceptance Criteria**:
- Given I am on a free plan
- When I click "Upgrade Plan" button in Billing section
- Then I am redirected to the credit purchase page (/dashboard/credits/purchase)
- And I can select a credit package
- And I complete the Stripe checkout flow
- When payment succeeds
- Then my subscription status updates
- And I return to settings page
- And I see updated subscription information

**Technical Requirements**:
- Reuse existing Stripe checkout integration
- Redirect to `/dashboard/credits/purchase` with UTM tracking
- Handle Stripe webhook to update subscription status
- Update User model fields after successful payment

#### US-2.3: Manage Subscription via Stripe Portal
**Story**: As a paid user, I want to manage my subscription (update payment method, cancel, download invoices) so that I have full control over my billing.

**Acceptance Criteria**:
- Given I have an active subscription
- When I click "Manage Subscription" button
- Then I am redirected to Stripe Customer Portal
- And I can perform actions:
  - Update payment method
  - View billing history
  - Download invoices
  - Cancel subscription
  - Resume cancelled subscription
- When I complete actions in Stripe Portal
- Then I return to settings page
- And changes are reflected via webhooks

**Technical Requirements**:
- Create API endpoint: `POST /api/stripe/create-portal-session`
- Generate Stripe Customer Portal session
- Configure portal settings in Stripe Dashboard:
  - Allow subscription cancellation
  - Allow payment method updates
  - Show invoice history
- Handle subscription webhooks:
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**API Endpoint Specification**:
```typescript
// POST /api/stripe/create-portal-session
Request: {}
Response: {
  url: string; // Stripe Customer Portal URL
}
```

---

### Epic 3: Usage & Credit History

#### US-3.1: View Credit Summary
**Story**: As a user, I want to see a summary of my credit usage so that I understand how I'm consuming credits.

**Acceptance Criteria**:
- Given I am on the settings page
- When I view the Usage section
- Then I see:
  - Current credit balance (large, prominent)
  - Total credits purchased (all-time)
  - Total credits spent (all-time)
  - Credits spent this month
  - Average credits spent per day (last 30 days)
- And the data is accurate and up-to-date
- And visual indicators show if balance is low (<5 credits)

**Technical Requirements**:
- Reuse existing `/api/credits/summary` endpoint
- Display data in card-based layout with icons
- Use color coding:
  - Green (>20 credits): Healthy
  - Amber (5-20 credits): Medium
  - Red (<5 credits): Low - action needed
- Consistent with existing CreditOverview component design

#### US-3.2: View Credit Transaction History
**Story**: As a user, I want to see a detailed history of all my credit transactions so that I can audit my usage.

**Acceptance Criteria**:
- Given I am on the settings page
- When I view the Credit History table
- Then I see a paginated table with columns:
  - Date/Time (formatted)
  - Type (Generation, Purchase, Refund, Bonus)
  - Amount (+/- credits)
  - Description
  - Balance After
- And transactions are sorted by date (newest first)
- And I can filter by transaction type (dropdown)
- And I can search by description (search input)
- And I can paginate through results (10 per page default)
- And I see a loading skeleton while data loads

**Technical Requirements**:
- Reuse existing `/api/credits/transactions` endpoint
- Implement client-side filtering and search
- Use shadcn/ui Table component
- Add pagination controls (Previous/Next buttons)
- Format dates with date-fns library
- Show transaction type badges with color coding:
  - Generation: Blue
  - Purchase: Green
  - Refund: Orange
  - Bonus: Purple

**API Response Format**:
```typescript
GET /api/credits/transactions?page=1&limit=10&type=all&search=
Response: {
  success: boolean;
  data: {
    transactions: Array<{
      id: string;
      amount: number;
      type: string;
      description: string;
      balanceAfter: number;
      createdAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
```

---

### Epic 4: Account Operations

#### US-4.1: Logout
**Story**: As a user, I want to log out of my account so that I can securely end my session.

**Acceptance Criteria**:
- Given I am on the settings page
- When I click "Logout" button
- Then I am immediately logged out via Clerk
- And I am redirected to the home page
- And my session is cleared
- And I cannot access protected routes without logging in again

**Technical Requirements**:
- Use Clerk's `SignOutButton` component
- Configure `afterSignOutUrl="/"` redirect
- Clear any client-side cached data
- No server-side API call needed (Clerk handles this)

#### US-4.2: Delete Account
**Story**: As a user, I want to delete my account so that I can remove all my data from the platform.

**Acceptance Criteria**:
- Given I am on the settings page
- When I click "Delete Account" button
- Then I see a confirmation dialog with warnings:
  - "This action cannot be undone"
  - "All your posts, credits, and data will be permanently deleted"
  - "You will lose access immediately"
- And I must type "DELETE" to confirm
- When I confirm deletion
- Then my Clerk account is deleted
- And my Prisma database records are cascade deleted
- And I am redirected to home page
- And I see a farewell message

**Technical Requirements**:
- Create API endpoint: `DELETE /api/user/account`
- Implement two-phase deletion:
  1. Delete Clerk user via Clerk API
  2. Clerk webhook triggers Prisma cascade delete
- Use Dialog component for confirmation
- Require typing "DELETE" exactly (case-sensitive)
- Handle errors gracefully (e.g., if Clerk deletion fails)
- Log deletion events for audit trail

**Confirmation Dialog Flow**:
```
1. User clicks "Delete Account"
2. Dialog opens with warning text
3. User must type "DELETE" in input field
4. "Confirm Delete" button only enables when input matches
5. On confirm:
   - Show loading state
   - Call DELETE /api/user/account
   - On success: redirect to home with toast
   - On error: show error message, close dialog
```

**API Endpoint Specification**:
```typescript
// DELETE /api/user/account
Request: {
  confirmationText: "DELETE";
}
Response: {
  success: boolean;
  message: string;
}
```

**Cascade Deletion Verification**:
- Prisma schema already has `onDelete: Cascade` on all relations
- Deletion of User will automatically delete:
  - Posts
  - CreditTransactions
  - StripeTransactions
- Test cascade deletion in development environment

---

## Technical Architecture

### Component Hierarchy

```
app/dashboard/settings/page.tsx (Server Component)
├── Profile Section (Client Component)
│   ├── Avatar (Clerk component)
│   ├── ProfileInfo (read-only)
│   └── EditProfileForm (Dialog)
│       ├── Input (firstName)
│       ├── Input (lastName)
│       └── Actions (Save/Cancel)
│
├── Billing Section (Client Component)
│   ├── SubscriptionStatus Card
│   │   ├── Badge (status indicator)
│   │   ├── Text (plan details)
│   │   └── NextBillingDate
│   ├── Button (Upgrade Plan) → /dashboard/credits/purchase
│   └── Button (Manage Subscription) → Stripe Portal
│
├── Usage Section (Client Component)
│   ├── CreditSummary Cards (reuse CreditOverview style)
│   │   ├── StatCard (Current Balance - Hero variant)
│   │   ├── StatCard (Total Purchased)
│   │   ├── StatCard (Total Spent)
│   │   └── StatCard (This Month Usage)
│   └── CreditHistoryTable
│       ├── Filters (Type dropdown, Search input)
│       ├── Table (shadcn/ui)
│       │   ├── TableHeader
│       │   ├── TableBody
│       │   │   └── TableRow[] (transactions)
│       │   └── EmptyState (if no transactions)
│       └── Pagination (Previous/Next)
│
└── Account Section (Client Component)
    ├── Button (Logout) → Clerk SignOutButton
    └── Button (Delete Account) → DeleteAccountDialog
        ├── DialogHeader (warning title)
        ├── DialogContent (warning text)
        ├── Input (type "DELETE" to confirm)
        └── DialogFooter (Cancel/Confirm Delete)
```

### File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── settings/
│   │       └── page.tsx (NEW - main settings page)
│   └── api/
│       ├── user/
│       │   ├── profile/
│       │   │   └── route.ts (NEW - GET/PUT profile)
│       │   └── account/
│       │       └── route.ts (NEW - DELETE account)
│       └── stripe/
│           └── create-portal-session/
│               └── route.ts (NEW - create Stripe portal)
│
├── components/
│   ├── settings/
│   │   ├── ProfileSection.tsx (NEW)
│   │   ├── EditProfileDialog.tsx (NEW)
│   │   ├── BillingSection.tsx (NEW)
│   │   ├── UsageSection.tsx (NEW)
│   │   ├── CreditHistoryTable.tsx (NEW)
│   │   ├── AccountSection.tsx (NEW)
│   │   └── DeleteAccountDialog.tsx (NEW)
│   └── ui/
│       ├── card.tsx (NEW - from shadcn)
│       ├── form.tsx (NEW - from shadcn)
│       ├── input.tsx (NEW - from shadcn)
│       ├── label.tsx (NEW - from shadcn)
│       ├── select.tsx (NEW - from shadcn)
│       ├── separator.tsx (NEW - from shadcn)
│       ├── avatar.tsx (NEW - from shadcn)
│       ├── badge.tsx (EXISTS)
│       ├── button.tsx (EXISTS)
│       ├── dialog.tsx (EXISTS)
│       └── table.tsx (EXISTS)
│
├── lib/
│   ├── stripe/
│   │   ├── client.ts (EXISTS)
│   │   └── customer-portal.ts (NEW - portal utilities)
│   ├── validations/
│   │   └── user.ts (NEW - Zod schemas)
│   └── utils/
│       └── date-formatter.ts (NEW - date utilities)
│
└── types/
    ├── user.ts (NEW)
    └── settings.ts (NEW)
```

---

## Database Schema Review & Migration

### Current User Model (from schema.prisma)
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

### Required Schema Additions

**Missing Fields for Step 9**:
1. `stripeCustomerId` - Stripe customer ID for portal access
2. `stripeSubscriptionId` - Active subscription ID
3. `stripeSubscriptionStatus` - Subscription status enum
4. `subscriptionPlanName` - Human-readable plan name
5. `subscriptionCredits` - Credits per billing cycle
6. `subscriptionRenewsAt` - Next renewal date

### Migration File: `add_subscription_fields_to_user.sql`

```prisma
-- Migration: Add subscription tracking fields
-- Date: 2025-01-XX
-- Step 9: Settings & User Profile

-- Add subscription-related fields to User model
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionPlanName" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionCredits" INTEGER;
ALTER TABLE "User" ADD COLUMN "subscriptionRenewsAt" TIMESTAMP(3);

-- Add unique constraints
ALTER TABLE "User" ADD CONSTRAINT "User_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
ALTER TABLE "User" ADD CONSTRAINT "User_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");

-- Add index for stripe customer lookups (faster portal access)
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
```

### Updated User Model (Final)

```prisma
model User {
  id                      String    @id @default(cuid())
  clerkId                 String    @unique
  email                   String    @unique
  credits                 Int       @default(10)
  organizationId          String?

  // Stripe subscription fields
  stripeCustomerId        String?   @unique
  stripeSubscriptionId    String?   @unique
  stripeSubscriptionStatus String? // "active", "canceled", "past_due", "trialing", "incomplete"
  subscriptionPlanName    String?   // "Starter", "Popular", "Pro"
  subscriptionCredits     Int?      // Credits per billing cycle
  subscriptionRenewsAt    DateTime?

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  posts                   Post[]
  creditTransactions      CreditTransaction[]
  stripeTransactions      StripeTransaction[]

  @@index([clerkId])
  @@index([email])
  @@index([organizationId])
  @@index([stripeCustomerId])
}
```

### Migration Execution Steps
```bash
# 1. Create migration
npx prisma migrate dev --name add_subscription_fields_to_user

# 2. Generate Prisma Client
npx prisma generate

# 3. Verify migration in Prisma Studio
npx prisma studio
```

---

## API Endpoint Specifications

### 1. GET /api/user/profile

**Purpose**: Fetch user profile information and credits

**Authentication**: Required (Clerk)

**Request**:
```typescript
GET /api/user/profile
Headers: {
  Cookie: "clerk_session=..."
}
```

**Response** (Success):
```typescript
{
  success: true,
  data: {
    profile: {
      id: string;
      clerkId: string;
      email: string;
      firstName: string;
      lastName: string;
      imageUrl: string;
      createdAt: string; // ISO 8601
    },
    credits: {
      currentBalance: number;
      totalPurchased: number;
      totalSpent: number;
      spentThisMonth: number;
    },
    subscription: {
      status: "free" | "active" | "canceled" | "past_due";
      planName: string | null;
      renewsAt: string | null; // ISO 8601
      customerId: string | null;
    }
  }
}
```

**Response** (Error):
```typescript
{
  success: false,
  error: "Error message",
  code: "UNAUTHORIZED" | "NOT_FOUND" | "SERVER_ERROR"
}
```

**Implementation Details**:
```typescript
// src/app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getUserCreditsInfo } from '@/lib/credits';

export async function GET() {
  try {
    // 1. Authenticate with Clerk
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkId || !clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Fetch user from database with subscription info
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        credits: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        subscriptionPlanName: true,
        subscriptionRenewsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 3. Get credit information
    const creditsInfo = await getUserCreditsInfo(user.id);

    // 4. Combine Clerk and Prisma data
    const response = {
      success: true,
      data: {
        profile: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          imageUrl: clerkUser.imageUrl,
          createdAt: user.createdAt.toISOString(),
        },
        credits: {
          currentBalance: creditsInfo?.currentCredits || 0,
          totalPurchased: creditsInfo?.totalPurchased || 0,
          totalSpent: creditsInfo?.totalSpent || 0,
          spentThisMonth: 0, // Calculated separately
        },
        subscription: {
          status: user.stripeSubscriptionStatus || 'free',
          planName: user.subscriptionPlanName,
          renewsAt: user.subscriptionRenewsAt?.toISOString() || null,
          customerId: user.stripeCustomerId,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

---

### 2. PUT /api/user/profile

**Purpose**: Update user profile information

**Authentication**: Required (Clerk)

**Request**:
```typescript
PUT /api/user/profile
Headers: {
  Cookie: "clerk_session=...",
  Content-Type: "application/json"
}
Body: {
  firstName: string;
  lastName?: string;
}
```

**Validation Schema**:
```typescript
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional()
    .nullable(),
});
```

**Response** (Success):
```typescript
{
  success: true,
  data: {
    firstName: string;
    lastName: string | null;
  },
  message: "Profile updated successfully"
}
```

**Response** (Validation Error):
```typescript
{
  success: false,
  error: "Validation error",
  code: "VALIDATION_ERROR",
  errors: {
    firstName?: string[];
    lastName?: string[];
  }
}
```

**Implementation Details**:
```typescript
// src/app/api/user/profile/route.ts (PUT method)
export async function PUT(request: Request) {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName } = validation.data;

    // 3. Update Clerk user
    const { clerkClient } = await import('@clerk/nextjs/server');
    await clerkClient.users.updateUser(clerkId, {
      firstName,
      lastName: lastName || undefined,
    });

    // 4. Verify user exists in Prisma (no update needed, Clerk is source of truth)
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      data: { firstName, lastName },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[API] Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

---

### 3. DELETE /api/user/account

**Purpose**: Permanently delete user account and all associated data

**Authentication**: Required (Clerk)

**Request**:
```typescript
DELETE /api/user/account
Headers: {
  Cookie: "clerk_session=...",
  Content-Type: "application/json"
}
Body: {
  confirmationText: "DELETE"; // Must be exactly "DELETE"
}
```

**Response** (Success):
```typescript
{
  success: true,
  message: "Account deleted successfully"
}
```

**Response** (Error):
```typescript
{
  success: false,
  error: "Error message",
  code: "UNAUTHORIZED" | "INVALID_CONFIRMATION" | "SERVER_ERROR"
}
```

**Implementation Details**:
```typescript
// src/app/api/user/account/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Verify confirmation text
    const body = await request.json();
    if (body.confirmationText !== 'DELETE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid confirmation text. Please type DELETE to confirm.',
          code: 'INVALID_CONFIRMATION',
        },
        { status: 400 }
      );
    }

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 4. Delete from Clerk first (will trigger webhook to delete from Prisma)
    const { clerkClient } = await import('@clerk/nextjs/server');
    await clerkClient.users.deleteUser(clerkId);

    // 5. Log deletion event for audit
    console.log(`[AUDIT] User account deleted: ${user.email} (${user.id})`);

    // Note: Prisma deletion will happen via Clerk webhook (user.deleted event)
    // The webhook handler already has cascade deletion logic

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting user account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

**Security Considerations**:
- Rate limit this endpoint (max 3 attempts per hour)
- Log all deletion attempts for audit trail
- Send confirmation email before deletion (optional)
- Implement soft delete option for 30-day grace period (future enhancement)

---

### 4. POST /api/stripe/create-portal-session

**Purpose**: Generate Stripe Customer Portal session URL

**Authentication**: Required (Clerk)

**Request**:
```typescript
POST /api/stripe/create-portal-session
Headers: {
  Cookie: "clerk_session=...",
  Content-Type: "application/json"
}
Body: {} // No body required
```

**Response** (Success):
```typescript
{
  success: true,
  url: string; // Stripe Customer Portal URL
}
```

**Response** (Error):
```typescript
{
  success: false,
  error: "Error message",
  code: "UNAUTHORIZED" | "NO_CUSTOMER" | "STRIPE_ERROR" | "SERVER_ERROR"
}
```

**Implementation Details**:
```typescript
// src/app/api/stripe/create-portal-session/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 3. Check if user has Stripe customer ID
    let customerId = user.stripeCustomerId;

    // 4. If no customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: clerkId,
        },
      });

      customerId = customer.id;

      // Update user with new customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });

      console.log(`[Stripe] Created customer for user ${user.id}: ${customerId}`);
    }

    // 5. Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const returnUrl = `${appUrl}/dashboard/settings?portal_return=true`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`[Stripe] Portal session created for customer ${customerId}`);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe API] Error creating portal session:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as any;
      return NextResponse.json(
        {
          success: false,
          error: `Stripe error: ${stripeError.message}`,
          code: 'STRIPE_ERROR',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

**Stripe Customer Portal Configuration** (via Stripe Dashboard):
- Navigate to: Settings → Billing → Customer Portal
- Enable features:
  - ✅ Allow customers to update payment methods
  - ✅ Allow customers to cancel subscriptions
  - ✅ Allow customers to view billing history
  - ✅ Allow customers to update billing information
- Cancellation behavior: Cancel at end of billing period (recommended)
- Branding: Upload logo and set brand colors

---

## shadcn/ui Components Installation

### Components Already Installed
- ✅ `button.tsx`
- ✅ `badge.tsx`
- ✅ `table.tsx`
- ✅ `dialog.tsx`
- ✅ `textarea.tsx`

### Components to Install

Run these commands sequentially:

```bash
# 1. Card component (for section containers)
npx shadcn@latest add card

# 2. Form components (for profile editing)
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label

# 3. Select component (for filtering)
npx shadcn@latest add select

# 4. Separator component (visual dividers)
npx shadcn@latest add separator

# 5. Avatar component (profile picture)
npx shadcn@latest add avatar

# 6. Skeleton component (loading states)
npx shadcn@latest add skeleton
```

**Note**: If shadcn CLI has issues, manually copy component files from shadcn/ui documentation.

### Verification Script

```bash
# Check if all required components exist
ls -la src/components/ui/card.tsx
ls -la src/components/ui/form.tsx
ls -la src/components/ui/input.tsx
ls -la src/components/ui/label.tsx
ls -la src/components/ui/select.tsx
ls -la src/components/ui/separator.tsx
ls -la src/components/ui/avatar.tsx
ls -la src/components/ui/skeleton.tsx
```

---

## Styling Guidelines (Tailwind CSS 3.4.17)

### Color Palette (Dark Theme Consistency)

**Background Colors**:
- Primary background: `bg-slate-950` or `bg-gray-900`
- Card backgrounds: `bg-slate-900` or `bg-gray-800`
- Elevated cards: `bg-slate-800` with `border-slate-700/50`

**Text Colors**:
- Primary text: `text-white` or `text-gray-50`
- Secondary text: `text-gray-400` or `text-gray-300`
- Muted text: `text-gray-500`

**Accent Colors**:
- Primary action: `bg-indigo-600 hover:bg-indigo-700`
- Success: `bg-emerald-600 hover:bg-emerald-700`
- Warning: `bg-amber-600 hover:bg-amber-700`
- Danger: `bg-red-600 hover:bg-red-700`

**Gradients** (consistent with existing dashboard):
```css
/* Page background */
bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950

/* Card backgrounds */
bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900

/* Accent gradients */
bg-gradient-to-r from-indigo-600 to-purple-600
```

### Component Styling Patterns

**Section Cards**:
```tsx
<div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 shadow-card-lg">
  {/* Content */}
</div>
```

**Hover Effects**:
```tsx
<button className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-indigo-lg">
  {/* Button content */}
</button>
```

**Loading States**:
```tsx
<div className="animate-pulse bg-slate-800/50 rounded-lg h-20" />
```

### Responsive Spacing

**Container Padding**:
```tsx
<div className="px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

**Section Spacing**:
```tsx
<div className="space-y-6 md:space-y-8">
  {/* Sections */}
</div>
```

**Grid Layouts**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards */}
</div>
```

---

## Integration Points

### 1. Clerk Authentication Integration

**Client-Side Hook**:
```typescript
import { useUser } from '@clerk/nextjs';

function ProfileSection() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Skeleton />;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <img src={user.imageUrl} alt={user.fullName} />
      <p>{user.firstName} {user.lastName}</p>
      <p>{user.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

**Server-Side Auth**:
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return <div>{/* Page content */}</div>;
}
```

**Update User**:
```typescript
import { clerkClient } from '@clerk/nextjs/server';

await clerkClient.users.updateUser(userId, {
  firstName: 'John',
  lastName: 'Doe',
});
```

### 2. Prisma ORM Integration

**Reuse Existing Prisma Client**:
```typescript
import { prisma } from '@/lib/prisma';

const user = await prisma.user.findUnique({
  where: { clerkId },
  include: {
    creditTransactions: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

**Transaction Safety**:
```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations in atomic transaction
  await tx.user.update({ where: { id }, data: { ... } });
  await tx.creditTransaction.create({ data: { ... } });
});
```

### 3. Stripe Integration

**Reuse Existing Stripe Client**:
```typescript
import { stripe } from '@/lib/stripe/client';

// Create portal session
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: returnUrl,
});
```

**Webhook Handling**:
The existing Stripe webhook handler (`/api/stripe/webhook/route.ts`) needs to be enhanced to handle subscription events:

```typescript
// Add to existing webhook handler
switch (event.type) {
  case 'customer.subscription.updated':
    const subscription = event.data.object;
    await prisma.user.update({
      where: { stripeCustomerId: subscription.customer },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        subscriptionRenewsAt: new Date(subscription.current_period_end * 1000),
      },
    });
    break;

  case 'customer.subscription.deleted':
    const deletedSub = event.data.object;
    await prisma.user.update({
      where: { stripeCustomerId: deletedSub.customer },
      data: {
        stripeSubscriptionId: null,
        stripeSubscriptionStatus: 'canceled',
        subscriptionRenewsAt: null,
      },
    });
    break;
}
```

### 4. Existing Credit System Integration

**Fetch Credit Summary**:
```typescript
import { getUserCreditsInfo } from '@/lib/credits';

const creditsInfo = await getUserCreditsInfo(userId);
// Returns: { userId, currentCredits, totalSpent, totalPurchased }
```

**Fetch Transaction History**:
```typescript
import { getTransactionHistory } from '@/lib/credits';

const history = await getTransactionHistory(userId, {
  limit: 10,
  page: 1,
  type: 'all',
  search: '',
});
// Returns: { transactions: [], pagination: { total, page, limit, totalPages } }
```

---

## Error Handling & Loading States

### Loading State Patterns

**Skeleton Screens**:
```tsx
// ProfileSection loading state
function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
```

**Spinner for Actions**:
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### Error Handling Patterns

**Toast Notifications** (using existing sonner):
```typescript
import { toast } from 'sonner';

// Success
toast.success('Profile updated successfully!');

// Error
toast.error('Failed to update profile. Please try again.');

// Loading
const toastId = toast.loading('Updating profile...');
// Later: toast.success('Done!', { id: toastId });
```

**Error Boundaries**:
```tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Settings page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-4">
        Something went wrong!
      </h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}
```

**Inline Validation Errors**:
```tsx
{errors.firstName && (
  <p className="text-sm text-red-500 mt-1">
    {errors.firstName[0]}
  </p>
)}
```

---

## Success Metrics & KPIs

### User Engagement Metrics
1. **Settings Page Visit Rate**: % of active users who visit settings page within first 7 days
   - Target: >60% of new users

2. **Profile Completion Rate**: % of users who update their profile information
   - Target: >40% of users who visit settings

3. **Subscription Management Rate**: % of paid users who access Stripe Portal
   - Target: >25% within 30 days of subscription

### Business Metrics
1. **Upgrade Conversion**: % of free users who upgrade after visiting billing section
   - Target: 5-10% conversion rate

2. **Churn Reduction**: Change in cancellation rate after portal access
   - Target: <5% monthly churn for paid users

3. **Support Ticket Reduction**: Decrease in billing/account-related support tickets
   - Target: 30% reduction in first month after launch

### Technical Metrics
1. **API Response Time**: Average latency for settings API endpoints
   - Target: <300ms for GET requests, <500ms for PUT/DELETE

2. **Error Rate**: % of failed API requests
   - Target: <1% error rate

3. **Page Load Time**: Time to interactive for settings page
   - Target: <2 seconds on 3G connection

### Monitoring Implementation
```typescript
// Add to API endpoints
console.time('api_user_profile_get');
// ... API logic
console.timeEnd('api_user_profile_get');

// Log key events
analytics.track('settings_page_viewed', { userId });
analytics.track('profile_updated', { userId, fields: ['firstName', 'lastName'] });
analytics.track('subscription_portal_opened', { userId });
analytics.track('account_deleted', { userId, reason: 'user_initiated' });
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Example: ProfileSection Component**
```typescript
// __tests__/components/settings/ProfileSection.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSection from '@/components/settings/ProfileSection';

describe('ProfileSection', () => {
  it('renders user information correctly', () => {
    render(<ProfileSection />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it('opens edit dialog when edit button clicked', async () => {
    render(<ProfileSection />);
    const editButton = screen.getByRole('button', { name: /edit profile/i });

    await userEvent.click(editButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });
});
```

### Integration Tests (Playwright E2E)

**Test File**: `tests/e2e/settings.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Settings & User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/sign-in');
    await page.fill('input[name="identifier"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Verify profile section is visible
    await expect(page.locator('h2:has-text("Profile")')).toBeVisible();

    // Verify user email is displayed
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('should edit profile name successfully', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Wait for dialog to open
    await expect(page.locator('role=dialog')).toBeVisible();

    // Update name
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');

    // Save changes
    await page.click('button:has-text("Save")');

    // Verify success toast
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Verify name updated in UI
    await expect(page.locator('text=Jane Smith')).toBeVisible();

    // Verify database update
    // (check via API or separate database query)
  });

  test('should display credit history', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Scroll to usage section
    await page.locator('h2:has-text("Usage & Credit History")').scrollIntoViewIfNeeded();

    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();

    // Verify table headers
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
  });

  test('should filter credit transactions', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Open filter dropdown
    await page.click('button:has-text("All Types")');

    // Select "Purchase" filter
    await page.click('text=Purchase');

    // Verify only purchase transactions are displayed
    const transactionTypes = await page.locator('td[data-type]').allTextContents();
    expect(transactionTypes.every(type => type === 'Purchase')).toBeTruthy();
  });

  test('should open Stripe Customer Portal', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Click manage subscription button
    const portalButton = page.locator('button:has-text("Manage Subscription")');

    // Verify button redirects to Stripe (external)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      portalButton.click(),
    ]);

    // Verify Stripe domain
    expect(popup.url()).toContain('billing.stripe.com');
  });

  test('should delete account with confirmation', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Scroll to account section
    await page.locator('h2:has-text("Account")').scrollIntoViewIfNeeded();

    // Click delete account button
    await page.click('button:has-text("Delete Account")');

    // Verify confirmation dialog
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=This action cannot be undone')).toBeVisible();

    // Type DELETE confirmation
    await page.fill('input[placeholder="Type DELETE to confirm"]', 'DELETE');

    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');

    // Verify redirect to home page
    await page.waitForURL('/');

    // Verify farewell message
    await expect(page.locator('text=Your account has been deleted')).toBeVisible();

    // Verify cannot access protected routes
    await page.goto('/dashboard');
    await page.waitForURL('/sign-in');
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Open edit dialog
    await page.click('button:has-text("Edit Profile")');

    // Clear name field
    await page.fill('input[name="firstName"]', '');

    // Attempt to save
    await page.click('button:has-text("Save")');

    // Verify error message
    await expect(page.locator('text=First name is required')).toBeVisible();

    // Verify dialog is still open
    await expect(page.locator('role=dialog')).toBeVisible();
  });
});
```

**Run E2E Tests**:
```bash
# Run all settings tests
npx playwright test tests/e2e/settings.spec.ts

# Run in headed mode (see browser)
npx playwright test tests/e2e/settings.spec.ts --headed

# Run in debug mode
npx playwright test tests/e2e/settings.spec.ts --debug

# Generate test report
npx playwright show-report
```

### API Endpoint Tests

**Test File**: `tests/api/user-profile.test.ts`

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('GET /api/user/profile', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token from Clerk test environment
    authToken = await getTestAuthToken();
  });

  it('should return user profile with 200 status', async () => {
    const response = await fetch('http://localhost:3003/api/user/profile', {
      headers: {
        Cookie: `clerk_session=${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.profile).toBeDefined();
    expect(data.data.credits).toBeDefined();
  });

  it('should return 401 for unauthenticated request', async () => {
    const response = await fetch('http://localhost:3003/api/user/profile');
    expect(response.status).toBe(401);
  });
});

describe('PUT /api/user/profile', () => {
  it('should update profile successfully', async () => {
    const response = await fetch('http://localhost:3003/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `clerk_session=${authToken}`,
      },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should return validation error for empty name', async () => {
    const response = await fetch('http://localhost:3003/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `clerk_session=${authToken}`,
      },
      body: JSON.stringify({
        firstName: '',
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## Implementation Checklist

### Phase 1: Database & API Foundation
- [ ] Update Prisma schema with subscription fields
- [ ] Run Prisma migration: `npx prisma migrate dev --name add_subscription_fields_to_user`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Verify migration in Prisma Studio
- [ ] Create validation schemas in `src/lib/validations/user.ts`
- [ ] Create `GET /api/user/profile` endpoint
- [ ] Create `PUT /api/user/profile` endpoint
- [ ] Create `DELETE /api/user/account` endpoint
- [ ] Create `POST /api/stripe/create-portal-session` endpoint
- [ ] Test all API endpoints with Postman/Thunder Client

### Phase 2: UI Component Installation
- [ ] Install shadcn/ui components:
  - [ ] `npx shadcn@latest add card`
  - [ ] `npx shadcn@latest add form`
  - [ ] `npx shadcn@latest add input`
  - [ ] `npx shadcn@latest add label`
  - [ ] `npx shadcn@latest add select`
  - [ ] `npx shadcn@latest add separator`
  - [ ] `npx shadcn@latest add avatar`
  - [ ] `npx shadcn@latest add skeleton`
- [ ] Verify all components render correctly in isolation

### Phase 3: Settings Page Components
- [ ] Create `src/components/settings/ProfileSection.tsx`
  - [ ] Display user avatar (Clerk)
  - [ ] Display user name and email
  - [ ] Display account creation date
  - [ ] Add "Edit Profile" button
- [ ] Create `src/components/settings/EditProfileDialog.tsx`
  - [ ] Form with firstName and lastName inputs
  - [ ] Zod validation integration
  - [ ] Save/Cancel actions
  - [ ] Loading states
  - [ ] Error handling
- [ ] Create `src/components/settings/BillingSection.tsx`
  - [ ] Subscription status card
  - [ ] Plan name and renewal date display
  - [ ] "Upgrade Plan" button (link to /dashboard/credits/purchase)
  - [ ] "Manage Subscription" button (open Stripe Portal)
- [ ] Create `src/components/settings/UsageSection.tsx`
  - [ ] Reuse StatCard components from CreditOverview
  - [ ] Display current balance (hero variant)
  - [ ] Display total purchased, spent, monthly usage
  - [ ] Dynamic color coding based on balance
- [ ] Create `src/components/settings/CreditHistoryTable.tsx`
  - [ ] Table with columns: Date, Type, Amount, Description, Balance After
  - [ ] Filter dropdown (All, Generation, Purchase, Refund, Bonus)
  - [ ] Search input (by description)
  - [ ] Pagination controls
  - [ ] Loading skeleton
  - [ ] Empty state
- [ ] Create `src/components/settings/AccountSection.tsx`
  - [ ] Logout button (Clerk SignOutButton)
  - [ ] Delete Account button
- [ ] Create `src/components/settings/DeleteAccountDialog.tsx`
  - [ ] Warning message
  - [ ] Confirmation input (type "DELETE")
  - [ ] Disabled "Confirm Delete" button until input matches
  - [ ] Loading state during deletion
  - [ ] Error handling

### Phase 4: Main Settings Page
- [ ] Create `src/app/dashboard/settings/page.tsx`
  - [ ] Server Component with auth check
  - [ ] Fetch initial data server-side
  - [ ] Render all section components
  - [ ] Responsive layout (mobile-first)
  - [ ] Loading states
  - [ ] Error boundary
- [ ] Add navigation link in dashboard sidebar (already exists in layout)
- [ ] Test page routing and navigation

### Phase 5: Stripe Integration
- [ ] Configure Stripe Customer Portal in Dashboard
  - [ ] Enable subscription cancellation
  - [ ] Enable payment method updates
  - [ ] Enable billing history
  - [ ] Upload branding (logo, colors)
- [ ] Update Stripe webhook handler (`/api/stripe/webhook/route.ts`)
  - [ ] Handle `customer.subscription.updated`
  - [ ] Handle `customer.subscription.deleted`
  - [ ] Update User model subscription fields
- [ ] Test webhook events with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3003/api/stripe/webhook
  stripe trigger customer.subscription.updated
  ```

### Phase 6: Clerk Integration
- [ ] Update Clerk webhook handler (`/api/webhooks/clerk/route.ts`)
  - [ ] Verify `user.updated` event updates email in Prisma
  - [ ] Verify `user.deleted` event cascades to Prisma
- [ ] Test Clerk webhooks with Clerk Dashboard "Send Test Event"
- [ ] Verify profile edits sync between Clerk and Prisma

### Phase 7: Testing
- [ ] Write unit tests for components
  - [ ] ProfileSection
  - [ ] EditProfileDialog validation
  - [ ] CreditHistoryTable filtering
  - [ ] DeleteAccountDialog confirmation
- [ ] Write E2E tests (Playwright)
  - [ ] View settings page
  - [ ] Edit profile name
  - [ ] Filter credit transactions
  - [ ] Open Stripe Portal
  - [ ] Delete account flow
- [ ] Test edge cases:
  - [ ] User with no subscription
  - [ ] User with active subscription
  - [ ] User with cancelled subscription
  - [ ] Network errors
  - [ ] API rate limiting

### Phase 8: Documentation & Polish
- [ ] Update README.md:
  - [ ] Document Settings page feature
  - [ ] Add API endpoint documentation
  - [ ] Update environment variables section
  - [ ] Add Stripe Customer Portal setup instructions
- [ ] Add JSDoc comments to all functions
- [ ] Add TypeScript types for all data structures
- [ ] Verify no console errors or warnings
- [ ] Run linter: `npm run lint`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Build project: `npm run build`
- [ ] Test production build: `npm run start`

### Phase 9: Deployment
- [ ] Push changes to Git repository
- [ ] Create pull request with detailed description
- [ ] Run CI/CD tests
- [ ] Deploy to staging environment
- [ ] Perform smoke tests on staging
- [ ] Deploy to production (Vercel)
- [ ] Monitor error logs and analytics
- [ ] Verify Stripe webhooks work in production

---

## Assumptions & Dependencies

### Assumptions
1. Users have already completed Clerk authentication
2. Prisma database connection is working
3. Stripe account is configured with test mode enabled
4. Credit system is already functional
5. Users have at least one credit transaction to display
6. Email field in User model is kept in sync with Clerk
7. Clerk is the single source of truth for profile data (name, email, avatar)

### Dependencies
1. **Clerk Account**: Settings page requires Clerk to be properly configured
2. **Stripe Account**: Billing features require Stripe API keys and webhook endpoint
3. **Database Access**: All features require Prisma connection to PostgreSQL
4. **Existing Components**: Relies on existing shadcn/ui components (Button, Badge, Dialog, Table)
5. **Credit System**: Usage section depends on existing credit tracking logic
6. **Navigation**: Relies on existing dashboard layout sidebar

---

## Risk Assessment & Mitigation

### High-Priority Risks

#### Risk 1: Account Deletion Data Loss
**Description**: User accidentally deletes account without understanding consequences.

**Impact**: High (irreversible data loss)

**Likelihood**: Medium

**Mitigation**:
- Implement strong confirmation dialog with warning text
- Require typing "DELETE" exactly to confirm
- Add email confirmation before deletion (optional)
- Implement soft delete with 30-day grace period (future enhancement)
- Log all deletion attempts for audit trail

#### Risk 2: Stripe Customer Portal Misconfiguration
**Description**: Customer Portal settings allow unintended actions (e.g., immediate cancellation without refund).

**Impact**: High (revenue loss, customer dissatisfaction)

**Likelihood**: Low

**Mitigation**:
- Configure portal to cancel at end of billing period
- Test all portal flows in Stripe test mode
- Document required portal settings in README
- Monitor webhook events for unexpected cancellations
- Add customer support contact in portal

#### Risk 3: Race Condition in Profile Updates
**Description**: User updates profile in Clerk while webhook is processing, causing data inconsistency.

**Impact**: Medium (data out of sync)

**Likelihood**: Low

**Mitigation**:
- Use Clerk as single source of truth for profile data
- Implement upsert logic in webhook handlers
- Add retry mechanism for failed webhook processing
- Log all webhook events for debugging

### Medium-Priority Risks

#### Risk 4: API Rate Limiting
**Description**: High traffic causes rate limits on Clerk or Stripe APIs.

**Impact**: Medium (degraded UX)

**Likelihood**: Low (MVP scale)

**Mitigation**:
- Implement caching for non-critical data
- Use optimistic UI updates where possible
- Add retry logic with exponential backoff
- Monitor API usage in production

#### Risk 5: Large Transaction History Performance
**Description**: Users with thousands of transactions experience slow page load.

**Impact**: Medium (poor UX for power users)

**Likelihood**: Medium

**Mitigation**:
- Implement pagination (10 items per page)
- Add database indexes on createdAt and type
- Use cursor-based pagination for large datasets (future)
- Consider archiving old transactions (future)

---

## Success Criteria

### Launch Criteria (Must Have)
- [ ] All API endpoints return correct responses (100% pass rate)
- [ ] Settings page loads in <2 seconds on 3G connection
- [ ] Profile editing works without errors
- [ ] Stripe Customer Portal opens correctly
- [ ] Account deletion completes successfully with confirmation
- [ ] Credit history displays accurately with pagination
- [ ] All E2E tests pass (100% pass rate)
- [ ] Zero console errors on production build
- [ ] TypeScript compilation succeeds without errors
- [ ] Mobile responsive design works on 320px+ screens
- [ ] Accessibility audit passes (WCAG 2.1 AA)

### Post-Launch Success Metrics (30 Days)
- [ ] 60%+ of new users visit settings page within 7 days
- [ ] 40%+ of users update profile information
- [ ] <1% error rate on API endpoints
- [ ] 5-10% upgrade conversion rate from settings page
- [ ] 30% reduction in billing-related support tickets
- [ ] <5% churn rate for paid users
- [ ] Average 4+ star rating in user feedback

---

## Future Enhancements (Post-MVP)

### Phase 2 Features (Not in Current Scope)
1. **Two-Factor Authentication (2FA)**
   - Enable 2FA via Clerk
   - Display 2FA status in settings
   - Add enable/disable toggle

2. **Email Preferences**
   - Granular notification controls
   - Weekly summary emails
   - Product update emails
   - Marketing communications opt-in

3. **Data Export**
   - "Download My Data" button
   - Generate ZIP with all user data (posts, transactions)
   - GDPR compliance

4. **Usage Analytics Dashboard**
   - Charts showing credit usage over time
   - Peak usage hours analysis
   - Cost forecasting

5. **Team Management** (if organizationId used)
   - Invite team members
   - Role-based permissions
   - Shared credit pools

6. **API Key Management**
   - Generate API keys for programmatic access
   - Revoke keys
   - Usage tracking per key

7. **Soft Delete with Grace Period**
   - 30-day grace period before permanent deletion
   - "Undo Delete" option
   - Scheduled deletion email reminders

8. **Theme Customization**
   - Light/dark mode toggle (currently dark-only)
   - Custom color schemes
   - Font size preferences

---

## Glossary

**Term** | **Definition**
---------|---------------
**Clerk** | Third-party authentication provider handling user sign-up, login, and profile management
**Prisma** | ORM (Object-Relational Mapping) tool for type-safe database access
**Stripe Customer Portal** | Self-service billing management interface provided by Stripe
**Cascade Delete** | Automatic deletion of related database records when parent record is deleted
**Webhook** | HTTP callback that sends real-time event data from external service to our API
**Server Component** | React component that renders on the server (Next.js 13+ feature)
**Client Component** | React component that renders in the browser (uses 'use client' directive)
**shadcn/ui** | Unstyled, accessible component library built on Radix UI primitives
**Zod** | TypeScript-first schema validation library
**Toast Notification** | Temporary pop-up message showing success/error feedback
**WCAG 2.1 AA** | Web Content Accessibility Guidelines level AA compliance standard

---

## Appendix: Environment Variables

### Required Environment Variables for Step 9

```bash
# Existing (already in .env)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
ANTHROPIC_API_KEY="sk-ant-..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# New (add if not present)
NEXT_PUBLIC_APP_URL="http://localhost:3003" # For redirect URLs
```

### Stripe Customer Portal Configuration

Navigate to: https://dashboard.stripe.com/settings/billing/portal

**Required Settings**:
- ✅ Customer information: Allow customers to edit email and billing address
- ✅ Payment methods: Allow customers to add and remove payment methods
- ✅ Subscriptions: Allow customers to cancel subscriptions (at period end)
- ✅ Invoices: Allow customers to view billing history and download invoices
- ✅ Branding: Upload logo and set brand colors

**Portal URL**: After configuration, the portal will be accessible at:
```
https://billing.stripe.com/p/session/{SESSION_ID}
```

---

## Contact & Support

**Project Owner**: Solo Developer
**GitHub Repository**: https://github.com/Albertons03/postforge-scheduler
**Tech Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 3.4.17 + Prisma + PostgreSQL + Clerk + Stripe

**For Implementation Questions**:
- Frontend: Refer to shadcn/ui documentation
- Backend: Refer to Prisma and Next.js API Routes docs
- Authentication: Refer to Clerk Next.js integration guide
- Payments: Refer to Stripe Billing documentation

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Status**: Ready for Implementation
**Estimated Implementation Time**: 16-24 hours (full-stack developer)
