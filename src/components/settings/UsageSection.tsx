'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface UsageSectionProps {
  userId: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export function UsageSection({ userId }: UsageSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState({
    currentBalance: 0,
    totalPurchased: 0,
    totalSpent: 0,
    spentThisMonth: 0,
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.credits);
      }

      // Fetch transaction history
      const txResponse = await fetch('/api/credits/transactions?limit=50');
      const txData = await txResponse.json();

      if (txData.success) {
        setTransactions(txData.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    filter === 'all' ? true : tx.type === filter
  );

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      generation: { color: 'bg-blue-600', label: 'Generation' },
      purchase: { color: 'bg-emerald-600', label: 'Purchase' },
      refund: { color: 'bg-amber-600', label: 'Refund' },
      bonus: { color: 'bg-purple-600', label: 'Bonus' },
    };

    const badge = badges[type] || { color: 'bg-slate-600', label: type };

    return (
      <Badge className={`${badge.color} hover:${badge.color}`}>
        {badge.label}
      </Badge>
    );
  };

  const getBalanceColor = (balance: number) => {
    if (balance >= 20) return 'text-emerald-500';
    if (balance >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Current Balance</p>
                <p className={`text-3xl font-bold text-white mt-1`}>
                  {isLoading ? '...' : stats.currentBalance}
                </p>
              </div>
              <Wallet className="h-10 w-10 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Purchased</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  +{isLoading ? '...' : stats.totalPurchased}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  -{isLoading ? '...' : stats.totalSpent}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">
                  -{isLoading ? '...' : stats.spentThisMonth}
                </p>
              </div>
              <Coins className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-slate-900 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Credit History</CardTitle>
              <CardDescription className="text-gray-400">
                Track all your credit transactions
              </CardDescription>
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white">All Types</SelectItem>
                <SelectItem value="generation" className="text-white">Generation</SelectItem>
                <SelectItem value="purchase" className="text-white">Purchase</SelectItem>
                <SelectItem value="refund" className="text-white">Refund</SelectItem>
                <SelectItem value="bonus" className="text-white">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-300 text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="border-slate-700 hover:bg-slate-800/50"
                    >
                      <TableCell className="text-gray-300">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell className="text-gray-300">
                        {tx.description || 'No description'}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {tx.amount >= 0 ? '+' : ''}
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-medium text-white">
                        {tx.balanceAfter}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
