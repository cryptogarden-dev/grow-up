import { Skeleton, SkeletonCard } from "@/app/components/Skeleton";

export default function CheckinLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
