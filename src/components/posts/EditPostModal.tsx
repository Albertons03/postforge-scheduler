'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  id: string;
  content: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: { content: string; scheduledAt: string | null }) => Promise<void>;
}

export function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      if (post.scheduledAt) {
        // Format to datetime-local input format
        const date = new Date(post.scheduledAt);
        const formatted = date.toISOString().slice(0, 16);
        setScheduledAt(formatted);
      } else {
        setScheduledAt('');
      }
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setIsSaving(true);
    try {
      await onSave(post.id, {
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxCharacters + 50}
                rows={8}
                className="bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-500"
                placeholder="Write your post content..."
              />
              <p className={`text-sm mt-1 ${isOverLimit ? 'text-rose-400' : 'text-slate-400'}`}>
                {characterCount}/{maxCharacters} characters
                {isOverLimit && ' (Over limit!)'}
              </p>
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-slate-300 mb-2">
                Schedule for
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to unschedule</p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-400 hover:text-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isOverLimit || !content.trim()}
              data-testid="save-button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
