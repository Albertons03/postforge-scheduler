import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { BillingSection } from '@/components/settings/BillingSection';
import { UsageSection } from '@/components/settings/UsageSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Settings | PostForge AI',
  description: 'Manage your account settings, profile, billing, and usage',
};

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkId || !clerkUser) {
    redirect('/sign-in');
  }

  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      createdAt: true,
      stripeCustomerId: true,
      stripeSubscriptionStatus: true,
      subscriptionPlanName: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Extract only the serializable data from clerkUser
  const clerkUserData = {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your account settings, profile, and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <ProfileSection
            clerkUser={clerkUserData}
            dbUser={user}
          />

          <Separator className="bg-slate-700/50" />

          {/* Appearance Section */}
          <AppearanceSection />

          <Separator className="bg-slate-700/50" />

          {/* Billing Section */}
          <BillingSection
            subscription={{
              status: user.stripeSubscriptionStatus || 'free',
              planName: user.subscriptionPlanName,
              renewsAt: user.subscriptionRenewsAt,
              hasCustomer: !!user.stripeCustomerId,
            }}
          />

          <Separator className="bg-slate-700/50" />

          {/* Usage & Credit History Section */}
          <UsageSection userId={user.id} />

          <Separator className="bg-slate-700/50" />

          {/* Account Actions Section */}
          <AccountSection />
        </div>
      </div>
    </div>
  );
}
