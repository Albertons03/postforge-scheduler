'use client';

import { format } from 'date-fns';
import { Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'published':
      return 'default';
    case 'scheduled':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return '💼';
    case 'twitter':
      return '🐦';
    case 'instagram':
      return '📷';
    case 'facebook':
      return '👥';
    default:
      return '📱';
  }
};

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <div
      className="bg-white dark:bg-slate-800/50 backdrop-blur-sm
                 rounded-xl border border-gray-200 dark:border-slate-700
                 p-4 sm:p-5 space-y-4
                 hover:border-gray-300 dark:hover:border-slate-600
                 transition-all duration-200
                 hover:shadow-lg dark:hover:shadow-slate-900/20"
      role="article"
      aria-label={`Post: ${post.content.substring(0, 50)}...`}
    >
      {/* Content Preview */}
      <div>
        <p className="text-gray-900 dark:text-slate-200 text-sm sm:text-base leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Badge */}
        <Badge
          variant={getStatusVariant(post.status)}
          className="text-xs font-semibold"
        >
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>

        {/* Platform Badge */}
        <Badge variant="outline" className="text-xs">
          <span className="mr-1">{getPlatformIcon(post.platform)}</span>
          {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
        </Badge>

        {/* Scheduled Time */}
        {post.scheduledAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{format(new Date(post.scheduledAt), 'MMM d')}</span>
            <Clock className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            <span>{format(new Date(post.scheduledAt), 'h:mm a')}</span>
          </div>
        )}
      </div>

      {/* Character Count & Created Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-500">
        <span>{post.content.length} characters</span>
        <span>Created {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-slate-700/50">
        <Button
          variant="outline"
          size="default"
          className="w-full min-h-[48px] text-sm font-semibold
                     border-gray-300 dark:border-slate-600 hover:border-indigo-500
                     hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
          onClick={() => onEdit(post)}
        >
          <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="default"
          className="w-full min-h-[48px] text-sm font-semibold"
          onClick={() => onDelete(post)}
        >
          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
  );
}
