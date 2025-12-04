'use client';

import { useState } from 'react';
import { User } from '@clerk/nextjs/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileSectionProps {
  clerkUser: User;
  dbUser: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
  };
}

export function ProfileSection({ clerkUser, dbUser }: ProfileSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(clerkUser.firstName || '');
  const [lastName, setLastName] = useState(clerkUser.lastName || '');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleSave = async () => {
    // Validation
    const newErrors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }
    if (lastName && lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setIsEditOpen(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = `${clerkUser.firstName?.[0] || ''}${clerkUser.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <>
      <Card className="bg-slate-900 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={clerkUser.imageUrl} alt={clerkUser.firstName || 'User'} />
              <AvatarFallback className="bg-indigo-600 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-lg font-medium text-white">
                  {clerkUser.firstName} {clerkUser.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{dbUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Member since</p>
                <p className="text-white">{format(new Date(dbUser.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <Button
              onClick={() => setIsEditOpen(true)}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800 text-white"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your profile information. Changes will be reflected across your account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-white">
                First Name *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-white">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter last name (optional)"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
              className="border-slate-600 hover:bg-slate-800 text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
    </>
  );
}
