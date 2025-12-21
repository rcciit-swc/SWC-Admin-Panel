import { Skeleton } from '@/components/ui/skeleton';

export function EditEventSkeleton() {
  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Header Skeleton */}
      <div className="border-b border-white/6 bg-[#0a0a0f]/80 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-lg bg-white/6" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl bg-white/6" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 bg-white/6" />
                  <Skeleton className="h-4 w-32 bg-white/6" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg bg-white/6" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Basic Information */}
        <div className="bg-[#0a0a0f] rounded-xl border border-white/6 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/6 mb-6">
            <Skeleton className="w-8 h-8 rounded-lg bg-white/6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/6" />
              <Skeleton className="h-3 w-48 bg-white/6" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Skeleton className="h-11 col-span-2 rounded-lg bg-white/6" />
            <Skeleton className="h-11 rounded-lg bg-white/6" />
            <Skeleton className="h-11 rounded-lg bg-white/6" />
            <Skeleton className="h-11 col-span-2 rounded-lg bg-white/6" />
            <Skeleton className="h-11 rounded-lg bg-white/6" />
            <Skeleton className="h-11 rounded-lg bg-white/6" />
          </div>
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#0a0a0f] rounded-xl border border-white/6 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/6 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-white/6" />
                <Skeleton className="h-3 w-36 bg-white/6" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-lg bg-white/6" />
              <Skeleton className="h-32 rounded-lg bg-white/6" />
            </div>
          </div>

          <div className="bg-[#0a0a0f] rounded-xl border border-white/6 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/6 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-white/6" />
                <Skeleton className="h-3 w-32 bg-white/6" />
              </div>
            </div>
            <Skeleton className="h-64 rounded-lg bg-white/6" />
          </div>
        </div>

        {/* Links and Coordinators */}
        <div className="bg-[#0a0a0f] rounded-xl border border-white/6 p-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg bg-white/6" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 bg-white/6" />
                    <Skeleton className="h-3 w-28 bg-white/6" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-lg bg-white/6" />
              </div>
              <Skeleton className="h-20 rounded-lg bg-white/6" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg bg-white/6" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/6" />
                    <Skeleton className="h-3 w-36 bg-white/6" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32 rounded-lg bg-white/6" />
              </div>
              <Skeleton className="h-20 rounded-lg bg-white/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
