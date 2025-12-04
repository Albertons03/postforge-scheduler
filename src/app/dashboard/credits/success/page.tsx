/**
 * Success Page
 * Displayed after successful credit purchase via Stripe
 * Shows purchase confirmation and new credit balance
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface SessionData {
  sessionId: string;
  status: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  customerEmail: string;
  metadata: {
    credits: string;
    packageName: string;
  };
  transaction: {
    id: string;
    credits: number;
    amount: number;
    currency: string;
    status: string;
    packageName: string;
    createdAt: string;
  } | null;
  currentBalance: number;
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Fetch session details from API
    fetchSessionDetails(sessionId);
  }, [sessionId]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stripe/session/${sessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve session details');
      }

      const data = await response.json();
      setSessionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Purchase Details
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Something went wrong. Please try again.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  const credits = sessionData.transaction?.credits || parseInt(sessionData.metadata?.credits || '0');
  const packageName = sessionData.transaction?.packageName || sessionData.metadata?.packageName || 'Credit Package';
  const amount = sessionData.amountTotal / 100; // Convert cents to dollars

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Success Icon with Animation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your credits have been added to your account
          </p>
        </div>

        {/* Purchase Details */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Package</p>
              <p className="text-lg font-semibold text-gray-900">{packageName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
              <p className="text-lg font-semibold text-gray-900">
                ${amount.toFixed(2)} {sessionData.currency.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Added</p>
                <p className="text-3xl font-bold text-blue-600">
                  +{credits.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">New Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sessionData.currentBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Transaction Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600 capitalize">
                {sessionData.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Session ID:</span>
              <span className="font-mono text-xs text-gray-900">
                {sessionData.sessionId.substring(0, 20)}...
              </span>
            </div>
            {sessionData.transaction && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-900">
                  {sessionData.transaction.id.substring(0, 20)}...
                </span>
              </div>
            )}
            {sessionData.customerEmail && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{sessionData.customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/generate"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Generate Post
          </Link>
        </div>

        {/* Receipt Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          A receipt has been sent to {sessionData.customerEmail}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
