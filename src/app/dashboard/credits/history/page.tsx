'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShoppingCart,
  RefreshCw,
  Gift,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const TRANSACTION_TYPES = [
  { value: 'all', label: 'All Transactions' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'generation', label: 'Generations' },
  { value: 'refund', label: 'Refunds' },
  { value: 'bonus', label: 'Bonuses' },
];

export default function CreditHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedType, debouncedSearch]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: selectedType,
        search: debouncedSearch,
      });

      const response = await fetch(`/api/credits/transactions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    // Convert transactions to CSV
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance After'];
    const rows = transactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString(),
      tx.type,
      tx.description,
      tx.amount.toString(),
      tx.balanceAfter.toString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map(cell => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `credit-history-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
        return <ShoppingCart className="w-4 h-4" aria-hidden="true" />;
      case 'generation':
        return <TrendingDown className="w-4 h-4" aria-hidden="true" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4" aria-hidden="true" />;
      case 'bonus':
        return <Gift className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Zap className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    if (amount > 0) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Credit History
          </h1>
          <p className="text-gray-400 text-lg">
            View all your credit transactions and usage history
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                aria-label="Search transactions"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
              aria-label="Filter by transaction type"
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Export transaction history to CSV"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-sm" role="alert">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
              <AlertCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Error Loading Transactions</p>
              <p className="text-sm text-rose-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" aria-hidden="true" />
              <p className="text-gray-400 text-lg">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-gray-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-400 text-center max-w-md">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Your credit transactions will appear here'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-gray-300 border border-slate-700">
                            {getTransactionIcon(tx.type)}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold border ${getTransactionColor(tx.amount)}`}>
                            {tx.amount > 0 ? '+' : ''}
                            {tx.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-white">
                          {tx.balanceAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-700/50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-gray-300 border border-slate-700">
                        {getTransactionIcon(tx.type)}
                        {tx.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold border ${getTransactionColor(tx.amount)}`}>
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{tx.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(tx.createdAt)}</span>
                      <span className="text-white font-semibold">
                        Balance: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-slate-700/50 bg-slate-900/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="p-2 rounded-lg border border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="p-2 rounded-lg border border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
