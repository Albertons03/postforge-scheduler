# Step 9: Settings & User Profile - Quick Implementation Guide

## Overview
This is a condensed, action-focused guide for implementing the Settings page. For detailed specifications, see `STEP_9_SETTINGS_USER_PROFILE_PRD.md`.

---

## Prerequisites Checklist
- ✅ Next.js 16 with App Router running
- ✅ Tailwind CSS 3.4.17 installed
- ✅ Prisma ORM connected to PostgreSQL
- ✅ Clerk authentication working
- ✅ Stripe API keys configured
- ✅ Credit system functional

---

## Implementation Order (5 Phases)

### Phase 1: Database Schema (30 min)

**Step 1.1: Update Prisma Schema**
```bash
# Edit prisma/schema.prisma
```

Add these fields to User model:
```prisma
model User {
  // ... existing fields ...

  stripeCustomerId        String?   @unique
  stripeSubscriptionId    String?   @unique
  stripeSubscriptionStatus String?
  subscriptionPlanName    String?
  subscriptionCredits     Int?
  subscriptionRenewsAt    DateTime?

  @@index([stripeCustomerId])
}
```

**Step 1.2: Run Migration**
```bash
npx prisma migrate dev --name add_subscription_fields_to_user
npx prisma generate
```

**Step 1.3: Verify**
```bash
npx prisma studio
# Check User table has new fields
```

---

### Phase 2: API Endpoints (2 hours)

**Step 2.1: Create User Profile API**

File: `src/app/api/user/profile/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getUserCreditsInfo } from '@/lib/credits';
import { z } from 'zod';

// GET /api/user/profile
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkId || !clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionStatus: true,
        subscriptionPlanName: true,
        subscriptionRenewsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const creditsInfo = await getUserCreditsInfo(user.id);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.id,
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
        },
        subscription: {
          status: user.stripeSubscriptionStatus || 'free',
          planName: user.subscriptionPlanName,
          renewsAt: user.subscriptionRenewsAt?.toISOString() || null,
        },
      },
    });
  } catch (error) {
    console.error('[API] Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile
const updateSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().max(50).trim().optional(),
});

export async function PUT(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName } = validation.data;

    // Update Clerk user
    const { clerkClient } = await import('@clerk/nextjs/server');
    await clerkClient.users.updateUser(clerkId, {
      firstName,
      lastName: lastName || undefined,
    });

    return NextResponse.json({
      success: true,
      data: { firstName, lastName },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[API] Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 2.2: Create Account Deletion API**

File: `src/app/api/user/account/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (body.confirmationText !== 'DELETE') {
      return NextResponse.json(
        { success: false, error: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete from Clerk (webhook will handle Prisma deletion)
    const { clerkClient } = await import('@clerk/nextjs/server');
    await clerkClient.users.deleteUser(clerkId);

    console.log(`[AUDIT] User deleted: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 2.3: Create Stripe Portal API**

File: `src/app/api/stripe/create-portal-session/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id, clerkId },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error('[Stripe] Portal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 2.4: Test APIs**
```bash
# Start dev server
npm run dev

# Test with Thunder Client/Postman
GET http://localhost:3003/api/user/profile
PUT http://localhost:3003/api/user/profile
POST http://localhost:3003/api/stripe/create-portal-session
DELETE http://localhost:3003/api/user/account
```

---

### Phase 3: Install UI Components (15 min)

```bash
# Install required shadcn components
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add skeleton

# Verify installation
ls src/components/ui/
```

**If shadcn CLI fails**: Manually copy components from https://ui.shadcn.com/docs/components

---

### Phase 4: Build UI Components (4 hours)

**Step 4.1: Profile Section**

File: `src/components/settings/ProfileSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import EditProfileDialog from './EditProfileDialog';

export default function ProfileSection() {
  const { user, isLoaded } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!isLoaded) {
    return <div className="animate-pulse bg-slate-800 h-48 rounded-xl" />;
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <>
      <Card className="bg-slate-900 border-slate-700/50 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-indigo-500/30">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
              <AvatarFallback className="bg-indigo-600 text-white text-xl">
                {initials || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {user?.firstName || ''} {user?.lastName || ''}
              </h3>
              <p className="text-gray-400 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="flex items-center text-gray-500 text-xs mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                Member since {format(new Date(user?.createdAt || Date.now()), 'MMMM yyyy')}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowEditDialog(true)}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            Edit Profile
          </Button>
        </div>

        <Separator className="bg-slate-700/50 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="text-white font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div>
            <p className="text-gray-500">Account ID</p>
            <p className="text-white font-mono text-xs">{user?.id.slice(0, 16)}...</p>
          </div>
        </div>
      </Card>

      <EditProfileDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        currentFirstName={user?.firstName || ''}
        currentLastName={user?.lastName || ''}
      />
    </>
  );
}
```

**Step 4.2: Edit Profile Dialog**

File: `src/components/settings/EditProfileDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
}

export default function EditProfileDialog({ isOpen, onClose, currentFirstName, currentLastName }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleSave = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          toast.error(data.error || 'Failed to update profile');
        }
        return;
      }

      toast.success('Profile updated successfully!');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="text-gray-300">Last Name (Optional)</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName[0]}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-700 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 4.3: Billing Section**

File: `src/components/settings/BillingSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Props {
  subscription: {
    status: string;
    planName: string | null;
    renewsAt: string | null;
  };
}

export default function BillingSection({ subscription }: Props) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to open billing portal');
        return;
      }

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const getStatusBadge = () => {
    if (subscription.status === 'active') {
      return <Badge className="bg-emerald-600">Active</Badge>;
    } else if (subscription.status === 'canceled') {
      return <Badge className="bg-amber-600">Cancelled</Badge>;
    }
    return <Badge variant="outline">Free Plan</Badge>;
  };

  return (
    <Card className="bg-slate-900 border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="h-6 w-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">Billing & Subscription</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Current Plan</p>
            <p className="text-white font-semibold">
              {subscription.planName || 'Free Plan'}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {subscription.renewsAt && (
          <div>
            <p className="text-gray-400 text-sm">Next Billing Date</p>
            <p className="text-white">
              {new Date(subscription.renewsAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            asChild
            variant="outline"
            className="flex-1 border-slate-700 hover:bg-slate-800"
          >
            <Link href="/dashboard/credits/purchase">
              Upgrade Plan
            </Link>
          </Button>

          {subscription.status !== 'free' && (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  Manage Subscription
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

**Step 4.4: Usage Section** (reuse existing CreditOverview component)

**Step 4.5: Account Section**

File: `src/components/settings/AccountSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@clerk/nextjs';
import { LogOut, Trash2 } from 'lucide-react';
import DeleteAccountDialog from './DeleteAccountDialog';

export default function AccountSection() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="bg-slate-900 border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <LogOut className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Account Actions</h2>
        </div>

        <div className="space-y-3">
          <SignOutButton>
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SignOutButton>

          <Button
            variant="destructive"
            className="w-full bg-red-900 hover:bg-red-950"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </Card>

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
```

**Step 4.6: Delete Account Dialog**

File: `src/components/settings/DeleteAccountDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: confirmText }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to delete account');
        return;
      }

      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Delete Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm font-semibold mb-2">
              Warning: This action cannot be undone!
            </p>
            <ul className="text-red-400 text-sm space-y-1 list-disc list-inside">
              <li>All your posts will be permanently deleted</li>
              <li>All your credits and transactions will be lost</li>
              <li>You will lose access immediately</li>
              <li>This action is irreversible</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="confirmDelete" className="text-gray-300">
              Type <span className="font-bold text-white">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmDelete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-2"
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-700 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 5: Main Settings Page (1 hour)

File: `src/app/dashboard/settings/page.tsx`

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getUserCreditsInfo } from '@/lib/credits';
import ProfileSection from '@/components/settings/ProfileSection';
import BillingSection from '@/components/settings/BillingSection';
import AccountSection from '@/components/settings/AccountSection';
import CreditOverview from '@/components/credits/CreditOverview';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Settings | PostForge',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkId || !clerkUser) {
    redirect('/sign-in');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      credits: true,
      stripeCustomerId: true,
      stripeSubscriptionStatus: true,
      subscriptionPlanName: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch credit info
  const creditsInfo = await getUserCreditsInfo(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your account, billing, and preferences
          </p>
        </div>

        {/* Profile Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Profile</h2>
          <ProfileSection />
        </section>

        <Separator className="bg-slate-700/50" />

        {/* Billing Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Billing</h2>
          <BillingSection
            subscription={{
              status: user.stripeSubscriptionStatus || 'free',
              planName: user.subscriptionPlanName,
              renewsAt: user.subscriptionRenewsAt?.toISOString() || null,
            }}
          />
        </section>

        <Separator className="bg-slate-700/50" />

        {/* Usage Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Usage & Credits
          </h2>
          <CreditOverview
            currentBalance={user.credits}
            totalPurchased={creditsInfo?.totalPurchased || 0}
            totalSpent={creditsInfo?.totalSpent || 0}
            thisMonthUsage={0}
            onBuyCredits={() => {}}
            onViewHistory={() => {}}
          />
        </section>

        <Separator className="bg-slate-700/50" />

        {/* Account Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Account</h2>
          <AccountSection />
        </section>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Manual Testing
- [ ] Navigate to `/dashboard/settings`
- [ ] Verify profile information displays correctly
- [ ] Click "Edit Profile" and update name
- [ ] Verify credit balance is accurate
- [ ] Click "Upgrade Plan" button (redirects correctly)
- [ ] Click "Manage Subscription" (opens Stripe Portal)
- [ ] Click "Logout" (redirects to home)
- [ ] Click "Delete Account" and cancel
- [ ] Type "DELETE" and confirm (optional - use test account)

### E2E Testing
```bash
# Create Playwright test
npx playwright test tests/e2e/settings.spec.ts

# Run test
npm run test
```

---

## Environment Variables Checklist

Add to `.env.local` if missing:
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3003"
```

---

## Deployment Checklist

- [ ] All TypeScript errors resolved: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] Database migration applied on production
- [ ] Stripe Customer Portal configured
- [ ] Clerk webhook endpoint verified
- [ ] Stripe webhook endpoint verified
- [ ] Test all features on staging environment

---

## Troubleshooting

### Issue: "User not found" error
**Solution**: Verify Clerk webhook created user in database. Check `/api/webhooks/clerk/route.ts` logs.

### Issue: Stripe Portal doesn't open
**Solution**: Check `stripeCustomerId` exists in User model. API will create if missing.

### Issue: Profile updates don't persist
**Solution**: Verify Clerk API key has write permissions. Check Clerk Dashboard API settings.

### Issue: Account deletion fails
**Solution**: Check Clerk webhook is receiving `user.deleted` events. Verify webhook secret.

---

## Quick Reference

**API Endpoints**:
- `GET /api/user/profile` - Fetch user data
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/account` - Delete account
- `POST /api/stripe/create-portal-session` - Open billing portal

**Key Files**:
- Main page: `src/app/dashboard/settings/page.tsx`
- Profile: `src/components/settings/ProfileSection.tsx`
- Billing: `src/components/settings/BillingSection.tsx`
- Account: `src/components/settings/AccountSection.tsx`

**Styling Classes**:
- Card: `bg-slate-900 border-slate-700/50`
- Button: `bg-indigo-600 hover:bg-indigo-700`
- Text: `text-white`, `text-gray-400`, `text-gray-500`

---

**Total Implementation Time**: 6-8 hours (experienced developer)
**Status**: Ready to implement
**Last Updated**: 2025-01-XX
