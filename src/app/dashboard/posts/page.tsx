'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, List } from 'lucide-react';
import { toast } from 'sonner';
import { PostsTable } from '@/components/posts/PostsTable';
import { PostsTableSkeleton } from '@/components/posts/PostsTableSkeleton';
import { EditPostModal } from '@/components/posts/EditPostModal';
import { CalendarView } from '@/components/posts/CalendarView';
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

type ViewMode = 'table' | 'calendar';

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/posts');
      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
      } else {
        toast.error('Failed to load posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
  };

  const handleSave = async (id: string, data: { content: string; scheduledAt: string | null }) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data } : p))
        );
        toast.success('Post updated successfully');
      } else {
        toast.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
      throw error;
    }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        toast.success('Post deleted');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleCalendarDrop = async (postId: string, newDate: Date) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, scheduledAt: newDate.toISOString() } : p
      )
    );

    try {
      await handleSave(postId, {
        content: posts.find((p) => p.id === postId)!.content,
        scheduledAt: newDate.toISOString(),
      });
    } catch (error) {
      // Revert on error
      fetchPosts();
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Post Management
          </h1>
          <p className="text-slate-400">View, edit, and schedule your LinkedIn posts</p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
              data-testid="table-tab"
            >
              <List className="w-4 h-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
              data-testid="calendar-tab"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Button>
          </div>

          <Button
            onClick={() => router.push('/dashboard/generate')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Post
          </Button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <PostsTableSkeleton rows={5} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4" data-testid="empty-state">
              <div className="mb-4">
                <Calendar className="w-16 h-16 mx-auto text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No posts yet</h3>
              <p className="text-slate-500 mb-6">
                Start by creating your first AI-generated LinkedIn post
              </p>
              <Button
                onClick={() => router.push('/dashboard/generate')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="p-6" data-testid="posts-table">
              {viewMode === 'table' ? (
                <PostsTable posts={posts} onEdit={handleEdit} onDelete={handleDelete} />
              ) : (
                <CalendarView posts={posts} onEventDrop={handleCalendarDrop} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditPostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onSave={handleSave}
      />
    </div>
  );
}
