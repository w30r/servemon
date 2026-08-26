"use client";

export function CardSkeleton() {
  return (
    <div className="glass animate-pulse rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded-full bg-white/10" />
        <div className="h-4 w-12 rounded-full bg-white/10" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-white/10" />
      </div>
      <div className="mt-4 h-3 w-24 rounded bg-white/10" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="glass flex items-center justify-between rounded-2xl p-4">
      <div className="min-w-0 flex-1">
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded-full bg-white/10" />
          <div className="h-3 w-12 rounded-full bg-white/10" />
        </div>
        <div className="mt-2 h-4 w-3/4 rounded bg-white/10" />
      </div>
      <div className="ml-4 h-3 w-20 shrink-0 rounded bg-white/10" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="glass mt-6 animate-pulse rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="w-full sm:w-2/3">
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded-full bg-white/10" />
              <div className="h-5 w-16 rounded-full bg-white/10" />
            </div>
            <div className="mt-3 h-8 w-full rounded bg-white/10" />
            <div className="mt-2 h-5 w-32 rounded bg-white/10" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 rounded-full bg-white/10" />
            <div className="h-10 w-28 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
      <div className="glass mt-6 animate-pulse rounded-3xl p-3">
        <div className="mb-2 flex gap-2 px-2">
          <div className="h-7 w-14 rounded-full bg-white/10" />
          <div className="h-7 w-14 rounded-full bg-white/10" />
          <div className="h-7 w-16 rounded-full bg-white/10" />
        </div>
        <div className="h-[80vh] rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export function BrowseSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-8 w-48 rounded bg-white/10" />
      <div className="mt-6 flex gap-2">
        <div className="h-10 w-64 rounded-full bg-white/10" />
        <div className="h-10 w-20 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-white/10" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
