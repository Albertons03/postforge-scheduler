/**
 * Purchase Page
 * Displays credit packages and handles purchase cancellation
 * Shows "canceled" message if user returns from canceled checkout
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  XCircle,
  ArrowLeft,
  CreditCard,
  Zap,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { CREDIT_PACKAGES } from '@/lib/constants/pricing';

function PurchasePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled') === 'true';

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (priceId: string, credits: number, packageName: string) => {
    try {
      setLoading(priceId);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          credits,
          packageName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Cancellation Notice */}
        {canceled && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <XCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Purchase Canceled
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your purchase was canceled. No charges were made to your account.
                  You can try again by selecting a package below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Purchase Credits
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a credit package to power your AI-generated LinkedIn posts.
            Credits never expire and can be used anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow ${
                pkg.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Package Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                {/* Credits */}
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {pkg.credits}
                  </span>
                  <span className="text-gray-600 ml-2">credits</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {pkg.price}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {pkg.pricePerCredit} per credit
                  </div>
                  {pkg.savings && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mt-2">
                      Save {pkg.savings}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI post generation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Auto scheduling</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Analytics included</span>
                  </li>
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() =>
                    handlePurchase(pkg.stripePriceId, pkg.credits, pkg.name)
                  }
                  disabled={loading !== null || !pkg.stripePriceId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === pkg.stripePriceId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Purchase Now
                    </>
                  )}
                </button>

                {!pkg.stripePriceId && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Price not configured
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How do credits work?
              </h3>
              <p className="text-gray-600 text-sm">
                Each credit allows you to generate one AI-powered LinkedIn post.
                Credits are deducted when you generate a post and never expire.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards (Visa, Mastercard, American
                Express) through our secure payment processor, Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! If you are not satisfied with your purchase, contact us
                within 14 days for a full refund. Refunds are processed within
                5-7 business days.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600 text-sm">
                No, credits never expire. Use them whenever you need to generate
                posts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading purchase options...</p>
          </div>
        </div>
      }
    >
      <PurchasePageContent />
    </Suspense>
  );
}
