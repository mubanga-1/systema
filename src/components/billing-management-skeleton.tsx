import React from 'react';

export function BillingManagementSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <div className="h-9 w-64 animate-pulse rounded-md bg-zinc-200/60" />
          <div className="h-5 w-80 animate-pulse rounded-md bg-zinc-100/60" />
        </div>
        <div className="h-4 w-20 animate-pulse rounded-md bg-zinc-100/60" />
      </div>

      {/* Current Subscription Card Skeleton */}
      <div className="grid gap-6 rounded-lg border p-6 bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100/60" />
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-200/60" />
          </div>
          <div className="text-right space-y-2">
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-zinc-100/60" />
            <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-zinc-200/60" />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-100/60" />
        </div>

        <div className="pt-2">
          <div className="h-10 w-full animate-pulse rounded-md bg-zinc-100/60" />
        </div>
      </div>

      {/* Change Plan Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200/60" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-md border border-zinc-100 bg-zinc-50/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}