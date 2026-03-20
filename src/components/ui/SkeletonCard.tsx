import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonKPI({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonLeadCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export function SkeletonRecordingRow({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 p-5", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonActivityItem({ className }: SkeletonCardProps) {
  return (
    <div className={cn("flex items-start gap-3 p-3", className)}>
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 p-5 space-y-4", className)}>
      <Skeleton className="h-5 w-32" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
