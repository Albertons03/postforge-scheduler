'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PostsTableSkeletonProps {
  rows?: number;
}

export function PostsTableSkeleton({ rows = 5 }: PostsTableSkeletonProps) {
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
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="relative overflow-hidden h-5 bg-slate-800 rounded-md animate-shimmer-loading">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer-loading" />
              </div>
            </TableCell>
            <TableCell>
              <div className="relative overflow-hidden h-5 w-20 bg-slate-800 rounded-full animate-shimmer-loading">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer-loading" />
              </div>
            </TableCell>
            <TableCell>
              <div className="relative overflow-hidden h-5 w-32 bg-slate-800 rounded-md animate-shimmer-loading">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer-loading" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <div className="relative overflow-hidden h-8 w-8 bg-slate-800 rounded-md animate-shimmer-loading">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer-loading" />
                </div>
                <div className="relative overflow-hidden h-8 w-8 bg-slate-800 rounded-md animate-shimmer-loading">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer-loading" />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
