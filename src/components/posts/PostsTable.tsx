'use client';

import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface PostsTableProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'published':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function PostsTable({ posts, onEdit, onDelete }: PostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Content</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id} data-testid="post-row">
            <TableCell className="font-medium">
              <p className="truncate max-w-md text-slate-300">
                {post.content.substring(0, 80)}
                {post.content.length > 80 && '...'}
              </p>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(post.status)}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              {post.scheduledAt ? (
                <span className="text-slate-400">
                  {format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm')}
                </span>
              ) : (
                <span className="text-slate-500 italic">Not scheduled</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(post)}
                  data-testid="edit-button"
                  aria-label="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(post)}
                  data-testid="delete-button"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
