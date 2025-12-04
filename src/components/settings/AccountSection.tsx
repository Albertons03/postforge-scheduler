'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, LogOut, Loader2, Trash2 } from 'lucide-react';

export function AccountSection() {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
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
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully. You will be redirected...');

      // Wait a moment and redirect to home
      setTimeout(() => {
        router.push('/?deleted=true');
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="bg-slate-900 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Account Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your account and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1">Logout</h4>
              <p className="text-sm text-gray-400">
                Sign out of your account on this device
              </p>
            </div>
            <SignOutButton>
              <Button
                variant="outline"
                className="border-slate-600 hover:bg-slate-800 text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SignOutButton>
          </div>

          <div className="flex items-start justify-between p-4 bg-red-950/20 rounded-lg border border-red-900/30">
            <div className="flex-1">
              <h4 className="text-red-400 font-medium mb-1 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Account
              </h4>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center text-xl">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-gray-300 space-y-3 pt-4">
              <p className="font-semibold">This action cannot be undone!</p>
              <p>Deleting your account will:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Permanently delete all your posts and scheduled content</li>
                <li>Remove all your credit transactions and history</li>
                <li>Cancel any active subscriptions</li>
                <li>Delete your profile and account data</li>
                <li>Revoke access immediately</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-300">
                ⚠️ <strong>Warning:</strong> All data will be permanently lost. Make sure to
                download any important content before proceeding.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText" className="text-white">
                Type <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">DELETE</span>{' '}
                to confirm
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Type DELETE here"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmText('');
              }}
              disabled={isDeleting}
              className="border-slate-600 hover:bg-slate-800 text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE' || isDeleting}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
