# PostForge - AI Social Media Scheduler MVP

Egy AI-alapú tool, ami segít social media posztokat generálni, schedule-elni és publikálni.

## Tech Stack
- **Frontend:** Next.js 16 (with Turbopack), React 19, TypeScript, Tailwind CSS 3.4.17
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **AI:** Claude 3.5 Sonnet API (Anthropic SDK)
- **Payments:** Stripe (with Customer Portal)
- **UI Components:** shadcn/ui + Radix UI
- **Testing:** Playwright
- **Deploy:** Vercel

## Features (MVP)
- ✅ User authentication (Clerk)
- ✅ AI-powered post generation (Claude API)
- ✅ Credit system with transaction history
- ✅ Post history management & scheduling
- ✅ Stripe payment integration with subscription management
- ✅ **Settings & User Profile** (Step 9)
  - Profile editing (name, email from Clerk)
  - Billing management with Stripe Customer Portal
  - Credit usage tracking and history table
  - Account actions (logout, delete account)
- 🔄 Coming soon: Multi-platform support, Advanced analytics

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- Claude API key
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/postforge-ai.git
cd postforge-ai
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - from Clerk dashboard
- `CLERK_SECRET_KEY` - from Clerk dashboard
- `DATABASE_URL` - from Supabase
- `DIRECT_URL` - from Supabase
- `ANTHROPIC_API_KEY` - from Anthropic console
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - from Stripe dashboard
- `STRIPE_SECRET_KEY` - from Stripe dashboard

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Initialize database (once DATABASE_URL is configured):
```bash
npm run db:migrate
```

7. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
```
src/
├── app/              # Next.js app router pages
│   ├── api/         # API routes
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/       # React components
├── lib/             # Utility functions
│   └── prisma.ts    # Prisma client
└── types/           # TypeScript types
```

## Development

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run prisma:generate # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio
npm run test           # Run Playwright tests
```

## Database Schema

### User
- `id` - Unique identifier
- `clerkId` - Clerk authentication ID
- `email` - User email
- `name` - User display name (synced with Clerk)
- `credits` - Available AI generation credits (default: 10)
- `stripeCustomerId` - Stripe customer ID
- `stripeSubscriptionId` - Active subscription ID
- `stripeSubscriptionStatus` - Subscription status (active, canceled, etc.)
- `subscriptionPlanName` - Plan name (Starter, Popular, Pro)
- `subscriptionCredits` - Monthly credit allowance
- `subscriptionRenewsAt` - Next renewal date
- `organizationId` - Optional organization ID
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Post
- `id` - Unique identifier
- `userId` - Reference to User
- `content` - Post content (max 500 chars)
- `platform` - Target platform (default: "linkedin")
- `status` - Post status (draft, scheduled, published, failed)
- `scheduledAt` - When the post should be published
- `metadata` - Additional data as JSON
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### CreditTransaction
- `id` - Unique identifier
- `userId` - Reference to User
- `amount` - Credit amount (negative for deductions, positive for additions)
- `type` - Transaction type (generation, purchase, refund, bonus)
- `description` - Transaction description
- `balanceAfter` - Credit balance after this transaction
- `metadata` - Additional data (Stripe session ID, post ID, etc.)
- `createdAt` - Transaction timestamp

### StripeTransaction
- `id` - Unique identifier
- `userId` - Reference to User
- `stripeSessionId` - Checkout Session ID
- `stripePaymentId` - Payment Intent ID
- `amount` - Amount in cents
- `currency` - Currency (default: usd)
- `credits` - Credits purchased
- `status` - Payment status (pending, completed, failed, refunded)
- `metadata` - Additional data as JSON
- `createdAt` - Transaction timestamp
- `updatedAt` - Last update timestamp

### PricingPlan
- `id` - Unique identifier
- `name` - Plan name (Starter, Popular, Pro)
- `stripePriceId` - Stripe Price ID
- `stripeProductId` - Stripe Product ID
- `credits` - Number of credits
- `priceInCents` - Price in cents
- `currency` - Currency (default: usd)
- `isActive` - Whether plan is available
- `isPopular` - Featured plan flag
- `displayOrder` - Sort order
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Testing

Run E2E tests with Playwright:

```bash
npm run test                           # Run all tests
npx playwright test tests/e2e/settings.spec.ts   # Run Settings page tests
npx playwright test --ui               # Run tests in UI mode
npx playwright test --headed           # Run tests in headed mode
npx playwright show-report             # Show test report
```

## Settings & User Profile (Step 9)

The Settings page (`/dashboard/settings`) provides comprehensive account management:

### Features
- **Profile Section**: Edit name (synced with Clerk), view email and join date
- **Billing Section**: View subscription status, manage subscription via Stripe Customer Portal
- **Usage Section**: Credit balance overview with detailed transaction history table
- **Account Actions**: Secure logout and account deletion with confirmation

### API Endpoints
- `GET /api/user/profile` - Fetch user profile, credits, and subscription data
- `PUT /api/user/profile` - Update user name (Zod validation)
- `DELETE /api/user/account` - Delete account with confirmation
- `POST /api/stripe/create-portal-session` - Generate Stripe Customer Portal URL

### Stripe Customer Portal Setup
1. Go to [Stripe Dashboard → Settings → Billing → Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. Enable features:
   - ✅ Update payment methods
   - ✅ Cancel subscriptions
   - ✅ View billing history
   - ✅ Update billing information
3. Set cancellation behavior: Cancel at end of billing period
4. Upload branding (logo, colors)

### Components
All components use Tailwind CSS 3.4.17 with dark theme consistency:
- `ProfileSection.tsx` - Profile display and edit dialog
- `BillingSection.tsx` - Subscription status and Stripe portal link
- `UsageSection.tsx` - Credit stats cards and transaction history table
- `AccountSection.tsx` - Logout and delete account with confirmation

## Deployment

Deployed on Vercel: [postforge.vercel.app](https://postforge.vercel.app)

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL (for redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3003"
```

## License
MIT

## Author
Solo Developer

---

**NOTE:** This is the result of Step 1 setup. Additional configuration needed for Supabase + Clerk with user input.
