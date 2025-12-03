# Next Steps - PostForge Setup

## Immediate Actions Required

### 1. Configure Environment Variables

Open `.env.local` and fill in the following values:

#### A. Supabase Database (REQUIRED)
```bash
# 1. Go to: https://supabase.com
# 2. Create a new project
# 3. Go to Project Settings > Database
# 4. Copy the "Connection string" (URI format)
# 5. Paste it below (replace both DATABASE_URL and DIRECT_URL)

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
```

#### B. Clerk Authentication (REQUIRED)
```bash
# 1. Go to: https://clerk.com
# 2. Create a new application
# 3. Go to API Keys section
# 4. Copy the keys below

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### C. Anthropic Claude API (REQUIRED)
```bash
# 1. Go to: https://console.anthropic.com
# 2. Create an API key
# 3. Paste it below

ANTHROPIC_API_KEY=sk-ant-...
```

#### D. Stripe Payment (REQUIRED)
```bash
# 1. Go to: https://stripe.com
# 2. Create an account
# 3. Go to Developers > API Keys
# 4. Copy both Publishable and Secret keys

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

#### E. OpenAI (OPTIONAL - Fallback)
```bash
# Only if you want OpenAI as a fallback AI provider
OPENAI_API_KEY=sk-...
```

---

### 2. Initialize Database

After configuring `DATABASE_URL` in `.env.local`:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run initial database migration
npm run db:migrate

# Enter a migration name when prompted (e.g., "init")
```

---

### 3. Start Development Server

```bash
npm run dev
```

Open your browser at: http://localhost:3000

---

### 4. Verify Setup

1. **Homepage loads:** You should see "Welcome to PostForge"
2. **No console errors:** Check browser developer console (F12)
3. **Database connection:** Test by creating a Prisma query

---

## Additional Configuration (Optional)

### A. Setup Clerk Middleware

Create: `src/middleware.ts`

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### B. Setup Clerk Layout Wrapper

Update: `src/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PostForge - AI Social Media Scheduler",
  description: "AI-powered social media content generation and scheduling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### C. Create Your First API Route

Example: `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

Test at: http://localhost:3000/api/health

---

## Development Workflow

### Daily Development
```bash
npm run dev              # Start dev server
npm run lint            # Check code quality
npm run test            # Run E2E tests
```

### Database Operations
```bash
npm run db:migrate      # Create & run new migration
npm run db:studio       # Open Prisma Studio GUI
npm run prisma:generate # Regenerate Prisma Client
```

### Production
```bash
npm run build           # Build for production
npm run start           # Start production server
```

---

## Troubleshooting

### Issue: Database connection fails
**Solution:**
- Verify `DATABASE_URL` is correct in `.env.local`
- Test connection: `npx prisma db pull`
- Check Supabase project is running

### Issue: Clerk authentication not working
**Solution:**
- Verify API keys in `.env.local`
- Check Clerk dashboard for application status
- Ensure middleware is configured

### Issue: Build fails
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: TypeScript errors
**Solution:**
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Restart TypeScript server in VS Code
# Command Palette (Ctrl+Shift+P) > "TypeScript: Restart TS Server"
```

---

## Useful Commands

### Package Management
```bash
npm install <package>           # Install new package
npm uninstall <package>         # Remove package
npm outdated                    # Check for updates
npm update                      # Update packages
```

### Git Operations
```bash
git status                      # Check changes
git add .                       # Stage all changes
git commit -m "message"         # Commit changes
git push origin master          # Push to remote
```

### Prisma Commands
```bash
npx prisma studio              # Open database GUI
npx prisma format              # Format schema file
npx prisma validate            # Validate schema
npx prisma db seed             # Run seed script
```

---

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Clerk Docs:** https://clerk.com/docs
- **Anthropic API:** https://docs.anthropic.com
- **Stripe Docs:** https://stripe.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Need Help?

1. Check `README.md` for project overview
2. Check `PROJECT_STATUS.md` for current status
3. Review error messages in terminal
4. Check browser console (F12) for frontend errors
5. Consult the documentation links above

---

**Good luck with your PostForge development!**
