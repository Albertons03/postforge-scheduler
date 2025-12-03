# PostForge - AI Social Media Scheduler MVP

Egy AI-alapú tool, ami segít social media posztokat generálni, schedule-elni és publikálni.

## Tech Stack
- **Frontend:** Next.js 16 (with Turbopack), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API Routes, Prisma ORM 7
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **AI:** Claude 3.5 Sonnet API (Anthropic SDK)
- **Payments:** Stripe
- **Testing:** Playwright
- **Deploy:** Vercel

## Features (MVP)
- ✅ User authentication (Clerk)
- ✅ AI-powered post generation (Claude API)
- ✅ Credit system for API usage
- ✅ Post history management
- ✅ Stripe payment integration
- 🔄 Coming soon: Post scheduling, multi-platform support

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
- `credits` - Available AI generation credits (default: 10)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Post
- `id` - Unique identifier
- `userId` - Reference to User
- `content` - Post content
- `platform` - Target platform (default: "linkedin")
- `status` - Post status (draft, scheduled, published)
- `metadata` - Additional data as JSON
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### CreditTransaction
- `id` - Unique identifier
- `userId` - Reference to User
- `amount` - Credit amount (positive or negative)
- `type` - Transaction type (generation, purchase, refund, bonus)
- `description` - Transaction description
- `createdAt` - Transaction timestamp

## Testing

```bash
npm run test     # Run tests with Playwright
```

## Deployment

Deployed on Vercel: [postforge.vercel.app](https://postforge.vercel.app)

## Environment Variables

See `.env.example` for all required environment variables.

## License
MIT

## Author
Solo Developer

---

**NOTE:** This is the result of Step 1 setup. Additional configuration needed for Supabase + Clerk with user input.
