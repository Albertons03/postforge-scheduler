'use client';

import { useState, useEffect } from 'react';
import { PostsTable } from './PostsTable';
import { PostCard } from './PostCard';
import { useIsMobile } from '@/hooks/useMediaQuery';

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

interface ResponsivePostsListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function ResponsivePostsList({
  posts,
  onEdit,
  onDelete,
}: ResponsivePostsListProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show cards on mobile (< 768px), table on desktop
  return isMobile ? (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          No posts found
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  ) : (
    <PostsTable posts={posts} onEdit={onEdit} onDelete={onDelete} />
  );
}
