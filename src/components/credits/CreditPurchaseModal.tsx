'use client';

import { useState } from 'react';
import { X, Zap, Check, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/constants/pricing';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
}

export default function CreditPurchaseModal({
  isOpen,
  onClose,
  currentBalance,
}: CreditPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call API to create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPackage.stripePriceId,
          credits: selectedPackage.credits,
          packageName: selectedPackage.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedPackage(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95"
          aria-describedby="credit-purchase-description"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div>
              <Dialog.Title className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Purchase Credits
              </Dialog.Title>
              <p id="credit-purchase-description" className="mt-2 text-gray-400 text-sm">
                {currentBalance !== undefined ? (
                  <>Current balance: <span className="font-semibold text-white">{currentBalance} credits</span></>
                ) : (
                  'Choose a credit package to continue creating amazing content'
                )}
              </p>
            </div>
            <Dialog.Close
              className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label="Close dialog"
            >
              <X className="w-6 h-6" />
            </Dialog.Close>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-sm" role="alert">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                <AlertCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Error</p>
                <p className="text-sm text-rose-300/80">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="shrink-0 text-rose-400 hover:text-rose-300 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Package Grid */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CREDIT_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const isPopular = pkg.popular;

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    disabled={isLoading}
                    className={`
                      group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-2 border-indigo-500 shadow-xl shadow-indigo-500/30 scale-105'
                          : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700/50 hover:border-indigo-500/50 hover:shadow-lg hover:scale-105'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    `}
                    aria-pressed={isSelected}
                    aria-label={`${pkg.name}: ${pkg.credits} credits for ${pkg.price}`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute top-0 left-0 right-0 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wide rounded-b-lg shadow-lg">
                          <Zap className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 bg-indigo-500 rounded-full shadow-lg">
                        <Check className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                    )}

                    {/* Glow effect on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 opacity-0 transition-opacity duration-300 ${
                        !isSelected && 'group-hover:opacity-10'
                      }`}
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <div className={`relative ${isPopular ? 'mt-8' : 'mt-0'}`}>
                      {/* Package Name */}
                      <h3 className="text-lg font-bold text-white mb-2">
                        {pkg.name}
                      </h3>

                      {/* Credit Amount */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" aria-hidden="true" />
                        <span className="text-4xl font-bold text-white">
                          {pkg.credits}
                        </span>
                        <span className="text-gray-400 text-sm">credits</span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-white mb-1">
                          {pkg.price}
                        </div>
                        <div className="text-sm text-gray-400">
                          {pkg.pricePerCredit} per credit
                        </div>
                      </div>

                      {/* Savings Badge */}
                      {pkg.savings && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                          <span className="text-emerald-400 text-sm font-bold">
                            Save {pkg.savings}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between px-8 py-6 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div className="text-sm text-gray-400">
              {selectedPackage ? (
                <span>
                  Selected: <span className="font-semibold text-white">{selectedPackage.name}</span> - {selectedPackage.credits} credits for {selectedPackage.price}
                </span>
              ) : (
                'Select a package to continue'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl border border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || isLoading}
                className="group relative overflow-hidden px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label={selectedPackage ? `Purchase ${selectedPackage.name}` : 'Select a package to continue'}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" fill="currentColor" aria-hidden="true" />
                      Continue to Payment
                    </>
                  )}
                </span>
                {/* Button hover effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
