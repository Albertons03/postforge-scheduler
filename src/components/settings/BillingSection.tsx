'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BillingSectionProps {
  subscription: {
    status: string;
    planName: string | null;
    renewsAt: Date | null;
    hasCustomer: boolean;
  };
}

export function BillingSection({ subscription }: BillingSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = () => {
    const status = subscription.status;

    if (status === 'active') {
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>;
    }
    if (status === 'canceled' || status === 'cancelled') {
      return <Badge className="bg-amber-600 hover:bg-amber-700">Cancelled</Badge>;
    }
    if (status === 'past_due') {
      return <Badge className="bg-red-600 hover:bg-red-700">Past Due</Badge>;
    }
    return <Badge className="bg-slate-600 hover:bg-slate-700">Free Plan</Badge>;
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/dashboard/credits/purchase');
  };

  const isPaidPlan = subscription.status === 'active' || subscription.status === 'canceled';

  return (
    <Card className="bg-slate-900 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white">Billing & Subscription</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold text-white">
                    {subscription.planName || 'Free Plan'}
                  </p>
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {subscription.renewsAt && (
              <div className="pl-8">
                <p className="text-sm text-gray-400">
                  {subscription.status === 'canceled' ? 'Expires on' : 'Renews on'}{' '}
                  <span className="text-white font-medium">
                    {format(new Date(subscription.renewsAt), 'MMMM d, yyyy')}
                  </span>
                </p>
              </div>
            )}

            {!isPaidPlan && (
              <div className="pl-8">
                <p className="text-sm text-gray-400">
                  Upgrade to unlock unlimited credits and premium features
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {isPaidPlan ? (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}

          {subscription.hasCustomer && !isPaidPlan && (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Billing Portal
                </>
              )}
            </Button>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-gray-300">
            💡 <strong>Tip:</strong> Use the Stripe Customer Portal to update payment methods,
            view invoices, and manage your subscription settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
